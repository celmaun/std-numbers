
declare var Object: { freeze<const T>(o: T): Omit<Readonly<T>, '__proto__'>; } & ObjectConstructor;

// https://webassembly.github.io/spec/core/_download/WebAssembly.pdf

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

// Numeric instructions are divided by number type. For each type, several subcategories can be distinguished:
// • Constants: return a static constant.
// • Unary Operations: consume one operand and produce one result of the respective type.
// • Binary Operations: consume two operands and produce one result of the respective type.
// • Tests: consume one operand of the respective type and produce a Boolean integer result.
// • Comparisons: consume two operands of the respective type and produce a Boolean integer result.
// • Conversions: consume a value of one type and produce a result of another (the source type of the conversion
// is the one after the “_”).
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


// https://augustus-pash.gitbook.io/wasm/types/numbers

// Numbers
// Wasm has four types of numbers i32, i64, f32, and f64. Each kind has their own operators and can be converted between types.

// i32 - 32bit integer
// i64 - 64bit integer
// f32 - 32bit float
// f64 - 64bit float




// Common Arithmetic Operations for different data types.
//
// | Operation    | i32                  | i64                  | f32          | f64          |
// |--------------|----------------------|----------------------|--------------|--------------|
// | add          | i32.add              | i64.add              | f32.add      | f64.add      |
// | sub          | i32.sub              | i64.sub              | f32.sub      | f64.sub      |
// | mul          | i32.mul              | i64.mul              | f32.mul      | f64.mul      |
// | div          | i32.div_s // signed  | i64.div_s            | f32.div      | f64.div      |
// |              | i32.div_u // unsigned| i64.div_u            |              |              |
// | remainder    | i32.rem_s            | i64.rem_s            |              |              |
// |              | i32.rem_u            | i64.rem_u            |              |              |
// | abs          |                      |                      | f32.abs      | f64.abs      |
// | neg          |                      |                      | f32.neg      | f64.neg      |
// | ceiling      |                      |                      | f32.ceil     | f64.ceil     |
// | floor        |                      |                      | f32.floor    | f64.floor    |
// | square root  |                      |                      | f32.sqrt     | f64.sqrt     |
// | min          |                      |                      | f32.min      | f64.min      |
// | max          |                      |                      | f32.max      | f64.max      |
// | copysign     |                      |                      | f32.copysign | f64.copysign |
// | trunc        |                      |                      | f32.trunc    | f64.trunc    |
// | nearest      |                      |                      | f32.nearest  | f64.nearest  |


interface i32 extends NumberConstructor {
    add(x: i32, y: i32): i32; // +
    sub(x: i32, y: i32): i32; // -
    mul(x: i32, y: i32): i32; // *
    div_s(dividend: i32, divisor: i32): i32; // /
    div_u(dividend: i32, divisor: i32): i32; // /
    rem_s(dividend: i32, divisor: i32): i32; // %
    rem_u(dividend: i32, divisor: i32): i32; // %
    abs(value: i32): i32;
    neg(value: i32): i32;
}

interface i64 extends BigIntConstructor {
    add(x: i64, y: i64): i64; // +
    sub(x: i64, y: i64): i64; // -
    mul(x: i64, y: i64): i64; // *
    div_s(dividend: i64, divisor: i64): i64; // /
    div_u(dividend: i64, divisor: i64): i64; // /
    rem_s(dividend: i64, divisor: i64): i64; // %
    rem_u(dividend: i64, divisor: i64): i64; // %
    abs(value: i64): i64;
    neg(value: i64): i64;
}

interface f32 extends NumberConstructor {
    add(x: f32, y: f32): f32; // +
    sub(x: f32, y: f32): f32; // -
    mul(x: f32, y: f32): f32; // *
    div(dividend: f32, divisor: f32): f32; // /
    abs(value: f32): f32;
    neg(value: f32): f32;
    ceil(value: f32): f32;
    floor(value: f32): f32;
    sqrt(value: f32): f32;
    min(left: f32, right: f32): f32;
    max(left: f32, right: f32): f32;
    copysign(left: f32, right: f32): f32;
    trunc(value: f32): f32;
    nearest(value: f32): f32;
}

interface f64 extends NumberConstructor {
    add(x: f64, y: f64): f64; // +
    sub(x: f64, y: f64): f64; // -
    mul(x: f64, y: f64): f64; // *
    div(dividend: f64, divisor: f64): f64; // /
    abs(value: f64): f64;
    neg(value: f64): f64;
    ceil(value: f64): f64;
    floor(value: f64): f64;
    sqrt(value: f64): f64;
    min(left: f64, right: f64): f64;
    max(left: f64, right: f64): f64;
    copysign(left: f64, right: f64): f64;
    trunc(value: f64): f64;
    nearest(value: f64): f64;
}

// Common Logic Operations for different data types.
//
// | Operation             | i32                  | i64                  | f32        | f64        |
// |-----------------------|----------------------|----------------------|------------|------------|
// | equals one            | i32.eqz              | i64.eqz              |            |            |
// | equals                | i32.eq               | i64.eq               | f32.eq     | f64.eq     |
// | not equal             | i32.ne               | i64.ne               | f32.ne     | f64.ne     |
// | less than             | i32.lt_s // signed   | i64.lt_s             | f32.lt     | f64.lt     |
// |                       | i32.lt_u // unsigned | i64.lt_u             |            |            |
// | greater than          | i32.gt_s             | i64.gt_s             | f32.gt     | f64.gt     |
// |                       | i32.gt_u             | i64.gt_u             |            |            |
// | less than or equal    | i32.le_s             | i64.le_s             | f32.le     | f64.le     |
// |                       | i32.le_u             | i64.le_u             |            |            |
// | greater than or equal | i32.ge_s             | i64.ge_s             | f32.ge     | f64.ge     |
// |                       | i32.ge_u             | i64.ge_u             |            |            |
// | and                   | i32.and              | i64.and              |            |            |
// | or                    | i32.or               | i64.or               |            |            |
// | xor                   | i32.xor              | i64.xor              |            |            |

