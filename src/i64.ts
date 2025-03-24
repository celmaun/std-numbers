import { defineMembers, defineStatic } from './util';

type ArithmeticInfixOperator = '+' | '-' | '*' | '/' | '%' | '**';
type BitwiseInfixOperator = '&' | '|' | '^' | '<<' | '>>';
type NumericInfixOperator = ArithmeticInfixOperator | BitwiseInfixOperator;

type NumericInfixOpTemplate = `${number | bigint}${NumericInfixOperator}${number | bigint}`;
type NumericInfixOpTemplateSp = `${number | bigint} ${NumericInfixOperator} ${number | bigint}`;
const i64x2 = BigInt64Array.of(1n, 1n);
Object.seal(i64x2);

const i64Factory = () => {
  const rgxNumericLiteral = /\s*(0[bB][01]+|0[oO][0-7]+|0[xX][0-9a-fA-F]+|[+-]?\d*\.?\d+(?:[e][+-]\d+)?)\s*/;
  const rgxNumericInfixOperator = /([+\-*\/%&|^]|\*\*|<<|>>)/;
  // Static regex literal for performance:
  const rgxNumericInfixOpTemplate =
    /^\s*(0[bB][01]+|0[oO][0-7]+|0[xX][0-9a-fA-F]+|[+-]?\d*\.?\d+(?:[e][+-]\d+)?)\s*([+\-*\/%&|^]|\*\*|<<|>>)\s*(0[bB][01]+|0[oO][0-7]+|0[xX][0-9a-fA-F]+|[+-]?\d*\.?\d+(?:[e][+-]\d+)?)\s*$/;

  const expected = RegExp('^' + rgxNumericLiteral.source + rgxNumericInfixOperator.source + rgxNumericLiteral.source + '$');

  if (rgxNumericInfixOpTemplate.source !== expected.source) {
    throw new SyntaxError(`'Malformed regex literal.\n Expected: ${expected.source}\n Got: ${rgxNumericInfixOpTemplate.source}`);
  }

  return defineMembers(
    {
      i64(x: bigint | number | NumericInfixOpTemplate | NumericInfixOpTemplateSp): bigint {
        if (typeof x !== 'string' && typeof x !== 'bigint' && typeof x !== 'number') throw new TypeError('Invalid argument type.');

        if (typeof x === 'bigint') return (i64x2[0] = x), i64x2[0] | (0n as i64);
        if (typeof x === 'number') return (i64x2[0] = BigInt(x)), i64x2[0] | (0n as i64);

        const match = String(x).match(rgxNumericInfixOpTemplate);

        if (match === null) return (i64x2[0] = x as any), i64x2[0] | 0n;

        const [_, left, operator, right] = match;
        // Use wrapper obj to preserve names for debugging purposes
        const m = { left, operator, right };

        i64x2[0] = String(m.left) as any;
        i64x2[1] = String(m.right) as any;

        // Use short-circuit if statements instead of switch
        if (m.operator === '+') return (i64x2[0] = i64x2[0] + i64x2[1]), i64x2[0] | 0n;
        if (m.operator === '-') return (i64x2[0] = i64x2[0] - i64x2[1]), i64x2[0] | 0n;
        if (m.operator === '*') return (i64x2[0] = i64x2[0] * i64x2[1]), i64x2[0] | 0n;
        if (m.operator === '/') return (i64x2[0] = i64x2[0] / i64x2[1]), i64x2[0] | 0n;
        if (m.operator === '%') return (i64x2[0] = i64x2[0] % i64x2[1]), i64x2[0] | 0n;
        if (m.operator === '**') return (i64x2[0] = i64x2[0] ** i64x2[1]), i64x2[0] | 0n;
        if (m.operator === '&') return (i64x2[0] = i64x2[0] & i64x2[1]), i64x2[0] | 0n;
        if (m.operator === '|') return (i64x2[0] = i64x2[0] | i64x2[1]), i64x2[0] | 0n;
        if (m.operator === '^') return (i64x2[0] = i64x2[0] ^ i64x2[1]), i64x2[0] | 0n;
        if (m.operator === '<<') return (i64x2[0] = i64x2[0] << i64x2[1]), i64x2[0] | 0n;
        if (m.operator === '>>') return (i64x2[0] = i64x2[0] >> i64x2[1]), i64x2[0] | 0n;

        throw new Error('Impossible operator matched: "' + m.operator + '". This should never happen.');
      },
    }.i64,
    {
      MIN_VALUE: -9223372036854775808n,
      MAX_VALUE: 9223372036854775807n,
    },
    {
      is(value: unknown): value is bigint {
        return typeof value === 'bigint' && value >= -9223372036854775808n && value <= 9223372036854775807n;
      },
      isI64(value: unknown): value is bigint {
        return typeof value === 'bigint' && value >= -9223372036854775808n && value <= 9223372036854775807n;
      },
      cmp(x: number | string | bigint, y: number | string | bigint): -1 | 0 | 1 {
        i64x2[0] = BigInt(x);
        i64x2[1] = BigInt(y);
        return i64x2[0] < i64x2[1] ? -1 : i64x2[0] > i64x2[1] ? 1 : 0;
      },
    }
  ) satisfies i64Constructor;
};


export const i64Globalize = (globalThis: unknown): void => {
  if (typeof globalThis !== 'object' || globalThis === null) throw new TypeError('Expected an object for globalThis.');

  const i64 = i64Factory();
  const { isI64 } = i64;

  defineStatic(globalThis, { i64, isI64 });
};
type i64 = bigint & { readonly '@i64': unique symbol };
export interface i64Constructor {
  (value: bigint | number | NumericInfixOpTemplateSp | NumericInfixOpTemplate): bigint;
  readonly MIN_VALUE: bigint;
  readonly MAX_VALUE: bigint;
  is(value: unknown): value is bigint;
  isI64(value: unknown): value is bigint;
  cmp(x: bigint | number | string, y: bigint | number | string): -1 | 0 | 1;
}
