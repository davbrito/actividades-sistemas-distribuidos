import { MongoClient } from "mongodb";
import { getConnectionString } from "../../config.js";
import { Battle, Pokemon } from "./data.js";

const POKEMONS_COLLECTION = "pokemons";
const BATTLES_COLLECTION = "battles";

export function pokemonCollection(cl: MongoClient) {
  return cl.db().collection<Pokemon>(POKEMONS_COLLECTION);
}

export function battleCollection(cl: MongoClient) {
  return cl.db().collection<Battle>(BATTLES_COLLECTION);
}

export async function connection<T>(
  callback: (client: MongoClient) => T | Promise<T>,
  cl: MongoClient = new MongoClient(getConnectionString())
) {
  try {
    return await callback(cl);
  } finally {
    await cl.close();
  }
}
