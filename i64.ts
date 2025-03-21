import { I32_MAX, I32_MIN, I64_MAX, I64_MIN, U32_MAX } from './constants';
import type {
  BigIntCastable,
  NumericInfixOperator,
  NumericUnaryOperator,
  i64Constructor,
  i64,
  I64_TemplateInfix,
  I64_TemplateUnary,
  NumericComparisonOperator,
  I64_Safe,
} from './types';
import { classof, createComparisonMethods, defineMembers, preserveNames } from './util';

function asserty<T>(value: unknown): asserts value is T {}

// Interprets the low bits of a BigInt as a 2's-complement 64-bit signed integer. All higher bits are discarded.
const interpret = (value: bigint | i64): bigint => {
  if (value == null) throw new TypeError('Missing argument');
  return BigInt.asIntN(64, value as bigint);
};
const interpreted = interpret as (value: bigint | i64) => i64;

// Coerce `value` to an 64-bit signed integer.
const coerce = (value: number | string | bigint): bigint => {
  if (value == null) throw new TypeError('i64(): Missing argument');

  if (typeof value === 'number') {
    const val = value < 0 ? value | 0 : value >>> 0;

    if (!Object.is(val, value)) {
      throw new TypeError('i64(): Invalid coercion from `number`: ' + value);
    }

    return BigInt(val);
  }

  if ((typeof value === 'string')) {
    const val = BigInt(value);

    if (String(val) !== value) {
      // Round-trip failed
      throw new RangeError('i64(): Invalid coercion from `string`: ' + value);
    }

    if (val < I64_MIN || val > I64_MAX) {
      throw new RangeError('i64(): Out of range [' + I64_MIN + ', ' + I64_MAX + ']: ' + value);
    }

    return val;
  }

  if (typeof value !== 'bigint') {
    throw new TypeError('i64(): Invalid coercion from: `' + classof(value) + '`');
  }

  if (value < I64_MIN || value > I64_MAX) {
    throw new RangeError('i64(): Out of range [' + I64_MIN + ', ' + I64_MAX + ']: ' + value);
  }

  return value;
};
const coerced = coerce as (value: BigIntCastable) => i64;

const clamp = (value: BigIntCastable): bigint => {
  if (value == null) throw new TypeError('Missing argument');

  if (typeof value === 'number') {
    return BigInt(value < 0 ? (value > I32_MIN ? value | 0 : I32_MIN) : value < U32_MAX ? value >>> 0 : U32_MAX);
  }

  let val = typeof value === 'bigint' ? value : BigInt(value as string);

  return (val < I64_MIN) ? I64_MIN : (val > I64_MAX) ? I64_MAX : val;
};

const clamped = clamp as (value: BigIntCastable) => i64;

const is = (value: unknown): value is i64 => {
  if (value === undefined) throw new TypeError('undefined is not an argument');

  return typeof value === 'bigint' && value >= i64.MIN_VALUE && value <= i64.MAX_VALUE;
}

// If `value` is a number or bigint that's safely and accurately compareable with a 64-bit signed integer
const isSafe = (value: unknown): value is I64_Safe => {
  if (value == null) throw new TypeError('Missing argument');

  if (typeof value === 'number') {
    return value === 0 ? Object.is(value, 0) : value === (value | 0) || value === value >>> 0;
  }

  return typeof value === 'bigint' ? value >= I64_MIN && value <= I64_MAX : false;
};

function i64TagInfix(op: NumericInfixOperator, left: number | string | bigint, right: number | string | bigint): i64 {
  const x = coerce(left);
  const y = coerce(right);

  if (!op) {
    throw new TypeError('i64.tag(): Missing operator');
  }

  let result = 0n;

  if (op === '+') {
    result = x + y;
  } else if (op === '-') {
    result = x - y;
  } else if (op === '*') {
    result = x * y;
  } else if (op === '/') {
    result = x / y;
  } else if (op === '%') {
    result = x % y;
  } else if (op === '%%') {
    // IEEE 754-style modulo operation - different from % remainder operator
    result = ((x % y) + y) % y; // Ensures the result has the same sign as divisor
  } else if (op === '&') {
    result = x & y;
  } else if (op === '|') {
    result = x | y;
  } else if (op === '^') {
    result = x ^ y;
  } else if (op === '**') {
    result = x ** y;
  } else if (op === '<<') {
    result = x << y;
  } else if (op === '>>') {
    result = x >> y;
  } else {
    throw new TypeError('i64.tag(): Unknown operator: ' + op);
  }

  return interpreted(result);
}

