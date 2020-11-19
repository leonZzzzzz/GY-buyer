import Taro, { Component, Config } from "@tarojs/taro";
import { View, Image, Text, Block, Icon } from "@tarojs/components";
import "./stallcoupon.scss";
import { myCoupon, receiveCoupon } from "@/api/store"

export default class Index extends Component {

  config: Config = {
    navigationBarTitleText: '档口优惠券'
  }
  state = {
    couponList: [],
    setCoupon: [],
    borId: '',
    coupondata: [],
    storeId: '',
    money: '',
    loading: false
  }
  componentWillMount() {
    const { storeId, couponId, money } = this.$router.params
    this.setState({ borId: couponId, storeId, money })
    let params = { storeId, status: 1 }
    Taro.showLoading()
    this.getCoupons(params)
  }
  // 获取档口优惠券
  getCoupons = async (params) => {
    const res = await myCoupon(params)
    this.setState({ loading: true })
    Taro.hideLoading()
    if (res.data.code == 20000) {
      const couponList = res.data.data.list
      var a = { amount: 0, amountDescription: '', expireTime: '2019-11-20 15:16', validTime: '2019-11-20 15:17', id: '', orderAmount: '', scopeDescription: '', status: '', storeId: params.storeId, title: '' }
      if (couponList.length > 0) {
        couponList.unshift(a)
      }
      couponList.map(item => {
        item.amount = parseFloat(item.amount / 100)
        item.starttime = item.validTime.split(' ')
        item.endtime = item.expireTime.split(' ')
        // coupondata.push(item)
      })

      this.setState({ couponList })
    }
  }
  chooseCoupon(id, storeId, title, amount, orderAmount) {
    let { money } = this.state
    console.log(money, id, amount, orderAmount)
    if (id == '') {
      this.setState({ borId: id })
      const couponInfo = {}
      couponInfo.storeId = this.state.storeId
      couponInfo.id = id
      couponInfo.title = title
      couponInfo.amount = parseFloat(amount * 100).toFixed(2)
      Taro.setStorageSync('couponInfo', couponInfo)
    } else {
      if (parseInt(money * 100) >= parseInt(orderAmount)) {
        // if (parseInt(money * 100) > parseInt(amount * 100)) {
        this.setState({ borId: id })
        const couponInfo = {}
        couponInfo.storeId = this.state.storeId
        couponInfo.id = id
        couponInfo.title = title
        couponInfo.amount = parseFloat(amount * 100).toFixed(2)
        Taro.setStorageSync('couponInfo', couponInfo)
        // } else {
        //   Taro.showToast({
        //     title: '优惠券金额大于订单金额，请重新选择',
        //     icon: 'none'
        //   })
        //   return
        // }
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
                    <View className='content' onClick={() => { this.chooseCoupon(item.id, item.storeId, item.title, item.amount, item.orderAmount) }}>
                      <View className='icon'><Icon type={borId == item.id ? 'success' : 'circle'}></Icon></View>
                      {item.amount > 0 ? (
                        <View className="coupons">
                          <Image className="cou-img" src={Taro.getStorageSync('imgHostItem')+'gy-icon_96.png'}></Image>
                          <View className="coupon-one">
                            <Text style="font-size:46rpx;font-weight:bold;"><Text style="font-size:26rpx !important;">￥</Text>{item.amount}</Text>
                            <Text>{item.amountDescription}</Text>
                          </View>
                          <View className="coupon-two">
                            <Text>{item.title}</Text>
                            <Text>{item.scopeDescription}</Text>
                            <Text className="coupon-time">{item.starttime[0]}~{item.endtime[0]}</Text>
                          </View>
                          <View className="coupon-three">
                            <Text>店铺券</Text>
                          </View>
                        </View>
                      ) : (
                          <View className="coupons nose">不使用优惠券</View>
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
                  <View className="no-data-text">没有可用的优惠券</View>
                </View>
              )}
          </Block>
        )}
      </Block>

    );
  }
}
