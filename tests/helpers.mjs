export function environment() {
  const values = new Map();
  const events = new EventTarget();
  globalThis.localStorage = {
    getItem: key => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: key => values.delete(key),
  };
  globalThis.CustomEvent = class extends Event { constructor(type, options = {}) { super(type); this.detail = options.detail; } };
  globalThis.window = Object.assign(events, { location: { hostname: 'localhost' } });
  globalThis.document = { getElementById: () => null };
  Object.defineProperty(globalThis, 'navigator', { configurable: true, value: {} });
  return values;
}
export const response = (data, status = 200) => ({ ok: status < 400, status, json: async () => data });
export const session = id => ({ token: `token-${id}`, user: { id } });
