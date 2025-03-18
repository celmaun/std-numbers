/**
 * @import {
 *   ArithmeticInfixOperator, 
 *   ArithmeticUnaryOperator, 
 *   BitwiseInfixOperator, BitwiseUnaryOperator, 
 *   NumericComparisonOperator
 * } from "./types"
 */

/**
 * The minimum value for an 8-bit signed integer.
 * @type {-128}
 * @constant
 */
export const I8_MIN = -128;

/**
 * The maximum value for an 8-bit signed integer.
 * @type {127}
 * @constant
 */
export const I8_MAX = 127;

/**
 * The minimum value for a 64-bit signed integer.
 * Represented as a BigInt literal to maintain precision.
 * @type {-9223372036854775808n}
 * @constant
 */
export const I64_MIN = -9223372036854775808n;

/**
 * The maximum value for a 64-bit signed integer.
 * Represented as a BigInt literal to maintain precision.
 * @type {9223372036854775807n}
 * @constant
 */
export const I64_MAX = 9223372036854775807n;

/**
 * The minimum value for a 32-bit signed integer.
 * @type {-2147483648}
 * @constant
 */
export const I32_MIN = -2147483648;

/**
 * The maximum value for a 32-bit signed integer.
 * @type {2147483647}
 * @constant
 */
export const I32_MAX = 2147483647;

/**
 * The minimum value for an 8-bit unsigned integer.
 * @type {0}
 * @constant
 */
export const U8_MIN = 0;

/**
 * The maximum value for an 8-bit unsigned integer.
 * @type {255}
 * @constant
 */
export const U8_MAX = 255;

/**
 * The minimum value for a 16-bit unsigned integer.
 * @type {0}
 * @constant
 */
export const U16_MIN = 0;

/**
 * The maximum value for a 16-bit unsigned integer.
 * @type {65535}
 * @constant
 */
export const U16_MAX = 65535;

/**
 * The minimum value for a 32-bit unsigned integer.
 * @type {0}
 * @constant
 */
export const U32_MIN = 0;

/**
 * The maximum value for a 32-bit unsigned integer.
 * @type {4294967295}
 * @constant
 */
export const U32_MAX = 4294967295;

/**
 * The minimum value for a 64-bit unsigned integer.
 * Represented as a BigInt literal to maintain precision.
 * @type {0n}
 * @constant
 */
export const U64_MIN = 0n;

/**
 * The maximum value for a 64-bit unsigned integer.
 * Represented as a BigInt literal to maintain precision.
 * @type {18446744073709551615n}
 * @constant
 */
export const U64_MAX = 18446744073709551615n;

/**
* @type {-3.40282347e38}
* @constant
*/
export const F32_MIN = -3.40282347e38;
/**
 * @type {3.40282347e38}
 * @constant
 */
export const F32_MAX = 3.40282347e38;
/**
 * @type {1.17549435e-38}
 * @constant
 */
export const F32_MIN_NORMAL_VALUE = 1.17549435e-38;
/**
 * @type {-16777215}
 * @constant
 */
export const F32_MIN_SAFE_INTEGER = -16777215;
/**
 * @type {16777215}
 * @constant
 */
export const F32_MAX_SAFE_INTEGER = 16777215;
/**
 * @type {1.1920929e-7}
 * @constant
 */
export const F32_EPSILON = 1.1920929e-7;

/**
 * @type {-1.7976931348623157e308}
 * @constant
 */
export const F64_MIN = -1.7976931348623157e308;

/**
 * @type {1.7976931348623157e308}
 * @constant
 */
export const F64_MAX = 1.7976931348623157e308;

/**
 * @type {2.2250738585072014e-308}
 * @constant
 */
export const F64_MIN_NORMAL_VALUE = 2.2250738585072014e-308;

/**
 * @type {-9007199254740991}
 * @constant
 */
export const F64_MIN_SAFE_INTEGER = -9007199254740991;

/**
 * @type {9007199254740991}
 * @constant
 */
export const F64_MAX_SAFE_INTEGER = 9007199254740991;

/**
 * @type {2.2204460492503131e-16}
 * @constant
 */
export const F64_EPSILON = 2.2204460492503131e-16;

/**
 * @type {ArithmeticInfixOperator[]}
 * @constant
 */
export const ARITHMETIC_INFIX_OPERATORS = ["+", "-", "*", "/", "%", "%%", "**"];

/**
 * @type {ArithmeticUnaryOperator[]}
 * @constant
 */
export const ARITHMETIC_UNARY_OPERATORS = ["-", "+"];

/**
 * @type {BitwiseInfixOperator[]}
 * @constant
 */
export const BITWISE_INFIX_OPERATORS = ["&", "|", "^", "<<", ">>", ">>>"];

/**
 * @type {BitwiseUnaryOperator[]}
 * @constant
 */
export const BITWISE_UNARY_OPERATORS = ["~"];

/**
 * @type {NumericComparisonOperator[]}
 * @constant
 */
export const NUMERIC_COMPARISON_OPERATORS = [
  "==",
  "!=",
  "<",
  ">",
  "<=",
  ">="
];