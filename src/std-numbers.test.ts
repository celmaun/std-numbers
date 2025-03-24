import { describe, expect, it } from 'vitest';
import { globalizeStdNumbers } from 'std-numbers';

globalizeStdNumbers(globalThis);

describe('Test Int64', () => {
  describe('Instantiation', () => {
    it('should be able to create an Int64 instance', () => {
      const int = new Int64(123);
      expect(int).toBeInstanceOf(Int64);
    });
    it('should be able to create an Int64 instance from a string', () => {
      const int = new Int64('123');
      expect(int).toBeInstanceOf(Int64);
    });
    it('should be able to create an Int64 instance from a bigint', () => {
      const int = new Int64(123n);
      expect(int).toBeInstanceOf(Int64);
    });
    it('should be able to create an Int64 instance from another Int64 instance', () => {
      const int = new Int64(123);
      const intCopy = new Int64(int);
      expect(intCopy).toBeInstanceOf(Int64);
    });
    it('should be able to create an Int64 instance from a string', () => {
      const int = new Int64('123');
      expect(int).toBeInstanceOf(Int64);
    });
    // should be able to set the value of an Int64 instance
    it('should be able to set the value of an Int64 instance', () => {
      const int = new Int64(123);
      int[0] = 456n;
      expect(int[0]).toBe(456n);
    });
  });

  describe('Addition and subtraction', () => {
    it('should add two Int64 instances', () => {
      const int1 = new Int64(123);
      const int2 = new Int64(456);
      expect(int1[0] + int2[0]).toBe(579n);
    });

    it('should subtract two Int64 instances', () => {
      const int1 = new Int64(123);
      const int2 = new Int64(456);
      expect(int1[0] - int2[0]).toBe(-333n);
    });
    it('should add two Int64 instances and return an Int64 instance', () => {
      const int1 = new Int64(123);
      const int2 = new Int64(456);
      const result = new Int64(int1[0] + int2[0]);
      expect(result).toBeInstanceOf(Int64);
      expect(result.valueOf()).toBe(579n);
    });
  });
});
