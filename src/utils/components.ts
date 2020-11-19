import Taro, { Component } from "@tarojs/taro";
import { baseUrl } from "@/config";
// import wxSdk from './jssdk_config';
// import api from '@/api/index'

export default class BaseComponent extends Component {
  imgHost: string;
  $env: Taro.ENV_TYPE;
  // $api: any;

  constructor() {
    super(...arguments);
    this.imgHost = baseUrl;
    this.$env = Taro.getEnv();
    // this.$api = api
  }

  // 返回顶部
  // backTop() {
  //   Taro.pageScrollTo({
  //     scrollTop: 0,
  //     duration: 0
  //   })
  // }

  // // 设置title
  // setNavTitle(title: string) {
  //   Taro.setNavigationBarTitle({
  //     title,
  //   });
  // }

  // // 设置加载动画
  // setPageLoading(status: boolean) {
  //   this.setState({
  //     pageLoading: status,
  //   });
  // }

  // // //是否具有下一页数据
  // isHasNextPage(data: any, length?: number) {
  //   if (length) {
  //     const { pageSize, pageNum } = data;
  //     return pageSize * pageNum === length;
  //   } else {
  //     const { total, pageSize, pageNum } = data;
  //     const allSize = Math.ceil(total / pageSize);
  //     return pageNum < allSize;
  //   }
  // }

  // // 获取本地保存的系统信息
  // getStorageSystemInfo() {
  //   let result = Taro.getStorageSync('systemInfo');
  //   if (result) {
  //     return JSON.parse(result);
  //   } else {
  //     return null;
  //   }
  // }

  // showToast(title = '', icon = 'none', duration = 2000) {
  //   return new Promise((resolve) => {
  //     Taro.showToast({
  //       title,
  //       icon,
  //       duration,
  //     });
  //     setTimeout(() => {
  //       resolve();
  //     }, duration);
  //   });
  // }

  // showLoading(state: boolean, title: string = '正在加载中', mask: boolean = true) {
  //   if (state) {
  //     Taro.showLoading({
  //       title: title,
  //       mask: mask,
  //     })
  //   } else {
  //     Taro.hideLoading()
  //   }
  // }

  // navigateBack(e?: { stopPropagation: () => void; }) {
  //   e && e.stopPropagation();
  //   Taro.navigateBack();
  // }

  // navigateTo(url: any, e?: { stopPropagation: () => void; } | undefined) {
  //   e && e.stopPropagation();
  //   Taro.navigateTo({ url }).catch(err => {
  //     Taro.showToast({
  //       title: '跳转失败',
  //       icon: 'none',
  //     });
  //     console.error('err :', err);
  //   });
  // }

  // redirectTo(url: any, e?: { stopPropagation: () => void; }) {
  //   e && e.stopPropagation();
  //   Taro.redirectTo({ url }).catch(err => {
  //     Taro.showToast({
  //       title: '跳转失败',
  //       icon: 'none',
  //     });
  //     console.error('err :', err);
  //   });
  // }

  // switchTab(url: any, e?: { stopPropagation: () => void; }) {
  //   e && e.stopPropagation();
  //   if (this.$env === Taro.ENV_TYPE.WEAPP) {
  //     Taro.switchTab({ url });
  //   } else {
  //     this.navigateTo(url);
  //   }
  // }

  // setDialogVisible(value: boolean, state: string): void {
  //   this.setState({
  //     [state]: value
  //   })
  // }
}

// export default BaseComponent
