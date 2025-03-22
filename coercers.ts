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

const xButStr = ' passed, expected a string';
const errEmptyStr = 'Empty string';
const errBlankStr = 'Blank string';
const unexpNegZero = 'Unexpected negative zero';
const unexpSpaceIn = 'Unexpected whitespace in ';
const unexpLeadZero = 'Unexpected leading zero in ';
const unexpPlusSign = 'Unexpected plus sign in ';
const unexpNegSign = 'Unexpected negative sign in ';
const unexpSignedZero = 'Unexpected signed zero in ';
const failedParseStr = 'Failed to parse string: ';
const cantCoerceFloat = 'Cannot coerce a floating-point number to an integer';
const invalidArg = 'Invalid argument: ';
const smallerThanI64 = 'Number is smaller than the minimum signed 64-bit integer: ';
const largerThanI64 = 'Number is larger than the maximum signed 64-bit integer: ';
const noNegUint = 'Number cannot be negative for unsigned integer: '
const largerThanU64 ='Number is larger than the maximum unsigned 64-bit integer: '

const unexpUintLead: Record<string, string> = Object.freeze({
  __proto__: null as never,
  '+': 'Unexpected plus sign in ',
  '-': 'Unexpected negative sign in ',
  '0': 'Unexpected leading zero in ',
});

// Parser methods to parse strings but enforce stricter rules than the built-in BigInt methods by mandating a round-trip back to exact string.
// Might decide to add some exceptions to the round-trip rule later on. e.g., allow plus sign aka '+123'. For now, we enforce round-trip.
const parserFactory = () => {
  const I64_MIN = -9223372036854775808n as const;

  const bi64unarr = BigInt64Array.of(0n);
  const bu64unarr = BigUint64Array.of(0n);

  Object.seal(bi64unarr);
  Object.seal(bu64unarr);

  const parsers = {
    // Parse a string to a 64-bit signed integer.
    // NB: The array assignment will throw a SyntaxError if the string contains a decimal point or uses scientific notation.
    // We forbid certain string formats that are permitted assignment to the typed array.
    parseI64(val: string): i64 {
      if (typeof val !== 'string') throw new TypeError(typeTag(val) + xButStr);
      if (val === '0') return 0n as i64;
      if (val === '-1') return -1n as i64;
      if (val === '1') return 1n as i64;
      if (val === '-0') throw new SyntaxError(unexpSignedZero + debugStr(val));
      if (val === '') throw new SyntaxError(errEmptyStr);
      const n = ((bi64unarr[0] = val as any), bi64unarr[0] | 0n) as i64;

      // If round-trip to string fails, we try to throw the most specific error below
      if (val === String(n)) {
        return n;
      }

      const bi = BigInt(val) | 0n;
      if (n !== bi) {
        // Round-trip with arbitrary precision BigInt fails because of an overflow/underflow range error
        if (bi < I64_MIN) throw new RangeError(smallerThanI64 + debugStr(val));
        throw new RangeError(largerThanI64 + debugStr(val));
      }

      const a = val[0];
      // Forbid a leading plus sign
      if (a === '+') throw new SyntaxError(unexpPlusSign + debugStr(val));
      // Forbid binary, octal, and hexadecimal strings (0bD, 0oD, 0xD) by checking for a leading zero
      if (a === '0' || (a === '-' && val[1] === '0')) throw new SyntaxError(unexpLeadZero + debugStr(val));
      // Forbid whitespace
      if (/\s/.test(val)) throw new SyntaxError(val.trim() ? unexpSpaceIn + debugStr(val) : errBlankStr);

      // Failed parse
      throw new SyntaxError('Failed to parse ' + debugStr(val));
    },
    // Parse a string to a 64-bit unsigned integer.
    // NB: The array assignment will throw a SyntaxError if the string contains a decimal point or uses scientific notation.
    // We forbid certain string formats that are permitted assignment to the typed array.
    parseU64(val: string): u64 {
      if (typeof val !== 'string') throw new TypeError(typeTag(val) + xButStr);
      if (val === '0') return 0n as u64;
      if (val === '1') return 1n as u64;
      if (val === '-0') throw new SyntaxError(unexpSignedZero + debugStr(val));
      if (val === '') throw new SyntaxError(errEmptyStr);

      const n = ((bu64unarr[0] = val as any), bu64unarr[0] | 0n) as u64;

      // If round-trip to string fails, we try to throw the most specific error below
      if (val === String(n)) {
        return n;
      }

      const bi = BigInt(val) | 0n;
      if (n !== bi) {
        // Round-trip with arbitrary precision BigInt fails because of an overflow/underflow range error
        if (bi < 0n) throw new RangeError(noNegUint + debugStr(val));
        throw new RangeError(largerThanU64 + debugStr(val));
      }

      const a = val[0];
      // Forbid a leading plus sign
      if (a === '+') throw new SyntaxError(unexpPlusSign + debugStr(val));
      // Forbid underflow by checking for a negative sign
      if (a === '-') throw new SyntaxError(unexpNegSign + debugStr(val));
      // Forbid binary, octal, and hexadecimal strings (0bD, 0oD, 0xD) by checking for a leading zero
      if (a === '0') throw new SyntaxError(unexpLeadZero + debugStr(val));
      // Forbid whitespace
      if (/\s/.test(val)) throw new SyntaxError(val.trim() ? unexpSpaceIn + debugStr(val) : errBlankStr);

      // Failed parse
      throw new SyntaxError('Failed to parse ' + debugStr(val));
    },
  };

  const { parseI64, parseU64 } = parsers;

  return { parseI64, parseU64 };
};

