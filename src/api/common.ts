import fetch from "@/utils/request";

// 获取手机号
export const getphone = params => {
  return fetch.post("api/v1/member/decryptPhone", params);
};
// 手机号注册
export const phonelogin = params => {
  return fetch.post("api/v1/member/loginForMobile", params);
};
// 信息认证
export const infoComfirm = params => {
  return fetch.post("api/v1/member/informationValidation", params);
};
// 验证信息是否认证
export const isvalid = () => {
  return fetch.get('api/v1/member/isValidMsg')
}
// 查看我的认证信息
export const memberInfo = () => {
  return fetch.get('api/v1/my/memberInfo')
}
// 获取手机号验证码
export const verilPhone = phone => {
  return fetch.post("api/v1/member/loginForMobile/smsCode", { phone });
};
//  订单统计
export const statusQuantity = () => {
  return fetch.get('api/mall/v1/guyuOrder/statusQuantity')
}
// 开具发票
export const applyInvoice = (params) => {
  return fetch.post('api/mall/v1/orderInvoice/applyInvoice', params)
}
// 获取开票信息
export const getInvoiceMsg = () => {
  return fetch.get('api/mall/v1/orderInvoice/getInvoiceMsg')
}



// 登录
export const usermember = (params) => {
  return fetch.post('api/v1/member/loginMember', params)
}
/**
 * 授权接口
 */
export const authorize = (params: any) => {
  return fetch.post('api/v1/member/authorize', params)
}
/**
 * 获取用户信息
 */
export const myuser = () => {
  return fetch.get('api/v1/my/info')
}

export const upload = (temFilePath: string, params: any) => {
  return fetch.upload("api/v1/attachments/images/tencent_cloud", temFilePath, params);
};

/**
 * 登陆接口
 */
export const login = params => {
  return fetch.post("login", params);
};

/**
 * 更新会员头像昵称
 */
export const updateMember = (params: any) => {
  return fetch.post('api/v1/member/updateMember', params)
}



// export const textget = () => {
//   return fetch.get('api/v1/member/testMemberId')
// }
