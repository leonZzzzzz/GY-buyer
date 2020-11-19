import fetch from "@/utils/request";
/**
 * 添加到收藏
 */
export const addCollection = (params: any) => {
  return fetch.post("api/mall/v1/productCollection/insert", params);
};
/**
 * 删除收藏
 */
export const delCollection = (productId: string) => {
  return fetch.post("api/mall/v1/productCollection/deleteByProduct", {
    productId
  });
};
/**
 * 获取收藏列表
 */
export const pageCollenction = (params: any) => {
  return fetch.get("api/mall/v1/productCollection/page", params);
};
