import { serve } from "@hono/node-server";
import { getConnInfo } from "@hono/node-server/conninfo";
import { Hono } from "hono";
import { logger } from "hono/logger";
import { renderDocument } from "../page/index.js";

const REGISTERED_SERVERS = (process.env.SERVERS || "")
  .split(",")
  .map((server) => {
    const [hostname, port] = server.split(":");
    const url = `http://${server}`;
    return { hostname, port, url };
  });

type ServerInfo = (typeof REGISTERED_SERVERS)[0];

const app = new Hono();

app.use(logger());

app.get("/info", async (c) => {
  const serverInfo = await fetchServersInfo();

  return c.html(
    renderDocument(
      <div>
        <h1>Información de servidores</h1>
        <ul>
          {serverInfo.map((server) => {
            return (
              <li key={server.url}>
                <strong>{server.url}</strong>: Se ha usado {server.count} veces
              </li>
            );
          })}
        </ul>
      </div>,
      { title: "Info", pathname: c.req.path },
    ),
  );
});

app.use(async (c) => {
  const server = await getNextServer();
  const conninfo = getConnInfo(c);

  const selfAddress = `${conninfo.remote.address}:${conninfo.remote.port}${c.req.path}`;
  const serverAddress = `${server.hostname}:${server.port}${c.req.path}`;
  console.log(`redirigiendo peticion ${selfAddress} -> ${serverAddress}`);

  return await proxy(c.req.raw, server);
});

serve(
  {
    fetch: app.fetch,
    port: 3000,
    hostname: "0.0.0.0",
  },
  (address) => {
    console.log(
      `load balancer listening on ${address.address}:${address.port}`,
    );
  },
);

let i = 0;
async function getNextServer() {
  for (let iter = 0; iter < 10; iter++) {
    const nextServer = REGISTERED_SERVERS[i++ % REGISTERED_SERVERS.length];

    if (await isOk(nextServer)) {
      return nextServer;
    }
  }

  throw new Error("No servers available");
}

async function isOk(server: ServerInfo) {
  try {
    console.log(`checking server ${server.url}`);
    const res = await fetch(`${server.url}/heartbeat`);

    return res.status === 200;
  } catch (e) {
    console.error(e);
    return false;
  }
}

async function fetchServersInfo() {
  const infos = [];

  for (const server of REGISTERED_SERVERS) {
    const info = fetch(server.url + "/serverinfo")
      .then((r) => r.json())
      .then((d: any) => ({ ...d, ...server }));
    infos.push(info);
  }

  return Promise.all(infos);
}

async function proxy(req: Request, server: ServerInfo) {
  const url = new URL(req.url);
  url.hostname = server.hostname;
  url.port = server.port;

  return await fetch(url, {
    method: req.method,
    headers: req.headers,
    body: req.body,
    duplex: req.duplex,
    credentials: req.credentials,
    integrity: req.integrity,
    redirect: req.redirect,
    referrer: req.referrer,
    referrerPolicy: req.referrerPolicy,
    keepalive: req.keepalive,
    signal: req.signal,
    mode: req.mode,
  });
}
