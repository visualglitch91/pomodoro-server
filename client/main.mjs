import { $, formatRemaining, onSpacebar } from "./utils.mjs";
import createProgressRing from "./createProgressRing.mjs";

const themeColors = {
  focus: "#e74c3c",
  "short-break": "#3498db",
  "long-break": "#27ae60",
};

const pauseIcon = "./assets/pause-icon.svg";
const playIcon = "./assets/play-icon.svg";

const tomatos = $(".tomatos");
const remaining = $("#remaining");
const themeColor = $('meta[name="theme-color"]');
const focusLabel = $("#focus-label");
const shotBreakLabel = $("#shot-break-label");
const longBreakLabel = $("#long-break-label");
const resetButton = $("#reset-button");
const playPauseButton = $("#play-pause-button");
const progressRing = createProgressRing($("#progress-ring"), 4, 130, 0);

let isRunning = false;

function render(state) {
  const { status, duration } = state;
  const timeRemaining = formatRemaining(state.remaining);
  const title = `(${state.running ? "▶" : "◼"} ${timeRemaining}) Smooth Tomato`;

  document.title = title;

  document.body.className = status.toLowerCase();

  themeColor.setAttribute("content", themeColors[status]);

  remaining.textContent = timeRemaining;

  focusLabel.classList.toggle("active", status === "focus");
  shotBreakLabel.classList.toggle("active", status === "short-break");
  longBreakLabel.classList.toggle("active", status === "long-break");

  Array.from(tomatos.children).forEach((tomato, index) => {
    tomato.classList.toggle("active", index === state.cycleCount);
  });

  playPauseButton.firstChild.src = state.running ? pauseIcon : playIcon;

  progressRing.setProgress(((duration - state.remaining) / duration) * 100);
}

const isSecure = window.location.protocol === "https:";

function api(path) {
  return fetch(
    `${window.location.protocol}//${window.location.host}/api/${path}`
  );
}

function onToggleRunning() {
  api(isRunning ? "stop" : "start");
}

function onReset() {
  api("reset");
  playPauseButton.focus();
}

const ws = new WebSocket(
  `${isSecure ? "wss" : "ws"}://${window.location.host}`
);

ws.addEventListener("message", (e) => {
  const state = JSON.parse(e.data);
  isRunning = state.running;
  render(state);
});

onSpacebar(onToggleRunning);
resetButton.addEventListener("click", onReset);
playPauseButton.addEventListener("click", onToggleRunning);
