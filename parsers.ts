function asserty<T>(value: unknown): asserts value is T {}

type numable = number | bigint | string;

type i8 = number & { '@i8': void };
type u8 = number & { '@u8': void };
type i16 = number & { '@i16': void };
type u16 = number & { '@u16': void };
type i32 = number & { '@i32': void };
type u32 = number & { '@u32': void };
type i64 = number & { '@i64': void };
type u64 = number & { '@u64': void };
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

  floatToString(value: number): string {
    if (value === 0) return Object.is(-0, value) ? '-0' : '0';
    return String(value);
  },
};

const { typeTag, floatToString } = util;

// Returns a parser function that coerces a value (of type 'number' | 'bigint' | 'string' ) to a 32-bit signed integer.
const parsei32Factory = (): ((value: numable) => i32) => {
  // The minimum value for a 32-bit signed integer.
  const MIN = -2147483648 as const;
  // The maximum value for a 32-bit signed integer.
  const MAX = 2147483647 as const;

  // Encapsulate in object literals to preserve function names
  const parser = {
    __proto__: null as never,

    guardFloat(orig: number, int: i32): true {
      if (orig === int) return true;

      if (!Number.isFinite(orig)) throw new TypeError(invalidArg + orig);
      if (Number.isSafeInteger(orig)) guardRange(orig);

      throw new TypeError(pre + 'Invalid coercion from non-integer `float`: ' + orig);
    },

    guardString(orig: string, int: i32): true {
      if (orig === '') throw new SyntaxError(invalidArg + 'Empty string');
      if (orig === String(int)) return true;
      if (orig.trim() === '') throw new SyntaxError(invalidArg + 'Empty string');

      const bi = BigInt(orig);
      if (orig === String(bi)) guardRange(bi);

      // Round-trip failed
      throw new SyntaxError(pre + 'Invalid coercion from `string`: ' + orig);
    },

    guardRange(value: number | bigint): true {
      if (value < MIN || value > MAX) throw new RangeError(pre + 'Number is out of 32-bit signed integer range: ' + value);
      return true;
    },

    // Coerce `value` to a 32-bit signed integer.
    parsei32(value: numable): i32 {
      if (value == null || value !== value) throw new TypeError(invalidArg + value);

      // Fast path for common cases
      if (value === 0) {
        if (1 / value !== Infinity) throw new TypeError(invalidArg + 'Negative zero');
        return 0 as i32;
      }
      if (value === 0n) return 0 as i32;
      if ((value === 1) || (value === 1n)) return 1 as i32;
      if ((value === -1) || (value === -1n)) return -1 as i32;
      if ((value === MIN) || (value === MAX)) return (value | 0) as i32;

      if (typeof value === 'number') {
        const val = (value | 0) as i32;
        guardFloat(value, val);
        return val;
      }

      if (typeof value === 'bigint') {
        guardRange(value);
        return (Number(value) | 0) as i32;
      }

      if (typeof value === 'string') {
        const val = (Number.parseInt(value, 10) | 0) as i32;
        guardString(value, val);
        return val;
      }

      throw new TypeError(invalidArg + typeTag(value));
    },
  } as const;

  const { parsei32, guardFloat, guardRange, guardString } = parser;
  const pre = parsei32.name + '(): ';
  const invalidArg = pre + 'Invalid argument: ';

  return parsei32;
};

export const parsei32 = parsei32Factory();
