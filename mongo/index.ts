import { Command } from "commander";
import { $$, APPS, getConnectionString, MONGODB_IMAGE } from "./config.js";
import {
  clearBattles,
  lastBattles,
  runBattle,
  runRanking,
} from "./scripts/bot.js";
import {
  initiateReplicaSet,
  printReplicasStatus,
  runServers,
  runTest,
  seedDatabase,
  stopServers,
} from "./scripts/run.js";

const program = new Command();

program.command("run").action(async () => {
  await runServers();
});

program.command("stop").action(async () => {
  await stopServers();
});

program.command("status").action(async () => {
  await printReplicasStatus();
});

program.command("replica-set").action(async () => {
  await initiateReplicaSet();
});

program.command("seed").action(async () => {
  await seedDatabase();
});

program.command("constring").action(async () => {
  console.log(getConnectionString());
});

program
  .command("mongosh")
  .argument("[nth]", "nth server")
  .action(async (nth) => {
    let connectionString;
    if (nth === undefined) {
      connectionString = getConnectionString();
    } else {
      nth = parseInt(nth);
      const app = APPS[nth - 1];
      if (!app) {
        console.log("Invalid nth");
        return;
      }

      connectionString = getConnectionString(nth);
    }
    await $$`docker run
    --name mongosh-${crypto.randomUUID()}
    --rm
    -it
    --network host
    ${MONGODB_IMAGE}
    mongosh ${connectionString}
    `.catch((err) => {
      console.error(String(err));
    });
  });

program
  .command("battle")
  .argument("[count]", "battle count", Number, 1)
  .option("-s, --silent", "silent mode")
  .action(async (count, options) => {
    await runBattle({
      count,
      silent: options.silent,
    });
  });

program.command("rank").action(async () => {
  await runRanking();
});

program.command("last").action(async () => {
  await lastBattles();
});

program.command("clear-battles").action(async () => {
  await clearBattles();
});

program.command("bot").action(async () => {
  await runTest();
});

program.command("help").action(() => {
  console.log(program.helpInformation());
});

program.parse();