function i64TagUnary(op: NumericUnaryOperator, value: i64): i64 {
  const val = coerce(value);

  if (!op) {
    throw new TypeError('Missing operator');
  }

  let result = 0n;

  if (op === '~') {
    result = ~val;
  } else if (op === '-') {
    result = -val;
  } else if (op === '+') {
    result = 0n + val;
  } else {
    throw new TypeError('Invalid operator: ' + op);
  }

  return interpreted(result);
}

const isTemplateUnary = (tsa: unknown) => {
  return Array.isArray(tsa) && tsa.length === 2 && typeof tsa[0] === 'string' && tsa[0] !== '' && tsa[1] === '';
};

const isTemplateInfix = (tsa: unknown) => {
  return Array.isArray(tsa) && tsa.length === 3 && tsa[0] === '' && typeof tsa[1] === 'string' && tsa[1] !== '' && tsa[2] === '';
};

interface i64Methods {
  cmp(left: number | string | bigint, right: number | string | bigint): -1 | 0 | 1;
  are(tsa: TemplateStringsArray, left: number | string | bigint, right: number | string | bigint): boolean;
}

const i64Methods: i64Methods = {
  // Compare two integer values
  cmp(left, right) {
    if (left == null || right == null) {
      throw new TypeError('i64.compare(): Missing arguments');
    }

    if (!isSafe(left) || !isSafe(right)) {
      throw new TypeError('i64.compare(): `left` and `right` are not comparable');
    }

    if (left < right) return -1;
    if (left > right) return 1;

    return 0;
  },

  are(tsa, left, right) {
    if (tsa == null || left == null || right == null) {
      throw new TypeError('i64.are``: Missing arguments');
    }

    if (arguments.length > 3) {
      throw new TypeError('i64.are``: Too many arguments');
    }

    if (!isTemplateInfix(tsa)) {
      throw new TypeError('i64.are``: Invalid template');
    }

    if (!isSafe(left) || !isSafe(right)) {
      throw new TypeError('i64.are``: ${left} and ${right} are not comparable');
    }

    const operator = tsa[1].trim() as any as NumericComparisonOperator;

    if (operator === '<') return left < right;
    if (operator === '>') return left > right;
    if (operator === '<=') return left <= right;
    if (operator === '>=') return left >= right;

    // This way we can compare BigInt's and Number's for equality w/o type coercion
    const areEqual = (left < right || left > right) === false;

    if (operator === '===') return areEqual && typeof left === typeof right;
    if (operator === '!==') return !areEqual || typeof left !== typeof right;
    if (operator === '==') return areEqual;
    if (operator === '!=') return !areEqual;

    throw new TypeError('i64.are``: Invalid comparison operator: ' + operator);
  },
} as const;

