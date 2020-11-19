export const toPriceYuan = (value: number, cent: number = 2): string => {
  let price = value / 100;
  return price.toFixed(cent);
};
// 数组去重
export const unique = (arr) => {
  return Array.from(new Set(arr))
}
