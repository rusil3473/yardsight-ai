// Browser polyfill for server-only ioredis imported by isomorphic packages
export default class Redis {
  constructor() {}
  on() { return this; }
  connect() { return Promise.resolve(); }
  disconnect() { return Promise.resolve(); }
  quit() { return Promise.resolve(); }
}
