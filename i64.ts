import { I64_MAX, I64_MIN } from "./constants";
import type {
  BigIntCastable,
  NumericInfixOperator,
  NumericUnaryOperator,
  SpacedNumericInfixOperator,
  SpacedNumericUnaryOperator,
  i64Constructor,
  i64,
  i64TemplateInfix as i64TemplateInfix,
  i64TemplateUnary,
  SpacedNumericComparisonOperator,
  NumericComparisonOperator,
  IntType,
  i16,
  i32,
  i8,
  u16,
  u32,
  u64,
  u8,
  I64_Compareable,
} from "./types";
import {
  asFloat64,
  createComparisonMethods,
  defineMembers,
  isIntType,
  preserveNames,
} from "./util";

// declare global {
//   namespace globalThis {
//     interface BigIntConstructor {
//       asIntN(bits: 64, int: bigint | i64): i64;
//     }
//   }
// }

// Interprets the low bits of a BigInt as a 2's-complement 64-bit signed integer. All higher bits are discarded.
const interpret = (value: bigint | i64): bigint => {
  if (value == null) throw new TypeError("Missing argument");
  return BigInt.asIntN(64, value as bigint);
};
const interpreted = interpret as (value: bigint | i64) => i64;

// Coerce `value` to an 64-bit signed integer.
const coerce = (value: BigIntCastable): bigint => {
  if (value == null) throw new TypeError("Missing argument");
  return typeof value === "number"
    ? BigInt(value < 0 ? value | 0 : value >>> 0)
    : BigInt.asIntN(
        64,
        typeof value === "bigint" ? value : BigInt(value as string)
      );
};
const coerced = coerce as (value: BigIntCastable) => i64;

// If `value` is a number or bigint that's safely and accurately compareable with a 64-bit signed integer
const isCompareable = (value: unknown): value is I64_Compareable => {
  if (typeof value === "number") {
    if (value === 0) {
      return Object.is(value, 0);
    }

    return value === (value | 0) || value === value >>> 0;
  }

  if (typeof value === "bigint") {
    return value >= I64_MIN && value <= I64_MAX;
  }

  return false;
};

function i64TagInfix(
  tsa: TemplateStringsArray | ["", SpacedNumericInfixOperator, ""],
  left: i64,
  right: i64
): i64 {
  const segments = tsa as any as ["", SpacedNumericInfixOperator, ""];
  const operator = segments[1];

  const x = coerce(left);
  const y = coerce(right);
  const op = operator.trim() as NumericInfixOperator;

  if (!op) {
    throw new TypeError("i64.tag(): Missing operator");
  }

  let result = 0n;

  if (op === "+") {
    result = x + y;
  } else if (op === "-") {
    result = x - y;
  } else if (op === "*") {
    result = x * y;
  } else if (op === "/") {
    result = x / y;
  } else if (op === "%") {
    result = x % y;
  } else if (op === "%%") {
    // IEEE 754-style modulo operation - different from % remainder operator
    result = ((x % y) + y) % y; // Ensures the result has the same sign as divisor
  } else if (op === "&") {
    result = x & y;
  } else if (op === "|") {
    result = x | y;
  } else if (op === "^") {
    result = x ^ y;
  } else if (op === "**") {
    result = x ** y;
  } else if (op === "<<") {
    result = x << y;
  } else if (op === ">>") {
    result = x >> y;
  } else {
    throw new TypeError("i64.tag(): Unknown operator: " + op);
  }

  return interpreted(result);
}

function i64TagUnary(
  tsa: TemplateStringsArray | [SpacedNumericUnaryOperator, ""] | [NumericUnaryOperator, ""],
  value: i64
): i64 {
  if (!Array.isArray(tsa) || tsa.length !== 2) {
    throw new TypeError("Invalid template");
  }

  const operator = tsa[0];

  const val = coerce(value);
  const op = operator.trim() as NumericUnaryOperator;

  if (!op) {
    throw new TypeError("Missing operator");
  }

  let result = 0n;

  if (op === "~") {
    result = ~val;
  } else if (op === "-") {
    result = -val;
  } else if (op === "+") {
    result = 0n + val;
  } else {
    throw new TypeError("Invalid operator: " + op);
  }

  return interpreted(result);
}

const isTemplateUnary = (tsa: unknown): tsa is TemplateStringsArray => {
  return (
    Array.isArray(tsa) &&
    tsa.length === 2 &&
    typeof tsa[0] === "string" &&
    tsa[0] !== "" &&
    tsa[1] === ""
  );
};

