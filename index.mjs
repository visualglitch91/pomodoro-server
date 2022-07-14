import http from "http";
import serveStatic from "serve-static";
import WebSocket, { WebSocketServer } from "ws";
import Pomodoro from "./Pomodoro.mjs";
import hooks from "./hooks.mjs";

const port = 2000;

const pomodoro = new Pomodoro({
  onStateChange: (state) => {
    hooks(state);
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(state));
      }
    });
  },
});

const serveClient = serveStatic("client");

const pomodoroMethods = ["start", "stop", "skip", "reset"];

function callPomodoroMethod(method) {
  console.log({ method });
  if (pomodoroMethods.includes(method)) {
    pomodoro[method]();
  }
}

const server = http.createServer((req, res) => {
  if (req.url.startsWith("/api/")) {
    callPomodoroMethod(req.url.slice(5));

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

  client.on("message", (data) => {
    callPomodoroMethod(data.toString());
  });
});

server.listen(port, () => {
  console.log("Pomodoro Server is running on port", port);
});
