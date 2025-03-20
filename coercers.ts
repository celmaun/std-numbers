function asserty<T>(value: unknown): asserts value is T {}

type numable = number | bigint | string;


type i32 = number & { '@i32': void };
type u32 = number & { '@u32': void };
type i64 = bigint & { '@i64': void };
type u64 = bigint & { '@u64': void };
type f32 = number & { '@f32': void };
type f64 = number & { '@f64': void };

const I8_MIN = -128 as const;
const I8_MAX = 127 as const;
const I64_MIN = -9223372036854775808n as const;
const I64_MAX = 9223372036854775807n as const;
const I32_MIN = -2147483648 as const;
const I32_MAX = 2147483647 as const;
const U8_MIN = 0 as const;
const U8_MAX = 255 as const;
const U16_MIN = 0 as const;
const U16_MAX = 65535 as const;
const U32_MIN = 0 as const;
const U32_MAX = 4294967295 as const;
const U64_MIN = 0n as const;
const U64_MAX = 18446744073709551615n as const;
const F32_MIN = -3.40282347e38 as const;
const F32_MAX = 3.40282347e38 as const;
const F32_MIN_NORMAL_VALUE = 1.17549435e-38 as const;
const F32_MIN_SAFE_INTEGER = -16777215 as const;
const F32_MAX_SAFE_INTEGER = 16777215 as const;
const F32_EPSILON = 1.1920929e-7 as const;
const F64_MIN = -1.7976931348623157e308 as const;
const F64_MAX = 1.7976931348623157e308 as const;
const F64_MIN_NORMAL_VALUE = 2.2250738585072014e-308 as const;
const F64_MIN_SAFE_INTEGER = -9007199254740991 as const;
const F64_MAX_SAFE_INTEGER = 9007199254740991 as const;
const F64_EPSILON = 2.2204460492503131e-16 as const;

const util = {
  __proto__: null as never,
  typeTag(value: unknown): string {
    if (value === null) return 'null';
    if (typeof value !== 'object') return typeof value;
    const tag = String(Object.prototype.toString.call(value));
    // Symbol.toStringTag can be an empty string ('[object ]')
    if (tag === '[object Object]' || tag === '[object ]') return 'object';
    if (tag === '[object Boolean]') return 'boolean';
    if (tag === '[object Number]') return 'number';
    if (tag === '[object BigInt]') return 'bigint';
    if (tag === '[object String]') return 'string';
    if (tag === '[object Symbol]') return 'symbol';
    return tag.slice(8, -1);
  },
};

const { typeTag } = util;

