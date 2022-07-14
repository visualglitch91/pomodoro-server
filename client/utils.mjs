export function formatRemaining(remaining) {
  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  return `${minutes}:${seconds < 10 ? `0${seconds}` : seconds}`;
}

export function cx(...args) {
  return args.filter((className) => typeof className === "string").join(" ");
}

export function times(number, handler) {
  return Array(number)
    .fill(null)
    .map((_, index) => handler(index));
}

export function $(selector) {
  return document.querySelector(selector);
}

export function onSpacebar(handler) {
  window.addEventListener("keydown", (e) => {
    const target = e.target;

    if (e.key === " " && target.tagName !== "BUTTON") {
      handler();
    }
  });
}
