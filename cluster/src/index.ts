import { Command } from "commander";
import { $ } from "execa";

const $$ = $({ verbose: "full" });

const program = new Command();

program.command("init").action(async () => {
  await $$`docker compose up`;
});

program.command("stop").action(async () => {
  await $$`docker compose down`;
});

program.command("help").action(() => {
  console.log(program.helpInformation());
});

program.parse();
