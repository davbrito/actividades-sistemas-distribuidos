import csvParser from "csv-parser";
import { MongoClient, ObjectId } from "mongodb";
import { Readable } from "node:stream";
import { pokemonCollection } from "./db.js";

export interface Pokemon {
  "#": number;
  Name: string;
  "Type 1": string;
  "Type 2": string;
  Total: number;
  HP: number;
  Attack: number;
  Defense: number;
  "Sp. Atk": number;
  "Sp. Def": number;
  Speed: number;
  Generation: number;
  Legendary: boolean;
}

export interface Battle {
  winnerId: ObjectId;
  loserId: ObjectId;
  createdAt: Date;
}

const DATA_URL =
  "https://gist.githubusercontent.com/armgilles/194bcff35001e7eb53a2a8b441e8b2c6/raw/92200bc0a673d5ce2110aaad4544ed6c4010f687/pokemon.csv";

export async function fetchPokemons() {
  const response = await fetch(DATA_URL);
  const stream = Readable.fromWeb(response.body!).pipe(
    csvParser({
      mapValues: ({ value }) => {
        if (/^\d+$/.test(value)) {
          return Number(value);
        }

        if (value === "True" || value === "False") {
          return JSON.parse(value.toLowerCase());
        }

        if (value === "") {
          return null;
        }

        return value;
      },
    })
  );

  const items: Pokemon[] = [];

  for await (const data of stream) {
    items.push(data);
  }

  return items;
}

export async function populatePokemons(client: MongoClient) {
  const collection = pokemonCollection(client);
  await collection.drop();
  await collection.createIndex({ Name: 1 }, { unique: true });

  const pokemons = await fetchPokemons();

  return await collection.insertMany(pokemons);
}