const isTemplateInfix = (tsa: unknown): tsa is TemplateStringsArray => {
  return (
    Array.isArray(tsa) &&
    tsa.length === 3 &&
    tsa[0] === "" &&
    typeof tsa[1] === "string" &&
    tsa[1] !== "" &&
    tsa[2] === ""
  );
};

interface i64Methods {
  compare(left: I64_Compareable, right: I64_Compareable): -1 | 0 | 1;
  are(
    tsa: TemplateStringsArray,
    left: I64_Compareable,
    right: I64_Compareable
  ): boolean;
}

const i64Methods: i64Methods = {
  // Compare two integer values
  compare(left, right) {
    if (left == null || right == null) {
      throw new TypeError("i64.compare(): Missing arguments");
    }

    if (!isCompareable(left)) {
      throw new TypeError("i64.compare(): `left` is not comparable with i64");
    }

    if (!isCompareable(right)) {
      throw new TypeError("i64.compare(): `right` is not comparable with i64");
    }

    const l = BigInt(left as number | bigint);
    const r = BigInt(right as number | bigint);
    if (l < r) return -1;
    if (l > r) return 1;

    return 0;
  },

  are(tsa, left, right) {
    if (tsa == null || left == null || right == null) {
      throw new TypeError("i64.are``: Missing arguments");
    }

    if (arguments.length > 3) {
      throw new TypeError("i64.are``: Too many arguments");
    }

    if (!isTemplateInfix(tsa)) {
      throw new TypeError("i64.are``: Invalid template");
    }

    if (!isCompareable(left)) {
      throw new TypeError("i64.are``: ${left} is not comparable with i64");
    }

    if (!isCompareable(right)) {
      throw new TypeError("i64.are``: ${right} is not comparable with i64");
    }

    const operator = tsa[1].trim() as any as NumericComparisonOperator;

    const a = BigInt(left as number | bigint);
    const b = BigInt(right as number | bigint);

    if (operator === "<") return a < b;
    if (operator === ">") return a > b;
    if (operator === "<=") return a <= b;
    if (operator === ">=") return a >= b;
    if (operator === "==") return a === b;
    if (operator === "!=") return a !== b;

    throw new TypeError("i64.are``: Invalid comparison operator: " + operator);
  },
} as const;

