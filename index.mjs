import http from "http";
import serveStatic from "serve-static";
import WebSocket, { WebSocketServer } from "ws";
import Pomodoro from "./Pomodoro.mjs";

const port = 2000;

const pomodoro = new Pomodoro({
  onStateChange: (state) => {
    wss.clients.forEach(function each(client) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(state));
      }
    });
  },
});

const serveClient = serveStatic("client");

const server = http.createServer((req, res) => {
  if (req.url.startsWith("/api/")) {
    const handler = {
      start: () => pomodoro.start(),
      stop: () => pomodoro.stop(),
      skip: () => pomodoro.skip(),
      reset: () => pomodoro.reset(),
      state: () => {},
    }[req.url.slice(5)];

    if (handler) {
      handler();
    }

    res.setHeader("Content-Type", "application/json");
    res.writeHead(200);
    res.end(JSON.stringify(pomodoro.getState()));
  } else {
    serveClient(req, res, () => {
      res.writeHead(404);
      res.end();
    });
  }

  return;
});

const wss = new WebSocketServer({ server });

wss.on("connection", (client) => {
  client.send(JSON.stringify(pomodoro.getState()));
});

server.listen(port, () => {
  console.log("Pomodoro Server is running on port", port);
});
