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

const json = JSON.stringify;

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

  debugStr(val: unknown): string {
    if (val == null || val === true || val === false || val !== val || val == Infinity || val === -Infinity) return String(val);

    if (typeof val === 'string') {
      return json(val);
    }

    return typeTag(val);
  },
};

const { typeTag, debugStr } = util;

const errEmptyStr = 'Empty string';
const errBlankStr = 'Blank string';
const unexpNegZero = 'Unexpected negative zero';
const unexpSpaceIn = 'Unexpected whitespace in ';
const unexpSpaced = 'Unexpected surrounding whitespace in ';
const cantCoerceFloat = 'Cannot coerce a floating-point number to an integer: ';
const cantCoerceU32 = 'Undefined behavior: attempt to coerce 32-bit unsigned to a signed integer: ';
const invalidArg = 'Invalid argument: ';
const invalidArgType = 'Invalid argument type: ';
const invalidArgVal = 'Invalid argument value: ';

// Returns a coercer function that coerces a value (of type 'number' | 'bigint' | 'string' ) to a 32-bit signed integer.
const coerceI32Factory = () => {
  // The minimum value for a 32-bit signed integer.
  const MIN = -2147483648 as const as i32;
  const MIN_BIG = -2147483648n as const;
  const MIN_STR = '-2147483648' as const;
  // The maximum value for a 32-bit signed integer.
  const MAX = 2147483647 as const as i32;
  const MAX_BIG = 2147483647n as const;
  const MAX_STR = '2147483647' as const;

  const coercer = {
    __proto__: null as never,
    // Coerce `value` to a 32-bit signed integer.
    coerceI32(x: numable): i32 {
      if (typeof x !== 'number' && typeof x !== 'bigint' && typeof x !== 'string') throw new TypeError(invalidArgType + typeTag(x));

      // Fast paths for common cases
      if (x === 0) {
        if (1 / x !== 1 / 0) throw new TypeError(unexpNegZero);
        return 0 as i32;
      }
      if (x === 0n || x === '0' || x === '+0') return 0 as i32;
      if (x === 1 || x === 1n || x === '1') return 1 as i32;
      if (x === -1 || x === -1n || x === '-1') return -1 as i32;
      if (x === MIN || x === MIN_BIG || x === MIN_STR) return MIN;
      if (x === MAX || x === MAX_BIG || x === MAX_STR) return MAX;

      if (typeof x === 'bigint') {
        return (Number(BigInt.asIntN(32, x)) | 0) as i32;
      }

      if (typeof x === 'number') {
        const n = x | 0;
        if (x !== n) {
          // @TODO: Take the correct course of action for the u32 case
          throw new TypeError(Number.isFinite(x) ? (x === x >>> 0 ? cantCoerceU32 + x : cantCoerceFloat + x) : invalidArgVal + x);
        }
        return n as i32;
      }

      if (x === '') throw new SyntaxError(errEmptyStr);
      if (x === '-0') throw new SyntaxError(unexpNegZero);
      if (String(x.at(-1)).trim() === '') {
        throw new SyntaxError(x.trim() === '' ? errBlankStr : unexpSpaced + debugStr(x));
      }

      // BigInt constructor has the sanest behavior for parsing integer strings.
      // Prepend plus sign so we don't have to check for leading whitespace.
      const a = x[0];
      const pre = a !== '-' && a !== '+' && a !== '0' ? '+' : '';
      return (Number(BigInt.asIntN(32, BigInt(pre + x))) | 0) as i32;
    },
  } as const;

  const { coerceI32 } = coercer;

  return coerceI32;
};

const coerceU32Factory = () => {
  // The maximum value for a 32-bit unsigned integer.
  const MAX = 4294967295 as const as u32; // 2**32 - 1
  const MAX_BIG = 4294967295n as const; // 2**32 - 1
  const MAX_STR = '4294967295' as const;

  const coercer = {
    __proto__: null as never,
    coerceU32(x: numable): u32 {
      if (typeof x !== 'number' && typeof x !== 'bigint' && typeof x !== 'string') throw new TypeError(invalidArgType + typeTag(x));

      // Fast paths for common cases
      if (x === 0) {
        if (1 / x !== 1 / 0) throw new TypeError(unexpNegZero);
        return 0 as u32;
      }
      if (x === 0n) return 0 as u32;
      if (x === 1 || x === 1n || x === '1') return 1 as u32;
      if (x === MAX || x === MAX_BIG || x === MAX_STR) return MAX as u32;

      if (typeof x === 'bigint') {
        return (Number(BigInt.asUintN(32, x)) >>> 0) as u32;
      }

      if (typeof x === 'number') {
        const n = (x >>> 0) as u32;
        if (x !== n) {
          throw new TypeError(Number.isFinite(x) ? cantCoerceFloat + x : invalidArgVal + x);
        }
        return n;
      }

      if (x === '') throw new SyntaxError(errEmptyStr);
      if (x === '-0') throw new SyntaxError(unexpNegZero);
      if (String(x.at(-1)).trim() === '') {
        throw new SyntaxError(x.trim() === '' ? errBlankStr : unexpSpaced + debugStr(x));
      }

      // BigInt constructor has the sanest behavior for parsing integer strings.
      // Prepend plus sign so we don't have to check for leading whitespace.
      const a = x[0];
      const pre = a !== '-' && a !== '+' && a !== '0' ? '+' : '';
      return (Number(BigInt.asUintN(32, BigInt(pre + x))) >>> 0) as u32;
    },
  } as const;

  const { coerceU32 } = coercer;

  return coerceU32;
};