const { parseI64, parseU64 } = parserFactory();

// Returns a coercer function that coerces a value (of type 'number' | 'bigint' | 'string' ) to a 32-bit signed integer.
const coerceI32Factory = () => {
  // The minimum value for a 32-bit signed integer.
  const MIN = -2147483648 as const as i32;
  const MIN_BIGINT = -2147483648n as const;
  const MIN_STR = '-2147483648' as const;
  // The maximum value for a 32-bit signed integer.
  const MAX = 2147483647 as const as i32;
  const MAX_BIGINT = 2147483647n as const;
  const MAX_STR = '2147483647' as const;

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
      if (orig === '') throw new SyntaxError(errEmptyStr);
      if (orig === String(int)) return true;
      if (/\s/.test(orig)) throw new SyntaxError(orig.trim() ? unexpSpaceIn + json(orig) : errBlankStr);

      const bi = BigInt(orig);
      if (orig === String(bi)) guardRange(bi);

      // Round-trip failed
      throw new SyntaxError(pre + 'Failed coercion from  ' + json(orig));
    },

    // Coerce `value` to a 32-bit signed integer.
    coerceI32(val: numable): i32 {
      if (val == null || val !== val) throw new TypeError(invalidArg + val);

      // Fast path for common cases
      if (val === 0) {
        if (1 / val !== 1 / 0) throw new TypeError(unexpNegZero);
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
        if (val === MIN_STR) return MIN;
        if (val === MAX_STR) return MAX;

        const v = (Number.parseInt(val, 10) | 0) as i32;
        guardString(val, v);
        return v;
      }

      throw new TypeError(invalidArg + typeTag(val));
    },

    safeCoerceI32<T>(val: numable, alt: T = 0 as T): i32 | T {
      if (val == null || val !== val || val === '') return typeof alt === 'function' ? alt(val) : alt;

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
      } else if (typeof val === 'bigint') {
        if (val < MIN_BIGINT || val > MAX_BIGINT) return typeof alt === 'function' ? alt(val) : alt;
        const v = (Number(val) | 0) as i32;
        return v;
      } else if (typeof val === 'string') {
        // Hot-paths for common strings
        if (val === '0') return 0 as i32;
        if (val === '1') return 1 as i32;
        if (val === '-1') return -1 as i32;
        if (val === MIN_STR) return MIN;
        if (val === MAX_STR) return MAX;

        const v = (Number.parseInt(val, 10) | 0) as i32;
        if (String(v) !== val) return typeof alt === 'function' ? alt(val) : alt;
        return v;
      }

      return typeof alt === 'function' ? alt(val) : alt;
    },
  } as const;

  const { coerceI32, safeCoerceI32, guardFloat, guardRange, guardString } = coercer;
  const pre = coerceI32.name + '(): ';
  const invalidArg = pre + 'Invalid argument: ';
  const errEmptyStr = invalidArg + 'Empty string';
  const errBlankStr = invalidArg + 'Blank string';
  const unexpSpaceIn = pre + 'Unexpected whitespace in ';

  return { coerceI32, safeCoerceI32 };
};

