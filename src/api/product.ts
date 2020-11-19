import fetch from "@/utils/request";


/**
 * 获取商品详情
 * @param {Object} params
 */
export const getProduct = (params: any) => {
  return fetch.get('api/mall/v1/product/get', params)
}
// 收藏
export const onCellect = (params: any) => {
  return fetch.post('api/mall/v1/productCollection/insert', params)
}
// 取消收藏
export const cancelCellect = (productId) => {
  return fetch.post('api/mall/v1/productCollection/deleteByProduct', { productId })
}

// 加入购物车
export const addCart = (params: any) => {
  return fetch.post('api/mall/v1/cart/addToCart', params)
}
// 获取购物车的数量
export const cartNum = (params: any) => {
  return fetch.get('api/mall/v1/cart/get', params)
}
// 门店经营信息
export const storeEng = (storeId) => {
  return fetch.get('/api/mall/v1/guyuStoreRegistration/get', { storeId })
}
// 店铺轮播图
export const storeBanner = (sellerId) => {
  return fetch.get('api/store/v1/storeHome/getStoreCarousel', { sellerId })
}
// 店铺信息
export const storeInfo = (storeId) => {
  return fetch.get('api/mall/v1/storeRegistration/getBusiness', { storeId })
}


/**
 * 获取商品规格
 */
export const getProductStock = (params: any) => {
  return fetch.get(`api/mall/v1/guyuProduct/stock`, params)
}

/**
 * 购买商品
 * @param {object} params
 */
export const addProduct = (params: any) => {
  return fetch.post('api/mall/v1/cart/nowBuy', params)
}
// 扫码进入详情获取storeId
export const getStoreId = (id) => {
  return fetch.get('api/store/v1/storeHome/getStoreId', { id })
}
// 二级分类
export const getSecondClass = (storeId) => {
  return fetch.get(`api/store/v1/storeHome/getStoreCategory`, { storeId })
}
// 店铺分类
export const getStoreClass = (storeId) => {
  return fetch.get(`api/store/v1/storeHome/storeCategoryList`, { storeId })
}