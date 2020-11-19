import fetch from "@/utils/request";

/**
 * 获取购物车
 */
export const pageCart = () => {
  return fetch.get("api/mall/v1/guyuCart/listOrderItem");
};
/**
 * 添加到购物车
 * @param {object} model
 */
export const addCart = (model: any) => {
  return fetch.post(`api/mall/v1/cart/addToCart`, model);
};
/**
 * 获取购物车数量
 */
export const getCartNum = () => {
  return fetch.get("api/mall/v1/cart/get");
};
/**
 * 添加购物车数量
 */
export const addCartNum = (params) => {
  return fetch.post("api/mall/v1/cart/add", params);
};
/**
 * 减少购物车数量
 */
export const deducteCartNumber = (params) => {
  return fetch.post("api/mall/v1/cart/deducte", params);
};
/**
 * 删除购物车
 */
export const deleteCart = (id: string) => {
  return fetch.post("api/mall/v1/cart/delete", {
    id
  });
};
