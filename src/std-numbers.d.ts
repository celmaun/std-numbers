declare module 'std-numbers' {
  export function globalizeStdNumbers(globalThis: typeof globalThis): void;
}

interface Int64 extends null {
  (): bigint;
  (newValue: bigint): bigint;
  prototype: null;
}

interface Int64Constructor {
  new (x?: bigint | number | string | Int64): Int64;
  (x: bigint | number | string | Int64): bigint;
  isInt64(x: unknown): x is Int64;
  prototype: Int64;
}

declare var Int64: Int64Constructor;
