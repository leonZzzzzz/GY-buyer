import fetch from "@/utils/request";




// 授权
export const testLogin = (params) => {
    return fetch.post("api/v1/member/login/mobile", params)
}
// 授权
export const authorize = (params) => {
    return fetch.post("api/v1/member/authorize", params)
}
// 是否绑定手机号
export const isBindPhone = () => {
    return fetch.get("api/v1/member/isBindMobile");
};
/**
 * 获取首页轮播图
 */
export const getBanner = () => {
    return fetch.get("api/member/v1/homePage/getHomeCarousel");
};

// 首页公告列表
export const getnotice = () => {
    return fetch.get("api/member/v1/homePage/getHomeNotice");
}

// 获取首页商品专区列表
export const getcommon = () => {
    return fetch.get("api/member/v1/homePage/getHomeSpecialProduct")
}

export const signIndex = (params) => {
    return fetch.post("api/sign/index/sid/11001", params);
};
// 获取分类 
export const getMethod = (params) => {
    return fetch.get('api/v1/category/listByTypeAndParentId', params)
}

// 获取城市
export const allCity = () => {
    return fetch.get("api/v1/store/storeHome/getStoreCity")
}
// 获取购物车数量
export const cartNum = () => {
    return fetch.get("api/mall/v1/cart/get")
}
