import Taro, { Chain } from "@tarojs/taro";
import { authorize } from "@/api/common";
import { pageStore, getCoupons1 } from "@/api/store";

/**
 * 处理会话过期后，自动请求上次的数据
 * @param url
 * @param data
 * @param method
 * @param header
 */
async function authorizeAndRequest(
  url: string,
  data: object,
  method: Method,
  header: object
) {
  const code = await Taro.login();
  //重新授权
  const res = await authorize({ code: code.code });
  const { memberId, sessionId } = res.data.data;
  Taro.setStorageSync("code", code.code);
  // 保存 memberId
  Taro.setStorageSync("memberid", memberId);
  // 保存 storeId
  Taro.setStorageSync("sessionid", sessionId);
  return Taro.request({
    url,
    data,
    method,
    header
  });
}
// 是否需要 storeId
export const needStoreIdRequest = async function (chain: Chain) {
  const data = chain.requestParams.data;
  if (data && "storeId" in data) {
    let storeId = Taro.getStorageSync("storeId");
    if (storeId) {
      data.storeId = storeId;
      return chain.proceed(chain.requestParams).then((res: any) => {
        return res;
      });
    } else {
      const result = await pageStore();
      storeId = result.data.data[0].id;
      data.storeId = storeId;
      Taro.setStorageSync("storeId", storeId);
      return chain.proceed(chain.requestParams).then((res: any) => {
        return res;
      });
    }
  } else {
    return chain.proceed(chain.requestParams).then((res: any) => {
      return res;
    });
  }
};

// 响应拦截
export const response = async function (chain: Chain) {
  const sessionId = Taro.getStorageSync("sessionid");
  if (sessionId) {
    chain.requestParams.header.WPGSESSID = sessionId;
  }
  return chain.proceed(chain.requestParams).then((res: any) => {
    const { url, method, data, header } = chain.requestParams;
    if (res.data.code === 20000) {
      return Promise.resolve(res);
    } else if (res.data.code === 63021 || res.data.code === 63020 || res.data.code === 10000) {
      // 是否有memberId
      if (Taro.getStorageSync("memberid")) {
        return authorizeAndRequest(url, data, method as Method, header);
      } else {
        // 不能直接跳过去，不符合微信登录规范影响提审
        // Taro.navigateTo({ url: "/pages/authorize/index" });
        if (Taro.showModal) {
          Taro.showModal({
            title: '温馨提示',
            content: '您还没有登录，请先登录后才能体验完整功能',
            confirmText: '去登录',
            confirmColor: '#1bbc3d'
          }).then(res => {
            if (res.confirm) {
              Taro.redirectTo({ url: '/pages/authorize/index' })
            }
          })
        }
        return Promise.reject(res);
      }
    } else if (res.data.code === 40000) {
      if (res.data.data.orderToken) {
        return Promise.resolve(res);
      }
      // 显示报错的信息
      Taro.showToast({
        title: res.data.message,
        icon: "none"
      });
      return Promise.reject(res);
    } else if (res.data.code == 40001) {
      // 显示报错的信息
      Taro.showToast({
        title: res.data.message,
        icon: "none"
      })
      if (res.data.data.orderToken) {
        return Promise.resolve(res);
      }

    }
    else {
      if (res.data.message == '所选商品规格不全，请重新选择规格') {

      } else {
        // 显示报错的信息
        Taro.showToast({
          title: res.data.message,
          icon: "none"
        });
        return Promise.reject(res);
      }
    }
  });
};