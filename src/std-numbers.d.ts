declare module 'std-numbers' {
  export function globalizeStdNumbers(globalThis: typeof globalThis): void;
}

interface Int64 {
  get [0](): bigint;
  set [0](value: bigint);
}

interface Int64Constructor {
  new (x?: bigint | number | string | Int64): Int64;
  isInt64(x: unknown): x is Int64;
  MIN_VALUE: bigint;
  MAX_VALUE: bigint;
  prototype: Int64;
}

declare var Int64: Int64Constructor;