// Returns a coercer function that coerces a value (of type 'number' | 'bigint' | 'string' ) to a 32-bit signed integer.
const coercei32Factory = () => {
  // The minimum value for a 32-bit signed integer.
  const MIN = -2147483648 as const as i32;
  const MIN_BIGINT = -2147483648n as const;
  const MIN_STRING = '-2147483648' as const;
  // The maximum value for a 32-bit signed integer.
  const MAX = 2147483647 as const as i32;
  const MAX_BIGINT = 2147483647n as const;
  const MAX_STRING = '2147483647' as const;

  const coercer = {
    __proto__: null as never,

    guardRange(value: number | bigint): true {
      if (value < MIN || value > MAX) throw new RangeError(pre + 'Number is out of 32-bit signed integer range: ' + value);
      return true;
    },

    guardFloat(orig: number, int: i32): true {
      if (orig === int) return true;

      if (orig === Infinity || orig === -Infinity) throw new TypeError(invalidArg + orig);
      if (Number.isSafeInteger(orig)) guardRange(orig);

      throw new TypeError(pre + 'Call a rounding method to convert `float`: ' + orig);
    },

    guardString(orig: string, int: i32): true {
      if (orig === '') throw new SyntaxError(invalidArg + 'Empty string');
      if (orig === String(int)) return true;
      if (orig.trim() === '') throw new SyntaxError(invalidArg + 'Blank string');

      const bi = BigInt(orig);
      if (orig === String(bi)) guardRange(bi);

      // Round-trip failed
      throw new SyntaxError(pre + 'Failed coercion from `string`: ' + orig);
    },

    // Coerce `value` to a 32-bit signed integer.
    coercei32(val: numable): i32 {
      if (val == null || val !== val) throw new TypeError(invalidArg + val);

      // Fast path for common cases
      if (val === 0) {
        if (1 / val !== 1 / 0) throw new TypeError(invalidArg + 'Negative zero');
        return 0 as i32;
      }
      if (val === 0n) return 0 as i32;
      if (val === 1 || val === 1n) return 1 as i32;
      if (val === -1 || val === -1n) return -1 as i32;
      if (val === MIN || val === MAX) return (val | 0) as i32;
      if (val === MIN_BIGINT || val === MAX_BIGINT) return (Number(val) | 0) as i32;

      if (typeof val === 'number') {
        const v = (val | 0) as i32;
        guardFloat(val, v);
        return v;
      }

      if (typeof val === 'bigint') {
        guardRange(val);
        return (Number(val) | 0) as i32;
      }

      if (typeof val === 'string') {
        // Hot-paths for common strings
        if (val === '0') return 0 as i32;
        if (val === '1') return 1 as i32;
        if (val === '-1') return -1 as i32;
        if (val === MIN_STRING) return MIN;
        if (val === MAX_STRING) return MAX;

        const v = (Number.parseInt(val, 10) | 0) as i32;
        guardString(val, v);
        return v;
      }

      throw new TypeError(invalidArg + typeTag(val));
    },

    safeCoercei32<T>(val: numable, alt: T = 0 as T): i32 | T {
      if (val == null || val !== val) return typeof alt === 'function' ? alt(val) : alt;

      // Fast path for common cases
      if (val === 0) {
        if (1 / val !== 1 / 0) return typeof alt === 'function' ? alt(val) : alt;
        return 0 as i32;
      }
      if (val === 0n) return 0 as i32;
      if (val === 1 || val === 1n) return 1 as i32;
      if (val === -1 || val === -1n) return -1 as i32;
      if (val === MIN || val === MAX) return (val | 0) as i32;
      if (val === MIN_BIGINT || val === MAX_BIGINT) return (Number(val) | 0) as i32;

      if (typeof val === 'number') {
        const v = (val | 0) as i32;
        if (v !== val) return typeof alt === 'function' ? alt(val) : alt;
        return v;
      }

      if (typeof val === 'bigint') {
        const v = (Number(val) | 0) as i32;
        if (v < MIN || v > MAX) return typeof alt === 'function' ? alt(val) : alt;
        return v;
      }

      if (typeof val === 'string') {
        // Hot-paths for common strings
        if (val === '0') return 0 as i32;
        if (val === '1') return 1 as i32;
        if (val === '-1') return -1 as i32;
        if (val === MIN_STRING) return MIN;
        if (val === MAX_STRING) return MAX;

        const v = (Number.parseInt(val, 10) | 0) as i32;
        if (String(v) !== val) return typeof alt === 'function' ? alt(val) : alt;
        return v;
      }

      return typeof alt === 'function' ? alt(val) : alt;
    },
  } as const;

  const { coercei32, safeCoercei32, guardFloat, guardRange, guardString } = coercer;
  const pre = coercei32.name + '(): ';
  const invalidArg = pre + 'Invalid argument: ';

  return { coercei32, safeCoercei32 };
};

