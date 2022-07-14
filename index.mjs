import http from "http";
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

const server = http.createServer((req, res) => {
  const handler = {
    start: () => pomodoro.start(),
    stop: () => pomodoro.stop(),
    skip: () => pomodoro.skip(),
    reset: () => pomodoro.reset(),
  }[req.url.slice(1)];

  if (handler) {
    handler();
  }

  res.setHeader("Content-Type", "application/json");
  res.writeHead(200);
  res.end(JSON.stringify(pomodoro.getState()));

  return;
});

const wss = new WebSocketServer({ server });

server.listen(port, () => {
  console.log("Pomodoro Server is running on port", port);
});
