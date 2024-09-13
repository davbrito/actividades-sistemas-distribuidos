import chalk from "chalk";
import Table from "cli-table3";
import { MongoClient, ObjectId } from "mongodb";
import { multiBattle } from "./bot/battle.js";
import { battleCollection, connection, pokemonCollection } from "./bot/db.js";
import { pokemonName, pokemonType } from "./bot/format.js";

export async function runBot() {
  await connection(async (client) => {
    await listLegendaryPokemons(client);
    {
      console.log();
      const pokemons = pokemonCollection(client);
      const pokemonTypes = [
        ...new Set(
          (await pokemons.distinct("Type 1"))
            .concat(await pokemons.distinct("Type 2"))
            .filter(Boolean)
        ),
      ];

      console.log();
      console.log(
        `Hay ${chalk.bold.blue(pokemonTypes.length)} tipos de pokemons`
      );
      console.log(pokemonTypes.join(", "));

      for (const type of pokemonTypes) {
        console.log(`    ${pokemonType(type)}`);
      }
    }

    {
      const generations = await pokemonCollection(client).distinct(
        "Generation"
      );
      console.log();
      console.log(
        `Generaciones de pokemons: ${chalk.bold.blue(generations.join(", "))}`
      );
    }
    // await multiBattle(10, client);
    // await battleRanking(15, client);
  });
}

export async function runBattle({
  count = 1,
  silent,
}: {
  count?: number;
  silent?: boolean;
}) {
  await connection(async (client) => {
    await multiBattle(count, client, silent);
  });
}

export const runRanking = async (limit = 20, client?: MongoClient) => {
  return await connection(async (client) => {
    await battleRanking(limit, client);
  }, client);
};

async function listLegendaryPokemons(client: MongoClient) {
  const legendary = await pokemonCollection(client)
    .find({ Legendary: true })
    .toArray();
  const legendaryCount = legendary.length;

  const byTypes = Object.groupBy(legendary, (pokemon) => pokemon["Type 1"]);

  console.log(`Hay ${chalk.bold.blue(legendaryCount)} pokemons legendarios`);

  for (const [type, pokemons] of Object.entries(byTypes)) {
    const count = pokemons?.length ?? 0;
    console.log(
      `    ${chalk.bold.blue(count)} son de tipo ${pokemonType(type)}`
    );
  }
}

interface RankItem {
  pokemonId: ObjectId;
  wins: number;
  losses: number;
}

async function battleRanking(limit = 20, client: MongoClient) {
  const battles = battleCollection(client);
  const pokemons = pokemonCollection(client);

  const map = new Map<string, RankItem>();

  for await (const battle of battles.find()) {
    const winnerId = battle.winnerId.toHexString();
    const loserId = battle.loserId.toHexString();

    if (!map.has(winnerId)) {
      map.set(winnerId, { pokemonId: battle.winnerId, wins: 0, losses: 0 });
    }

    if (!map.has(loserId)) {
      map.set(loserId, { pokemonId: battle.loserId, wins: 0, losses: 0 });
    }

    map.get(winnerId)!.wins++;
    map.get(loserId)!.losses++;
  }

  const table = new Table({ head: ["", "Pokemon", "Victorias", "Derrotas"] });

  for (const [, { wins, losses, pokemonId }] of map) {
    const poke = await pokemons.findOne(pokemonId);
    if (!poke) {
      continue;
    }

    table.push([0, pokemonName(poke), wins, losses]);

    if (table.length >= limit) {
      break;
    }
  }

  table.sort((a, b) => (b as any)[2] - (a as any)[2]);

  table.forEach((row, i) => {
    (row as any)[0] = i + 1;
  });

  console.log(table.toString());
}

export const lastBattles = connected(async (client) => {
  const battles = await battleCollection(client)
    .find()
    .sort({ createdAt: -1 })
    .limit(10)
    .toArray();

  const table = new Table({ head: ["Ganador", "Perdedor", "Fecha"] });

  for (const battle of battles) {
    const winner = await pokemonCollection(client).findOne(battle.winnerId);
    const loser = await pokemonCollection(client).findOne(battle.loserId);

    if (!winner || !loser) {
      continue;
    }

    table.push([
      pokemonName(winner),
      pokemonName(loser),
      battle.createdAt.toLocaleString(),
    ]);
  }

  console.log(table.toString());
});

export const clearBattles = connected(async (client) => {
  await client.db().collection("battles").drop();
});

function connected(fn: (client: MongoClient) => unknown) {
  return async () => {
    await connection(async (client) => {
      await fn(client);
    });
  };
}
