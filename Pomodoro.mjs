const Status = {
  FOCUS: "focus",
  SHORT_BREAK: "short-break",
  LONG_BREAK: "long-break",
};

const totalCycle = 4;

const durations = {
  [Status.FOCUS]: 5,
  [Status.SHORT_BREAK]: 2,
  [Status.LONG_BREAK]: 4,
};

const initialStatus = Status.FOCUS;

const initialState = {
  running: false,
  remaining: durations[initialStatus],
  prevStatus: initialStatus,
  status: initialStatus,
  cycleCount: 0,
};

export default function Pomodoro({ onStateChange }) {
  let interval = 0;
  let state = { ...initialState };

  function setState(nextState) {
    state = nextState;
    onStateChange(state);
  }

  function getState() {
    return state;
  }

  function tick() {
    const nextState = { ...state, remaining: state.remaining - 1 };

    if (nextState.remaining < 0) {
      switch (nextState.status) {
        case Status.FOCUS:
          nextState.status =
            nextState.cycleCount >= totalCycle - 1
              ? Status.LONG_BREAK
              : Status.SHORT_BREAK;
          break;
        case Status.LONG_BREAK:
          nextState.status = Status.FOCUS;
          nextState.cycleCount = 0;
          break;
        case Status.SHORT_BREAK:
          nextState.status = Status.FOCUS;
          nextState.cycleCount++;
          break;
      }

      nextState.remaining = durations[nextState.status];
    }

    nextState.prevStatus = state.status;
    setState(nextState);
  }

  function start() {
    if (!state.running) {
      clearInterval(interval);
      interval = setInterval(tick, 1000);
      setState({ ...state, running: true });
    }
  }

  function stop() {
    if (state.running) {
      clearInterval(interval);
      setState({ ...state, running: false });
    }
  }

  function skip() {
    state = { ...state, remaining: 0 };
    tick();
  }

  function reset() {
    setState({ ...initialState });
  }

  return {
    start,
    stop,
    skip,
    reset,
    getState,
  };
}
