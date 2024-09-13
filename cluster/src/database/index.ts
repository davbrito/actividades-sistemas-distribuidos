import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { HOST, PORT } from "./config.js";

const app = new Hono();

let count = 0;

app.get("/", (c) => c.json({ count: count++ }));

serve({ fetch: app.fetch, port: PORT, hostname: HOST }, (address) => {
  console.log(`server listening on ${address.address}:${address.port}`);
});
