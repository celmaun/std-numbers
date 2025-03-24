const util = {
  json(value: unknown): string {
    return JSON.stringify(value);
  },

  typeTag(value: unknown): string {
    if (value === null) return 'null';
    if (typeof value !== 'object') return typeof value;
    const tag = String(Object.prototype.toString.call(value));
    // Symbol.toStringTag can be an empty string ('')
    if (tag === '[object Object]' || tag === '[object ]') return 'object';
    return tag.slice(8, -1);
  },
  debugStr(val: unknown): string {
    if (val == null || val === true || val === false || val !== val || val == Infinity || val === -Infinity) return String(val);

    if (typeof val === 'string') {
      return json(val);
    }

    return typeTag(val);
  },

  defineReadonly<T extends {}, U extends Readonly<Record<string | symbol, any>>>(object: T, properties: U): T & U {
    const descriptors = Object.getOwnPropertyDescriptors(properties);

    for (const desc of Object.values(descriptors)) {
      desc.configurable = false;
      desc.enumerable = false;
      desc.writable = false;
    }

    Object.defineProperties(object, descriptors);

    return object as any;
  },
  defineStatic<T extends {}, V extends Record<string | symbol, any>>(object: T, properties: V): T & V {
    const descriptors = Object.getOwnPropertyDescriptors(properties);

    for (const desc of Object.values(descriptors)) {
      desc.enumerable = false;
    }

    Object.defineProperties(object, descriptors);

    return object as any;
  },

  defineMembers<T extends {}, const U extends Readonly<Record<string | symbol, any>>, V extends Record<string | symbol, any>>(
    target: T,
    readonlyMembers: U,
    staticMembors: V
  ): T & U & V {
    defineReadonly(target, readonlyMembers);
    defineStatic(target, staticMembors);
    return target as any;
  },

  defineNumericClass<T extends {}, const U extends Readonly<Record<string | symbol, any>>, V extends Record<string | symbol, any>>(
    target: T,
    readonlyMembers: U,
    staticMembors: V
  ): T & U & V {
    defineReadonly(target, readonlyMembers);
    defineStatic(target, staticMembors);
    Object.freeze(target);
    return target as any;
  },

  nonEnumerable<T extends Record<string | symbol, any>>(object: T): T {
    const descriptors = Object.getOwnPropertyDescriptors(object);

    for (const desc of Object.values(descriptors)) {
      desc.enumerable = false;
    }

    Object.defineProperties(object, descriptors);

    return object;
  },

  // Preserve the names of functions through minification.
  preserveNames<const T extends Record<string, Function>>(record: T): T {
    for (const [name, func] of Object.entries(record)) {
      if (typeof func === 'function' && func.name !== name) {
        Object.defineProperty(func, 'name', { value: name });
      }
    }

    return record;
  },
};

export const { json, typeTag, debugStr, defineReadonly, nonEnumerable, defineStatic, defineMembers, preserveNames, defineNumericClass } = util;
