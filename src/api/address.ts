import fetch from "@/utils/request";
/**
 * 获取地址列表
 */
export const listAddress = () => {
  return fetch.get("api/mall/v1/address/list");
};

/**
 * 获取单个地址
 */
export const getAddress = (params: any) => {
  return fetch.get("api/mall/v1/address/get", params);
};

/**
 * 添加地址
 */
export const addAddress = (params: any) => {
  return fetch.json("api/mall/v1/address/add", params);
};
/**
 * 更新地址
 */
export const updateAddress = (params: any) => {
  return fetch.json("api/mall/v1/address/update", params);
};


/**
 * 删除地址
 */
export const deleteAddress = (params: any) => {
  return fetch.post("api/mall/v1/address/delete", params);
};
/**
 * 默认地址
 */
export const updateDefaultAddress = (params: any) => {
  return fetch.post("api/mall/v1/address/updateDefault", params);
};
