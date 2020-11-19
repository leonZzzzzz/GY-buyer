import fetch from "@/utils/request";

//#region
/**
 * 领券列表
 * @param params
 */
export const getCoupons = (storeId) => {
  return fetch.get("api/v1.1/coupon-rule/page", { storeId });
};
// 平台优惠券
export const getCoupons1 = () => {
  return fetch.get("api/v1.1/coupon-rule/page");
};

//领券优惠券
export const receiveCoupon = (ruleId: string, providerId) => {
  return fetch.post("api/v1.1/coupon/insert", { ruleId, providerId });
};

// 我的优惠券
export const myCoupon = (params) => {
  return fetch.get("api/v1.1/coupon/page", params);
};