const i64: i64Constructor = defineMembers(
  function i64(
    valueOrTsa:
      | BigIntCastable
      | TemplateStringsArray
      | i64TemplateUnary
      | i64TemplateInfix,
    leftOrValue?: BigIntCastable,
    right?: BigIntCastable
  ): i64 {
    if (new.target !== undefined) {
      throw new TypeError("i64 is not a constructor");
    }

    if (valueOrTsa == null) {
      throw new TypeError("i64(): Missing arguments");
    }

    if (typeof valueOrTsa === "bigint") {
      return interpreted(valueOrTsa);
    }

    if (typeof valueOrTsa === "object" && Array.isArray(valueOrTsa)) {
      return (i64 as i64Constructor).tag(
        valueOrTsa as any as TemplateStringsArray,
        leftOrValue,
        right
      );
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
        return (
          typeof value === "bigint" &&
          value >= i64.MIN_VALUE &&
          value <= i64.MAX_VALUE
        );
      },

      parseInt(int: BigIntCastable): i64 {
        return coerced(int);
      },

      tag(
        tsa: TemplateStringsArray,
        leftOrValue?: BigIntCastable,
        right?: BigIntCastable
      ) {
        if (arguments.length > 3) {
          throw new TypeError("i64.tag``: Too many arguments");
        }

        if (tsa == null) {
          throw new TypeError("i64.tag``: Missing template object");
        }

        const str1 = tsa[0].trim();

        if (typeof str1 !== "string") {
          throw new TypeError("i64.tag``: Invalid template string");
        }

        if (arguments.length === 1) {
          if (str1 === "" || tsa.length !== 1) {
            throw new TypeError("i64.tag``: Invalid template string");
          }

          if (str1.includes(" ")) {
            // Trim -> Remove number separators -> Split by space or tab -> Trim each segment
            // Example literals:
            //  i64`2 + 3`
            //  i64`~2`
            //  i64`1_000_000 + 2_000_000`
            const customTsa = str1
              .replaceAll("_", "")
              .split(/[\ ]+/)
              .map((x) => x.trim());

            if (customTsa.length !== 3) {
              throw new TypeError("i64.tag(): Invalid template string");
            }
            const operator = customTsa[1] as SpacedNumericInfixOperator;
            return i64TagInfix(["", operator, ""], coerced(customTsa[0]), coerced(customTsa[2]));
          }

          if (str1.startsWith("~") || str1.startsWith("-") || str1.startsWith("+")) {
            const operator = str1[0] as NumericUnaryOperator;
            return i64TagUnary([operator, ""], coerced(str1.slice(1)));
          }

          return coerced(str1);
        }

        if (isTemplateInfix(tsa)) {
          if (leftOrValue == null || right == null) {
            throw new TypeError("i64.tag(): Missing arguments");
          }

          return i64TagInfix(tsa, coerced(leftOrValue), coerced(right));
        }

        if (isTemplateUnary(tsa)) {
          if (leftOrValue == null) {
            throw new TypeError("i64.tag(): Missing arguments");
          }

          return i64TagUnary(tsa, coerced(leftOrValue));
        }

        throw new TypeError("i64.tag(): Invalid template string");
      },

      compare: i64Methods.compare,

      are: i64Methods.are,

      [Symbol.hasInstance](value: unknown): value is i64 {
        return i64.is(value);
      },

      // IntMath<BigInt64> implementation
      add(x: i64, y: i64): i64 {
        return interpreted(coerce(x) + coerce(y));
      },

      sub(x: i64, y: i64): i64 {
        return interpreted(coerce(x) - coerce(y));
      },

      mul(x: i64, y: i64): i64 {
        return interpreted(coerce(x) * coerce(y));
      },

      div(dividend: i64, divisor: i64): i64 {
        return interpreted(coerce(dividend) / coerce(divisor));
      },

      mod(dividend: i64, divisor: i64): i64 {
        const x = coerce(dividend);
        const y = coerce(divisor);
        const result = ((x % y) + y) % y; // Ensures the result has the same sign as divisor
        return interpreted(result);
      },

      rem(dividend: i64, divisor: i64): i64 {
        return interpreted(coerce(dividend) % coerce(divisor));
      },

      clz(value: i64): i64 {
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

      popcnt(value: i64): i64 {
        // Count number of set bits
        let val = coerce(value);
        let count = 0n;
        while (val !== 0n) {
          count += val & 1n;
          val >>= 1n;
        }
        return interpreted(count);
      },

      rotl(value: i64, shift: i64): i64 {
        // Rotate left
        const val = coerce(value);
        const s = coerce(shift) & 63n;
        return interpreted((val << s) | (val >> (64n - s)));
      },

      rotr(value: i64, shift: i64): i64 {
        // Rotate right
        const val = coerce(value);
        const s = coerce(shift) & 63n;
        return interpreted((val >> s) | (val << (64n - s)));
      },

      abs(value: i64): i64 {
        // Absolute value
        const val = coerce(value);
        return interpreted(val < 0n ? -val : val);
      },

      max(left: i64, right: i64): i64 {
        // Maximum of two values
        const l = coerce(left);
        const r = coerce(right);
        return interpreted(l > r ? l : r);
      },

      min(left: i64, right: i64): i64 {
        // Minimum of two values
        const l = coerce(left);
        const r = coerce(right);
        return interpreted(l < r ? l : r);
      },

      pow(base: i64, exponent: i64): i64 {
        // Power operation
        const b = coerce(base);
        const e = coerce(exponent);
        return interpreted(b ** e);
      },

      shl(value: i64, shift: i64): i64 {
        // Shift left operation
        const val = coerce(value);
        const s = coerce(shift);
        return interpreted(val << s);
      },

      shr(value: i64, shift: i64): i64 {
        // Shift right operation
        const val = coerce(value);
        const s = coerce(shift);
        return interpreted(val >> s);
      },

      not(value: i64): i64 {
        // Bitwise NOT operation
        const val = coerce(value);
        return coerced(~val);
      },

      and(left: i64, right: i64): i64 {
        // Bitwise AND operation
        const l = coerce(left);
        const r = coerce(right);
        return interpreted(l & r);
      },

      or(left: i64, right: i64): i64 {
        // Bitwise OR operation
        const l = coerce(left);
        const r = coerce(right);
        return interpreted(l | r);
      },

      xor(left: i64, right: i64): i64 {
        // Bitwise XOR operation
        const l = coerce(left);
        const r = coerce(right);
        return interpreted(l ^ r);
      },
    },
    createComparisonMethods(i64Methods.compare)
  )
);

preserveNames({
  i64,
});

Object.defineProperty(globalThis, i64.name, {
  configurable: true,
  enumerable: false,
  writable: true,
  value: i64,
});
