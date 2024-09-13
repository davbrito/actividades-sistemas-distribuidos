import { serve } from "@hono/node-server";
import { getConnInfo } from "@hono/node-server/conninfo";
import { Hono, HonoRequest } from "hono";
import { logger } from "hono/logger";
import { renderToStaticMarkup } from "react-dom/server";
import Document from "../server/document.js";

const REGISTERED_SERVERS = (process.env.SERVERS || "")
  .split(",")
  .map((server) => {
    const [hostname, port] = server.split(":");
    return { hostname, port, url: `http://${server}` };
  });

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

let i = 0;
app.use(async (c) => {
  const server = getNextServer();
  const req = replaceRequestHost(c.req, server);
  const conninfo = getConnInfo(c);

  const selfAddress = `${conninfo.remote.address}:${conninfo.remote.port}${c.req.path}`;
  const serverAddress = `${server.hostname}:${server.port}${c.req.path}`;
  console.log(`redirigiendo peticion ${selfAddress} -> ${serverAddress}`);

  return await fetch(req);
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

function replaceRequestHost(
  req: HonoRequest,
  server: (typeof REGISTERED_SERVERS)[0],
) {
  const url = new URL(req.url);
  url.hostname = server.hostname;
  url.port = server.port;
  return new Request(url, req.raw);
}

function getNextServer() {
  return REGISTERED_SERVERS[i++ % REGISTERED_SERVERS.length];
}

async function fetchServersInfo() {
  const infos = [];

  for (const server of REGISTERED_SERVERS) {
    const url = `http://${server.hostname}:${server.port}`;
    const info = fetch(`${url}/serverinfo`)
      .then((r) => r.json())
      .then((d: any) => ({ ...d, ...server }));
    infos.push(info);
  }

  return Promise.all(infos);
}
