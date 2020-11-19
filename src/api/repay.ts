import fetch from "@/utils/request";

// 欠账列表
export const outlist = () => {
  return fetch.get("api/v1/my/paymentDaysRecord");
};
// 账期订单
export const paymentorder = (params) => {
  return fetch.get("api/v1/my/paymentDaysPage", params);
};
// 还账记录
export const paybill = (params) => {
  return fetch.get("api/v1/my/repaymentPage", params);
};
// 还账
export const deductMoney = (params) => {
  return fetch.post("api/v1/my/deductMoney", params);
};
// 获取余额
export const getbalance = () => {
  return fetch.get("api/v1/my/walletAmount");
};
