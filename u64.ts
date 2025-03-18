import { u64 } from "./types";

interface BigIntConstructor {
  asUintN(bits: 64, int: bigint | u64): u64;
}

declare var BigInt: BigIntConstructor;