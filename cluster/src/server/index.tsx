import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { renderToStaticMarkup } from "react-dom/server";
import { HOST, PORT } from "./config.js";

const app = new Hono();

let handleCount = 0;

app
  .get("/serverinfo", (c) => {
    return c.json({ count: handleCount });
  })
  .get("/", async (c) => {
    c.status(200);

    return c.html(
      "<!DOCTYPE html>" +
        renderToStaticMarkup(
          <html>
            <head>
              <title>App</title>
            </head>
            <body>
              <div id="app">
                <div>Respondiendo desde servidor: {HOST}</div>
                <div>El servidor ha respondido {handleCount++} veces</div>
              </div>
            </body>
          </html>
        )
    );
  });

serve(
  {
    fetch: app.fetch,
    port: PORT,
    hostname: HOST,
  },
  (address) => {
    console.log(`server listening on ${address.address}:${address.port}`);
  }
);
