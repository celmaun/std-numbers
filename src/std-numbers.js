// @ts-check

const util = {
  json(value) {
    return JSON.stringify(value);
  },

  typeTag(value) {
    if (value === null) return 'null';
    if (typeof value !== 'object') return typeof value;
    const tag = String(Object.prototype.toString.call(value));
    if (tag === '[object Object]' || tag === '[object ]') return 'object';
    return tag.slice(8, -1);
  },
  debugStr(val) {
    if (val == null || val === true || val === false || val !== val || val == Infinity || val === -Infinity) return String(val);

    if (typeof val === 'string') {
      return json(val);
    }

    return typeTag(val);
  },
  // Preserve the names of functions through minification.
  preserveNames(record) {
    for (const [name, func] of Object.entries(record)) {
      if (typeof func === 'function' && func.name !== name) {
        Object.defineProperty(func, 'name', { value: name });
      }
    }

    return record;
  },
};

const { json, typeTag, debugStr, preserveNames } = util;

const i64x2 = BigInt64Array.of(0n, 0n);
Object.seal(i64x2);

const INT64_MIN_VALUE = -9223372036854775808n;
const INT64_MAX_VALUE = 9223372036854775807n;

const Int64Static = {
  isInt64(x) {
    return typeof x === 'object' && x !== null && Object.prototype.toString.call(x) === '[object Int64]';
  },
};

const { isInt64 } = Int64Static;

/**
 *
 * @param {bigint | number | string | Int64} x
 * @returns {Int64}
 */
function Int64(x = 0n) {
  if (x == null) throw new TypeError('Value cannot be null or undefined.');

  if (new.target === undefined) {
    // @ts-expect-error
    return (i64x2[0] = typeof x === 'number' ? BigInt(x) : x), i64x2[0] | 0n;
  }
  // @ts-expect-error
  let val = ((i64x2[0] = typeof x === 'number' ? BigInt(x) : x), i64x2[0] | 0n);

  const fn = {
    Int64GetToStringTag() {
      return 'Int64';
    },
    Int64ToString(radix) {
      return val.toString(radix);
    },
    Int64ValueOf() {
      return val;
    },
    Int64GetValue() {
      return val;
    },
    Int64SetValue(newValue) {
      val = ((i64x2[0] = typeof newValue === 'number' ? BigInt(newValue) : newValue), i64x2[0] | 0n);
    },
  };

  return Object.freeze(
    Object.create(null, {
      constructor: { value: Int64 },
      valueOf: { value: fn.Int64ValueOf },
      toString: { value: fn.Int64ToString },
      [Symbol.toStringTag]: { get: fn.Int64GetToStringTag },
      0: { get: fn.Int64GetValue, set: fn.Int64SetValue },
    })
  );
}

preserveNames({ Int64 });

Object.defineProperties(Int64, {
  MIN_VALUE: { value: INT64_MIN_VALUE },
  MAX_VALUE: { value: INT64_MAX_VALUE },
  isInt64: { value: isInt64 },
  [Symbol.hasInstance]: { value: isInt64 },
});

export const globalizeStdNumbers = (globalThat) => {
  if (typeof globalThat !== 'object' || globalThat === null) throw new TypeError('Expected an object for globalThat. Got: ' + typeTag(globalThat));

  Object.defineProperties(globalThat, {
    Int64: { value: Int64 },
  });
};
