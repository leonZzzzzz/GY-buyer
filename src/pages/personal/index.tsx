import Taro, { Component, Config } from "@tarojs/taro";
import { View, Text, Image, Form, Button, Block, OpenData } from "@tarojs/components";
import "./index.scss";
import { usermember, myuser, authorize, statusQuantity } from "@/api/common"
import { cartNum } from "@/api/index"
import { AtBadge } from 'taro-ui'

export default class Index extends Component {
  state = {
    ismodel: false,
    orderCount: [
      {
        id: 0,
        title: "待支付",
        icon: "qc-icon-qianbao",
        count: 0,
        src: '../../images/myicon/guyu-me-1.png',
        url: "/pagesMall/order/list/index?type=0"

      },
      {
        id: 1,
        title: "待发货",
        icon: "qc-icon-daifahuo",
        count: 0,
        src: '../../images/myicon/guyu-me-2.png',
        url: "/pagesMall/order/list/index?type=1"
      },
      {
        id: 2,
        title: "配送中",
        icon: "qc-icon-daishouhuo",
        count: 0,
        src: '../../images/myicon/guyu-me-3.png',
        url: "/pagesMall/order/list/index?type=2"
      },
      {
        id: 10,
        title: "评分",
        icon: "qc-icon-yiwancheng",
        count: 0,
        src: '../../images/myicon/guyu-me-5.png',
        url: "/pagesMall/order/list/index?type=10"
      },
      {
        id: 4,
        title: "售后",
        icon: "qc-icon-shouhou",
        count: 0,
        src: '../../images/myicon/guyu-me-4.png',
        url: "/pagesMall/after-sale/after-sale"
      }
    ],
    serveGroup: [
      {
        id: 1,
        title: "优惠券",
        url: "../../pagesCommon/coupons/mycard/mycard",
        icon: "../../images/myicon/gy-icon_20.png",
        num: '0'
      },
      {
        id: 2,
        title: "我的收藏",
        url: "../../pagesCommon/collect/collect",
        icon: "../../images/myicon/guyu-me-6.png"
      },
      {
        id: 8,
        title: "我的欠账",
        url: "/pagesCommon/outstanding/outstanding",
        icon: "../../images/myicon/repay.png"
      },
      {
        id: 3,
        title: "我的地址",
        url: "/pagesCommon/address/list/index",
        icon: "../../images/myicon/guyu-me-7.png"
      },
      {
        id: 4,
        title: "在线客服",
        url: "",
        icon: "../../images/myicon/guyu-me-8.png"
      },
      {
        id: 5,
        title: "关于我们",
        url: "../../pagesCommon/aboutus/aboutus",
        icon: "../../images/myicon/guyu-me-9.png"
      },
      {
        id: 6,
        title: "设置",
        url: "../../pagesCommon/setting/setting",
        icon: "../../images/myicon/shezhi.png"
      },
      {
        id: 7,
        title: "推荐新人获得平台优惠券",
        url: "../../pagesCommon/referrer/referrer",
        icon: "../../images/myicon/guyu-me-10.png"
      }
    ],
    phone: '',
    code: '',
    amount: '', couponSize: '0',
    rechargeDiscount: '',
    isLogin: false
  }
  config: Config = {
    navigationBarTitleText: "个人中心"
  };
  // 获取购物车数量
  getCartNum = async () => {
    const res = await cartNum()
    if (res.data.code == 20000) {
      let text = res.data.data.qty
      text = JSON.stringify(text)
      if (text > 0) {
        Taro.setTabBarBadge({
          index: 3,
          text: text
        })
      }
    }
  }
  componentDidShow() {
    // 进入页面就调用
    const phone = Taro.getStorageSync('phone')
    // let code = Taro.getStorageSync('code')
    let code = ''
    let params = {}
    // if (code) {
    //   code = code
    //   params = { code: code }
    //   this.getAuthorize(params, true)
    //   this.setState({ code: code })
    // } else {
    Taro.login().then(res => {
      code = res.code
      console.log(code)
      params = { code: code }
      this.getAuthorize(params, true)
      Taro.setStorageSync('code', res.code)
      this.setState({ code: code })
    })
    // }

    const { orderCount } = this.state
    orderCount.map(item => {
      item.count = 0
    })
    this.setState({ phone: phone, code, orderCount })
    if (Taro.getStorageSync("memberid")) {
      this.ordertotal(orderCount)
      this.getmymation()
      this.getCartNum()
    }
  }