const coerceU32Factory = () => {
  // The maximum value for a 32-bit unsigned integer.
  const MAX = 4294967295 as const as u32; // 2**32 - 1
  const MAX_BIGINT = 4294967295n as const; // 2**32 - 1
  const MAX_STR = '4294967295' as const;

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
      if (orig === '') throw new SyntaxError(errEmptyStr);
      if (orig === String(int)) return true;
      if (/\s/.test(orig)) throw new SyntaxError(orig.trim() ? unexpSpaceIn + json(orig) : errBlankStr);

      const bi = BigInt(orig);
      if (orig === String(bi)) guardRange(bi);
      // Round-trip failed
      throw new SyntaxError(pre + 'Failed coercion from  ' + json(orig));
    },

    coerceU32(val: numable): u32 {
      if (val == null || val !== val) throw new TypeError(invalidArg + val);

      // Fast path for common cases
      if (val === 0) {
        if (1 / val !== 1 / 0) throw new TypeError(unexpNegZero);
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
        if (val === MAX_STR) return MAX;
        const v = (Number.parseInt(val, 10) >>> 0) as u32;
        guardString(val, v);
        return v;
      }

      throw new TypeError(invalidArg + typeTag(val));
    },

    safeCoerceU32<T>(val: numable, alt: T = 0 as T): u32 | T {
      if (val == null || val !== val || val === '') return typeof alt === 'function' ? alt(val) : alt;

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
        if (v === val) return v;
      } else if (typeof val === 'bigint') {
        if (val >= 0n && val <= MAX_BIGINT) return (Number(val) >>> 0) as u32;
      } else if (typeof val === 'string' && val[0] !== '-' && !/\s/.test(val)) {
        const v = (Number.parseInt(val, 10) >>> 0) as u32;
        if (String(v) === val) return v;
      }

      return typeof alt === 'function' ? alt(val) : alt;
    },
  } as const;

  const { coerceU32, safeCoerceU32, guardFloat, guardRange, guardString } = coercer;
  const pre = coerceU32.name + '(): ';
  const invalidArg = pre + 'Invalid argument: ';
  const errEmptyStr = invalidArg + 'Empty string';
  const errBlankStr = invalidArg + 'Blank string';
  const unexpSpaceIn = pre + 'Unexpected whitespace in ';

  return { coerceU32, safeCoerceU32 };
};

