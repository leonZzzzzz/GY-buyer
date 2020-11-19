import Taro, { Component, Config } from "@tarojs/taro";
import { View, Image, Text, Block, Icon } from "@tarojs/components";
import "./index.scss";
import { myCoupon } from "@/api/store"

export default class Index extends Component {

  config: Config = {
    navigationBarTitleText: '平台运费券'
  }
  state = {
    couponList: [],
    setCoupon: [],
    borId: '',
    money: '',
    loading: false
  }
  componentWillMount() {
    let { productMoney, id, money } = this.$router.params
    console.log(money)
    this.setState({ productMoney, borId: id, money })
    const params = { status: 1, storeId: 0, ruleType: 4, pageNum: 1, pageSize: 999 }
    Taro.showLoading()
    this.getCoupons(params)
  }
  // 获取平台优惠券
  getCoupons = async (params) => {
    const res = await myCoupon(params)
    this.setState({ loading: true })
    Taro.hideLoading()
    if (res.data.code == 20000) {
      const couponList = res.data.data.list
      var a = { amount: 0, amountDescription: '', expireTime: '2019-11-20 15:16', validTime: '2019-11-20 15:17', id: '1002', orderAmount: '', scopeDescription: '', status: '', storeId: '', title: '' }
      if (couponList.length > 0) {
        couponList.unshift(a)
      }

      couponList.map(item => {
        // item.amount = parseFloat(item.amount / 100).toFixed(2)
        if (item.couponType == 2) {
          item.couponAmount = parseFloat(item.amount / 10)
        } else {
          item.couponAmount = parseFloat(item.amount / 100)
        }
        item.startTime = item.validTime.split(' ')
        item.endTime = item.expireTime.split(' ')
      })
      this.setState({ couponList: couponList })
    }
  }
  chooseCoupon(item) {
    let { money } = this.state
    let {id, amount, orderAmount} = item
    const couponInfo = JSON.parse(JSON.stringify(item))
    this.setState({ borId: id })
    console.log(parseInt(money * 100))
    if (id == 1002 || id == '1002') {
      Taro.setStorageSync('freightCoupon', couponInfo)
    } else {
      if (parseInt(money * 100) >= parseInt(orderAmount)) {
        Taro.setStorageSync('freightCoupon', couponInfo)
      } else {
        Taro.showToast({
          title: '订单金额不足，不能使用此优惠券，请重新选择',
          icon: 'none'
        })
        return
      }
    }
  }
  // 确定后返回上一页
  back() {
    Taro.navigateBack({
      delta: 1
    })
  }


  render() {
    const { couponList, borId, loading } = this.state
    return (
      <Block>
        {loading && (
          <Block>
            {couponList.length > 0 ? (
              <Block>
                {couponList.map((item, i) => {
                  return (
                    <View className='content' key={String(i)} onClick={() => { this.chooseCoupon(item) }}>
                      <View className='icon'><Icon type={borId == item.id ? 'success' : 'circle'}></Icon></View>
                      {item.id && item.id != '1002' || item.id != 1002 ? (
                        <View className="coupons">
                          <Image className="cou-img" src={Taro.getStorageSync('imgHostItem')+'gy-icon_96.png'}></Image>
                          <View className="coupon-one">
                            {item.couponType == 2 
                              ? (<Text style="font-size:60rpx;font-weight:bold;">{item.couponAmount}<Text style="font-size:26rpx !important;">折</Text></Text>)
                              : (<Text style="font-size:60rpx;font-weight:bold;"><Text style="font-size:26rpx !important;">￥</Text>{item.couponAmount}</Text>)
                            }
                            <Text>{item.amountDescription}</Text>
                          </View>
                          <View className="coupon-two">
                            <Text>{item.title}</Text>
                            <Text>{item.scopeDescription}</Text>
                            <Text className="coupon-time">{item.startTime[0]}~{item.endTime[0]}</Text>
                          </View>
                          <View className="coupon-three">
                            <Text>{item.ruleType == 4 ? '运费券':'平台券'}</Text>
                          </View>
                        </View>
                      ) : (
                          <View className="coupons nose">不使用运费券</View>
                        )}
                    </View>
                  )
                })}
                <View style="height:160rpx;"></View>
                <View className='btn' onClick={this.back}>确定</View>
              </Block>
            ) : (
                <View className="no-data-view">
                  <Image
                    src={Taro.getStorageSync('imgHostItem')+'qt_89.png'}
                    mode="widthFix"
                    className="no-data-image"
                  ></Image>
                  <View className="no-data-text">没有可用的运费券
                    <Text style='color: rgb(255, 102, 0);padding-left: 5px;text-decoration: underline;font-size:28rpx;' onClick={() => {
                      Taro.navigateTo({url: '/pagesCommon/coupons/coupon/coupon'})
                    }}>去领券</Text>
                </View>
                </View>
              )}
          </Block>
        )}
      </Block>

    );
  }
}