  // 静默授权获取sessionid和openid
  getAuthorize = async (params: any, isGetUser?: Boolean) => {
    const res = await authorize(params)
    console.log(res)
    if (res.data.code == 20000) {
      Taro.setStorageSync('sessionid', res.data.data.sessionId)
      Taro.setStorageSync('openid', res.data.data.openId)
      Taro.setStorageSync('memberid', res.data.data.memberId)
      // var par = {
      //   code: params.code,
      //   encryptedData: this.state.encryptedData,
      //   iv: this.state.iv
      // }
      // this.decyPhone(par)
      // if (isGetUser) this.isuserinfo()
    }
  }
  // 判断是否授权头像昵称
  // isuserinfo = async () => {
  //   const res = await myuser()
  //   if (res.data.data.isLogin) {
  //     this.setState({ ismodel: true })
  //   }
  // }
  // 获取用户昵称头像
  getUserInfo(e) {
    const code = Taro.getStorageSync('code')
    const { encryptedData, iv, userInfo } = e.target
    const { nickName, gender, avatarUrl } = userInfo
    const params = { encryptedData, iv, appellation: nickName, sex: gender, headImage: avatarUrl, code: code }
    this.loginuser(params)
  }
  // 将用户信息传给后台并获取登录信息
  loginuser = async (params) => {
    const res = await usermember(params)
    if (res.data.code == 20000) {
      Taro.setStorageSync('memberId', res.data.data.memberId)
      Taro.setStorageSync('openId', res.data.data.openId)
      this.setState({ ismodel: false })
      Taro.navigateTo({ url: "/pages/authorize/index" });
    }
  }
  componentDidHide() {
    // 退出页面调用
  }

  // 订单统计
  async ordertotal(orderCount) {
    await statusQuantity().then(res => {
      // let { orderCount } = this.state
      let { afterSaleQuantity, finishQuantity, undeliveredQuantity, unpaidQuantity, unreceivedQuantity } = res.data.data
      if (Number(afterSaleQuantity) > 0) {
        orderCount[4].count = afterSaleQuantity
      }
      if (Number(finishQuantity) > 0) {
        orderCount[3].count = finishQuantity
      }
      if (Number(undeliveredQuantity) > 0) {
        orderCount[1].count = undeliveredQuantity
      }
      if (Number(unpaidQuantity) > 0) {
        orderCount[0].count = unpaidQuantity
      }
      if (Number(unreceivedQuantity) > 0) {
        orderCount[2].count = unreceivedQuantity
      }
    })
  }
  // 获取余额和优惠券张数
  getmymation = async () => {
    const res = await myuser()
    if (res.data.code == 20000) {
      let { amount, couponSize, isLogin, member, rechargeDiscount } = res.data.data
      amount = parseFloat(amount / 100).toFixed(2)
      rechargeDiscount = parseInt(rechargeDiscount * 100)
      let phone = this.state.phone
      if (member && member.mobilePhoneNumber) {
        phone = member.mobilePhoneNumber
        Taro.setStorageSync('phone', phone)
      }
      this.setState({ amount, couponSize, rechargeDiscount, isLogin, userInfo: member, phone: phone })
    }
  }






