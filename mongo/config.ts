import { $ } from "execa";

export const REPLICA_SET = "rs0";
export const DATABASE_NAME = "distribuidos";
export const MONGODB_VERSION = "7.0.12-ubuntu2204";
export const MONGODB_IMAGE = `mongodb/mongodb-community-server:${MONGODB_VERSION}`;
export const $$ = $({ verbose: "short", stdio: "inherit" });

class DbServerApp {
  constructor(public number: number, public ip: string, public port: number) {}

  get name() {
    return `mongodb-${this.number}`;
  }

  get host() {
    return `localhost:${this.port}`;
  }

  get connectionStr() {
    return `mongodb://${this.host}/${DATABASE_NAME}`;
  }
}

export const APPS = [
  new DbServerApp(1, "192.168.0.2", 27017),
  new DbServerApp(2, "192.168.0.3", 27018),
  new DbServerApp(3, "192.168.0.4", 27019),
];

export function getConnectionString(number?: number) {
  if (number === undefined) {
    const host = APPS.map((app) => app.host).join(",");

    return `mongodb://${host}/${DATABASE_NAME}`;
  }

  const app = APPS[number - 1];

  if (!app) {
    throw new Error(`App ${number} not found`);
  }

  return app.connectionStr;
}