const coerceu32Factory = () => {
  // The maximum value for a 32-bit unsigned integer.
  const MAX = 4294967295 as const as u32; // 2**32 - 1
  const MAX_BIGINT = 4294967295n as const; // 2**32 - 1
  const MAX_STRING = '4294967295' as const;

  const coercer = {
    __proto__: null as never,

    guardRange(value: number | bigint): true {
      if (value < 0 || value > MAX) throw new RangeError(pre + typeof value + ' is out of 32-bit unsigned integer range: ' + value);
      return true;
    },

    guardFloat(orig: number, int: u32): true {
      if (orig === int) return true;

      if (orig === Infinity || orig === -Infinity) throw new TypeError(invalidArg + orig);
      if (Number.isSafeInteger(orig)) guardRange(orig);

      throw new TypeError(pre + 'Call a rounding function to convert `float`: ' + orig);
    },

    guardString(orig: string, int: u32): true {
      if (orig === '') throw new SyntaxError(invalidArg + 'Empty string');
      if (orig === String(int)) return true;
      if (orig.trim() === '') throw new SyntaxError(invalidArg + 'Blank string');

      const bi = BigInt(orig);
      if (orig === String(bi)) guardRange(bi);

      // Round-trip failed
      throw new SyntaxError(pre + 'Failed coercion from `string`: ' + orig);
    },

    coerceu32(val: numable): u32 {
      if (val == null || val !== val) throw new TypeError(invalidArg + val);

      // Fast path for common cases
      if (val === 0) {
        if (1 / val !== 1 / 0) throw new TypeError(invalidArg + 'Negative zero');
        return 0 as u32;
      }
      if (val === 0n) return 0 as u32;
      if (val === 1 || val === 1n) return 1 as u32;
      if (val === MAX || val === MAX_BIGINT) return MAX as u32;

      if (typeof val === 'number') {
        const v = (val >>> 0) as u32;
        guardFloat(val, v);
        return v;
      }

      if (typeof val === 'bigint') {
        guardRange(val);
        return (Number(val) >>> 0) as u32;
      }

      if (typeof val === 'string') {
        // Hot-paths for common strings
        if (val === '0') return 0 as u32;
        if (val === '1') return 1 as u32;
        if (val === MAX_STRING) return MAX as u32;
        const v = (Number.parseInt(val, 10) >>> 0) as u32;
        guardString(val, v);
        return v;
      }

      throw new TypeError(invalidArg + typeTag(val));
    },

    safeCoerceu32<T>(val: numable, alt: T = 0 as T): u32 | T {
      if (val == null || val !== val) return typeof alt === 'function' ? alt(val) : alt;

      // Fast path for common cases
      if (val === 0) {
        if (1 / val !== 1 / 0) return typeof alt === 'function' ? alt(val) : alt;
        return 0 as u32;
      }
      if (val === 0n) return 0 as u32;
      if (val === 1 || val === 1n) return 1 as u32;
      if (val === MAX || val === MAX_BIGINT) return MAX as u32;

      if (typeof val === 'number') {
        const v = (val >>> 0) as u32;
        if (v !== val) return typeof alt === 'function' ? alt(val) : alt;
        return v;
      }

      if (typeof val === 'bigint') {
        if (val < 0 || val > MAX) return typeof alt === 'function' ? alt(val) : alt;
        const v = (Number(val) >>> 0) as u32;
        return v;
      }

      if (typeof val === 'string') {
        const v = (Number.parseInt(val, 10) >>> 0) as u32;
        if (String(v) !== val) return typeof alt === 'function' ? alt(val) : alt;
        return v;
      }

      return typeof alt === 'function' ? alt(val) : alt;
    },
  } as const;

  const { coerceu32, safeCoerceu32, guardFloat, guardRange, guardString } = coercer;
  const pre = coerceu32.name + '(): ';
  const invalidArg = pre + 'Invalid argument: ';

  return { coerceu32, safeCoerceu32 };
};