interface i32 extends NumberConstructor {
    eqz(value: i32): boolean;
    eq(left: i32, right: i32): boolean;
    ne(left: i32, right: i32): boolean;
    lt_s(left: i32, right: i32): boolean;
    lt_u(left: i32, right: i32): boolean;
    gt_s(left: i32, right: i32): boolean;
    gt_u(left: i32, right: i32): boolean;
    le_s(left: i32, right: i32): boolean;
    le_u(left: i32, right: i32): boolean;
    ge_s(left: i32, right: i32): boolean;
    ge_u(left: i32, right: i32): boolean;
    and(left: i32, right: i32): i32;
    or(left: i32, right: i32): i32;
    xor(left: i32, right: i32): i32;
}

interface i64 extends BigIntConstructor {
    eqz(value: i64): boolean;
    eq(left: i64, right: i64): boolean;
    ne(left: i64, right: i64): boolean;
    lt_s(left: i64, right: i64): boolean;
    lt_u(left: i64, right: i64): boolean;
    gt_s(left: i64, right: i64): boolean;
    gt_u(left: i64, right: i64): boolean;
    le_s(left: i64, right: i64): boolean;
    le_u(left: i64, right: i64): boolean;
    ge_s(left: i64, right: i64): boolean;
    ge_u(left: i64, right: i64): boolean;
    and(left: i64, right: i64): i64;
    or(left: i64, right: i64): i64;
    xor(left: i64, right: i64): i64;
}

interface f32 extends NumberConstructor {
    eq(value: f32): boolean;
    ne(value: f32): boolean;
    lt(left: f32, right: f32): boolean;
    gt(left: f32, right: f32): boolean;
    le(left: f32, right: f32): boolean;
    ge(left: f32, right: f32): boolean;
}

interface f64 extends NumberConstructor {
    eq(value: f64): boolean;
    ne(value: f64): boolean;
    lt(left: f64, right: f64): boolean;
    gt(left: f64, right: f64): boolean;
    le(left: f64, right: f64): boolean;
    ge(left: f64, right: f64): boolean;
}



// Conversions between different data types.
//
// | x to y | i32                 | i64                 | f32                | f64                |
// |--------|---------------------|---------------------|--------------------|--------------------|
// | i32    |                     | i32.extend_i32_s    | i32.convert_i64_s  | i32.convert_f32_s  |
// | i32    |                     | i32.wrap_i64        | i32.trunc_f32_s    | i32.trunc_f64_s    |
// | i64    | i64.extend_i32_s    |                     | i64.trunc_f32_u    | i64.trunc_f64_s    |
// | f32    | f32.convert_i32     | f32.convert_i64_s   |                    | f32.demote_f64     |
// | f64    | f64.convert_i32_s   | f64.convert_i64_s   | f64.promote_f32    |                    |

interface i32 extends NumberConstructor {
    wrap_i64(value: i64): i32;
    trunc_f32_s(value: f32): i32;
    trunc_f64_s(value: f64): i32;
}

interface i64 extends BigIntConstructor {
    extend_i32_s(value: i32): i64;
    trunc_f32_u(value: f32): i64;
    trunc_f64_s(value: f64): i64;
}

interface f32 extends NumberConstructor {
    convert_i32(value: i32): f32;
    convert_i64_s(value: i64): f32;
    demote_f64(value: f64): f32;
}

interface f64 extends NumberConstructor {
    convert_i32_s(value: i32): f64;
    convert_i64_s(value: i64): f64;
    promote_f32(value: f32): f64;
}

// Common Bitwise Operations for different data types.

// | Operation            | i32                  | i64                  | f32                | f64                |
// |----------------------|----------------------|-----------------------------------------------------------------
// | and                  | i32.and              | i64.and
// | or                   | i32.or               | i64.or
// | xor                  | i32.xor              | i64.xor
// | not                  | i32.not              | i64.not
// | shift left           | i32.shl              | i64.shl
// | shift right          | i32.shr_s            | i64.shr_s
// |                      | i32.shr_u            | i64.shr_u
// | rotate left          | i32.rotl             | i64.rotl
// | rotate right         | i32.rotr             | i64.rotr
// | count leading zeros  | i32.clz              | i64.clz
// | count trailing zeros | i32.ctz              | i64.ctz
// | population count     | i32.popcnt           | i64.popcnt

interface i32 extends NumberConstructor {
    not(value: i32): i32;
    shl(value: i32, shift: i32): i32;
    shr_s(value: i32, shift: i32): i32;
    shr_u(value: i32, shift: i32): i32;
    rotl(value: i32, shift: i32): i32;
    rotr(value: i32, shift: i32): i32;
    clz(value: i32): i32;
    ctz(value: i32): i32;
    popcnt(value: i32): i32;
}

interface i64 extends BigIntConstructor {
    not(value: i64): i64;
    shl(value: i64, shift: i64): i64;
    shr_s(value: i64, shift: i64): i64;
    shr_u(value: i64, shift: i64): i64;
    rotl(value: i64, shift: i64): i64;
    rotr(value: i64, shift: i64): i64;
    clz(value: i64): i64;
    ctz(value: i64): i64;
    popcnt(value: i64): i64;
}
