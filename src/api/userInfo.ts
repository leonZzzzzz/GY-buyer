import fetch from "@/utils/request";

/**
 * 关于我们
 */
export const aboutus = () => {
    return fetch.get("api/v1/staticConfig/about_us");
};

// 我的收藏
export const mycollect = (params) => {
    return fetch.get("api/mall/v1/productCollection/page", params);
};
// 获取验证码
export const authCode = (phone) => {
    return fetch.post("api/v1/payPassword/smsCode", { phone });
};
// 设置支付密码
export const setpassward = (params) => {
    return fetch.json("api/v1/payPassword/setPassword", params);
};
// 推荐新人
export const recommendUser = (type) => {
    return fetch.get("api/v1/staticConfig/recommendUser", { type });
};
// 退出登录
export const loginout = () => {
    return fetch.get("api/v1/member/logout");
};

// 余额明细查询
export const balaccount = (params) => {
    return fetch.get("api/v1/my/listWalletFlow", params);
};
// 提现信息
export const drawMsg = () => {
    return fetch.get("api/v1/my/withdrawMsg");
};
// 新增银行卡信息
export const backcardInfo = (params) => {
    return fetch.post("api/v1/memberBank/insert", params);
};
// 获取银行卡信息
export const getBack = (id) => {
    return fetch.get("api/v1/memberBank/get", { id });
};
// 修改银行卡信息
export const updataCard = (params) => {
    return fetch.post("api/v1/memberBank/update", params);
};
// 我的信息
export const myInfo = () => {
    return fetch.get("api/v1/my/memberInfo");
};
// 充值
export const discount = (amount) => {
    return fetch.post("api/v1/my/rechargeDiscount", { amount });
};
// 提现
export const withdraw = (params) => {
    return fetch.post("api/v1/my/withdraw", params);
};

// 相关问题
export const related = (type) => {
    return fetch.get("api/v1/staticConfig/agreement", { type });
};

// 客服微信二维码
export const wechatservice = (storeId) => {
    return fetch.get("api/mall/v1/storeRegistration/get", { storeId });
};
/**
 * 推荐新人领券海报
*/
 export const wechatCode = () => {
  return fetch.get("api/v1/my/getSmallProgramCode");
};
/**
 * 小程序码
*/
export const wechatCodeUrl = (params) => {
  return fetch.get("api/v1/my/getSmallProgramCodeUrl", params);
};


// 删除收藏
// 获取验证码
export const deleteCollect = (id) => {
    return fetch.post("api/mall/v1/productCollection/delete", { id });
};