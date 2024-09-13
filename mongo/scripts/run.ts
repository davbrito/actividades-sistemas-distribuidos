import chalk from "chalk";
import Table from "cli-table3";
import { MongoClient } from "mongodb";
import { setTimeout } from "node:timers/promises";
import { $$, APPS, getConnectionString, REPLICA_SET } from "../config.js";
import { runRanking } from "./bot.js";
import { battle, multiBattle } from "./bot/battle.js";
import { populatePokemons } from "./bot/data.js";
import { connection } from "./bot/db.js";

const electionTimeoutMillis = 500;
const serverSelectionTimeoutMS = 3_000;

export async function runServers() {
  console.log("levantando servidores");
  await $$`docker compose up -d --build --remove-orphans --force-recreate`;
  // await setTimeout(2000);
  // await initiateReplicaSet();
  // await setTimeout(2000);
  // await seedDatabase();
}

export async function initiateReplicaSet() {
  const initiateOptions = buildReplicaSetOptions();

  console.log("iniciando replica set con:", initiateOptions);

  const conn = APPS[0].connectionStr;
  const client = new MongoClient(conn, {
    replicaSet: REPLICA_SET,
    directConnection: true,
  });

  try {
    const admin = client.db().admin();

    const result = await admin.command({ replSetInitiate: initiateOptions });
    console.log("replica set inicializado", result);
  } catch (error) {
    console.error(String(error));
    process.exit(1);
  } finally {
    await client.close();
  }
}

function buildReplicaSetOptions() {
  return {
    _id: REPLICA_SET,
    members: APPS.map(({ ip, name, number }) => ({
      _id: number,
      host: `${ip}`,
      tags: { name },
    })),
    settings: {
      electionTimeoutMillis,
    },
  };
}

export async function seedDatabase() {
  await task("rellenando base de datos con informacion", async () => {
    const dbAddr = getConnectionString();
    await connection(async (client) => {
      await populatePokemons(client);
      await multiBattle(100, client, "none");
    }, new MongoClient(dbAddr, { serverSelectionTimeoutMS }));
  });
}

export async function stopServers() {
  await $$`docker compose down --volumes`;
}

async function task(message: string, fn: () => Promise<void>) {
  const pendingEmojis = ["⠙", "⠘", "⠰", "⠴", "⠤", "⠦", "⠆", "⠃", "⠋", "⠉"]; // ["⏳", "⌛"];
  const doneEmoji = "✅";
  const errorEmoji = "❌";
  const cps = 10;
  const ms = Math.round(1000 / cps);

  let i = 0;

  const writeLine = (line: string) => {
    process.stdout.clearLine(0);
    process.stdout.cursorTo(0);
    process.stdout.write(line);
  };

  const displayStatus = () => {
    const emoji = pendingEmojis[i % pendingEmojis.length];
    i++;
    writeLine(`${emoji} ${message}`);
  };

  const interval = setInterval(displayStatus, ms);

  try {
    displayStatus();
    await fn();
    clearInterval(interval);
    writeLine(`${doneEmoji} ${message}\n`);
  } catch (error) {
    clearInterval(interval);
    writeLine(`${errorEmoji} ${message}\n`);
    throw error;
  }
}

function separator() {
  const LINE_UNICODE = "\u2500";
  const LINE_LENGTH = process.stdout.columns;
  process.stdout.write("\n");
  process.stdout.write(LINE_UNICODE.repeat(LINE_LENGTH));
  process.stdout.write("\n\n");
}

export async function runTest() {
  await step("Estatus", () => printReplicasStatus());

  const appToShutdown = await getPrimaryApp();
  const connectionString = getConnectionString();

  await step(
    "iniciando batalla de prueba. " +
      `(cadena de conexion: ${connectionString})`,
    () => tryBattle()
  );

  await step("comprobando replicas directamente", () => checkReplicasEach());

  if (appToShutdown) {
    await step("matando replica primaria", async () => {
      await $$`docker compose stop ${appToShutdown.name}`;
    });
  }

  await step("Estatus", () => printReplicasStatus());

  await step(
    "iniciando segunda batalla de prueba. " +
      `(cadena de conexion: ${connectionString})`,
    () => tryBattle()
  );

  await step("comprobando replicas directamente", () => checkReplicasEach());

  await step("Ranking de batallas", () => runRanking(8));

  if (appToShutdown) {
    await step(
      "levantando nuevamente replica apagada",
      () => $$`docker compose start ${appToShutdown.name}`
    );
  }
}

let i = 1;
async function step<T>(title: string, fn: () => Promise<T>): Promise<T> {
  console.log(chalk.bold(`#${i++} ${title}`));

  const waitMs = 2000;
  const start = Date.now();

  const result = await fn();

  separator();

  const elapsed = Date.now() - start;

  if (elapsed < waitMs) {
    await setTimeout(waitMs - elapsed);
  }

  return result;
}

async function checkReplicasEach() {
  const primaryApp = await getPrimaryApp();

  for (const app of APPS) {
    const isPrimary = primaryApp?.number === app.number;
    const connectionString = app.connectionStr;
    console.log();
    const props = [app.name, isPrimary ? chalk.bold("primaria") : ""]
      .filter(Boolean)
      .join(", ");
    console.log(
      `- replica ${app.number} (${props}):`,
      `(cadena de conexion: ${connectionString})`
    );
    await tryBattle(connectionString);
  }
}

async function tryBattle(conn = getConnectionString(), direct = false) {
  await connection(async (client) => {
    await battle({ client, long: false });
  }, new MongoClient(conn, { serverSelectionTimeoutMS, directConnection: direct })).catch(
    (err) => {
      console.error(String(err));
    }
  );
}

async function getPrimaryApp() {
  return await connection(async (client) => {
    const result = await client.db().admin().replSetGetStatus();
    const primary = result.members.find(
      (member: any) => member.stateStr === "PRIMARY"
    );
    return APPS.find((app) => app.number === primary._id);
  });
}

const CHECK = "\u2713";
const CROSS = "\u2717";

export async function printReplicasStatus() {
  const connectionString = getConnectionString();
  const results = await connection(async (client) => {
    const result = await client.db().admin().replSetGetStatus();
    return result.members as any[];
  }, new MongoClient(connectionString, { serverSelectionTimeoutMS: 20_000, retryReads: true, directConnection: false })).catch(
    (error) => {
      console.error(error);
      return [];
    }
  );

  const table = new Table({
    head: ["Servidor", "Estado"],
    style: { compact: true, head: ["white"] },
  });

  for (const app of APPS) {
    const member = results.find(
      (member) => String(member._id) === String(app.number)
    );

    if (!member) {
      table.push([app.name, chalk.red("no disponible")]);
      continue;
    }

    const isPrimary = member.stateStr === "PRIMARY";
    const name = app?.name ?? member._id;
    const isDown = member.health === 0;

    const status = isDown ? chalk.red(CROSS) : chalk.green(CHECK);
    const stateStr = isPrimary ? chalk.bold(member.stateStr) : member.stateStr;

    table.push([name, `${status} ${stateStr}`]);
  }

  console.log(table.toString());
}