// Returns a coercer function that coerces a value (of type 'number' | 'bigint' | 'string' ) to a 64-bit signed integer as a native 'bigint'.
const coercei64Factory = () => {
  // The minimum value for a 64-bit signed integer.
  const MIN = -9223372036854775808n as const as i64;
  // The maximum value for a 64-bit signed integer.
  const MAX = 9223372036854775807n as const as i64;

  const coercer = {
    __proto__: null as never,

    guardRange(value: bigint | number): true {
      if (value < MIN || value > MAX) throw new RangeError(pre + typeof value + ' is out of 64-bit signed integer range: ' + value);
      return true;
    },
    guardFloat(orig: number, int: i32 | u32): true {
      if (orig === int) return true;
      if (orig === Infinity || orig === -Infinity) throw new TypeError(invalidArg + orig);
      if (Number.isSafeInteger(orig)) throw new TypeError(pre + 'Call a rounding method to convert fraction-less `float`: ' + orig);
      throw new TypeError(pre + 'Call a rounding method to convert `float`: ' + orig);
    },

    guardString(orig: string, int: i64): true {
      if (orig === '') throw new SyntaxError(invalidArg + 'Empty string');
      if (orig === String(int)) return guardRange(int);
      if (orig.trim() === '') throw new SyntaxError(invalidArg + 'Empty string');
      throw new SyntaxError(pre + 'Failed coercion from `string`: ' + orig);
    },

    coercei64(value: numable): i64 {
      if (value == null || value !== value) throw new TypeError(invalidArg + value);

      // Fast path for common cases
      if (value === 0) {
        if (1 / value !== 1 / 0) throw new TypeError(invalidArg + 'Negative zero');
        return 0n as i64;
      }
      if (value === 0n) return 0n as i64;
      if (value === 1 || value === 1n) return 1n as i64;
      if (value === -1 || value === -1n) return -1n as i64;
      if (value === MIN) return MIN;
      if (value === MAX) return MAX;

      if (typeof value === 'number') {
        const val = value < 0 ? ((value | 0) as i32) : ((value >>> 0) as u32);
        guardFloat(value, val);
        return BigInt(val) as i64;
      }

      if (typeof value === 'bigint') {
        guardRange(value);
        return (value | 0n) as i64;
      }

      if (typeof value === 'string') {
        const val = (BigInt(value) | 0n) as i64;
        guardString(value, val);
        return val;
      }

      throw new TypeError(invalidArg + typeTag(value));
    },
    // Non-throwing coercion to i64 with an optional alternative value
    safeCoercei64<T>(val: numable, alt: T = 0n as T): i64 | T {
      if (val == null || val !== val) return typeof alt === 'function' ? alt(val) : alt;

      // Fast path for common cases
      if (val === 0) {
        if (1 / val !== 1 / 0) return typeof alt === 'function' ? alt(val) : alt;
        return 0n as i64;
      }
      if (val === 0n) return 0n as i64;
      if (val === 1 || val === 1n) return 1n as i64;
      if (val === -1 || val === -1n) return -1n as i64;
      if (val === MIN) return MIN;
      if (val === MAX) return MAX;

      if (typeof val === 'number') {
        const v = val < 0 ? ((val | 0) as i32) : ((val >>> 0) as u32);
        if (v !== val) return typeof alt === 'function' ? alt(val) : alt;
        return BigInt(v) as i64;
      }

      if (typeof val === 'bigint') {
        const v = val | 0n;
        if (v < MIN || v > MAX) return typeof alt === 'function' ? alt(val) : alt;
        return v as i64;
      }

      if (typeof val === 'string') {
        const v = (BigInt(val) | 0n) as i64;
        if (String(v) !== val || v < MIN || v > MAX) return typeof alt === 'function' ? alt(val) : alt;
        return v;
      }

      return typeof alt === 'function' ? alt(val) : alt;
    },
  } as const;

  const { coercei64, safeCoercei64, guardFloat, guardRange, guardString } = coercer;
  const pre = coercei64.name + '(): ';
  const invalidArg = pre + 'Invalid argument: ';

  return { coercei64, safeCoercei64 };
};

