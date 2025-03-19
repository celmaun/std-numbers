import { describe, expect, it, test } from 'vitest';

import { I64 } from './i64';

// https://github.com/peterolson/BigInteger.js/blob/master/spec/spec.js
describe('I64', () => {


  describe('Tagged template literals', () => {
    describe('Addition and subtraction', () => {
      it('by 0 is the identity', () => {
        // Addition by 0
        expect(I64`${1} + ${0}`).toBe(1n);
        expect(I64`1 + 0`).toBe(1n);

        expect(I64`${-1} + ${0}`).toBe(-1n);
        expect(I64`-1 + 0`).toBe(-1n);

        expect(I64`${0} + ${-1}`).toBe(-1n);
        expect(I64`0 + -1`).toBe(-1n);
        
        expect(I64`${0} + ${153}`).toBe(153n);
        expect(I64`0 + 153`).toBe(153n);

        expect(I64`${153} + ${0}`).toBe(153n);
        expect(I64`153 + 0`).toBe(153n);
        
        expect(I64`${0} + ${-153}`).toBe(-153n);
        expect(I64`0 + -153`).toBe(-153n);
        
        expect(I64`${-153} + ${0}`).toBe(-153n);
        expect(I64`-153 + 0`).toBe(-153n);
        
        expect(I64`${0} + ${'984419032179098'}`).toBe(984419032179098n);
        expect(I64`0 + 984419032179098`).toBe(984419032179098n);
        
        expect(I64`${'98441903217909808'} + ${0}`).toBe(98441903217909808n);
        expect(I64`98441903217909808 + 0`).toBe(98441903217909808n);
        
        expect(I64`${0} + ${'-98441903217909'}`).toBe(-98441903217909n);
        expect(I64`0 + -98441903217909`).toBe(-98441903217909n);
        
        expect(I64`${'-9844190321790980'} + ${0}`).toBe(-9844190321790980n);
        expect(I64`-9844190321790980 + 0`).toBe(-9844190321790980n);

        // Subtraction by 0
        expect(I64`${1} - ${0}`).toBe(1n);
        expect(I64`1 - 0`).toBe(1n);
        
        expect(I64`${-1} - ${0}`).toBe(-1n);
        expect(I64`-1 - 0`).toBe(-1n);
        
        expect(I64`${153} - ${0}`).toBe(153n);
        expect(I64`153 - 0`).toBe(153n);
        
        expect(I64`${-153} - ${0}`).toBe(-153n);
        expect(I64`-153 - 0`).toBe(-153n);
        
        expect(I64`${'984419032179098'} - ${0}`).toBe(984419032179098n);
        expect(I64`984419032179098 - 0`).toBe(984419032179098n);
        
        expect(I64`${'-98441903217909'} - ${0}`).toBe(-98441903217909n);
        expect(I64`-98441903217909 - 0`).toBe(-98441903217909n);
      });

      //it('addition by inverse is 0, subtraction by self is 0', function () {
      //  expect(bigInt('5').subtract(bigInt('5'))).toBe(0);
      //  expect(bigInt('5').add(bigInt('-5'))).toBe(0);
      //  expect(bigInt('10000000000000000').subtract(bigInt('10000000000000000'))).toBe(0);
      //  expect(bigInt('10000000000000000').add(bigInt('-10000000000000000'))).toBe(0);
      //});

      // it('handles signs correctly', function () {
      //   expect(bigInt(1).add(1)).toBe(2);
      //   expect(bigInt(1).add(-5)).toBe(-4);
      //   expect(bigInt(-1).add(5)).toBe(4);
      //   expect(bigInt(-1).add(-5)).toBe(-6);
      //   expect(bigInt(5).add(1)).toBe(6);
      //   expect(bigInt(5).add(-1)).toBe(4);
      //   expect(bigInt(-5).add(1)).toBe(-4);
      //   expect(bigInt(-5).add(-1)).toBe(-6);

      //   expect(bigInt(1).minus(1)).toBe(0);
      //   expect(bigInt(1).minus(-5)).toBe(6);
      //   expect(bigInt(-1).minus(5)).toBe(-6);
      //   expect(bigInt(-1).minus(-5)).toBe(4);
      //   expect(bigInt(5).minus(1)).toBe(4);
      //   expect(bigInt(5).minus(-1)).toBe(6);
      //   expect(bigInt(-5).minus(1)).toBe(-6);
      //   expect(bigInt(-5).minus(-1)).toBe(-4);

      //   expect(bigInt('1234698764971301').add(5)).toBe('1234698764971306');
      //   expect(bigInt('1234698764971301').add(-5)).toBe('1234698764971296');
      //   expect(bigInt('-1234698764971301').add(5)).toBe('-1234698764971296');
      //   expect(bigInt('-1234698764971301').add(-5)).toBe('-1234698764971306');
      //   expect(bigInt(5).add('1234698764971301')).toBe('1234698764971306');
      //   expect(bigInt(5).add('-1234698764971301')).toBe('-1234698764971296');
      //   expect(bigInt(-5).add('1234698764971301')).toBe('1234698764971296');
      //   expect(bigInt(-5).add('-1234698764971301')).toBe('-1234698764971306');

      //   expect(bigInt('1234698764971301').minus(5)).toBe('1234698764971296');
      //   expect(bigInt('1234698764971301').minus(-5)).toBe('1234698764971306');
      //   expect(bigInt('-1234698764971301').minus(5)).toBe('-1234698764971306');
      //   expect(bigInt('-1234698764971301').minus(-5)).toBe('-1234698764971296');
      //   expect(bigInt(5).minus('1234698764971301')).toBe('-1234698764971296');
      //   expect(bigInt(5).minus('-1234698764971301')).toBe('1234698764971306');
      //   expect(bigInt(-5).minus('1234698764971301')).toBe('-1234698764971306');
      //   expect(bigInt(-5).minus('-1234698764971301')).toBe('1234698764971296');

      //   expect(bigInt('1234567890987654321').plus('9876543210123456789')).toBe('11111111101111111110');
      //   expect(bigInt('1234567890987654321').plus('-9876543210123456789')).toBe('-8641975319135802468');
      //   expect(bigInt('-1234567890987654321').plus('9876543210123456789')).toBe('8641975319135802468');
      //   expect(bigInt('-1234567890987654321').plus('-9876543210123456789')).toBe('-11111111101111111110');
      //   expect(bigInt('9876543210123456789').plus('1234567890987654321')).toBe('11111111101111111110');
      //   expect(bigInt('9876543210123456789').plus('-1234567890987654321')).toBe('8641975319135802468');
      //   expect(bigInt('-9876543210123456789').plus('1234567890987654321')).toBe('-8641975319135802468');
      //   expect(bigInt('-9876543210123456789').plus('-1234567890987654321')).toBe('-11111111101111111110');

      //   expect(bigInt('1234567890987654321').minus('9876543210123456789')).toBe('-8641975319135802468');
      //   expect(bigInt('1234567890987654321').minus('-9876543210123456789')).toBe('11111111101111111110');
      //   expect(bigInt('-1234567890987654321').minus('9876543210123456789')).toBe('-11111111101111111110');
      //   expect(bigInt('-1234567890987654321').minus('-9876543210123456789')).toBe('8641975319135802468');
      //   expect(bigInt('9876543210123456789').minus('1234567890987654321')).toBe('8641975319135802468');
      //   expect(bigInt('9876543210123456789').minus('-1234567890987654321')).toBe('11111111101111111110');
      //   expect(bigInt('-9876543210123456789').minus('1234567890987654321')).toBe('-11111111101111111110');
      //   expect(bigInt('-9876543210123456789').minus('-1234567890987654321')).toBe('-8641975319135802468');

      //   expect(bigInt('-9007199254740991').add(bigInt('-1')).toString() === '-9007199254740992').toBe(true);
      //   expect(bigInt('-5616421592529327000000000000000').minus('987682355516543').toString() === '-5616421592529327987682355516543').toBe(true);

      //   expect(bigInt('0').negate().add('10000000000000000')).toBe('10000000000000000');
      //   expect(bigInt('0').negate().add(bigInt('-1'))).toBe('-1');
    });

    it('shifting left and right work', function () {
      expect(I64`${-5n} >> ${2n}`).toBe(-2n);
      expect(I64`${5n} >> ${-2n}`).toBe(20n);
      expect(I64`${5n} << ${-2n}`).toBe(1n);
      expect(I64`${1024n} << ${10n}`).toBe(1048576n);
      expect(I64`${2596148429n} >> ${10n}`).toBe(2535301n);
      expect(I64`${858992n} >> ${-5n}`).toBe(27487744n);
      expect(I64`${3868567632n} << ${-5n}`).toBe(120892738n);
      expect(I64`${-1n} >> ${25n}`).toBe(-1n);
      expect(I64`${1n} << ${1n}`).toBe(2n);
    });

    it('and, or, xor, and not work', () => {
      expect(I64`${435783453n} & ${902345074n}`).toBe(435783453n & 902345074n);
      expect(I64`${435783453n} | ${902345074n}`).toBe(435783453n | 902345074n);
      expect(I64`${435783453n} ^ ${902345074n}`).toBe(435783453n ^ 902345074n);
      expect(I64`~${94981987261387596n}`).toBe(~94981987261387596n);
      expect(I64`${-693104770801506n} ^ ${25214903917n}`).toBe(-693104770801506n ^ 25214903917n);
      expect(I64`${-693104772318573n} & ${280655n}`).toBe(-693104772318573n & 280655n);
      expect(I64`${-65n} ^ ${-42n}`).toBe(-65n ^ -42n);
      expect(I64`${6n} & ${-3n}`).toBe(6n & -3n);
      expect(I64`~${0n}`).toBe(~0n);
      expect(I64`${13n} | ${-8n}`).toBe(13n | -8n);
      expect(I64`${12n} ^ ${-5n}`).toBe(12n ^ -5n);
    });
  });

  describe('Static methods', () => {
    describe('Bitwise operations', () => {
      it('shifting left and right work', () => {
        expect(I64.shr(-5n, 2n)).toBe(-2n);
        expect(I64.shr(5n, -2n)).toBe(20n);
        expect(I64.shl(5n, -2n)).toBe(1n);
        expect(I64.shl(1024n, 10n)).toBe(1048576n);
        expect(I64.shr(2596148429n, 10n)).toBe(2535301n);
        expect(I64.shr(858992n, -5n)).toBe(27487744n);
        expect(I64.shl(3868567632n, -5n)).toBe(120892738n);
        expect(I64.shr(-1n, 25n)).toBe(-1n);
        expect(I64.shl(1n, 1n)).toBe(2n);
      });

      it('and, or, xor, and not work', () => {
        expect(I64.and(435783453n, 902345074n)).toBe(298352912n);
        expect(I64.or(435783453n, 902345074n)).toBe(1039775615n);
        expect(I64.xor(435783453n, 902345074n)).toBe(741422703n);
        expect(I64.not(94981987261387596n)).toBe(-94981987261387597n);
        expect(I64.xor(-693104770801506n, 25214903917n)).toBe(-693129762781453n);
        expect(I64.and(-693104772318573n, 286710655n)).toBe(268491283n);
        expect(I64.xor(-65n, -42n)).toBe(105n);
        expect(I64.and(6n, -3n)).toBe(4n);
        expect(I64.not(0n)).toBe(-1n);
        expect(I64.or(13n, -8n)).toBe(-3n);
        expect(I64.xor(12n, -5n)).toBe(-9n);
      });
    });
  });
});
