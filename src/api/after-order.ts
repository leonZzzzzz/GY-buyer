import fetch from "@/utils/request";

/**
 * 售后订单列表
 */
export const pageAfterSale = (params: any) => {
  return fetch.get("api/mall/v1/guyuOrderAfterSales/page", params);
};
/**
 * 售后订单详情
 */
export const getAfterSale = (params: any) => {
  return fetch.get("api/mall/v1/after-sale/get", params);
};
// 获取决绝售后原因
export const refuseReason = (params: any) => {
  return fetch.get("api/mall/v1/guyuOrderAfterSales/refundReason", params);
};

/**
 * 获取退货原因
 */
// export const returnGoodsReasonType = (orderId) => {
//   return fetch.get("api/mall/v1/guyuOrderAfterSales/refundReason", { orderId });
// };
/**
 * 申请退款
 */
export const refundApply = (params?: any) => {
  return fetch.json("api/mall/v1/after-sale/refund/apply", params);
};
/**
 * 获取退款原因
 */
export const refundReasonType = (params?: any) => {
  return fetch.get("api/mall/v1/guyuOrderAfterSales/refundReason", params);
};
export const getStoreAddress = (params: any) => {
  return fetch.get("api/mall/v1/store/get", params);
};