const coerceu64Factory = () => {
  // The maximum value for a 64-bit unsigned integer.
  const MAX = 18446744073709551615n as const as u64; // 2**64 - 1

  const coercer = {
    __proto__: null as never,

    guardRange(val: bigint | number): true {
      if (val < 0 || val > MAX) throw new RangeError(pre + typeof val + ' is out of 64-bit unsigned integer range: ' + val);
      return true;
    },

    guardFloat(orig: number, int: i32 | u32): true {
      if (orig === int) return true;
      if (orig === Infinity || orig === -Infinity) throw new TypeError(invalidArg + orig);
      if (Number.isSafeInteger(orig)) throw new TypeError(pre + 'Call a rounding method to convert fraction-less `float`: ' + orig);
      throw new TypeError(pre + 'Call a rounding method to convert `float`: ' + orig);
    },

    guardString(orig: string, int: u64): true {
      if (orig === '') throw new SyntaxError(invalidArg + 'Empty string');
      if (orig === String(int)) return guardRange(int);
      if (orig.trim() === '') throw new SyntaxError(invalidArg + 'Blank string');
      throw new SyntaxError(pre + 'Failed coercion from `string`: ' + orig);
    },

    coerceu64(value: numable): u64 {
      if (value == null || value !== value) throw new TypeError(invalidArg + value);

      // Fast path for common cases
      if (value === 0) {
        if (1 / value !== 1 / 0) throw new TypeError(invalidArg + 'Negative zero');
        return 0n as u64;
      }
      if (value === 0n) return 0n as u64;
      if (value === 1 || value === 1n) return 1n as u64;
      if (value === MAX) return MAX;

      if (typeof value === 'number') {
        const val = (value >>> 0) as u32;
        guardFloat(value, val);
        return BigInt(val) as u64;
      }

      if (typeof value === 'bigint') {
        guardRange(value);
        return (value | 0n) as u64;
      }

      if (typeof value === 'string') {
        const val = (BigInt(value) | 0n) as u64;
        guardString(value, val);
        return val;
      }

      throw new TypeError(invalidArg + typeTag(value));
    },
    // Non-throwing coercion to u64 with an optional alternative value
    safeCoerceu64<T>(val: numable, alt: T = 0n as T): u64 | T {
      if (val == null || val !== val) return typeof alt === 'function' ? alt(val) : alt;

      // Fast path for common cases
      if (val === 0) {
        if (1 / val !== 1 / 0) return typeof alt === 'function' ? alt(val) : alt;
        return 0n as u64;
      }
      if (val === 0n) return 0n as u64;
      if (val === 1 || val === 1n) return 1n as u64;
      if (val === MAX) return MAX;

      if (typeof val === 'number') {
        const v = (val >>> 0) as u32;
        if (v !== val) return typeof alt === 'function' ? alt(val) : alt;
        return BigInt(v) as u64;
      }

      if (typeof val === 'bigint') {
        const v = val | 0n;
        if (v < 0n || v > MAX) return typeof alt === 'function' ? alt(val) : alt;
        return v as u64;
      }

      if (typeof val === 'string') {
        const v = (BigInt(val) | 0n) as u64;
        if (v < 0n || v > MAX || String(v) !== val) return typeof alt === 'function' ? alt(val) : alt;
        return v;
      }

      return typeof alt === 'function' ? alt(val) : alt;
    },
  } as const;

  const { coerceu64, safeCoerceu64, guardFloat, guardRange, guardString } = coercer;
  const pre = coerceu64.name + '(): ';
  const invalidArg = pre + 'Invalid argument: ';

  return { coerceu64, safeCoerceu64 };
};

export const { coercei32, safeCoercei32 } = coercei32Factory();
export const { coerceu32, safeCoerceu32 } = coerceu32Factory();
export const { coercei64, safeCoercei64 } = coercei64Factory();
export const { coerceu64, safeCoerceu64 } = coerceu64Factory();
