import fetch from '@/utils/request'
/**
 * 获取父分类
 */
export function getCategorys(params) {
  return fetch.get('api/v1/category/listByTypeAndParentId', params)
}

// 获取分类商品
export function getCateProduct(params) {
  return fetch.get('api/mall/v1/product/page', params)
}

// 获取搜索的店铺信息
export function getStore(params) {
  return fetch.get('api/mall/v1/guyuStoreProduct/page', params)
}