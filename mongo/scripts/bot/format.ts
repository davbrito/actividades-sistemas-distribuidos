import chalk, { ForegroundColorName } from "chalk";
import { Pokemon } from "./data.js";
import invariant from "invariant";

export const typeColors: Record<string, ForegroundColorName> = {
  Ice: "cyan",
  Electric: "yellow",
  Fire: "red",
  Psychic: "magenta",
  Water: "blue",
  Rock: "gray",
  Steel: "gray",
  Dragon: "red",
  Ground: "yellow",
  Normal: "white",
  Ghost: "magenta",
  Dark: "gray",
  Grass: "green",
  Flying: "cyan",
  Fairy: "magenta",
  Bug: "green",
  Poison: "magenta",
  Fighting: "red",
};

export const typeEmojis: Record<string, string> = {
  Ice: "❄️",
  Electric: "⚡",
  Fire: "🔥",
  Psychic: "🔮",
  Water: "💧",
  Rock: "🪨",
  Steel: "🦾",
  Dragon: "🐉",
  Ground: "⛰️",
  Normal: "🟦",
  Ghost: "👻",
  Dark: "🌑",
  Grass: "🌿",
  Flying: "🦅",
  Fairy: "🧚",
  Bug: "🐞",
  Poison: "☠️",
  Fighting: "🥊",
};

export function pokemonName(pokemon: Pokemon) {
  const type = pokemon["Type 1"];
  const color = typeColors[type] ?? "white";
  return chalk.bold[color](pokemon.Name) + " " + typeEmojis[type] + " ";
}

export function pokemonType(type: string) {
  invariant(type in typeColors, `Tipo ${type} no encontrado`);
  invariant(type in typeEmojis, `Emoji para tipo ${type} no encontrado`);

  return chalk.bold[typeColors[type] ?? "white"](type) + " " + typeEmojis[type];
}

export const formatPercentage = new Intl.NumberFormat(undefined, {
  style: "percent",
  maximumFractionDigits: 2,
}).format;
