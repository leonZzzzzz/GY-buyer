import Taro, { Component, Config } from "@tarojs/taro";
import { View, Image, Text, Block, RadioGroup } from "@tarojs/components";
import "./coupon.scss";
import { getCoupons, getCoupons1, receiveCoupon } from "@/api/store"
import { myuser } from "@/api/common"

export default class Index extends Component {

  config: Config = {
    navigationBarTitleText: '领券中心'
  }
  state = {
    couponList: [],
    setCoupon: [],
    jump: '',
    loading: false,
    // memberType=newcust 新用户
    userInfo: {}
  }
  componentDidMount() {
    let query = this.$router.params
    if (query.scene) {
      let queryArr = query.scene.split('_')
      query.storeId = queryArr[0]
      query.jump = queryArr[1]
    }
    console.log('页面参数===》', query)
    const storeId = query.storeId
    const jump = query.jump
    this.setState({ jump })
    Taro.showLoading()
    if (storeId) {
      this.getCoupons(storeId)
    } else {
      this.getCoupons1()
    }
    this.getUserInfo()
  }

   // 获取我的信息
   getUserInfo = async () => {
    let res = await myuser();
    this.setState({userInfo: res.data.data || {}})
  }

  // 获取优惠券列表
  getCoupons = async (storeId) => {
    const res = await getCoupons(storeId)
    this.setState({ loading: true })
    Taro.hideLoading()
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
      this.setState({ couponList: couponList })
    }
  }
  getCoupons1 = async () => {
    const res = await getCoupons1()
    this.setState({ loading: true })
    Taro.hideLoading()
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
      this.setState({ couponList: res.data.data.list })
    }
  }
  receiveCoup(ruleId, providerId) {
    console.log(ruleId, providerId)
    this.insertCoup(ruleId, providerId)
  }
  // 领券优惠券
  insertCoup = async (ruleId, providerId) => {
    const res = await receiveCoupon(ruleId, providerId)
    const jump = this.state.jump
    if (res.data.code == 20000) {
      if (jump == 'goods' || jump == "who") {
        Taro.showToast({
          title: res.data.message,
          icon: 'none'
        })
        setTimeout(() => {
          Taro.navigateBack({
            delta: 1
          })
        }, 1000);

      } else {
        Taro.showToast({
          title: res.data.message,
          icon: 'none'
        })
        setTimeout(() => {
          this.componentDidMount()
        }, 1000);

        // Taro.showModal({
        //   content: res.data.message,
        //   showCancel: false,
        //   success(res) {
        //     if (res.confirm) {
        //       Taro.navigateTo({
        //         url: '../mycard/mycard'
        //       })
        //     }
        //   }
        // })
      }
    } else {
      Taro.showToast({
        title: res.data.message,
        icon: 'none'
      })
    }
  }

  render() {
    const { couponList, loading, userInfo } = this.state
    let couImg = (item) => {
      return item.receiveLimit == 'newcust' && userInfo.memberType != 'newcust' 
      ? Taro.getStorageSync('imgHostItem')+'gy-icon_116.png' 
      : Taro.getStorageSync('imgHostItem')+'gy-icon_96.png'
    }
    let grayColor = (item) => {
      return item.receiveLimit == 'newcust' && userInfo.memberType != 'newcust' ? 'color: #999 !important;' : ''
    }

    return (
      <Block>
        {loading && (
          <Block>
            {couponList.length > 0 ? (
              <Block>
                {couponList.map((item, i) => {
                  return (
                    <View className="coupons" style={grayColor(item)} key={String(i)} onClick={() => { this.receiveCoup(item.id, item.providerId) }}>
                      { item.receiveLimit == 'newcust' && <View className="newcust-tag">新用户</View>}
                      {item.memberReceiveQuantity > 0 ? (
                        <Image className="cou-img" src={couImg(item)}></Image>
                      ) : (
                          <Block>
                            <Image className="cou-img" src={Taro.getStorageSync('imgHostItem')+'gy-icon_116.png'}></Image>
                            <Image className="coller" src={Taro.getStorageSync('imgHostItem')+'gy-icon_03.png'}></Image>
                          </Block>
                        )}
                      <View className="coupon-one">
                        {item.couponType == 2 
                          ? (<Text style="font-size:60rpx;font-weight:bold;">{item.couponAmount}<Text style="font-size:26rpx !important;">折</Text></Text>)
                          : (<Text style="font-size:60rpx;font-weight:bold;"><Text style="font-size:26rpx !important;">￥</Text>{item.couponAmount}</Text>)
                        }
                        <Text>{item.amountDescription}</Text>
                      </View>
                      <View className="coupon-two">
                        <Text>{item.couponTitle}</Text>
                        <Text>{item.scopeDescription}</Text>
                        <Text className="coupon-time">{item.ruleStartTime}~{item.ruleEndTime}</Text>
                      </View>
                      <View className="coupon-three">
                        {/* 限制新用户可领的券，但不是新用户默认为灰色 */}
                        {item.memberReceiveQuantity > 0 ? (
                          <Text className="coupon-three-a" style={grayColor(item)} >立即领取</Text>
                        ) : (
                            <Text className="coupon-three-b" style={grayColor(item)} >立即领取</Text>
                          )}
                      </View>
                    </View>
                  )
                })}
              </Block>
            ) : (
                <View className="no-data-view">
                  <Image
                    src={Taro.getStorageSync('imgHostItem')+'qt_89.png'}
                    mode="widthFix"
                    className="no-data-image"
                  ></Image>
                  <View className="no-data-text">没有可领取的优惠券</View>
                </View>
              )}
          </Block>
        )}
      </Block>

    );
  }
}
