import { describe, it, expect } from 'vitest';
import { parsei32 } from './parsers';

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

describe('Test number parsing functions', () => {
    describe('parsei32()', () => {
        // It should identity parse a valid i32 number
        it('should parse a valid i32 number', () => {
            expect(parsei32(123)).toBe(123);
            expect(parsei32(-123)).toBe(-123);
            expect(parsei32(0)).toBe(0);
            expect(parsei32(2147483647)).toBe(2147483647);
            expect(parsei32(-2147483648)).toBe(-2147483648);
            expect(parsei32(I32_MIN)).toBe(-2147483648);
            expect(parsei32(I32_MAX)).toBe(2147483647);
        });

        // It should throw a RangeError on out-of-range `number` numbers
        it('should throw a RangeError on out-of-range `number` numbers', () => {
            expect(() => parsei32(2147483648)).toThrow(RangeError);
            expect(() => parsei32(-2147483649)).toThrow(RangeError);
            expect(() => parsei32(41347483655548)).toThrow(RangeError);
  
            expect(() => parsei32(I32_MIN - 1)).toThrow(RangeError);
            expect(() => parsei32(I32_MAX + 1)).toThrow(RangeError);
            expect(() => parsei32(U32_MAX)).toThrow(RangeError);
            expect(() => parsei32(U32_MAX + 1)).toThrow(RangeError);
            expect(() => parsei32(Number.MAX_SAFE_INTEGER)).toThrow(RangeError);
            expect(() => parsei32(Number.MIN_SAFE_INTEGER)).toThrow(RangeError);
        });

        // It should throw a TypeError for floating point numbers that are unsafe integers
        it('should throw a TypeError for floating point numbers that are not safe integers', () => {
            expect(() => parsei32(-7414227031455547483649)).toThrow(TypeError);
        });

        // It should throw a TypeError for floating point numbers with a non-zero fractional part
        it('should throw a TypeError for floating point numbers with a non-zero fractional part', () => {
            expect(() => parsei32(123.456)).toThrow(TypeError);
            expect(() => parsei32(-123.456)).toThrow(TypeError);
            expect(() => parsei32(0.123)).toThrow(TypeError);
            expect(() => parsei32(2147483647.123)).toThrow(TypeError);
            expect(() => parsei32(-2147483648.123)).toThrow(TypeError);

        });

        // It should throw a TypeError for Number.* constants that are not integers
        it('should throw a TypeError for Number.* constants that are not integers', () => {
            expect(() => parsei32(Number.MAX_VALUE)).toThrow(TypeError);
            expect(() => parsei32(Number.MIN_VALUE)).toThrow(TypeError);
            expect(() => parsei32(Number.NaN)).toThrow(TypeError);
            expect(() => parsei32(Number.POSITIVE_INFINITY)).toThrow(TypeError);
            expect(() => parsei32(Number.NEGATIVE_INFINITY)).toThrow(TypeError);
            expect(() => parsei32(Number.EPSILON)).toThrow(TypeError);
        });

        // It should throw a TypeError for Math.* constants that are not integers
        it('should throw a TypeError for Math.* constants that are not integers', () => {
            expect(() => parsei32(Math.PI)).toThrow(TypeError);
            expect(() => parsei32(Math.E)).toThrow(TypeError);
            expect(() => parsei32(Math.LN2)).toThrow(TypeError);
            expect(() => parsei32(Math.LN10)).toThrow(TypeError);
            expect(() => parsei32(Math.LOG2E)).toThrow(TypeError);
            expect(() => parsei32(Math.LOG10E)).toThrow(TypeError);
            expect(() => parsei32(Math.SQRT1_2)).toThrow(TypeError);
            expect(() => parsei32(Math.SQRT2)).toThrow(TypeError);
        });

        // It should coerce valid bigint numbers to i32
        it('should coerce valid bigint numbers to i32', () => {
            expect(parsei32(123n)).toBe(123);
            expect(parsei32(-123n)).toBe(-123);
            expect(parsei32(0n)).toBe(0);
            expect(parsei32(2147483647n)).toBe(2147483647);
            expect(parsei32(-2147483648n)).toBe(-2147483648);
        });

        // It should throw a RangeError on out-of-range bigint numbers
        it('should throw a RangeError on out-of-range bigint numbers', () => {
            expect(() => parsei32(I64_MAX)).toThrow(RangeError);
            expect(() => parsei32(I64_MIN)).toThrow(RangeError);
            expect(() => parsei32(41347483655548n)).toThrow(RangeError);
            expect(() => parsei32(-7414227031455547483649n)).toThrow(RangeError);
        });

        it('should parse a valid integer string within valid range', () => {
            expect(parsei32('123')).toBe(123);
            // More strings with larger numbers but in the valid range
            expect(parsei32('2147483647')).toBe(2147483647);
            expect(parsei32('-2147483648')).toBe(-2147483648);
            expect(parsei32('0')).toBe(0);
            expect(parsei32('123456')).toBe(123456);
            expect(parsei32('-123456')).toBe(-123456);
        });

        it('should parse negative integer strings within valid range', () => {
            expect(parsei32('-123')).toBe(-123);
            expect(parsei32('-5657574')).toBe(-5657574);
            expect(parsei32('-3339323')).toBe(-3339323);
        });

        // It should throw a type error for undefined, null and NaN
        it('should throw a TypeError for no-argument, undefined, null and NaN', () => {
            // @ts-expect-error
            expect(() => parsei32()).toThrow(TypeError);
            expect(() => parsei32(undefined as any)).toThrow(TypeError);
            expect(() => parsei32(null as any)).toThrow(TypeError);
            expect(() => parsei32(NaN)).toThrow(TypeError);
        });

        // It should throw a type error for negative zero, Infinity and -Infinity
        it('should throw a TypeError for negative zero, Infinity and -Infinity', () => {
            expect(() => parsei32(-0)).toThrow(TypeError);
            expect(() => parsei32(Infinity)).toThrow(TypeError);
            expect(() => parsei32(-Infinity)).toThrow(TypeError);
        });

        it('should throw a RangeError for out-of-range numeric strings', () => {
            expect(() => parsei32('4294967296')).toThrow(RangeError);
            expect(() => parsei32('-4294967296')).toThrow(RangeError);
            // Random integer strings that are out of range
            expect(() => parsei32('2147483648')).toThrow(RangeError);
            expect(() => parsei32('-2147483649')).toThrow(RangeError);

            expect(() => parsei32('3000000000')).toThrow(RangeError);
            expect(() => parsei32('-3000000000')).toThrow(RangeError);

            expect(() => parsei32('76678656577657664545335')).toThrow(RangeError);
            expect(() => parsei32('-987654323456789876543245')).toThrow(RangeError);
        });

        it('should throw a SyntaxError for invalid strings', () => {
            expect(() => parsei32('abc')).toThrow(SyntaxError);
            expect(() => parsei32('')).toThrow(SyntaxError);
            expect(() => parsei32('    ')).toThrow(SyntaxError);
        });

        it('should throw a SyntaxError for strings with a signed zero', () => {
            expect(() => parsei32('-0')).toThrow(SyntaxError);
            expect(() => parsei32('+0')).toThrow(SyntaxError);
        });

        it('should throw a SyntaxError for strings with leading non-numeric characters', () => {
            expect(() => parsei32('abc123')).toThrow(SyntaxError);
            expect(() => parsei32('0xFF')).toThrow(SyntaxError);
        });

        it('should throw a SyntaxError for strings in hexadecimal format', () => {
            expect(() => parsei32('0x123')).toThrow(SyntaxError);
            expect(() => parsei32('-0x123')).toThrow(SyntaxError);  
        });

        it('should throw a SyntaxError for strings in octal format', () => {
            expect(() => parsei32('0123')).toThrow(SyntaxError);
            expect(() => parsei32('-0123')).toThrow(SyntaxError);
        });


        it('should throw a SyntaxError for strings in binary format', () => {
            expect(() => parsei32('0b101')).toThrow(SyntaxError);
            expect(() => parsei32('-0b101')).toThrow(SyntaxError);
        });

        // It should throw a TypeError for arguments that are not numbers or strings
        it('should throw a TypeError for arguments that are not numbers or strings', () => {
            expect(() => parsei32({} as any)).toThrow(TypeError);
            expect(() => parsei32([] as any)).toThrow(TypeError);
            expect(() => parsei32((() => 123) as any)).toThrow(TypeError);
            expect(() => parsei32((Symbol('test')) as any)).toThrow(TypeError);
        });


        it('should throw a TypeError for boolean values', () => {
            expect(() => parsei32(true as any)).toThrow(TypeError);
            expect(() => parsei32(false as any)).toThrow(TypeError);
        });

    });
});