// Returns a coercer function that coerces a value (of type 'number' | 'bigint' | 'string' ) to a 64-bit signed integer as a native 'bigint'.
const coerceI64Factory = () => {
  // The minimum value for a 64-bit signed integer.
  const MIN = -9223372036854775808n as const as i64;
  const MIN_STR = '-9223372036854775808' as const;
  // The maximum value for a 64-bit signed integer.
  const MAX = 9223372036854775807n as const as i64;
  const MAX_STR = '9223372036854775807' as const;
  const i64x1 = BigInt64Array.of(1n);
  Object.seal(i64x1);

  const coercer = {
    __proto__: null as never,
    coerceI64(x: numable): i64 {
      if (typeof x !== 'number' && typeof x !== 'bigint' && typeof x !== 'string') throw new TypeError(invalidArg + typeTag(x));

      // Fast paths for common cases
      if (x === 0) {
        if (1 / x !== 1 / 0) throw new TypeError(unexpNegZero);
        return 0n as i64;
      }
      if (x === 0n || x === '0') return 0n as i64;
      if (x === 1 || x === 1n || x === '1') return 1n as i64;
      if (x === -1 || x === -1n || x === '-1') return -1n as i64;
      if (x === MIN || x === MIN_STR) return MIN;
      if (x === MAX || x === MAX_STR) return MAX;

      if (typeof x === 'number') {
        const n = x < 0 ? x | 0 : x >>> 0;
        if (x !== n) {
          throw new TypeError(Number.isFinite(x) ? cantCoerceFloat + x : invalidArgVal + x);
        }
        return ((i64x1[0] = BigInt(n)), i64x1[0] | 0n) as i64;
      }

      if (typeof x === 'bigint') {
        return ((i64x1[0] = x as bigint), i64x1[0] | 0n) as i64;
      }

      if (x === '') throw new SyntaxError(errEmptyStr);
      if (x === '-0') throw new SyntaxError(unexpNegZero);
      if (String(x.at(-1)).trim() === '') {
        throw new SyntaxError(x.trim() === '' ? errBlankStr : unexpSpaced + debugStr(x));
      }

      // Prepend plus sign so we don't have to check for leading whitespace.
      const a = x[0];
      const pre = a !== '-' && a !== '+' && a !== '0' ? '+' : '';
      return ((i64x1[0] = (pre + x) as any), i64x1[0] | 0n) as i64;
    },
  } as const;

  const { coerceI64 } = coercer;
  return coerceI64;
};

const coerceU64Factory = () => {
  // The maximum value for a 64-bit unsigned integer.
  const MAX = 18446744073709551615n as const as u64; // 2**64 - 1
  const MAX_STR = '18446744073709551615' as const;
  const u64x1 = BigUint64Array.of(1n);
  Object.seal(u64x1);

  const coercer = {
    __proto__: null as never,
    coerceU64(x: numable): u64 {
      if (typeof x !== 'number' && typeof x !== 'bigint' && typeof x !== 'string') throw new TypeError(invalidArg + typeTag(x));

      // Fast paths for common cases
      if (x === 0) {
        if (1 / x !== 1 / 0) throw new TypeError(unexpNegZero);
        return 0n as u64;
      }
      if (x === 0n || x === '0') return 0n as u64;
      if (x === 1n || x === 1 || x === '1') return 1n as u64;
      if (x === MAX || x === MAX_STR) return MAX;

      if (typeof x === 'number') {
        const n = x >>> 0;
        if (x !== n) {
          throw new TypeError(Number.isFinite(x) ? cantCoerceFloat + x : invalidArgVal + x);
        }
        return ((u64x1[0] = BigInt(n)), u64x1[0] | 0n) as u64;
      }

      if (typeof x === 'bigint') {
        return ((u64x1[0] = x as bigint), u64x1[0] | 0n) as u64;
      }

      if (x === '') throw new SyntaxError(errEmptyStr);
      if (x === '-0') throw new SyntaxError(unexpNegZero);
      if (String(x.at(-1)).trim() === '') {
        throw new SyntaxError(x.trim() === '' ? errBlankStr : unexpSpaced + debugStr(x));
      }

      // Prepend plus sign so we don't have to check for leading whitespace.
      const a = x[0];
      const pre = a !== '-' && a !== '+' && a !== '0' ? '+' : '';
      return ((u64x1[0] = (pre + x) as any), u64x1[0] | 0n) as u64;
    },
  } as const;

  const { coerceU64 } = coercer;

  return coerceU64;
};

