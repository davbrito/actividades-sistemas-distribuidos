import mysql from "mysql2/promise";
import { createTable } from "./movies.js";

const connection = await mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "root",
  database: "web",
});

try {
  await createTable(connection);
} finally {
  await connection.end();
}
