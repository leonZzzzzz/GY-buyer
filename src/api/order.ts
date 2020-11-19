import fetch from "@/utils/request";

/**
 * 订单预览
 * orderItemIds 商品的id 多个用_连接
 */
export const getOrderPreview = (params) => {
  return fetch.get("api/mall/v1/guyuOrder/prepare", params);
};
// 订单生成
export const getOrderCreate = (params) => {
  return fetch.json("api/mall/v1/guyuOrder/generate", params);
};
// 订单预支付
export const advancePay = (params) => {
  return fetch.post("api/mall/v1/guyuOrder/prepay", params);
};
// 平台配送服务费
export const transportamount = (params) => {
  return fetch.get("api/mall/v1/guyuOrder/getTransportAmount", params);
};
// 订单去支付
export const orderListPay = (orderId) => {
  return fetch.get("api/mall/v1/guyuOrder/checkout", { orderId });
};
// 订单评价
export const orderGrade = (params) => {
  return fetch.json("api/mall/v1/guyuOrderEvaluate/evaluate", params);
};
// 订单配送信息
export const ByOrderId = (orderId) => {
  return fetch.get("api/mall/v1/guyuOrder/getOrderDriver", { orderId });
};
// 订单商品信息
export const productInfo = (orderId) => {
  return fetch.get("api/mall/v1/guyuOrder/listOrderItem", { orderId });
};
// 订单是否已支付
export const queryPayOrder = (id) => {
  return fetch.get("api/mall/v1/order/queryPayOrder", { id });
};


// 余额支付输入密码
export const remaining = (password) => {
  return fetch.post("api/v1/payPassword/getWalletToken", { password });
};










/**
 * 订单购买
 */
export const postOrder = (params: any) => {
  return fetch.post("api/mall/v1/orderPay/prepay", params);
};
/**
 * 订单重新购买
 */
export const postResOrder = (params: any) => {
  return fetch.post("api/mall/v1/orderPay/retryPrepay", params);
};
// 微信支付
export const wechatPay = (token) => {
  return fetch.get("api/v1/wechat/pay_request_parameter", { token });
};
/**
 * 订单列表
 */
export const pageOrder = (params: any) => {
  return fetch.get("api/mall/v1/guyuOrder/page", params);
};
/**
 * 订单详情
 */
export const getOrder = (params: any) => {
  return fetch.get("api/mall/v1/guyuOrder/detail", params);
};
/**
 * 订单取消
 */
export const cancelOrder = (params: any) => {
  return fetch.post("api/mall/v1/order/cancel", params);
};
/**
 * 取消账期订单
 */
export const cancelAccounOrder = (params: any) => {
  return fetch.post("api/mall/v1/guyuOrder/cancel", params);
};
/**
 * 订单完成
 */
export const finishOrder = (id) => {
  return fetch.post("api/mall/v1/order/finish", { id });
};
/**
 * 获取订单超时时间
 */
export const shopOrderCancelTime = () => {
  return fetch.get("api/v1/config/shopOrderCancelTime");
};
/**
 * 订单状态统计
 */
export const getOrderStatus = () => {
  return fetch.get("api/mall/v1/order/getStatusQuantity");
};

// 确认收货
export const confirmOrder = (id) => {
  return fetch.post("api/mall/v1/order/receive", { id });
};