// Returns a coercer function that coerces a value (of type 'number' | 'bigint' | 'string' ) to a 64-bit signed integer as a native 'bigint'.
const coerceI64Factory = () => {
  // The minimum value for a 64-bit signed integer.
  const MIN = -9223372036854775808n as const as i64;
  // The maximum value for a 64-bit signed integer.
  const MAX = 9223372036854775807n as const as i64;

  const i64unarr = BigInt64Array.of(0n);
  const bu64unarr = BigUint64Array.of(0n);

  Object.seal(i64unarr);
  Object.seal(bu64unarr);

  const coercer = {
    __proto__: null as never,

    // Throw unless `x` can be a valid i32 or u32.
    coerceI64Number(x: number): true {
      if (typeof x !== 'number') throw new TypeError(invalidArg + typeTag(x));
      if (x === 0 && 1 / x !== 1 / 0) throw new TypeError(unexpNegZero);
      if (x !== x || x === Infinity || x === -Infinity) throw new TypeError(invalidArg + x);
      if (x === (x < 0 ? x | 0 : x >>> 0)) return true;
      throw new TypeError(cantCoerceFloat + x);
    },

    // Called when round-trip w/ coerced bigint from string failed.
    coerceI64String(s: string): never {
      if (s === '') throw new SyntaxError(errEmptyStr);
      if (s === String(BigInt(s))) throw new RangeError((BigInt(s) < MIN ? smallerThanI64 : largerThanI64) + debugStr(s));
      if (s[0] === '+' || s[0] === '0') throw new SyntaxError(unexpUintLead[s[0]] + debugStr(s));
      if (s[0] === '-' && s[1] === '0') throw new SyntaxError(unexpUintLead['0'] + debugStr(s));
      if (/\s/.test(s)) throw new SyntaxError(s.trim() ? unexpSpaceIn + debugStr(s) : errBlankStr);
      throw new SyntaxError(failedParseStr + debugStr(s));
    },

    // Called when round-trip w/ coerced bigint failed.
    coerceI64BigInt(x: bigint): never {
      throw new RangeError((x < MIN ? smallerThanI64 : largerThanI64) + debugStr(x));
    },

    coerceI64(x: numable): i64 {
      if (typeof x !== 'number' && typeof x !== 'bigint' && typeof x !== 'string') throw new TypeError(invalidArg + typeTag(x));

      // Fast paths for common cases
      if (x === 0) {
        if (1 / x !== 1 / 0) coerceI64Number(x);
        return 0n as i64;
      }
      if (x === 0n) return 0n as i64;
      if (x === 1 || x === 1n) return 1n as i64;
      if (x === -1 || x === -1n) return -1n as i64;
      if (x === MIN) return MIN;
      if (x === MAX) return MAX;

      const n = ((i64unarr[0] = (typeof x === 'number' ? BigInt(x < 0 ? x | 0 : x >>> 0) : x) as bigint), i64unarr[0]) as i64;

      if (x === n) return n;

      if (typeof x === 'bigint') {
        coerceI64BigInt(x);
      } else if (typeof x === 'number') {
        coerceI64Number(x);
      } else {
        x === String(n) || coerceI64String(x);
      }

      return n;
    },
    // Non-throwing coercion to i64 with an optional alternative value
    safeCoerceI64<T>(val: numable, alt: T = 0n as T): i64 | T {
      if (val == null || val !== val || val === '') return typeof alt === 'function' ? alt(val) : alt;

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
      } else if (typeof val === 'bigint') {
        if (val < MIN || val > MAX) return typeof alt === 'function' ? alt(val) : alt;
        return (val | 0n) as i64;
      } else if (typeof val === 'string' && !/\s/.test(val)) {
        const v = (BigInt(val) | 0n) as i64;
        if (String(v) !== val || v < MIN || v > MAX) return typeof alt === 'function' ? alt(val) : alt;
        return v;
      }

      return typeof alt === 'function' ? alt(val) : alt;
    },
  } as const;

  const { coerceI64, safeCoerceI64, coerceI64String, coerceI64Number, coerceI64BigInt } = coercer;
  return { coerceI64, safeCoerceI64 };
};

