// WebAssembly numeric operations ported to JavaScript
// Using the `Number` type for i32, u32, i64, and f64.
// Using the `BigInt` type for i64 and u64.
// This is a proof of concept, and not intended for production use.
// This code is released into the public domain.

import { classof, defineMembers } from "./util";


/**
 * The minimum value for an 8-bit signed integer.
 * @type {-128}
 * @constant
 */
const I8_MIN = -128;

/**
 * The maximum value for an 8-bit signed integer.
 * @type {127}
 * @constant
 */
const I8_MAX = 127;

/**
 * The minimum value for a 64-bit signed integer.
 * Represented as a BigInt literal to maintain precision.
 * @type {-9223372036854775808n}
 * @constant
 */
const I64_MIN = -9223372036854775808n;

/**
 * The maximum value for a 64-bit signed integer.
 * Represented as a BigInt literal to maintain precision.
 * @type {9223372036854775807n}
 * @constant
 */
const I64_MAX = 9223372036854775807n;

/**
 * The minimum value for a 32-bit signed integer.
 * @type {-2147483648}
 * @constant
 */
const I32_MIN = -2147483648 as const;

/**
 * The maximum value for a 32-bit signed integer.
 * @type {2147483647}
 * @constant
 */
const I32_MAX = 2147483647 as const;

/**
 * The minimum value for an 8-bit unsigned integer.
 * @type {0}
 * @constant
 */
const U8_MIN = 0;

/**
 * The maximum value for an 8-bit unsigned integer.
 * @type {255}
 * @constant
 */
const U8_MAX = 255;

/**
 * The minimum value for a 16-bit unsigned integer.
 * @type {0}
 * @constant
 */
const U16_MIN = 0;

/**
 * The maximum value for a 16-bit unsigned integer.
 * @type {65535}
 * @constant
 */
const U16_MAX = 65535;

/**
 * The minimum value for a 32-bit unsigned integer.
 * @type {0}
 * @constant
 */
const U32_MIN = 0;

/**
 * The maximum value for a 32-bit unsigned integer.
 * @type {4294967295}
 * @constant
 */
const U32_MAX = 4294967295;

/**
 * The minimum value for a 64-bit unsigned integer.
 * Represented as a BigInt literal to maintain precision.
 * @type {0n}
 * @constant
 */
const U64_MIN = 0n;

/**
 * The maximum value for a 64-bit unsigned integer.
 * Represented as a BigInt literal to maintain precision.
 */
const U64_MAX = 18446744073709551615n as const;

/**
 * @type {-3.40282347e38}
 * @constant
 */
const F32_MIN = -3.40282347e38;
/**
 * @type {3.40282347e38}
 * @constant
 */
const F32_MAX = 3.40282347e38;
/**
 * @type {1.17549435e-38}
 * @constant
 */
const F32_MIN_NORMAL_VALUE = 1.17549435e-38;
/**
 * @type {-16777215}
 * @constant
 */
const F32_MIN_SAFE_INTEGER = -16777215;
/**
 * @type {16777215}
 * @constant
 */
const F32_MAX_SAFE_INTEGER = 16777215;
/**
 * @type {1.1920929e-7}
 * @constant
 */
const F32_EPSILON = 1.1920929e-7;

/**
 * @type {-1.7976931348623157e308}
 * @constant
 */
const F64_MIN = -1.7976931348623157e308;

/**
 * @type {1.7976931348623157e308}
 * @constant
 */
const F64_MAX = 1.7976931348623157e308;

/**
 * @type {2.2250738585072014e-308}
 * @constant
 */
const F64_MIN_NORMAL_VALUE = 2.2250738585072014e-308;

/**
 * @type {-9007199254740991}
 * @constant
 */
const F64_MIN_SAFE_INTEGER = -9007199254740991;

/**
 * @type {9007199254740991}
 * @constant
 */
const F64_MAX_SAFE_INTEGER = 9007199254740991;

/**
 * @type {2.2204460492503131e-16}
 * @constant
 */
const F64_EPSILON = 2.2204460492503131e-16;

// https://webassembly.github.io/spec/core/_download/WebAssembly.pdf
// https://webassembly.github.io/spec/core/appendix/index-instructions.html
// 2.4.1 Numeric Instructions
// Numeric instructions provide basic operations over numeric values of specific type. These operations closely match
// respective operations available in hardware.

//
// nn, mm ::= 32 | 64
// sx ::= u | s
// instr ::= inn.const unn | fnn.const fnn
//         | inn.iunop | fnn.funop
//         | inn.ibinop | fnn.fbinop
//         | inn.itestop
//         | inn.irelop | fnn.frelop
//         | inn.extend8_s | inn.extend16_s | i64.extend32_s
//         | i32.wrap_i64 | i64.extend_i32_sx | inn.trunc_fmm_sx
//         | inn.trunc_sat_fmm_sx
//         | f32.demote_f64 | f64.promote_f32 | fnn.convert_imm_sx
//         | inn.reinterpret_fnn | fnn.reinterpret_inn
//         | ...
//
// iunop ::= clz | ctz | popcnt
// ibinop ::= add | sub | mul | div_sx | rem_sx
//          | and | or | xor | shl | shr_sx | rotl | rotr
// funop ::= abs | neg | sqrt | ceil | floor | trunc | nearest
// fbinop ::= add | sub | mul | div | min | max | copysign
// itestop ::= eqz
// irelop ::= eq | ne | lt_sx | gt_sx | le_sx | ge_sx
// frelop ::= eq | ne | lt | gt | le | ge

