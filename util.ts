import {
  I8_MIN,
  I8_MAX,
  U8_MIN,
  U8_MAX,
  I64_MIN,
  I64_MAX,
  U16_MIN,
  U16_MAX,
  U64_MIN,
  U64_MAX,
} from "./constants";
import {
  i16,
  i32,
  i8,
  u32,
  u8,
  u16,
  i64,
  u64,
  f32,
  f64,
  BigIntCastable,
} from "./types";

export type ClassOf =
  | "undefined"
  | "null"
  | "boolean"
  | "number"
  | "bigint"
  | "string"
  | "symbol"
  | "function"
  | "object"
  | "Array"
  | "RegExp"
  | "Date"
  | "Error"
  | "Map"
  | "Set"
  | "WeakMap"
  | "WeakSet"
  | "ArrayBuffer"
  | "SharedArrayBuffer"
  | "DataView"
  | "Float32Array"
  | "Float64Array"
  | "Int8Array"
  | "Int16Array"
  | "Int32Array"
  | "Uint8Array"
  | "Uint8ClampedArray"
  | "Uint16Array"
  | "Uint32Array"
  | "BigInt64Array"
  | "BigUint64Array"
  | "ArrayBufferView"
  | "Promise"
  | "Proxy"
  | "Reflect"
  | "WeakRef"
  | "FinalizationRegistry"
  | "ModuleNamespaceObject"
  | "Intl.Collator"
  | "Intl.DateTimeFormat"
  | "Intl.NumberFormat"
  | string;

export const classof = (value: unknown): ClassOf => {
  if (value === null) {
    return "null";
  }

  if (typeof value !== "object") {
    return typeof value as ClassOf;
  }

  // Symbol.toStringTag can be an empty string ('')
  const tag = String(
    Object.prototype.toString.call(value).slice(8, -1)
  ) as ClassOf;

  if (tag === "" || tag === "Object") {
    return "object";
  }

  if (tag === "Boolean") {
    return "boolean";
  }

  if (tag === "Number") {
    return "number";
  }

  if (tag === "BigInt") {
    return "bigint";
  }

  if (tag === "String") {
    return "string";
  }

  if (tag === "Symbol") {
    return "symbol";
  }

  return tag;
};

export const defineReadonly = <
  T extends {},
  U extends Readonly<Record<string | symbol, any>>
>(
  object: T,
  properties: U
): T & U => {
  const descriptors = Object.getOwnPropertyDescriptors(properties);

  for (const desc of Object.values(descriptors)) {
    desc.configurable = false;
    desc.enumerable = false;
    desc.writable = false;
  }

  Object.defineProperties(object, descriptors);

  return object as any;
};

export const defineStatic = <
  T extends {},
  V extends Record<string | symbol, any>
>(
  object: T,
  properties: V
): T & V => {
  const descriptors = Object.getOwnPropertyDescriptors(properties);

  for (const desc of Object.values(descriptors)) {
    desc.enumerable = false;
  }

  Object.defineProperties(object, descriptors);

  return object as any;
};

export const defineMembers = <
  T extends {},
  U extends Readonly<Record<string | symbol, any>>,
  V extends Record<string | symbol, any>
>(
  target: T,
  readonlyMembers: U,
  staticMembors: V
): T & U & V => {
  defineReadonly(target, readonlyMembers);
  defineStatic(target, staticMembors);
  return target as any;
};

export const nonEnumerable = <T extends Record<string | symbol, any>>(
  object: T
): T => {
  const descriptors = Object.getOwnPropertyDescriptors(object);

  for (const desc of Object.values(descriptors)) {
    desc.enumerable = false;
  }

  Object.defineProperties(object, descriptors);

  return object;
};

// Is `value` an 8-bit signed integer?
export const isInt8 = (value: unknown): value is i8 => {
  if (typeof value !== "number") {
    return false;
  }

  const val = value | 0;

  return Object.is(val, value) && val >= I8_MIN && val <= I8_MAX;
};

// console.log(((val << 24) >> 24), Int8Array.of(val)[0]);

// Coerce `value` to an 8-bit signed integer.
export const asInt8 = (value: unknown): i8 => {
  if (typeof value === "bigint") {
    return (Number(BigInt.asIntN(8, value)) | 0) as i8;
  }

  const val = Number(value as number) | 0;

  // Ensure that the value is an 8-bit signed integer. Silently truncate the value if it is not.
  return ((val << 24) >> 24) as i8;
};

// Is `value` an 8-bit unsigned integer?
export const isUint8 = (value: unknown): value is u8 => {
  if (typeof value !== "number") {
    return false;
  }

  const val = value >>> 0;

  return Object.is(val, value) && val >= U8_MIN && val <= U8_MAX;
};

