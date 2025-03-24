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

const Int64Static = {
  isInt64(x) {
    return typeof x === 'function' && Object.prototype.toString.call(x) === '[object Int64.macro]';
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
  let val = typeof x === 'number' ? BigInt(x) : isInt64(x) ? x() : x;

  val = ((i64x2[0] = val), i64x2[0] | 0n);

  const getSetInt64 = (...args) => {
    if (args.length === 0) return val;
    const x = args[0];
    val = ((i64x2[0] = typeof x === 'number' ? BigInt(x) : x), i64x2[0] | 0n);
    return val;
  };

  Object.setPrototypeOf(getSetInt64, null);
  return Object.freeze(
    Object.defineProperties(getSetInt64, {
      constructor: { value: Int64 },
      name: { value: 'Int64.macro' },
      [Symbol.toStringTag]: { get: () => 'Int64.macro' },
    })
  );
}

preserveNames({ Int64 });

Object.defineProperties(Int64, {
  isInt64: { value: isInt64 },
  [Symbol.hasInstance]: { value: isInt64 },
});

export const globalizeStdNumbers = (globalThat) => {
  if (typeof globalThat !== 'object' || globalThat === null) throw new TypeError('Expected an object for globalThat. Got: ' + typeTag(globalThat));

  Object.defineProperties(globalThat, {
    Int64: { value: Int64 },
  });
};
