import type {
  BigIntCastable,
  NumericBinaryOperator,
  NumericUnaryOperator,
  SpacedNumericBinaryOperator,
  SpacedNumericUnaryOperator,
  i64Constructor,
  i64,
  i64TemplateBinary,
  i64TemplateUnary,
} from "./types";
import { defineMembers } from "./util";


declare global {
  namespace globalThis {
    interface BigIntConstructor {
      asIntN(bits: 64, int: bigint | i64): i64;
    }
  }
}


function i64Binary(
  arg0: TemplateStringsArray | ["", SpacedNumericBinaryOperator, ""],
  arg1: BigIntCastable,
  arg2: BigIntCastable
): i64 {
  const segments = arg0 as any as ["", SpacedNumericBinaryOperator, ""];
  const operator = segments[1];

  const x = i64.parseInt(arg1) as bigint;
  const y = i64.parseInt(arg2) as bigint;
  const op = operator.trim() as NumericBinaryOperator;

  if (!op) {
    throw new TypeError("Missing operator");
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
    throw new TypeError("Unknown operator: " + op);
  }

  return BigInt.asIntN(64, result) as i64;
}

function i64Unary(
  arg0: TemplateStringsArray | [SpacedNumericUnaryOperator, ""],
  arg1: BigIntCastable
): i64 {
  if (!Array.isArray(arg0) || (arg0.length !== 2)) {
    throw new TypeError('Invalid template');
  }
  
  const operator = arg0[0];

  const val = i64.parseInt(arg1);
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
    result = 0n + (val as bigint);
  } else {
    throw new TypeError("Invalid operator: " + op);
  }

  return BigInt.asIntN(64, result) as i64;
}

