export const checkBit = (a: number, n: number): boolean => {
  return (a & (1 << (n - 1))) !== 0;
};