  render() {
    const { amount, couponSize, rechargeDiscount } = this.state
    return (
      <Block>
        <View className='personal'>
          <View className='personal-content'>
            <View className='personal-content__user'>
              {this.state.phone ? (
                <View className='personal-content__user-info' onClick={() => { Taro.navigateTo({ url: '../../pagesMall/memberInfo/memberInfo' }) }}>
                  <OpenData className='personal-content__user-img' type='userAvatarUrl'></OpenData>
                  {/* <Image src={user.headImage} className="personal-content__user-img"></Image> */}
                  <View className='personal-content__user-name'>
                    <OpenData className='name' type='userNickName' lang='zh_CN'></OpenData>
                    <Text>{this.state.phone}</Text>
                  </View>
                </View>
              ) : (
                  <View className='personal-content__user-info'>
                    <View className='personal-content__user-img'></View>
                    {/* <View className='personal-content__user-name'>立即登录</View> */}
                    <Button className='login' lang="zh_CN" open-type="getUserInfo" onGetUserInfo={this.getUserInfo}>立即登录</Button>
                  </View>
                )}
              {this.state.phone && (
                <View className='personal-content__user-detail' onClick={() => { Taro.navigateTo({ url: '../../pagesBalance/account/account?amount=' + amount + '&discount=' + rechargeDiscount }); }}>
                  <Text className='vou'>充值{rechargeDiscount}折</Text>
                  <Text className='balance'>余额：{amount}元</Text>
                </View>
              )}
            </View>
          </View>
          <View className='my-order'>
            <View className='myorder-t' onClick={() => { Taro.navigateTo({ url: '../../pagesMall/order/list/index?type=-1' }) }}>
              <View className='myorder-t-y'>我的订单</View>
              <View className='myorder-t-u'>全部订单 <Text className='qcfont qc-icon-chevron-right' /></View>
            </View>
            <View className='group'>
              {this.state.orderCount.map((item: any) => {
                return (
                  <View className='g-item' key={item.id} onClick={() => { Taro.navigateTo({ url: item.url }); }}>
                    {Number(item.count) > 0 && <View className='count'><AtBadge value={item.count} /></View>}
                    {/* <View className={`qcfont ${item.icon}`} /> */}
                    <Image className='iconimg' src={item.src}></Image>
                    <View className='title'>{item.title}</View>
                  </View>
                );
              })}
            </View>
          </View>

          <View className='my-detail-msg'>
            <View className='my-detail-gro'>
              {this.state.serveGroup.map((item: any) => {
                return (
                  <Block key={item.id}>
                    {item.id != 4 ? (
                      <View
                        className='my-gro-img'
                        key={item.id}
                        onClick={() => {
                          Taro.navigateTo({
                            url: item.url
                          });
                        }}
                      >
                        <View className='row'>
                          <Image src={item.icon}></Image>
                          <View>{item.title}</View>
                        </View>
                        {item.id == 1 && (
                          <View className='cou-num'>({couponSize}张)</View>
                        )}
                        <Text className='image-one qc-menu-card__icon qcfont qc-icon-chevron-right' />
                      </View>
                    ) : (
                        // <Button className="invite-button" open-type="contact" session-from="weapp">
                        //   <View className='my-detail-msg '>
                        //     <View className='my-detail-gro'>
                        //       <Image className='my-gro-img' src='../../image/tab/store-service.png'></Image>
                        //       <Text className='my-gro-text'>联系客服</Text>
                        //     </View>
                        //     <View className='my-gro-go'>
                        //       <Image class='my-go-img' src='../../image/next-page.png'></Image>
                        //     </View>
                        //   </View>
                        // </Button>
                        <Button open-type='contact' className='invite-button kefu'>
                          <View className='my-gro-img1'>
                            <View className='row'>
                              <Image src={item.icon}></Image>
                              <View>{item.title}</View>
                            </View>
                            <Text className='image-one qc-menu-card__icon qcfont qc-icon-chevron-right' />
                          </View>
                        </Button>
                      )}

                  </Block>

                );
              })}
            </View>
          </View>
        </View>
      </Block>
    );
  }
}







