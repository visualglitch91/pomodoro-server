import { $, formatRemaining, onSpacebar } from "./utils.mjs";
import createProgressRing from "./createProgressRing.mjs";

const themeColors = {
  focus: "#e74c3c",
  "short-break": "#3498db",
  "long-break": "#27ae60",
};

const pauseIcon = "./assets/pause-icon.svg";
const playIcon = "./assets/play-icon.svg";
const prevIcon = "./assets/prev-icon.svg";
const nextIcon = "./assets/next-icon.svg";

const tomatos = $(".tomatos");
const remaining = $("#remaining");
const themeColor = $('meta[name="theme-color"]');
const focusLabel = $("#focus-label");
const shotBreakLabel = $("#shot-break-label");
const longBreakLabel = $("#long-break-label");
const resetButton = $("#reset-button");
const playPauseButton = $("#play-pause-button");
const prevButton = $("#prev-button");
const nextButton = $("#next-button");
const progressRing = createProgressRing($("#progress-ring"), 4, 130, 0);

let isRunning = false;

prevButton.firstChild.src = prevIcon;
nextButton.firstChild.src = nextIcon;

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

  const nextPlayPauseIcon = state.running ? pauseIcon : playIcon;

  if (playPauseButton.firstChild.getAttribute("src") !== nextPlayPauseIcon) {
    playPauseButton.firstChild.src = nextPlayPauseIcon;
  }

  progressRing.setProgress(((duration - state.remaining) / duration) * 100);
}

const isSecure = window.location.protocol === "https:";

let ws;

function connect() {
  function retry() {
    setTimeout(connect, 1000);
  }

  ws = new WebSocket(`${isSecure ? "wss" : "ws"}://${window.location.host}`);

  ws.addEventListener("message", (e) => {
    const state = JSON.parse(e.data);
    isRunning = state.running;
    render(state);
  });

  ws.addEventListener("close", retry);
  ws.addEventListener("error", retry);
}

function onToggleRunning() {
  ws?.send(isRunning ? "stop" : "start");
}

function onReset() {
  ws?.send("reset");
  playPauseButton.focus();
}

function onPrev() {
  ws?.send("prev");
  playPauseButton.focus();
}

function onNext() {
  ws?.send("next");
  playPauseButton.focus();
}

onSpacebar(onToggleRunning);
resetButton.addEventListener("click", onReset);
playPauseButton.addEventListener("click", onToggleRunning);
prevButton.addEventListener("click", onPrev);
nextButton.addEventListener("click", onNext);
connect();
