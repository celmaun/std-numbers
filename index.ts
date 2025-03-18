import type {
  i32,
  u32,
  i64,
  u64,
  BigIntCastable,
} from "./types";
import { defineReadonly, defineStatic } from "./util";

defineReadonly(Number, {
  MIN_INT32: -(2 ** 31),
  MAX_INT32: 2 ** 31 - 1,
  MIN_UINT32: 0,
  MAX_UINT32: 2 ** 32,
});

const NumberConstructorMethods = {
  isi32(value: unknown): value is i32 {
    return (
      typeof value === "number" &&
      (!value ? Object.is(value, 0) : value === (value | 0))
    );
  },
  isu32(value: unknown): value is u32 {
    return (
      typeof value === "number" &&
      (!value ? Object.is(value, 0) : value === value >>> 0)
    );
  },
  is32Bit(value: unknown): value is i32 | u32 {
    return (
      typeof value === "number" &&
      (!value
        ? Object.is(value, 0)
        : (value | 0) === value || value >>> 0 === value)
    );
  },
} as const;

defineStatic(Number, NumberConstructorMethods);

defineReadonly(BigInt, {
  MIN_INT64: -(2n ** 63n),
  MAX_INT64: 2n ** 63n - 1n,
  MIN_UINT64: 0n,
  MAX_UINT64: 2n ** 64n,
});


const BigIntConstructorMethods = {
  isInt64(value: unknown): value is i64 {
    const MIN_INT64 = -9223372036854775808n; // BigInt.MIN_INT64
    const MAX_INT64 = 9223372036854775807n; // BigInt.MAX_INT64

    return (
      typeof value === "bigint" && value >= MIN_INT64 && value <= MAX_INT64
    );
  },
  isUint64(value: unknown): value is u64 {
    const MAX_UINT64 = 18446744073709551615n; // BigInt.MAX_UINT64
    return typeof value === "bigint" && value >= 0n && value <= MAX_UINT64;
  },

  // Type-casting with `BigInt(x)`
  parseInt64(int: BigIntCastable): i64 {
    return BigInt.asIntN(64, BigInt(int)) as any as i64;
  },
  parseUint64(int: BigIntCastable): u64 {
    return BigInt.asUintN(64, BigInt(int)) as any as u64;
  },

  // No type-casting (throws if arg not bigint)
  asInt64(int: bigint | i64 | u64): i64 {
    return BigInt.asIntN(64, int) as any as i64;
  },
  asUint64(int: bigint | i64 | u64): u64 {
    return BigInt.asUintN(64, int) as any as u64;
  },
} as const;

defineStatic(BigInt, BigIntConstructorMethods);

interface BigIntConstructor {
  (value: BigIntCastable): bigint;

  readonly prototype: BigInt;

  /**
   * Interprets the low bits of a BigInt as a 2's-complement signed integer.
   * All higher bits are discarded.
   * @param bits The number of low bits to use
   * @param int The BigInt whose bits to extract
   */
  asIntN(bits: number, int: bigint | i64 | u64): bigint;

  /**
   * Interprets the low bits of a BigInt as an unsigned integer.
   * All higher bits are discarded.
   * @param bits The number of low bits to use
   * @param int The BigInt whose bits to extract
   */
  asUintN(bits: number, int: bigint | i64 | u64): bigint;

  /** The smallest integer that can be represented in 64-bit. Equal to -(2n ** 63n). */
  readonly MIN_INT64: -9223372036854775808n;
  readonly MAX_INT64: 9223372036854775807n;

  readonly MIN_UINT64: 0n;
  readonly MAX_UINT64: 18446744073709551615n;

  isInt64(value: unknown): value is i64;

  isUint64(value: unknown): value is u64;

  is64Bit(value: unknown): value is i64 | u64;

  // Type-casting with `BigInt(x)`
  parseInt64(int: BigIntCastable): i64;
  parseUint64(int: BigIntCastable): u64;

  // No type-casting (throws if arg not bigint)
  asInt64(int: bigint): bigint;
  asInt64(int: i64 | u64): i64;

  asUint64(int: bigint): bigint;
  asUint64(int: i64 | u64): u64;
}

declare var BigInt: BigIntConstructor;