const coerceF32Factory = () => {
  // The minimum value for a 32-bit floating point number.
  const MIN = -3.40282347e38 as const as f32;
  // The maximum value for a 32-bit floating point number.
  const MAX = 3.40282347e38 as const as f32;
  // The minimum positive value for a 32-bit floating point number.
  const MIN_NORMAL_VALUE = 1.17549435e-38 as const as f32;
  // The minimum safe integer value for a 32-bit floating point number.
  const MIN_SAFE_INTEGER = -16777215 as const as f32;
  // The maximum safe integer value for a 32-bit floating point number.
  const MAX_SAFE_INTEGER = 16777215 as const as f32;
  // The smallest interval between two representable numbers.
  const EPSILON = 1.1920929e-7 as const as f32;

  const coercer = {
    __proto__: null as never,
  } as const;
};

const coerceF64Factory = () => {
  // The minimum value for a 64-bit floating point number.
  const MIN = -1.7976931348623157e308 as const as f64;
  // The maximum value for a 64-bit floating point number.
  const MAX = 1.7976931348623157e308 as const as f64;
  // The minimum positive value for a 64-bit floating point number.
  const MIN_NORMAL_VALUE = 2.2250738585072014e-308 as const as f64;
  // The minimum safe integer value for a 64-bit floating point number.
  const MIN_INT = -9007199254740991 as const as f64;
  const MIN_BIGINT = -9007199254740991n as const;
  // The maximum safe integer value for a 64-bit floating point number.
  const MAX_INT = 9007199254740991 as const as f64;
  const MAX_BIGINT = 9007199254740991n as const;
  // The smallest interval between two representable numbers.
  const EPSILON = 2.2204460492503131e-16 as const as f64;

  const coercer = {
    __proto__: null as never,

    guardString(val: string, num: f64): true {
      if (val === '') throw new SyntaxError(errEmptyStr);
      if (/\s/.test(val)) throw new SyntaxError(val.trim() ? unexpSpaceIn + json(val) : errBlankStr);
      if (num !== num) throw new SyntaxError('Failed coercion from ' + json(val));
      if (num === Infinity || num === -Infinity) throw new RangeError('Coerced string is out of 64-bit floating point range');

      // Unsure if should allow leading plus sign
      if (val[0] === '+') throw new SyntaxError('Undesired leading plus sign in ' + json(val));

      const nstr = String(num); // `num` as string
      if (val === nstr) return true;

      // Some extra tests for sane argument values, not required but useful for debugging
      // Lowercase to normalize any engineering notation /[eE]/
      const vlc = val.toLowerCase(); // `val` as lowercase string
      if (vlc === nstr) return true;
      if (vlc.startsWith(nstr)) throw new SyntaxError('String has invalid trailing characters: ' + json(vlc.slice(nstr.length)));

      // Test `val` for leading zero(s), unless it's a single zero followed by a decimal point
      if (/^-?0[^.]/.test(val)) throw new SyntaxError('Unexpected leading zero(s) in ' + json(val));

      return true;
    },

    // non-throwing variant of guardString()
    validateString(val: string, num: f64): boolean {
      if (!Number.isFinite(num) || val === '' || /\s/.test(val)) return false;
      const nstr = String(num);
      if (val === nstr) return true;
      const vlc = val.toLowerCase();
      if (vlc === nstr) return true;
      return !(vlc.startsWith(nstr) || val[0] === '+' || /^-?0[^.]/.test(val));
    },

    coerceF64(val: numable): f64 {
      if (val == null) throw new TypeError(invalidArg + val);
      if (typeof val === 'number') return +val as f64;

      // Hot-paths for common cases
      if (val === 0n) return 0 as f64;
      if (val === 1n) return 1 as f64;
      if (val === -1n) return -1 as f64;
      if (val === MIN_BIGINT) return +MIN_INT as f64;
      if (val === MAX_BIGINT) return +MAX_INT as f64;

      if (typeof val === 'bigint') {
        if (val < MIN_BIGINT || val > MAX_BIGINT) throw new RangeError('BigInt(' + val + ') is out of 64-bit floating point safe integer range');
        return +Number(val) as f64;
      }

      if (typeof val === 'string') {
        if (val === '-0') return -0 as f64;
        if (val === '0') return 0 as f64;
        if (val === '-1') return -1 as f64;
        if (val === '1') return 1 as f64;
        if (val === 'NaN') return NaN as f64;
        if (val === 'Infinity') return Infinity as f64;
        if (val === '-Infinity') return -Infinity as f64;
        const f = +parseFloat(val) as f64; // Returns NaN on failure, note that we already handled 'NaN' and [+-]Infinity as strings above.
        guardString(val, f);
        return f;
      }

      throw new TypeError(invalidArg + typeTag(val));
    },
  } as const;

  const { coerceF64, guardString, validateString } = coercer;

  return coerceF64;
};

export const coerceI32 = coerceI32Factory();
export const coerceU32 = coerceU32Factory();
export const coerceI64 = coerceI64Factory();
export const coerceU64 = coerceU64Factory();
export const coerceF32 = coerceF32Factory();
export const coerceF64 = coerceF64Factory();
