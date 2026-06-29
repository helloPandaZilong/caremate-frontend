export class MockEventSource {
  static instances = [];
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSED = 2;

  constructor(url, options = {}) {
    this.url = url;
    this.options = options;
    this.readyState = MockEventSource.CONNECTING;
    this.closed = false;
    this.listeners = new Map();
    this.onopen = null;
    this.onerror = null;
    this.onmessage = null;
    MockEventSource.instances.push(this);
  }

  addEventListener(type, listener) {
    const listeners = this.listeners.get(type) ?? [];
    listeners.push(listener);
    this.listeners.set(type, listeners);
  }

  removeEventListener(type, listener) {
    const listeners = this.listeners.get(type) ?? [];
    this.listeners.set(
      type,
      listeners.filter((item) => item !== listener),
    );
  }

  open() {
    this.readyState = MockEventSource.OPEN;
    this.onopen?.({ type: 'open' });
  }

  emit(type, data = {}, extra = {}) {
    const event = {
      type,
      data: typeof data === 'string' ? data : JSON.stringify(data),
      lastEventId: extra.lastEventId ?? String(data?.id ?? ''),
      ...extra,
    };

    if (type === 'message') this.onmessage?.(event);
    for (const listener of this.listeners.get(type) ?? []) {
      listener(event);
    }
  }

  fail(error = new Error('SSE mock error')) {
    this.readyState = MockEventSource.CONNECTING;
    this.onerror?.(error);
  }

  close() {
    this.readyState = MockEventSource.CLOSED;
    this.closed = true;
  }

  static reset() {
    MockEventSource.instances = [];
  }

  static install() {
    globalThis.EventSource = MockEventSource;
    return MockEventSource;
  }
}
