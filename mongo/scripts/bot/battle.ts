import chalk from "chalk";
import CliTable3 from "cli-table3";
import { chunk } from "lodash-es";
import { MongoClient, WithId } from "mongodb";
import { Pokemon } from "./data.js";
import { battleCollection, pokemonCollection } from "./db.js";
import { formatPercentage, pokemonName } from "./format.js";

function simulateBattle(pokemon1: WithId<Pokemon>, pokemon2: WithId<Pokemon>) {
  const pokemon1Total = pokemon1.Total;
  const pokemon2Total = pokemon2.Total;

  const pokemon1Probability = pokemon1Total / (pokemon1Total + pokemon2Total);
  const pokemo2Probability = 1 - pokemon1Probability;
  const random = Math.random();

  const winner = random < pokemon1Probability ? pokemon1 : pokemon2;

  return {
    pokemon1,
    pokemon2,
    winner,
    loser: winner === pokemon1 ? pokemon2 : pokemon1,
    pokemon1Probability,
    pokemo2Probability,
    createdAt: new Date(),
  };
}

type BattleResult = ReturnType<typeof simulateBattle>;

async function getPokemonStatsData(
  client: MongoClient,
  pokemon: WithId<Pokemon>,
  vs: WithId<Pokemon>
) {
  const collection = battleCollection(client);

  const wins = await collection.countDocuments({ winnerId: pokemon._id });
  const losses = await collection.countDocuments({ loserId: vs._id });

  const total = wins + losses;

  const winRate = total ? wins / total : 0;

  return {
    total,
    wins,
    losses,
    winRate,
  };
}

type PokemonStats = Awaited<ReturnType<typeof getPokemonStatsData>>;

export async function battle({
  number,
  client,
  long,
  silent,
}: {
  number?: number;
  client: MongoClient;
  long?: boolean;
  silent?: boolean;
}) {
  const [pokemon1, pokemon2] = await pokemonCollection(client)
    .aggregate<WithId<Pokemon>>([{ $sample: { size: 2 } }])
    .toArray();

  const battleResults = simulateBattle(pokemon1, pokemon2);
  const { winner, loser, createdAt } = battleResults;

  await printBattle({
    silent,
    long,
    number,
    battleResults,
    client,
  });

  await battleCollection(client).insertMany([
    {
      winnerId: winner._id,
      loserId: loser._id,
      createdAt,
    },
  ]);
}

async function printBattle({
  number,
  client,
  long,
  silent,
  battleResults,
}: {
  number?: number;
  client: MongoClient;
  long?: boolean;
  silent?: boolean;
  battleResults: BattleResult;
}) {
  const { winner, pokemon1, pokemon2 } = battleResults;
  if (!silent) {
    if (!long) {
      const title =
        number !== undefined
          ? `Batalla ${number.toString().padStart(4, " ")}`
          : "Batalla";
      console.log(
        ` ${title}:   ${pokemonName(pokemon1)} vs. ${pokemonName(
          pokemon2
        )} -> Gana: ${pokemonName(winner)}`
      );
    } else {
      await longBattleResult(battleResults, pokemon1, pokemon2, client);
    }
  }
}

async function getBattlePairs(client: MongoClient, count: number) {
  const total = count * 2;
  const pokemons = await pokemonCollection(client)
    .aggregate<WithId<Pokemon>>([{ $sample: { size: total } }])
    .toArray();

  if (pokemons.length % 2 !== 0) {
    pokemons.pop();
  }

  return chunk(pokemons, 2);
}

export async function multiBattle(
  count: number,
  client: MongoClient,
  silent?: boolean | "none"
) {
  const long = count === 1;

  let interval;
  let i = 0;
  const buffer: BattleResult[] = [];

  const print = async (space?: "pre" | "pos") => {
    const battles = buffer.splice(0);
    if (silent === "none") return;
    if (space === "pre") {
      process.stdout.write("\n");
    }
    if (silent) {
      process.stdout.clearLine(0);
      process.stdout.cursorTo(0);
      process.stdout.write(formatPercentage(i / count));
    } else {
      for (const battleResults of battles) {
        await printBattle({ silent, long, battleResults, client });
      }
    }
    if (space === "pos") {
      process.stdout.write("\n");
    }
  };

  try {
    await print("pre");
    interval = setInterval(() => {
      print();
    }, 500);

    while (i < count) {
      const pokemons = await getBattlePairs(client, count - i);
      const results = [];

      for (const pair of pokemons) {
        const result = simulateBattle(pair[0], pair[1]);
        results.push({
          winnerId: result.winner._id,
          loserId: result.loser._id,
          createdAt: result.createdAt,
        });
        buffer.push(result);
        i++;
      }

      await battleCollection(client).insertMany(results);
    }

    await print("pos");
    if (silent !== "none") {
      console.log();
    }
  } finally {
    if (interval) {
      clearInterval(interval);
    }
  }
}

async function longBattleResult(
  battleResults: BattleResult,
  pokemon1: WithId<Pokemon>,
  pokemon2: WithId<Pokemon>,
  client: MongoClient
) {
  const { winner, loser, pokemon1Probability, pokemo2Probability } =
    battleResults;
  console.log(``);
  console.log(`Batalla: ${pokemonName(pokemon1)} vs. ${pokemonName(pokemon2)}`);
  const winnerStats = await getPokemonStatsData(client, winner, loser);
  const loserStats = await getPokemonStatsData(client, loser, winner);

  renderBattlePokemon(
    "Ganador (🏆)",
    winner,
    winner === pokemon1 ? pokemon1Probability : pokemo2Probability,
    winnerStats
  );

  renderBattlePokemon(
    "Perdedor",
    loser,
    winner === pokemon1 ? pokemo2Probability : pokemon1Probability,
    loserStats
  );

  console.log(``);
  console.log(`El ganador es ${chalk.bold.blue(winner.Name)}!`);
}

function renderBattlePokemon(
  title: string,
  poke: WithId<Pokemon>,
  probability: number,
  stats: PokemonStats
) {
  const table = new CliTable3({
    chars: {
      "left-mid": "",
      "mid-mid": "",
      "right-mid": "",
      "top-mid": "",
      "bottom-mid": "",
      mid: "",
      middle: "",
      left: "  ",
      right: "  ",
      top: " ",
      "top-left": "",
      "top-right": "",
      "bottom-left": "  ",
      "bottom-right": "",
    },
  });

  const formattedName = `${pokemonName(poke)} (${chalk.dim(`#${poke["#"]}`)})`;
  const dash = chalk.dim("─");
  table.push(
    { [title]: formattedName },
    {
      [dash.repeat(countChars(title))]: dash.repeat(countChars(formattedName)),
    },
    { Probabilidad: formatPercentage(probability) },
    {
      Estadísticas:
        `Ganadas: ${stats.wins}` +
        ` / Perdidas: ${stats.losses}` +
        ` (Tasa de Victorias ${formatPercentage(stats.winRate)})`,
    }
  );

  console.log(table.toString());
}

function countChars(str: string) {
  return Array.from(str).length;
}