export const I64: i64Constructor = defineMembers(
  function i64(
    valueOrTsa: number | string | bigint | TemplateStringsArray | I64_TemplateUnary | I64_TemplateInfix,
    leftOrValue?: number | string | bigint,
    right?: number | string | bigint
  ): i64 {
    if (new.target !== undefined) {
      throw new TypeError('i64 is not a constructor');
    }

    if (valueOrTsa == null) {
      throw new TypeError('i64(): Missing arguments');
    }

    if (typeof valueOrTsa === 'bigint') {
      return interpreted(valueOrTsa);
    }

    if (typeof valueOrTsa === 'object' && Array.isArray(valueOrTsa)) {
      return (i64 as i64Constructor).tag(valueOrTsa as any as TemplateStringsArray, leftOrValue, right);
    }

    return coerced(valueOrTsa as BigIntCastable);
  },
  {
    MIN_VALUE: -9223372036854775808n,
    MAX_VALUE: 9223372036854775807n,
  },
  Object.assign(
    {
      is(value: unknown): value is i64 {
        return typeof value === 'bigint' && value >= i64.MIN_VALUE && value <= i64.MAX_VALUE;
      },

      parseInt(int: number | string | bigint): i64 {
        if (int == null) throw new TypeError('Missing argument');

        return coerced(int);
      },

      tag(tsa: TemplateStringsArray, leftOrValue?: BigIntCastable, right?: BigIntCastable) {
        if (arguments.length > 3) {
          throw new TypeError('i64.tag``: Too many arguments');
        }

        if (tsa == null) {
          throw new TypeError('i64.tag``: Missing template object');
        }

        const str1 = tsa[0].trim();

        if ((leftOrValue === undefined) && (right === undefined)) {
          if (str1 === '' || tsa.length !== 1) {
            throw new TypeError('i64.tag``: Invalid template string');
          }

          if (str1.includes(' ')) {
            // Trim -> Remove number separators -> Split by space or tab -> Trim each segment
            // Example literals:
            //  i64`2 + 3`
            //  i64`~2`
            //  i64`1_000_000 + 2_000_000`
            const customTsa = str1
              .replaceAll('_', '')
              .split(/[\ ]+/)
              .map((x) => x.trim());

            if (customTsa.length !== 3) {
              throw new TypeError('i64.tag(): Invalid template string');
            }
            const operator = customTsa[1] as NumericInfixOperator;
            return i64TagInfix(operator, coerced(customTsa[0]), coerced(customTsa[2]));
          }

          if (str1.startsWith('~') || str1.startsWith('-') || str1.startsWith('+')) {
            const operator = str1[0] as NumericUnaryOperator;
            return i64TagUnary(operator, coerced(str1.slice(1)));
          }

          return coerced(str1);
        }

        if (isTemplateInfix(tsa)) {
          if (leftOrValue == null || right == null) {
            throw new TypeError('i64.tag(): Missing arguments');
          }

          const op = tsa[1].trim() as NumericInfixOperator;

          return i64TagInfix(op, coerced(leftOrValue), coerced(right));
        }

        if (isTemplateUnary(tsa)) {
          if (leftOrValue == null) {
            throw new TypeError('i64.tag(): Missing arguments');
          }
          const op = tsa[0].trim() as NumericUnaryOperator;

          return i64TagUnary(op, coerced(leftOrValue));
        }

        throw new TypeError('i64.tag(): Invalid template string');
      },

      cmp: i64Methods.cmp,

      are: i64Methods.are,

      [Symbol.hasInstance](value: unknown): value is i64 {
        return i64.is(value);
      },

      // IntMath<BigInt64> implementation
      add(x: number | string | bigint, y: number | string | bigint): i64 {
        if (x == null || y == null) throw new TypeError('Missing argument');

        return interpreted(coerce(x) + coerce(y));
      },

      sub(x: number | string | bigint, y: number | string | bigint): i64 {
        if (x == null || y == null) throw new TypeError('Missing argument');

        return interpreted(coerce(x) - coerce(y));
      },

      mul(x: number | string | bigint, y: number | string | bigint): i64 {
        if (x == null || y == null) throw new TypeError('Missing argument');

        return interpreted(coerce(x) * coerce(y));
      },

      div(dividend: number | string | bigint, divisor: number | string | bigint): i64 {
        if (dividend == null || divisor == null) throw new TypeError('Missing argument');

        return interpreted(coerce(dividend) / coerce(divisor));
      },

      mod(dividend: number | string | bigint, divisor: number | string | bigint): i64 {
        if (dividend == null || divisor == null) throw new TypeError('Missing argument');

        const x = coerce(dividend);
        const y = coerce(divisor);
        const result = ((x % y) + y) % y; // Ensures the result has the same sign as divisor
        return interpreted(result);
      },

      rem(dividend: number | string | bigint, divisor: number | string | bigint): i64 {
        if (dividend == null || divisor == null) throw new TypeError('Missing argument');

        return interpreted(coerce(dividend) % coerce(divisor));
      },

      clz(value: number | string | bigint): i64 {
        if (value == null) throw new TypeError('Missing argument');

        // Count leading zeros
        if (value === 0n) return coerced(64n);
        let val = coerce(value);
        let n = 0n;
        if ((val & 0xffffffff00000000n) === 0n) {
          n += 32n;
          val <<= 32n;
        }
        if ((val & 0xffff000000000000n) === 0n) {
          n += 16n;
          val <<= 16n;
        }
        if ((val & 0xff00000000000000n) === 0n) {
          n += 8n;
          val <<= 8n;
        }
        if ((val & 0xf000000000000000n) === 0n) {
          n += 4n;
          val <<= 4n;
        }
        if ((val & 0xc000000000000000n) === 0n) {
          n += 2n;
          val <<= 2n;
        }
        if ((val & 0x8000000000000000n) === 0n) {
          n += 1n;
        }
        return interpreted(n);
      },

      ctz(value: i64): i64 {
        if (value == null) throw new TypeError('Missing argument');

        // Count trailing zeros
        let val = coerce(value);
        if (val === 0n) return 64n;
        let n = 0n;
        if ((val & 0x00000000ffffffffn) === 0n) {
          n += 32n;
          val >>= 32n;
        }
        if ((val & 0x000000000000ffffn) === 0n) {
          n += 16n;
          val >>= 16n;
        }
        if ((val & 0x00000000000000ffn) === 0n) {
          n += 8n;
          val >>= 8n;
        }
        if ((val & 0x000000000000000fn) === 0n) {
          n += 4n;
          val >>= 4n;
        }
        if ((val & 0x0000000000000003n) === 0n) {
          n += 2n;
          val >>= 2n;
        }
        if ((val & 0x0000000000000001n) === 0n) {
          n += 1n;
        }
        return interpreted(n);
      },

      popcnt(value: number | string | bigint): i64 {
        if (value == null) throw new TypeError('Missing argument');

        // Count number of set bits
        let val = coerce(value);
        let count = 0n;
        while (val !== 0n) {
          count += val & 1n;
          val >>= 1n;
        }
        return interpreted(count);
      },

      rotl(value: number | string | bigint, shift: number | string | bigint): i64 {
        if (value == null || shift == null) throw new TypeError('Missing argument');

        // Rotate left
        const val = coerce(value);
        const s = coerce(shift) & 63n;
        return interpreted((val << s) | (val >> (64n - s)));
      },

      rotr(value: i64, shift: i64): i64 {
        if (value == null || shift == null) throw new TypeError('Missing argument');

        // Rotate right
        const val = coerce(value);
        const s = coerce(shift) & 63n;
        return interpreted((val >> s) | (val << (64n - s)));
      },

      abs(value: number | string | bigint): i64 {
        if (value == null) throw new TypeError('Missing argument');

        // Absolute value
        const val = coerce(value);
        return interpreted(val < 0n ? -val : val);
      },

      max(left: number | string | bigint, right: number | string | bigint): i64 {
        if (left == null || right == null) throw new TypeError('Missing argument');

        // Maximum of two values
        const l = coerce(left);
        const r = coerce(right);
        return interpreted(l > r ? l : r);
      },

      min(left: number | string | bigint, right: number | string | bigint): i64 {
        if (left == null || right == null) throw new TypeError('Missing argument');

        // Minimum of two values
        const l = coerce(left);
        const r = coerce(right);
        return interpreted(l < r ? l : r);
      },

      pow(base: number | string | bigint, exponent: number | string | bigint): i64 {
        if (base == null || exponent == null) throw new TypeError('Missing argument');

        // Power operation
        const b = coerce(base);
        const e = coerce(exponent);
        return interpreted(b ** e);
      },

      shl(value: number | string | bigint, shift: number | string | bigint): i64 {
        if (value == null || shift == null) throw new TypeError('Missing argument');

        // Shift left operation
        const val = coerce(value);
        const s = coerce(shift);
        return interpreted(val << s);
      },

      shr(value: number | string | bigint, shift: number | string | bigint): i64 {
        if (value == null || shift == null) throw new TypeError('Missing argument');

        // Shift right operation
        const val = coerce(value);
        const s = coerce(shift);
        return interpreted(val >> s);
      },

      not(value: number | string | bigint): i64 {
        if (value == null) throw new TypeError('Missing argument');

        // Bitwise NOT operation
        const val = coerce(value);
        return coerced(~val);
      },

      and(left: number | string | bigint, right: number | string | bigint): i64 {
        if (left == null || right == null) throw new TypeError('Missing argument');

        // Bitwise AND operation
        const l = coerce(left);
        const r = coerce(right);
        return interpreted(l & r);
      },

      or(left: number | string | bigint, right: number | string | bigint): i64 {
        if (left == null || right == null) throw new TypeError('Missing argument');

        // Bitwise OR operation
        const l = coerce(left);
        const r = coerce(right);
        return interpreted(l | r);
      },

      xor(left: number | string | bigint, right: number | string | bigint): i64 {
        if (left == null || right == null) throw new TypeError('Missing argument');

        // Bitwise XOR operation
        const l = coerce(left);
        const r = coerce(right);
        return interpreted(l ^ r);
      },
    },
    createComparisonMethods(i64Methods.cmp)
  )
);

preserveNames({
  i64: I64,
});

Object.defineProperty(globalThis, 'i64', {
  configurable: true,
  enumerable: false,
  writable: true,
  value: I64,
});