// Coerce `value` to an 8-bit unsigned integer.

export const asUint8 = (value: unknown): u8 => {
  if (typeof value === "bigint") {
    return (Number(BigInt.asUintN(8, value)) >>> 0) as u8;
  }

  const val = Number(value as number) >>> 0;

  // Ensure that the value is an 8-bit unsigned integer. Silently truncate the value if it is not.
  return (val & 0xff) as u8;
};

// Is `value` an 16-bit signed integer?
export const isInt16 = (value: unknown): value is i16 => {
  if (typeof value !== "number") {
    return false;
  }

  const val = value | 0;

  return Object.is(val, value) && val >= I64_MIN && val <= I64_MAX;
};

// Coerce `value` to an 16-bit signed integer.
export const asInt16 = (value: unknown): i16 => {
  if (typeof value === "bigint") {
    return (Number(BigInt.asIntN(16, value)) | 0) as i16;
  }

  return (Number(value as number) | 0) as i16;
};

// Is `value` an 16-bit unsigned integer?
export const isUint16 = (value: unknown): value is u16 => {
  if (typeof value !== "number") {
    return false;
  }

  const val = value >>> 0;

  return Object.is(val, value) && val >= U16_MIN && val <= U16_MAX;
};

// Coerce `value` to an 16-bit unsigned integer.
export const asUint16 = (value: unknown): u16 => {
  if (typeof value === "bigint") {
    return (Number(BigInt.asUintN(16, value)) >>> 0) as u16;
  }

  // Ensure that the value is an 16-bit unsigned integer. Silently truncate the value if it is not.
  return (Number(value as number) & 0xffff) as u16;
};

// Is `value` an 32-bit signed integer?
export const isInt32 = (value: unknown): value is i32 => {
  return (
    typeof value === "number" &&
    (!value ? Object.is(value, 0) : value === (value | 0))
  );
};

// Coerce `value` to an 32-bit signed integer.
export const asInt32 = (value: unknown): i32 => {
  if (typeof value === "bigint") {
    return (Number(BigInt.asIntN(32, value)) | 0) as i32;
  }

  return (Number(value as number) | 0) as i32;
};

// Is `value` an 32-bit unsigned integer?
export const isUint32 = (value: unknown): value is u32 => {
  return (
    typeof value === "number" &&
    (!value ? Object.is(value, 0) : value === value >>> 0)
  );
};

// Coerce `value` to an 32-bit unsigned integer.
export const asUint32 = (value: unknown): u32 => {
  if (typeof value === "bigint") {
    return (Number(BigInt.asUintN(32, value)) >>> 0) as u32;
  }

  return (Number(value as number) >>> 0) as u32;
};

// Is `value` an 64-bit signed integer?
export const isBigInt64 = (value: unknown): value is i64 => {
  if (typeof value !== "bigint") {
    return false;
  }

  const val = value | 0n;

  return val >= I64_MIN && val <= I64_MAX;
};

// Coerce `value` to an 64-bit signed integer.
export const asBigInt64 = (value: BigIntCastable): i64 => {
  if (typeof value === "number") {
    return BigInt(value | 0) as i64;
  }

  return BigInt.asIntN(64, BigInt(value as bigint)) as i64;
};

// Is `value` an 64-bit unsigned integer?
export const isBigUint64 = (value: unknown): value is u64 => {
  if (typeof value !== "bigint") {
    return false;
  }

  const val = value | 0n;

  return val >= U64_MIN && val <= U64_MAX;
};

// Coerce `value` to an 64-bit unsigned integer.
export const asBigUint64 = (value: BigIntCastable): u64 => {
  if (typeof value === "number") {
    return BigInt(value >>> 0) as u64;
  }

  return BigInt.asUintN(64, BigInt(value as bigint)) as u64;
};

// Is `value` a 32-bit single precision floating point number?
export const isFloat32 = (value: unknown): value is f32 => {
  return typeof value === "number" && Object.is(value, Math.fround(value));
};

// Coerce `value` to a 32-bit single precision floating point number.
export const asFloat32 = (value: unknown): f32 => {
  if (typeof value === "bigint") {
    return Math.fround(Number(value)) as any as f32;
  }
  return Math.fround(value as number) as any as f32;
};

// Is `value` a 64-bit double precision floating point number?
export const isFloat64 = (value: unknown): value is f64 => {
  return typeof value === "number";
};

// Coerce `value` to a 64-bit double precision floating point number.
export const asFloat64 = (value: unknown): f64 => {
  return Number(value) as any as f64;
};
