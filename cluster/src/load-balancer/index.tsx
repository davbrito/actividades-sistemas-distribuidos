import { serve } from "@hono/node-server";
import { getConnInfo } from "@hono/node-server/conninfo";
import { Hono, HonoRequest } from "hono";
import { logger } from "hono/logger";
import { renderToStaticMarkup } from "react-dom/server";
import Document from "../server/document.js";
import { Client, Dispatcher, HeadersInit, Request } from "undici";
import { mean, sum } from "lodash-es";

const REGISTERED_SERVERS = (process.env.SERVERS || "")
  .split(",")
  .map((server) => {
    const [hostname, port] = server.split(":");
    const url = `http://${server}`;
    const client = new Client(url, {
      keepAliveTimeout: 10,
      keepAliveMaxTimeout: 10,
    });
    return { hostname, port, url, client };
  });

type ServerInfo = (typeof REGISTERED_SERVERS)[0];

const app = new Hono();

app.use(logger());

app.get("/info", async (c) => {
  const serverInfo = await fetchServersInfo();

  return c.html(
    "<!DOCTYPE html>" +
      renderToStaticMarkup(
        <Document title="Info" pathname={c.req.path}>
          <div>
            <h1>Información de servidores</h1>
            <ul>
              {serverInfo.map((server) => {
                return (
                  <li key={server.url}>
                    <strong>{server.url}</strong>: Se ha usado {server.count}{" "}
                    veces
                  </li>
                );
              })}
            </ul>
          </div>
        </Document>,
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
    const res = await server.client.request({
      method: "GET",
      path: "/heartbeat",
    });

    return res.statusCode === 200;
  } catch (e) {
    console.error(e);
    return false;
  }
}

async function fetchServersInfo() {
  const infos = [];

  for (const server of REGISTERED_SERVERS) {
    const info = server.client
      .request({
        method: "GET",
        path: "/serverinfo",
        throwOnError: true,
      })
      .then((r) => r.body.json())
      .then((d: any) => ({ ...d, ...server }));
    infos.push(info);
  }

  return Promise.all(infos);
}

async function proxy(request: Request, server: ServerInfo) {
  const url = new URL(request.url);

  const res = await server.client.request({
    method: request.method as Dispatcher.HttpMethod,
    path: url.pathname + url.search,
    headers: request.headers,
    body: request.body as any,
  });

  return new Response(res.body, {
    status: res.statusCode,
    headers: res.headers as HeadersInit,
  });
}
