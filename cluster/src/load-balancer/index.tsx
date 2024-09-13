import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { renderToStaticMarkup } from "react-dom/server";

const REGISTERED_SERVERS = (process.env.SERVERS || "")
  .split(",")
  .map((server) => {
    const [hostname, port] = server.split(":");
    return { hostname, port, url: `http://${server}` };
  });

const app = new Hono();

app.get("/info", async (c) => {
  const serverInfo = await fetchServersInfo();

  return c.html(
    "<!DOCTYPE html>" +
      renderToStaticMarkup(
        <html>
          <head>
            <meta charSet="utf-8" />
            <title>Info</title>
          </head>
          <body>
            <div id="app">
              <div>
                <h1>Información de servidores</h1>
                <ul>
                  {serverInfo.map((server) => {
                    return (
                      <li key={server.url}>
                        <strong>{server.url}</strong>: Se ha usado{" "}
                        {server.count} veces
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </body>
        </html>
      )
  );
});

let i = 0;
app.all("/*", (request) => {
  const server = REGISTERED_SERVERS[i++ % REGISTERED_SERVERS.length];
  console.log(`proxying request to ${server.hostname}:${server.port}`);
  const url = new URL(request.req.url);
  url.hostname = server.hostname;
  url.port = server.port;
  return fetch(url, request.req);
});

serve(
  {
    fetch: app.fetch,
    port: 3000,
    hostname: "0.0.0.0",
  },
  (address) => {
    console.log(
      `load balancer listening on ${address.address}:${address.port}`
    );
  }
);

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