const coerceU64Factory = () => {
  // The maximum value for a 64-bit unsigned integer.
  const MAX = 18446744073709551615n as const as u64; // 2**64 - 1
  const MAX_STR = '18446744073709551615' as const;

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
      if (orig === '') throw new SyntaxError(errEmptyStr);
      if (orig === String(int)) return guardRange(int);
      if (/\s/.test(orig)) throw new SyntaxError(orig.trim() ? unexpSpaceIn + json(orig) : errBlankStr);
      throw new SyntaxError(pre + 'Failed coercion from  ' + json(orig));
    },

    coerceU64(value: numable): u64 {
      if (value == null || value !== value) throw new TypeError(invalidArg + value);

      // Fast path for common cases
      if (value === 0) {
        if (1 / value !== 1 / 0) throw new TypeError(unexpNegZero);
        return 0n as u64;
      }
      if (value === 0n) return 0n as u64;
      if (value === 1 || value === 1n) return 1n as u64;
      if (value === MAX) return MAX;

      if (typeof value === 'number') {
        const v = (value >>> 0) as u32;
        guardFloat(value, v);
        return BigInt(v) as u64;
      }

      if (typeof value === 'bigint') {
        guardRange(value);
        return (value | 0n) as u64;
      }

      if (typeof value === 'string') {
        if (value === '0') return 0n as u64;
        if (value === '-1') return -1n as u64;
        if (value === '1') return 1n as u64;
        if (value === MAX_STR) return MAX;

        return (parseU64(value) | 0n) as u64;
      }

      throw new TypeError(invalidArg + typeTag(value));
    },
    // Non-throwing coercion to u64 with an optional alternative value
    safeCoerceU64<T>(val: numable, alt: T = 0n as T): u64 | T {
      if (val == null || val !== val || val === '') return typeof alt === 'function' ? alt(val) : alt;

      // Fast path for common cases
      if (val === 0) {
        // Negative zero?
        if (1 / val !== 1 / 0) return typeof alt === 'function' ? alt(val) : alt;
        return 0n as u64;
      }
      if (val === 0n) return 0n as u64;
      if (val === 1 || val === 1n) return 1n as u64;
      if (val === MAX) return MAX;

      if (typeof val === 'number') {
        const v = (val >>> 0) as u32;
        if (v === val) return (BigInt(v) | 0n) as u64;
      } else if (typeof val === 'bigint') {
        if (val >= 0n && val <= MAX) return (val | 0n) as u64;
      } else if (typeof val === 'string' && val[0] !== '-' && !/\s/.test(val)) {
        const v = (BigInt(val) | 0n) as u64;
        if (v >= 0n && v <= MAX && String(v) === val) return v;
      }

      return typeof alt === 'function' ? alt(val) : alt;
    },
  } as const;

  const { coerceU64, safeCoerceU64, guardFloat, guardRange, guardString } = coercer;
  const pre = coerceU64.name + '(): ';
  const invalidArg = pre + 'Invalid argument: ';
  const errEmptyStr = invalidArg + 'Empty string';
  const errBlankStr = invalidArg + 'Blank string';
  const unexpSpaceIn = pre + 'Unexpected whitespace in ';

  return { coerceU64, safeCoerceU64 };
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

    safeCoerceF64<T>(val: numable, alt: T = NaN as T): f64 | T {
      if (val == null) return typeof alt === 'function' ? alt(val) : alt;
      if (typeof val === 'number') return +val as f64;

      // Hot-paths for common cases
      if (val === 0n) return 0 as f64;
      if (val === 1n) return 1 as f64;
      if (val === -1n) return -1 as f64;
      if (val === MIN_BIGINT) return +MIN_INT as f64;
      if (val === MAX_BIGINT) return +MAX_INT as f64;

      if (typeof val === 'bigint') {
        if (val < MIN_BIGINT || val > MAX_BIGINT) return typeof alt === 'function' ? alt(val) : alt;
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
        if (val === '' || val.trim() === '') return typeof alt === 'function' ? alt(val) : alt;
        const f = +parseFloat(val) as f64;
        if (validateString(val, f)) return f;
      }

      return typeof alt === 'function' ? alt(val) : alt;
    },
  } as const;

  const { coerceF64, safeCoerceF64, guardString, validateString } = coercer;

  return { coerceF64, safeCoerceF64 };
};

export const { coerceI32, safeCoerceI32 } = coerceI32Factory();
export const { coerceU32, safeCoerceU32 } = coerceU32Factory();
export const { coerceI64, safeCoerceI64 } = coerceI64Factory();
export const { coerceU64, safeCoerceU64 } = coerceU64Factory();
export const { coerceF64, safeCoerceF64 } = coerceF64Factory();
