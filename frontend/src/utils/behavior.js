export class TypingTracker {
  constructor() {
    this.keys = {};
    this.metrics = [];
    this.lastKeyup = null;
  }

  onKeyDown(e) {
    const now = Date.now();
    this.keys[e.key] = now;
    const flightTime = this.lastKeyup ? now - this.lastKeyup : 0;
    this.metrics.push({ type: "keydown", flightTime, timestamp: now });
  }

  onKeyUp(e) {
    const now = Date.now();
    const downTime = this.keys[e.key];
    const dwellTime = downTime ? now - downTime : 0;
    this.lastKeyup = now;
    this.metrics.push({ type: "keyup", dwellTime, timestamp: now });
    delete this.keys[e.key];
  }

  onPaste(e) {
    this.metrics.push({ type: "paste", timestamp: Date.now() });
  }

  getData() {
    return this.metrics;
  }
}

export class MouseTracker {
  constructor() {
    this.metrics = [];
    this.lastMove = Date.now();
    this.lastClick = null;
  }

  onMouseMove(e) {
    const now = Date.now();
    const timeDiff = now - this.lastMove;
    if (timeDiff > 50) {
      this.metrics.push({ type: "move", x: e.clientX, y: e.clientY, timeDiff });
      this.lastMove = now;
    }
  }

  onClick(e) {
    const now = Date.now();
    const clickInterval = this.lastClick ? now - this.lastClick : 0;
    this.metrics.push({
      type: "click",
      x: e.clientX,
      y: e.clientY,
      clickInterval,
    });
    this.lastClick = now;
  }

  getData() {
    return this.metrics;
  }
}

export const typingTracker = new TypingTracker();
export const mouseTracker = new MouseTracker();
