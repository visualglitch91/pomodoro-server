const Status = {
  FOCUS: "focus",
  SHORT_BREAK: "short-break",
  LONG_BREAK: "long-break",
};

const Config = {
  cyclesBeforeLongBreak: 4,
  initialStatus: Status.FOCUS,
  durations: {
    [Status.FOCUS]: 25 * 60,
    [Status.SHORT_BREAK]: 5 * 60,
    [Status.LONG_BREAK]: 15 * 60,
  },
};

export default class Pomodoro {
  _interval = 0;
  _running = false;
  _status = Config.initialStatus;
  _prevStatus = Config.initialStatus;
  _duration = Config.durations[Config.initialStatus];
  _remaining = Config.durations[Config.initialStatus];
  _cycleCount = 0;
  _onStateChange = () => {};

  constructor({ onStateChange }) {
    this._onStateChange = onStateChange;
  }

  _emitStateChange() {
    this._onStateChange(this.getState());
  }

  _tick() {
    this._remaining -= 1;
    this._prevStatus = this._status;

    if (this._remaining < 0) {
      switch (this._status) {
        case Status.FOCUS:
          this._status =
            this._cycleCount >= Config.cyclesBeforeLongBreak - 1
              ? Status.LONG_BREAK
              : Status.SHORT_BREAK;
          break;
        case Status.LONG_BREAK:
          this._status = Status.FOCUS;
          this._cycleCount = 0;
          break;
        case Status.SHORT_BREAK:
          this._status = Status.FOCUS;
          this._cycleCount++;
          break;
      }

      this._duration = Config.durations[this._status];
      this._remaining = Config.durations[this._status];
    }

    this._emitStateChange();
  }

  getState() {
    return {
      running: this._running,
      status: this._status,
      prevStatus: this._prevStatus,
      duration: this._duration,
      remaining: this._remaining,
      cycleCount: this._cycleCount,
    };
  }

  start() {
    if (!this._running) {
      clearInterval(this._interval);
      this._running = true;
      this._interval = setInterval(() => this._tick(), 1000);
      this._emitStateChange();
    }
  }

  stop() {
    if (this._running) {
      clearInterval(this._interval);
      this._running = false;
      this._emitStateChange();
    }
  }

  skip() {
    this._remaining = 0;
    this._tick();
  }

  reset() {
    this._remaining = Config.durations[Config.initialStatus];
    this._prevStatus = Config.initialStatus;
    this._status = Config.initialStatus;
    this._cycleCount = 0;
    this._emitStateChange();
  }
}
