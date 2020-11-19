import "@tarojs/async-await";
import Taro, { Component, Config } from "@tarojs/taro";
import Index from "./pages/index";
import { response, needStoreIdRequest } from "./utils/interceptors";
import checkAppUpdate from "./utils/check-app-update";
import "./app.scss";
import './styles/custom-variables.scss'
import { authorize, isBindPhone, cartNum } from "@/api/index"
import { myuser, isvalid } from "@/api/common"
import { getCoupons1 } from "@/api/store"

// Taro.addInterceptor(needStoreIdRequest);
Taro.addInterceptor(response);

// 如果需要在 h5 环境中开启 React Devtools
// 取消以下注释：
// if (process.env.NODE_ENV !== 'production' && process.env.TARO_ENV === 'h5')  {
//   require('nerv-devtools')
// }
class App extends Component {
  /**
   * 指定config的类型声明为: Taro.Config
   * 由于 typescript 对于 object 类型推导只能推出 Key 的基本类型
   * 对于像 navigationBarTextStyle: 'black' 这样的推导出的类型是 string
   * 提示和声明 navigationBarTextStyle: 'black' | 'white' 类型冲突, 需要显示声明类型
   */
  config: Config = {
    pages: [
      "pages/home/index",
      "pages/category/index",
      "pages/cart/index",
      "pages/personal/index",
      "pages/authorize/index",
      "pages/shop/shopping"

    ],
    subPackages: [
      {
        root: "pagesCommon",
        pages: [
          "address/list/index",
          "address/edit/index",
          "coupons/coupon/coupon",
          "coupons/mycard/mycard",
          "location-city/city",
          "search/search-list",
          "goods/goods-detail",
          "wholesaler/wholesaler",
          "lesdetail/lesdetail",
          "collect/collect",
          "aboutus/aboutus",
          "setting/setting",
          "setpsd/setpsd",
          "phone-login/phone-login",
          "auth-msg/auth-msg",
          "referrer/referrer",
          "protocol/protocol",
          "outstanding/outstanding",
          "bill-list/bill-list",
          "repayment/repayment",
          "payback/payback",
        ]
      },
      {
        root: "pagesBalance",
        pages: [
          "account/account",
          "recharge/recharge",
          "cash-desk/cash-desk",
          "pay-success/pay-success",
          "deposit/deposit",
          "bal-list/bal-list",
          "bankinfo/bankinfo"

        ]
      },
      {
        root: "pagesMall",
        pages: [
          "product-detail/index",
          "product-confirm/index",
          "order/list/index",
          "order/detail/index",
          "payment/payment",
          "pay-for/pay-for",
          "order-detail/order-detail",
          "grade/grade",
          "apply-draw/apply-draw",
          "after-sale/after-sale",
          "purchase-detail/purchase-detail",
          "stallcoupon/stallcoupon",
          "platcoupon/platcoupon",
          "freight-coupon/index",
          "memberInfo/memberInfo",
          "information/information",
          "invoice/invoice"
        ]
      }
    ],
    window: {
      backgroundColor: "#f3f3f3",
      backgroundTextStyle: "light",
      navigationBarBackgroundColor: "#fff",
      navigationBarTitleText: "微商城",
      navigationBarTextStyle: "black"
    },
    tabBar: {
      selectedColor: "#1BBC3D",
      color: "#000",
      list: [
        {
          text: "首页",
          pagePath: "pages/home/index",
          iconPath: "./images/tabbar/gy-icon_80.png",
          selectedIconPath: "./images/tabbar/gy-icon_11.png"
        },
        {
          text: "供应商",
          pagePath: "pages/shop/shopping",
          iconPath: "./images/tabbar/gy-icon_88.png",
          selectedIconPath: "./images/tabbar/gy-icon_62.png"
        },
        {
          text: "分类",
          pagePath: "pages/category/index",
          iconPath: "./images/tabbar/gy-icon_65-2.png",
          selectedIconPath: "./images/tabbar/gy-icon_65.png"
        },
        {
          text: "购物车",
          pagePath: "pages/cart/index",
          iconPath: "./images/tabbar/gy-icon_90.png",
          selectedIconPath: "./images/tabbar/gy-icon_69.png"
        },
        {
          text: "我的",
          pagePath: "pages/personal/index",
          iconPath: "./images/tabbar/gy-icon_89.png",
          selectedIconPath: "./images/tabbar/gy-icon_67.png"
        }
      ]
    },
    "permission": {
      "scope.userLocation": {
        "desc": "你的位置信息将用于小程序位置接口的效果展示"
      }
    }
  };

