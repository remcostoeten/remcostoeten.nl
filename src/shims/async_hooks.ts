export class AsyncLocalStorage<T = unknown> {
  // no-op shim for client build
  run<R>(store: T, callback: (...args: any[]) => R, ...args: any[]): R {
    return callback(...args);
  }
  getStore(): T | undefined {
    return undefined;
  }
  enterWith(_store: T): void {}
  disable(): void {}
  exit<R>(_callback: (...args: any[]) => R, ..._args: any[]): R {
    // @ts-ignore
    return undefined;
  }
}
