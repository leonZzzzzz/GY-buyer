import Taro, { Component, Config } from "@tarojs/taro";
import {
  Block,
  View,
  Text,
  Image,
  ScrollView
} from "@tarojs/components";
import "./mycard.scss";
import { myCoupon, getCoupons, getCoupons1, receiveCoupon } from "@/api/store"

export default class Index extends Component {

  state = {
    gocouponList: [],
    setCoupon: [],
    jump: '',
    loading: false,
    // memberType=newcust 新用户
    userInfo: {},

    type: '4',
    couponList: [],
    list: [],
    pageNum: 1, total1: '', total2: '', total3: ''
  };
  config: Config = {
    navigationBarTitleText: "优惠券"
  };
  componentDidMount() {
    Taro.showLoading()
    this.getCoupons1()
    // this.setCoupon(this.state.type, this.state.pageNum)
  }
  // 获取优惠群列表
  getCoupons1 = async () => {
    const res = await getCoupons1()
    this.setState({ loading: true })
    Taro.hideLoading()
    if (res.data.code == 20000) {
      const gocouponList = res.data.data.list
      gocouponList.map(item => {
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
      this.setState({ gocouponList: res.data.data.list })
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
      }
    } else {
      Taro.showToast({
        title: res.data.message,
        icon: 'none'
      })
    }
  }
  swichSwiperItem(e) {
    console.log(e)
    const type = e.currentTarget.dataset.type
    this.setState({ type: type, pageNum: 1, list: [] })
    this.setCoupon(type, '1')
  }
  // 去领券
  gogetcoupon() {
    Taro.navigateTo({
      url: '../coupon/coupon'
    })
  }
  setCoupon = async (type, pageNum) => {
    const params = { status: type, storeId: '', pageNum: pageNum, pageSize: 20 }
    const res = await myCoupon(params)
    Taro.hideLoading()
    const couponList = res.data.data.list
    const list = this.state.list
    couponList.map(item => {
      if (item.couponType == 2) {
        item.amount = Number(item.amount / 10)
      } else {
        item.amount = Number(item.amount / 100)
      }
      item.startTime = item.validTime.split(" ")
      item.endTime = item.expireTime.split(" ")
      list.push(item)
    })
    if (type == 1) {
      this.setState({ total1: res.data.data.total })
    } else if (type == 3) {
      this.setState({ total2: res.data.data.total })
    } else if (type == 2) {
      this.setState({ total3: res.data.data.total })
    }
    this.setState({ couponList: list })
  }
  // 去使用
  goUse(storeId) {
    if (!storeId || storeId == '0') {
      Taro.switchTab({
        url: '../../../pages/home/index'
      })
    } else {
      Taro.navigateTo({
        url: '../../wholesaler/wholesaler?storeId=' + storeId
      })
    }
  }
  onReachBottom() {
    this.state.pageNum++
    Taro.showLoading({
      title: '正在加载'
    })
    this.setCoupon(this.state.type, this.state.pageNum)
  }
  render() {
    const { couponList, total1, total2, total3, type, gocouponList, userInfo } = this.state
    // const { couponList, loading, userInfo } = this.state
    let couImg = (item) => {
      return item.receiveLimit == 'newcust' && userInfo.memberType != 'newcust'
        ? Taro.getStorageSync('imgHostItem') + 'gy-icon_116.png'
        : Taro.getStorageSync('imgHostItem') + 'gy-icon_96.png'
    }
    let grayColor = (item) => {
      return item.receiveLimit == 'newcust' && userInfo.memberType != 'newcust' ? 'color: #999 !important;' : ''
    }
    return (
      <View className="main-container">
        <ScrollView scroll-x='true' className="nav-header-view" scroll-into-view="{{curSwiperIdx=='5'?'listReturn':''}}">
          <View className="header-col-view {{type == '4' ? 'show-border-bottom' : '' }}" data-type='4' onClick={this.swichSwiperItem}>
            <Text data-idx='0'>去领券</Text>
          </View>
          <View className="header-col-view {{type == '1' ? 'show-border-bottom' : '' }}" data-type='1' onClick={this.swichSwiperItem}>
            {total1 ? (
              <Text data-idx='0'>未使用 ({total1})</Text>
            ) : (
                <Text data-idx='0'>未使用</Text>
              )}

          </View>
          <View className="header-col-view {{type == '3' ? 'show-border-bottom' : '' }}" data-type='3' onClick={this.swichSwiperItem}>
            {total2 ? (
              <Text data-idx='1'>已过期 ({total2})</Text>
            ) : (
                <Text data-idx='1'>已过期</Text>
              )}
          </View>
          <View className="header-col-view {{type == '2' ? 'show-border-bottom' : '' }}" data-type='2' onClick={this.swichSwiperItem}>
            {total3 ? (
              <Text data-idx='2'>已使用 ({total3})</Text>
            ) : (
                <Text data-idx='2'>已使用</Text>
              )}
          </View>
        </ScrollView>

        <View className="card-list-view">
          {loading && (
            <Block>
              {type == 4 && (
                <Block>
                  {gocouponList.length > 0 ? (
                    <Block>
                      {gocouponList.map((item, i) => {
                        return (
                          <View className="coupons" style={grayColor(item)} key={String(i)} onClick={() => { this.receiveCoup(item.id, item.providerId) }}>
                            {item.receiveLimit == 'newcust' && <View className="newcust-tag">新用户</View>}
                            {item.memberReceiveQuantity > 0 ? (
                              <Image className="cou-img" src={couImg(item)}></Image>
                            ) : (
                                <Block>
                                  <Image className="cou-img" src={Taro.getStorageSync('imgHostItem') + 'gy-icon_116.png'}></Image>
                                  <Image className="coller" src={Taro.getStorageSync('imgHostItem') + 'gy-icon_03.png'}></Image>
                                </Block>
                              )}
                            <View className="coupon-one">
                              {item.couponType == 2
                                ? (<Text style="font-size:60rpx;font-weight:bold;">{item.couponAmount}<Text style="font-size:26rpx !important;">折</Text></Text>)
                                : (<View style="font-size:60rpx;font-weight:bold;"><Text style="font-size:26rpx !important;margin-top:13px;">￥</Text>{item.couponAmount}</View>)
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
                          src={Taro.getStorageSync('imgHostItem') + 'qt_89.png'}
                          mode="widthFix"
                          className="no-data-image"
                        ></Image>
                        <View className="no-data-text">没有可领取的优惠券</View>
                      </View>
                    )}
                </Block>
              )}
            </Block>
          )}


          {type != 4 && (
            <Block>
              {couponList.length > 0 ? (
                <Block>
                  {couponList.map((card, i) => {
                    return (
                      <Block>
                        {type == 1 && (
                          <View className="card-item-view" key={String(i)} data-isplat="{{card.is_platform_coupon}}" data-storeid="{{card.store_id}}">
                            <Image className='pos' src={require('../../../images/item/guoyu-917_188.png')}></Image>
                            <View className="card-list-view-left">
                              <View className='card-item-up'>
                                <View className="card-item-up-left">
                                  {card.couponType == 2 ? (
                                    <View className="card-money-text">
                                      <Text>{card.amount}</Text>折
                                    </View>) : (
                                      <View className="card-money-text">￥
                                        <Text>{card.amount}</Text>
                                      </View>
                                    )}
                                  <View className="card-limit-text">{card.amountDescription}</View>
                                </View>
                                <View className='card-item-up-middle'>
                                  <View className="card-title-text">{card.title}</View>
                                  <View className='card-type-text'>{card.scopeDescription}</View>
                                  <View className='usecou'>
                                    <View className="card-time-text">{card.startTime[0]}至{card.endTime[0]}</View>
                                    <Text onClick={() => { this.goUse(card.storeId) }}>去使用</Text>
                                  </View>
                                </View>
                              </View>
                            </View>
                          </View>
                        )}
                        {type == 2 && (
                          <View className="card-item-view" data-isplat="{{card.is_platform_coupon}}" data-storeid="{{card.store_id}}">
                            <Image className='pos' src={require('../../../images/item/guoyu-917_185.png')}></Image>
                            <View className="card-list-view-left">
                              <View className='card-item-up'>
                                <View className="card-item-up-left">
                                  {card.couponType == 2 ? (
                                    <View className="card-money-text">
                                      <Text>{card.amount}</Text>折
                                    </View>) : (
                                      <View className="card-money-text">￥
                                        <Text>{card.amount}</Text>
                                      </View>
                                    )}
                                  <View className="card-limit-text">{card.amountDescription}</View>
                                </View>
                                <View className='card-item-up-middle'>
                                  <View className="card-title-text">{card.title}</View>
                                  <View className='card-type-text'>{card.scopeDescription}</View>
                                  <View className='usecou'>
                                    <View className="card-time-text">{card.startTime[0]}至{card.endTime[0]}</View>
                                  </View>
                                </View>
                                <Image className='itemimg' src={require('../../../images/item/guoyu-917_180.png')}></Image>
                              </View>
                            </View>
                          </View>
                        )}
                        {type == 3 && (
                          <View className="card-item-view" data-isplat="{{card.is_platform_coupon}}" data-storeid="{{card.store_id}}">
                            <Image className='pos' src={require('../../../images/item/guoyu-917_185.png')}></Image>
                            <View className="card-list-view-left">
                              <View className='card-item-up'>
                                <View className="card-item-up-left">
                                  {card.couponType == 2 ? (
                                    <View className="card-money-text">
                                      <Text>{card.amount}</Text>折
                                    </View>) : (
                                      <View className="card-money-text">￥
                                        <Text>{card.amount}</Text>
                                      </View>
                                    )}
                                  <View className="card-limit-text">{card.amountDescription}</View>
                                </View>
                                <View className='card-item-up-middle'>
                                  <View className="card-title-text">{card.title}</View>
                                  <View className='card-type-text'>{card.scopeDescription}</View>
                                  <View className='usecou'>
                                    <View className="card-time-text">{card.startTime[0]}至{card.endTime[0]}</View>
                                  </View>
                                </View>
                                <Image className='itemimg' src={require('../../../images/item/qt_156.png')}></Image>
                              </View>
                            </View>
                          </View>
                        )}
                      </Block>
                    )
                  })}
                </Block>
              ) : (
                  <View className="no-data-view">
                    <Image src={require('../../../images/item/qt_89.png')} mode="widthFix" className="no-data-image" />
                    <Text className="no-data-text">此分类没有优惠券</Text>
                  </View>
                )}
            </Block>
          )}

        </View>
      </View>
    );
  }
}