const i64: i64Constructor = defineMembers(
  function i64(
    arg0: BigIntCastable | TemplateStringsArray | i64TemplateUnary | i64TemplateBinary,
    arg1?: BigIntCastable,
    arg2?: BigIntCastable
  ): i64 {
    if (new.target !== undefined) {
      throw new TypeError("i64 is not a constructor");
    }

    if (arg0 === undefined || arg0 === null) {
      throw new TypeError("i64(): Missing arguments");
    }

    if (typeof arg0 === "bigint") {
      return BigInt.asIntN(64, arg0);
    }

    if (typeof arg0 === "object" && Array.isArray(arg0)) {
      return (i64 as i64Constructor).tag(
        arg0 as any as TemplateStringsArray,
        arg1,
        arg2
      );
    }

    return BigInt.asIntN(64, BigInt(arg0 as any));
  },
  {
    MIN_VALUE: -9223372036854775808n,
    MAX_VALUE: 9223372036854775807n,
  } as const,
  {
    is(value: BigIntCastable): value is i64 {
      return (
        typeof value === "bigint" &&
        value >= i64.MIN_VALUE &&
        value <= i64.MAX_VALUE
      );
    },

    parseInt(int: BigIntCastable): i64 {
      return BigInt.asIntN(64, BigInt(int as any)) as any as i64;
    },

    tag(
      tsa: TemplateStringsArray,
      arg1?: BigIntCastable,
      arg2?: BigIntCastable
    ) {
      const str1 = tsa[0];

      if (typeof str1 !== "string") {
        throw new TypeError("i64.tag(): Invalid template string");
      }

      if (arguments.length > 3) {
        throw new TypeError("i64.tag(): Too many arguments");
      }

      if (tsa.length === 3) {
        if (arguments.length !== 3) {
          throw new TypeError("i64.tag(): Invalid number of arguments");
        }

        return i64Binary(tsa, arg1 as BigIntCastable, arg2 as BigIntCastable);
      }

      if (tsa.length === 2) {
        if (arguments.length !== 2) {
          throw new TypeError("i64.tag(): Invalid number of arguments");
        }

        return i64Unary(tsa, arg1 as BigIntCastable);
      }

      if (arguments.length === 1) {
        if (str1.includes(" ") || str1.includes("\t")) {
          // Trim -> Remove number separators -> Split by space or tab -> Trim each segment
          // Example literals: 
          //  i64`2 + 3`
          //  i64`~2`
          //  i64`1_000_000 + 2_000_000`
          const literalTsa = str1
            .trim()
            .replaceAll("_", "")
            .split(/[\ \t]+/)
            .map((x) => x.trim());

          if (literalTsa.length === 3) {
            return i64Binary(
              ["", literalTsa[1] as SpacedNumericBinaryOperator, ""],
              literalTsa[0],
              literalTsa[2]
            );
          } else if (literalTsa.length === 2) {
            return i64Unary(
              [literalTsa[0] as SpacedNumericUnaryOperator, ""],
              literalTsa[1]
            );
          }

          throw new TypeError("i64.tag(): Invalid template string");
        }

        if (tsa.length === 1) {
          return BigInt.asIntN(64, BigInt(str1)) as any as i64;
        }
      }

      throw new TypeError("i64.tag(): Invalid template string");
    },

    [Symbol.hasInstance](value: unknown): value is i64 {
      return i64.is(value);
    },

    // IntMath<BigInt64> implementation
    add(x: i64, y: i64): i64 {
      return i64((i64(x) as bigint) + (i64(y) as bigint));
    },

    sub(x: i64, y: i64): i64 {
      return i64((i64(x) as bigint) - (i64(y) as bigint));
    },

    mul(x: i64, y: i64): i64 {
      return i64((i64(x) as bigint) * (y as bigint));
    },

    div(dividend: i64, divisor: i64): i64 {
      return i64((i64(dividend) as bigint) / (i64(divisor) as bigint));
    },

    mod(dividend: i64, divisor: i64): i64 {
      const x = i64(dividend) as bigint;
      const y = i64(divisor) as bigint;
      const result = ((x % y) + y) % y; // Ensures the result has the same sign as divisor
      return i64(result);
    },

    rem(dividend: i64, divisor: i64): i64 {
      return i64((i64(dividend) as bigint) % (i64(divisor) as bigint));
    },

    clz(value: i64): i64 {
      // Count leading zeros
      if (value === 0n) return i64(64n);
      let val = i64(value) as bigint;
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
      return i64(n);
    },

    ctz(value: i64): i64 {
      // Count trailing zeros
      if (value === 0n) return i64(64n);
      let val = i64(value) as bigint;
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
      return i64(n);
    },

    popcnt(value: i64): i64 {
      // Count number of set bits
      let val = i64(value) as bigint;
      let count = 0n;
      while (val !== 0n) {
        count += val & 1n;
        val >>= 1n;
      }
      return i64(count);
    },

    rotl(value: i64, shift: i64): i64 {
      // Rotate left
      const val = i64(value) as bigint;
      const s = i64(shift) as bigint & 63n;
      return i64((val << s) | (val >> (64n - s)));
    },

    rotr(value: i64, shift: i64): i64 {
      // Rotate right
      const val = i64(value) as bigint;
      const s = i64(shift) as bigint & 63n;
      return i64((val >> s) | (val << (64n - s)));
    },

    abs(value: i64): i64 {
      // Absolute value
      const val = i64(value) as bigint;
      return i64(val < 0n ? -val : val);
    },

    max(left: i64, right: i64): i64 {
      // Maximum of two values
      const l = i64(left) as bigint;
      const r = i64(right) as bigint;
      return i64(l > r ? l : r);
    },

    min(left: i64, right: i64): i64 {
      // Minimum of two values
      const l = i64(left) as bigint;
      const r = i64(right) as bigint;
      return i64(l < r ? l : r);
    },

    pow(base: i64, exponent: i64): i64 {
      // Power operation
      const b = i64(base) as bigint;
      const e = i64(exponent) as bigint;
      return i64(b ** e);
    },

    shl(value: i64, shift: i64): i64 {
      // Shift left operation
      const val = i64(value) as bigint;
      const s = i64(shift) as bigint;
      return i64(val << s);
    },

    shr(value: i64, shift: i64): i64 {
      // Shift right operation
      const val = i64(value) as bigint;
      const s = i64(shift) as bigint;
      return i64(val >> s);
    },

    not(value: i64): i64 {
      // Bitwise NOT operation
      const val = i64(value) as bigint;
      return i64(~val);
    },

    and(left: i64, right: i64): i64 {
      // Bitwise AND operation
      const l = i64(left) as bigint;
      const r = i64(right) as bigint;
      return i64(l & r);
    },

    or(left: i64, right: i64): i64 {
      // Bitwise OR operation
      const l = i64(left) as bigint;
      const r = i64(right) as bigint;
      return i64(l | r);
    },

    xor(left: i64, right: i64): i64 {
      // Bitwise XOR operation
      const l = i64(left) as bigint;
      const r = i64(right) as bigint;
      return i64(l ^ r);
    },
  }
);

Object.defineProperty(i64, "name", {
  value: Object.keys({i64})[0],
  configurable: false,
  enumerable: false,
  writable: false
});

Object.defineProperty(globalThis, i64.name, {
  configurable: true,
  enumerable: false,
  writable: true,
  value: i64,
});
