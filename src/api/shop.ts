import fetch from "@/utils/request";


// 获取头部分类
export const getClassTitle = (params: any) => {
    return fetch.get('api/v1/category/listByType', params)
}
/**
 * 获取门店列表
 * @param {Object} params
 */
export const getstoreProduct = (params: any) => {
    return fetch.get('api/mall/v1/guyuStoreProduct/page', params)
}