  /*   constructor() {
      super();
      this.state = {
        code: ''
      }
    } */
  globalData = {
    firstId: '',
    toView: '',
    type: ''
  }

  componentWillMount() {
    Taro.clearStorageSync();
    this.getcode()
    // this.checkcomponent()
    Taro.removeStorageSync('couponInfo')
    Taro.removeStorageSync('platCouponInfo')
    Taro.removeStorageSync('freightCoupon')
    Taro.removeStorageSync('address')
    Taro.removeStorageSync('payamount')
    Taro.removeStorageSync('deamount')
    Taro.setStorageSync('imgHostItem', 'https://guyu-1300342109.cos.ap-guangzhou.myqcloud.com/public/item/')
  }

  componentDidMount() {
    checkAppUpdate();
    // this.getcode()
    // Taro.getSetting({
    //   success: (res) => {
    //     console.log(res)
    //   }
    // })
  }
  // 设置小程序默认字体大小


  // 获取code后调用接口获取sessionkey和openid
  getcode() {
    Taro.login().then(res => {
      let params = { code: res.code }
      Taro.setStorageSync('code', res.code)
      this.getsession(params)
    })
  }
  getsession = async (params) => {
    const data = await authorize(params)
    if (data.data.code == 20000) {
      Taro.setStorageSync('sessionid', data.data.data.sessionId)
      Taro.setStorageSync('openid', data.data.data.openId)
      Taro.setStorageSync('memberid', data.data.data.memberId)
      this.getbindPhone()
      this.getCoupons1()
    }
  }
  // 优惠券
  // 获取优惠券
  getCoupons1 = async () => {
    const res = await getCoupons1()
    if (res.data.code == 20000) {
      const couponList = res.data.data.list
      couponList.map(item => {
        let ruleStartTime = item.ruleStartTime
        let ruleEndTime = item.ruleEndTime
        ruleStartTime = ruleStartTime.split(' ')
        ruleEndTime = ruleEndTime.split(' ')
        item.ruleStartTime = ruleStartTime[0]
        item.ruleEndTime = ruleEndTime[0]
        if (item.couponType == 2) {
          item.couponAmount = parseFloat(item.couponAmount / 10)
        } else {
          item.couponAmount = parseFloat(item.couponAmount / 100)
        }
      })
      // console.log(couponList)
      // this.setState({ couponList })
      Taro.setStorageSync('couponList', couponList)
    }
  }
  // 是否绑定手机号
  getbindPhone = async () => {
    const res = await isBindPhone()
    if (res.data.data) {
      // 去获取手机号

    } else {
      // 已经绑定手机号可调我的信息获取手机号
      this.getUserInfo()
    }
  }
  // 获取我的信息
  getUserInfo = async () => {
    const res = await myuser();
    if (res.data.code == 20000) {
      const phone = res.data.data.member.mobilePhoneNumber
      Taro.setStorageSync('phone', phone)
      this.getIsValid()
    }
  }
  // 验证是否认证信息
  getIsValid = async () => {
    const res = await isvalid()
    if (res.data.code == 20000) {
      if (!res.data.data) {
        Taro.showModal({
          content: '您的信息还未认证，请先去认证',
          showCancel: false,
          success: (res => {
            if (res.confirm) {
              Taro.navigateTo({
                url: '/pagesCommon/auth-msg/auth-msg'
              })
            }
          })
        })

      }
    }
  }


  // 是否授权
  checkcomponent() {
    Taro.getSetting()
      .then(res => {
        if (res.authSetting["scope.userInfo"]) {
          return true;
        } else {
          throw new Error('没有授权')
        }
      })
      .then(res => {
        console.log(res)
        return Taro.getUserInfo();
      })
      .then(res => {
        Taro.setStorage({
          key: 'userInfo',
          data: res.userInfo
        })
      })
      .catch(err => {
      })
  }


  // 在 App 类中的 render() 函数没有实际作用
  // 请勿修改此函数
  render() {
    return <Index />;
  }
}

Taro.render(<App />, document.getElementById("app"));
