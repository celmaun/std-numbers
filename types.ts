export type i8 = (Number & { ["#Int8"]: unique symbol }) | 0 | -1 | 1;
export type i16 =
  | (Number & { ["#Int16"]: unique symbol })
  | 0
  | -1
  | 1;
  | 16;
export type i32 =
  | (Number & { ["#Int32"]: unique symbol })
  | 0
  | -1
  | 1
  | 32;
// export type Int32 = i32;

export type u8 = (Number & { ["#Uint8"]: unique symbol }) | 0 | 1 | 8 | 255;
export type u16 = (Number & { ["#Uint16"]: unique symbol }) | 0 | 1 | 16 | 65535;
export type u32 = (Number & { ["#Uint32"]: unique symbol }) | 0 | 1 | 32 | 4294967295;
// export type Uint32 = u32;

export type f32 = Number & { ["#Float32"]: unique symbol };
// export type Float32 = f32;
export type f64 = Number & { ["#Float64"]: unique symbol };
// export type Float64 = f64;

export type NumberCastable = number | i32 | u32 | string | boolean;

export type BigIntCastable =
  | boolean
  | number
  | bigint
  | i8
  | u8
  | i16
  | u16
  | i32
  | u32
  | i64
  | u64
  | string;

export type i64 =
  | (BigInt & { ["#BigInt64"]: unique symbol })
  | 0n
  | -1n
  | 1n
  | 64n;

// export type BigInt64 = i64;

export type u64 =
  | (BigInt & { ["#BigUint64"]: unique symbol })
  | 0n
  | 1n;

// export type BigUint64 = u64;

export type Numeric =
  | number
  | bigint
  | i8
  | u8
  | i16
  | u16
  | i32
  | u32
  | i64
  | u64
  | f32
  | f64
  | i64
  | u64;

export type IntType = i8 | u8 | i16 | u16 | i32 | u32 | i64 | u64;

export type UintType = u8 | u16 | u32 | u64;

export type ArithmeticInfixOperator = "+" | "-" | "*" | "/" | "%" | "%%" | "**";
export type ArithmeticUnaryOperator = "-" | "+";
export type BitwiseInfixOperator = "&" | "|" | "^" | "<<" | ">>" | ">>>";
export type BitwiseUnaryOperator = "~";

export type NumericComparisonOperator = "==" | "!=" | "<" | ">" | "<=" | ">=";

export type NumericInfixOperator =
  | ArithmeticInfixOperator
  | BitwiseInfixOperator;
export type NumericUnaryOperator =
  | ArithmeticUnaryOperator
  | BitwiseUnaryOperator;

export type SpacedNumericComparisonOperator = ` ${NumericComparisonOperator} `;
export type SpacedNumericUnaryOperator = ` ${NumericUnaryOperator} `;
export type SpacedNumericInfixOperator = ` ${NumericInfixOperator} `;

export interface ArithmeticMath<T> {
  add(x: T, y: T): T; // +
  sub(x: T, y: T): T; // -
  mul(x: T, y: T): T; // *
  div(dividend: T, divisor: T): T; // /
  mod(dividend: T, divisor: T): T; // %
  rem(dividend: T, divisor: T): T; // %%
  pow(base: T, exponent: T): T; // **
}

export interface CompareMath<T> {
  eq(left: T, right: T): boolean; // =
  neq(left: T, right: T): boolean; // !=
  lt(left: T, right: T): boolean; // <
  lte(left: T, right: T): boolean; // <=
  gt(left: T, right: T): boolean; // >
  gte(left: T, right: T): boolean; // >=
}

export interface BitwiseMath<T> {
  not(int: T): T; // ~
  and(left: T, right: T): T; // &
  or(left: T, right: T): T; // |
  xor(left: T, right: T): T; // ^
  // Performs the sign-agnostic rotate left operation on a 32-bit or 64-bit integer.
  rotl(value: T, shift: T): T;

  // Performs the sign-agnostic rotate right operation on a 32-bit or 64-bit integer.
  rotr(value: T, shift: T): T;
  shl(value: T, shift: T): T; // <<
  shr(value: T, shift: T): T; // >>
}

export interface IntMath<T>
  extends ArithmeticMath<T>,
    BitwiseMath<T>,
    CompareMath<Numeric> {
  // Performs the sign-agnostic count leading zero bits operation on a 32-bit or 64-bit integer. All zero bits are considered leading if the value is zero.
  clz(value: T): T;

  // Performs the sign-agnostic count trailing zero bits operation on a 32-bit or 64-bit integer. All zero bits are considered trailing if the value is zero.
  ctz(value: T): T;

  // Performs the sign-agnostic count number of one bits operation on a 32-bit or 64-bit integer.
  popcnt(value: T): T;

  // Computes the absolute value of an integer or float.
  abs(value: T): T;

  // Determines the maximum of two integers or floats. If either operand is NaN, returns NaN.
  max(left: T, right: T): T;

  // Determines the minimum of two integers or floats. If either operand is NaN, returns NaN.
  min(left: T, right: T): T;
}

export interface UintMath<T> extends IntMath<T> {
  shru(value: T, shift: T): T; // >>>
}

export type I64_Compareable = i8 | u8 | i16 | u16 | i32 | u32 | i64 | u64;

export type i64TemplateUnary =
  | TemplateStringsArray
  | [SpacedNumericUnaryOperator, ""];
export type i64TemplateInfix =
  | TemplateStringsArray
  | ["", SpacedNumericInfixOperator, ""];

export interface i64Constructor extends IntMath<i64> {
  readonly MIN_VALUE: -9223372036854775808n;
  readonly MAX_VALUE: 9223372036854775807n;

  (arg0: BigIntCastable): i64;

  (arg0: TemplateStringsArray): i64;
  (arg0: i64TemplateUnary, arg1?: BigIntCastable): i64;
  (arg0: i64TemplateInfix, arg1?: BigIntCastable, arg2?: BigIntCastable): i64;

  tag(arg0: TemplateStringsArray): i64;
  tag(arg0: i64TemplateUnary, arg1?: BigIntCastable): i64;
  tag(tsa: i64TemplateInfix, arg1?: BigIntCastable, arg2?: BigIntCastable): i64;

  readonly prototype: i64;
  is(value: unknown): value is i64;
  // String tag variant of compare method / comparison operators.
  are(
    tsa: TemplateStringsArray,
    left: I64_Compareable,
    right: I64_Compareable
  ): boolean;
  // Compare two numbers and return -1 if left < right, 0 if left == right, and 1 if left > right.
  compare(left: I64_Compareable, right: I64_Compareable): -1 | 0 | 1;

  parseInt(int: BigIntCastable): i64;
}

declare global {
  namespace globalThis {
    const i64: i64Constructor;
  }
}