type nn = "32" | "64";
type mm =  "32" | "64";
type int = "i32" | "i64";
type float = "f32" | "f64";
type num = int | float;
type sx = "u" | "s";
type iunop = "clz" | "ctz" | "popcnt";
type ibinop = "add" | "sub" | "mul" | `div_${sx}` | `rem_${sx}` | "and" | "or" | "xor" | "shl" | `shr_${sx}` | "rotl" | "rotr";

type funop = "abs" | "neg" | "sqrt" | "ceil" | "floor" | "trunc" | "nearest";
type fbinop = "add" | "sub" | "mul" | "div" | "min" | "max" | "copysign";
type itestop = "eqz";
type irelop = "eq" | "ne" | `lt_${sx}` | `gt_${sx}` | `le_${sx}` | `ge_${sx}`;
type frelop = "eq" | "ne" | "lt" | "gt" | "le" | "ge";

// Unary Operations: consume one operand and produce one result of the respective type.
type unop = iunop | funop | `extend${nn}_${sx}`;
// Binary Operations: consume two operands and produce one result of the respective type.
type binop = ibinop | fbinop;
// Tests: consume one operand of the respective type and produce a Boolean integer result.
type testop = itestop;
// Comparisons: consume two operands of the respective type and produce a Boolean integer result.
type relop = irelop | frelop;
// Conversions: consume a value of one type and produce a result of another (the source type of the conversion is the one after the “_”).
type cvtop = "wrap" | "extend" | "trunc" | "trunc_sat" | "convert" | "demote" | "promote" | "reinterpret";

// Numeric instructions are divided by number type. For each type, several subcategories can be distinguished:
// • Constants: return a static constant.
// • Unary Operations: consume one operand and produce one result of the respective type.
// • Binary Operations: consume two operands and produce one result of the respective type.
// • Tests: consume one operand of the respective type and produce a Boolean integer result.
// • Comparisons: consume two operands of the respective type and produce a Boolean integer result.
// • Conversions: consume a value of one type and produce a result of another (the source type of the conversion is the one after the “_”).

// Some integer instructions come in two flavors, where a signedness annotation sx distinguishes whether the operands
// are to be interpreted as unsigned or signed integers. For the other integer instructions, the use of two’s complement
// for the signed interpretation means that they behave the same regardless of signedness.

// Conventions
// Occasionally, it is convenient to group operators together according to the following grammar shorthands:
// unop ::= iunop | funop | extend𝑁_s
// binop ::= ibinop | fbinop
// testop ::= itestop
// relop ::= irelop | frelop
// cvtop ::= wrap | extend | trunc | trunc_sat | convert | demote | promote | reinterpret

type i32 = number & { ["#i32"]: void };
type u32 = number & { ["#u32"]: void };
type i64 = number & { ["#i64"]: void };
type u64 = number & { ["#i64"]: void };
type f32 = number & { ["#f32"]: void };
type f64 = number & { ["#f64"]: void };
type numable = number | bigint | string;



interface I32Constructor {
    MIN_VALUE: number;
    MAX_VALUE: number;
    // Constants
    readonly const: (value: numable) => number;
    // Unary Operations
    readonly clz: (value: numable) => number;
    readonly ctz: (value: numable) => number;
    readonly popcnt: (value: numable) => number;
    // Binary Operations
    readonly add: (x: numable, y: numable) => number;
    readonly sub: (x: numable, y: numable) => number;
    readonly mul: (x: numable, y: numable) => number;
    readonly div: (dividend: numable, divisor: numable) => number;
    readonly rem: (dividend: numable, divisor: numable) => number;
    readonly and: (left: numable, right: numable) => number;
    readonly or: (left: numable, right: numable) => number;
    readonly xor: (left: numable, right: numable) => number;
    readonly shl: (value: numable, shift: number) => number;
    readonly shr: (value: numable, shift: number) => number;
    readonly rotl: (value: numable, shift: number) => number;
    readonly rotr: (value: numable, shift: number) => number;
    // Tests
    readonly eqz: (value: numable) => boolean;
    // Comparisons
    readonly eq: (left: numable, right: numable) => boolean;
    readonly ne: (left: numable, right: numable) => boolean;
    readonly lt: (left: numable, right: numable) => boolean;
    readonly le: (left: numable, right: numable) => boolean;
    readonly gt: (left: numable, right: numable) => boolean;
    readonly ge: (left: numable, right: numable) => boolean;
    // Conversions
}

