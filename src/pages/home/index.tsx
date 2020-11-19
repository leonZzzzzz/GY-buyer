import Taro, { Component, Config } from "@tarojs/taro";
import { getBanner, getnotice, getcommon, getMethod, cartNum } from "@/api/index";
import {
  Block,
  View,
  Text,
  Image,
  Input,
  Swiper,
  SwiperItem,
  Navigator,
  ScrollView
} from "@tarojs/components";
import "./index.scss";
import { AtNoticebar } from 'taro-ui'
import { getCoupons1, receiveCoupon } from "@/api/store"

const app = Taro.getApp()

export default class Index extends Component {
  // 去领券
  gocoupon() {
    Taro.navigateTo({
      url: '../../pagesCommon/coupons/coupon/coupon'
    })
  };
  // 选择城市
  golocation() {
    Taro.navigateTo({
      url: '../../pagesCommon/location-city/city'
    })
  }
  // 搜索商品
  gosearch() {
    Taro.navigateTo({
      url: '../../pagesCommon/search/search-list'
    })
  }

  // 去到商品详情
  gotodetail(id, storeId) {
    Taro.navigateTo({
      url: '../../pagesCommon/goods/goods-detail?storeId=' + storeId + '&id=' + id
    })
  }
  state = {
    currentDate: new Date().getTime(),
    imageurl: 'https://guyu-1300342109.cos.ap-guangzhou.myqcloud.com',
    bannerList: [],
    valueList: [
      {
        txt: '次日送达',
        src: '../../images/item/gy-icon_27.png'
      },
      {
        txt: '新鲜保证',
        src: '../../images/item/gy-icon_27.png'
      },
      {
        txt: '品质质检',
        src: '../../images/item/gy-icon_27.png'
      },
      {
        txt: '售后服务',
        src: '../../images/item/gy-icon_27.png'
      }
    ],
    methodList: [],
    productData: [],
    pageConfig: [
      {
        name: "QcText",
        options: {
          backgroundColor: "#A73C3C",
          color: "#EBEBEB",
          fontSize: 44,
          fontWeight: "normal",
          lineHeight: 44,
          textAlign: "left",
          value: "请输入内容"
        }
      },
      {
        name: "QcSplit",
        options: {
          backgroundColor: "#000000",
          height: 40
        }
      },
      {
        name: "QcMall1",
        options: {}
      },
      {
        name: "QcMall2",
        options: {}
      }
    ],
    onemethodList: [],
    twomethodList: [],

    notice: [],
    text: "",
    marqueePace: 1,//滚动速度
    marqueeDistance: 0,//初始滚动距离
    marquee_margin: 50,
    size: 14,
    interval: 20,
    length: '',
    windowWidth: '',

    width: 0,
    ismove: false,
    time: 0,
    topfixed: false,
    oddshow: false,
    evenshow: false,
    couponList: []
  };
  onShareAppMessage() {
    return {
      title: '丰盈e鲜',
      success: function (res) {
        console.log("转发成功:" + JSON.stringify(res));
      },
      fail: function (res) {
        // 转发失败
        console.log("转发失败:" + JSON.stringify(res));
      }
    }
  }
  componentWillUnmount() {
    clearInterval(this.state.interval)
  }
  componentDidNotFound() {
    clearInterval(this.state.interval)
  }

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
    let query = this.$router.params
    console.log('推荐人电话', query)
    // let query = { scene: '15899996666' }
    if (query.scene) {
      let queryArr = query.scene.split('_')
      console.log(queryArr)
      Taro.setStorageSync('recMobile', queryArr[0])
    }
    this.powerbanner()
    this.powernotice()
    this.methodSet()
    this.powercommon()
    if (Taro.getStorageSync("memberid")) {
      this.getCartNum()
    }
  }

  // 领取优惠券
  receiveCoup(ruleId, providerId) {
    console.log(ruleId, providerId)
    this.insertCoup(ruleId, providerId)
  }
  insertCoup = async (ruleId, providerId) => {
    const res = await receiveCoupon(ruleId, providerId)
    if (res.data.code == 20000) {
      Taro.showToast({
        title: res.data.message,
        icon: 'none'
      })
      setTimeout(() => {
        this.getCoupons1()
      }, 1000);
    } else {
      Taro.showToast({
        title: res.data.message,
        icon: 'none'
      })
    }
  }
  // 刷新优惠券列表
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
  // 获取公告
  powernotice = async () => {
    const res = await getnotice()
    if (res.data.code == 20000) {
      let notice = res.data.data
      // let notice = [{ content: 'ad哈进口国had克己奉公会卡顿立即发货刚开始的复合弓开始了电饭锅' },
      // { content: '沃尔特温热台湾人热图有热图有' }]
      // var windowWidth = Taro.getSystemInfoSync().windowWidth;// 屏幕宽度
      var windowWidth = 265
      var windowtext = parseInt(windowWidth / 13)//每行可容纳字数
      let a = 0
      notice.map(item => {
        a++
        item.content = a + '.' + item.content
      })
      if (notice.length > 1) {
        notice.map((item, index) => {
          var length = item.content.length
          console.log(length)
          if (length > windowtext) {
            var c = item.content.slice(0, windowtext)
            var d = item.content.slice(windowtext)
            notice.splice(index, 1, { content: c }, { content: d })
          }
        })
      } else {
        if (notice.length == 1) {
          notice.map((item, index) => {
            var length = item.content.length
            console.log(length)
            if (length <= windowtext) {
              notice.push(item)
            } else {
              var c = item.content.slice(0, windowtext)
              var d = item.content.slice(windowtext)
              notice.splice(index, 1, { content: c }, { content: d })
            }
          })
        }
      }
      console.log(notice)
      this.setState({ notice })
      // this.run(length, windowWidth)
    }
  }

  run(length, windowWidth) {
    var interval = setInterval(() => {
      if (length > windowWidth) {
        var maxscrollwidth = length + this.state.marquee_margin;
        var crentleft = this.state.marqueeDistance;
        if (crentleft <= maxscrollwidth) {
          this.setState({
            marqueeDistance: crentleft + this.state.marqueePace
          })
          clearInterval(interval)
          this.run(length, windowWidth)
        } else {
          clearInterval(interval)
          this.setState({
            marqueeDistance: 0
          })
          this.run(length, windowWidth)
        }
      } else {
        clearInterval(this.state.interval);
        this.setState({ marquee_margin: 1000 });
      }
    }, this.state.interval)
  }

  // 获取轮播图
  powerbanner = async () => {
    const res = await getBanner()
    if (res.data.code == 20000) {
      this.setState({ bannerList: res.data.data })
    }
  }
  // 获取分类
  methodSet = async () => {
    const params = { type: 1 }
    const res = await getMethod(params)
    let methodList = res.data.data
    // let one = []; let two = []
    // if (methodList.length > 10) {
    //   two = methodList.slice(10)
    //   one = methodList.splice(0, 10)
    // }
    this.setState({
      // onemethodList: one, 
      // twomethodList: two, 
      methodList
    })
  }
  gomethod(id, code) {
    app.globalData.firstId = id
    app.globalData.toView = code
    Taro.switchTab({
      url: '../category/index'
    })
  }
  // 获取专区数据
  powercommon = async () => {
    const res = await getcommon()
    const { code, data } = res.data
    data.map((item, i) => {
      const list = item.list
      list.map(list => {
        list.productPrice = parseFloat(list.productPrice / 100).toFixed(2)
      })
    })
    if (code == 20000) {
      var couponList = Taro.getStorageSync('couponList')
      console.log('优惠券', couponList)
      if (!couponList) {
        this.componentDidShow()
      }
      this.setState({ productData: data, couponList })
    }
  }
  onInput(e) {
  }
  confirm(e) {
  }
  // 轮播图跳转
  bannerJump(type, link, id) {
    if (type == 'product') {
      Taro.navigateTo({
        url: '../../pagesCommon/goods/goods-detail?storeId=' + id + '&id=' + link
      })
    }
  }

  onPageScroll(e) {
    // console.log(e.scrollTop) //这个就是滚动到的位置,可以用这个位置来写判断
    if (e.scrollTop >= 288) {
      if (this.state.evenshow) {
        this.setState({ evenshow: true, oddshow: false })
      } else {
        this.setState({ topfixed: true, oddshow: true })
      }
    }
    else {
      if (this.state.evenshow) {
        this.setState({ evenshow: false, oddshow: false })
      } else {
        this.setState({ topfixed: false, oddshow: false, evenshow: false })
      }
    }
  }
  showoddrow() {
    this.setState({
      oddshow: true,
      evenshow: false
    })
  }
  showevencol() {
    this.setState({
      evenshow: true,
      oddshow: false
    })
  }



  config: Config = {
    navigationBarTitleText: "首页",
    navigationBarBackgroundColor: "#1BBC3D",
    navigationBarTextStyle: "white",
  };
  render() {
    const { imageurl, topfixed, couponList, oddshow, evenshow, methodList, productData, notice, marqueeDistance, marquee_margin, valueList, bannerList, onemethodList, twomethodList } = this.state
    return (
      <View style='flex-direction:column;'>
        {topfixed && (
          <View className='fixed-con'>
            {evenshow && (
              <View className='fixedlist'>
                <View className='row-box allrow'>
                  {methodList.map((item: any, index) => {
                    return (
                      <View className='' key={String(index)} onClick={() => { this.gomethod(item.id, item.code) }}>
                        <Image src={imageurl + item.iconUrl}></Image>
                        <Text>{item.name}</Text>
                      </View>
                    )
                  })}
                </View>
                <View className='jiantou' onClick={this.showoddrow}><Text className='iconfont icon-left-double-arrow-copy-copy'></Text></View>
              </View>
            )}
            {oddshow && (
              <View className='fixedlist' >
                {/* <ScrollView scroll-x style='white-space: nowrap;'> */}
                <View className='fixed_odd' style='flex-wrap:wrap'>
                  {methodList.map((item: any, index) => {
                    return (
                      <View key={String(index)} onClick={() => { this.gomethod(item.id, item.code) }}>
                        {/* <Image src={imageurl + item.iconUrl}></Image> */}
                        <Text>{item.name}</Text>
                      </View>
                    )
                  })}
                </View>
                {/* </ScrollView> */}
                <View style='margin-top:20rpx' className='jiantou' onClick={this.showevencol}><Text className='iconfont icon-load-more'></Text></View>
              </View>
            )}
          </View>
        )}

        {/* {notice.length > 0 && (
            // <AtNoticebar marquee single speed={60}>{text}</AtNoticebar>
            <View className='container-con'>
              <Swiper className="container" vertical='true' autoplay="true" interval={3000} circular>
                {notice.map(text => {
                  return (
                    <SwiperItem className="marquee_text">{text.content}</SwiperItem>
                  )
                })}
              </Swiper>
            </View>
          )
          } */}

        <View className={notice[0].content ? 'search' : 'search1'}>
          {/* onClick={this.golocation} */}
          <View className='seat'>
            <View>广州</View>
            <Text style='line-height:42rpx;margin-left:10rpx' className='iconfont icon-xiajiantou'></Text>
            {/* <Image src={require('../../images/item/qt_111.png')}></Image> */}
          </View>
          <View className='searchview' onClick={this.gosearch}>
            <Input className='searchinput'
              placeholder='请输入你想要采购的商品'
              placeholderClass='placestyle'
            ></Input>
          </View>
          {/* <Image className='draw' src={require('../../images/myicon/gy-icon_20.png')} onClick={(this.gocoupon)}></Image> */}
        </View>

        <View id='topscoll'>
          <View className='newContent'>
            {bannerList.length > 0 && (
              <Swiper
                autoplay
                className={text ? 'swiperok' : 'swipertop'}
                indicatorDots
                indicatorActiveColor='#ff3030'
                indicatorColor='#ffffff'
                interval={3000}
                circular
              >
                {bannerList.map((item, index) => {
                  return (
                    <SwiperItem className='list-header-image' key={String(index)}>
                      <Navigator className='header-image'>
                        <Image onClick={() => { this.bannerJump(item.skipType, item.skipLinks, item.pdtStoreId) }}
                          src={imageurl + item.imgLinks}
                          mode='aspectFill'
                          lazyLoad
                        ></Image>
                      </Navigator>
                    </SwiperItem>
                  )
                })}
              </Swiper>
            )}
            {/* <Swiper className='list-header-image'>
              <SwiperItem className='list-header-image'>
                <Navigator className='header-image'>
                  <Image
                    src={require('../../images/item/head-no.png')}
                    mode='aspectFill'
                    lazyLoad
                  ></Image>
                </Navigator>
              </SwiperItem>
            </Swiper> */}


            <View className='card-banner-area'>
              {valueList.map((item, index) => {
                return (
                  <View key={String(index)} className='card-banner-item'>
                    <Text className='iconfont icon-duigou '></Text>
                    {/* <Image src={require('../../images/item/gy-icon_27.png')}></Image> */}
                    <Text>{item.txt}</Text>
                  </View>
                )
              })}
            </View>
          </View>

          {/*  分类  */}
          <View style={notice.length > 0 ? 'height:850rpx' : 'height:790rpx'} className='hei'>
            <View className='catenotice'>
              {methodList.length > 5 && (
                <View className='catelist'>
                  <View className={notice.length > 0 ? 'two2_box' : 'two_box'}>
                    <View className='row-box'>
                      {methodList.map((item: any, index) => {
                        return (
                          <View className='' key={String(index)} onClick={() => { this.gomethod(item.id, item.code) }}>
                            <Image src={imageurl + item.iconUrl}></Image>
                            <Text>{item.name}</Text>
                          </View>
                        )
                      })}
                    </View>
                  </View>
                </View>
              )}
              {/* {twomethodList.length > 0 ? (
                <Swiper
                  className='catelist'
                  indicatorDots={false}
                  indicatorColor='#ddd'
                  indicatorActiveColor='#FF840B'
                >
                  <SwiperItem>
                    <View className='two_box'>
                      <View className='row-box'>
                        {onemethodList.map((item: any, index) => {
                          return (
                            <View className='' key={String(index)} onClick={() => { this.gomethod(item.id, item.code) }}>
                              <Image src={imageurl + item.iconUrl}></Image>
                              <Text>{item.name}</Text>
                            </View>
                          )
                        })}
                      </View>
                    </View >
                  </SwiperItem >
                  <SwiperItem>
                    <View className='two_box'>
                      <View className='row-box'>
                        {twomethodList.map((item: any, index) => {
                          return (
                            <View className='' key={String(index)} onClick={() => { this.gomethod(item.id, item.code) }}>
                              <Image src={imageurl + item.iconUrl}></Image>
                              <Text>{item.name}</Text>
                            </View>
                          )
                        })}
                      </View>
                    </View>
                  </SwiperItem>
                </Swiper >
              ) : (
                  <Block>
                    {methodList.length > 5 ? (
                      <Swiper className='catelist' indicatorColor='#ddd' indicatorActiveColor='#FF840B'>
                        <SwiperItem>
                          <View className='two_box'>
                            <View className='row-box'>
                              {methodList.map((item: any, index) => {
                                return (
                                  <View className='' key={String(index)} onClick={() => { this.gomethod(item.id, item.code) }}>
                                    <Image src={imageurl + item.iconUrl}></Image>
                                    <Text>{item.name}</Text>
                                  </View>
                                )
                              })}
                            </View>
                          </View>
                        </SwiperItem>
                      </Swiper>
                    ) : (
                        <Swiper className='swiper-box' indicatorColor='#ddd' indicatorActiveColor='#FF840B'>
                          <SwiperItem>
                            <View className='two_box'>
                              <View className='row-box'>
                                {methodList.map((item: any, index) => {
                                  return (
                                    <View className='' key={String(index)} onClick={() => { this.gomethod(item.id, item.code) }}>
                                      <Image src={imageurl + item.iconUrl}></Image>
                                      <Text>{item.name}</Text>
                                    </View>
                                  )
                                })}
                              </View>
                            </View>
                          </SwiperItem >
                        </Swiper >
                      )}
                  </Block>
                )
              } */}
              {notice.length > 0 && (
                // <AtNoticebar marquee single speed={60}>{text}</AtNoticebar>
                <View className='container-con'>
                  <Image src='../../images/item/newnotice.png'></Image>
                  <Swiper className="container" vertical='true' autoplay="true" interval={3000} circular>
                    {notice.map(text => {
                      return (
                        <SwiperItem className="marquee_text">{text.content}</SwiperItem>
                      )
                    })}
                  </Swiper>
                </View>
              )
              }
              <View className='discoupon'>
                <View className='coupontitle'>
                  <Text style='margin-top:7rpx;'>领取优惠券，购买生鲜更优惠</Text>
                  <Text className='getmore' onClick={(this.gocoupon)}>更多<Text className='iconfont icon-youjiantou' style='font-size:26rpx;margin-left:5rpx;'></Text></Text>
                </View>
                <View className='couponcontent'>
                  <ScrollView scroll-x className='couponswiper'>
                    {couponList.length > 0 && (
                      <Block>
                        {couponList.map(item => {
                          return (
                            <View className='couponbox' onClick={() => { this.receiveCoup(item.id, item.providerId) }}>
                              <Image src='../../images/item/couponpic.png'></Image>
                              <View className={item.memberReceiveQuantity > 0 ? 'disbox' : 'disbox1'}>
                                <View className='distitle'>
                                  <View className='disprice'>
                                    {item.couponType == 2
                                      ? (<View><Text style='font-size:32rpx;font-weight:bold'>{item.couponAmount}</Text>折 {item.amountDescription}</View>)
                                      : (<View>￥<Text style='font-size:32rpx;font-weight:bold'>{item.couponAmount}</Text> {item.amountDescription}</View>)
                                    }

                                  </View>
                                  <View>{item.couponTitle}</View>
                                  <View style='font-size:20rpx;color:#e1977e'>{item.ruleStartTime}~{item.ruleEndTime}</View>
                                </View>
                                <View className={item.memberReceiveQuantity > 0 ? "coupon-three" : 'coupon-three2'}><Text className='coupon-three-a'>{item.memberReceiveQuantity > 0 ? '领取' : '已领取'}</Text></View>
                              </View>
                            </View >
                          )
                        })}
                      </Block>
                    )}
                  </ScrollView>
                </View>
              </View>
            </View>
            <Image className='orangepic' src='../../images/item/orange.png'></Image>
          </View>
        </View>

        {
          productData.map((item: any, index) => {
            return (
              <View className='trade' key={String(index)}>
                <View className='trade-img'>
                  <Image
                    className='topleft'
                    src={require('../../images/item/icon_88.png')}
                  ></Image>
                  <Text className='trade-title'>{item.name}</Text>
                  <Image
                    className='topleft'
                    src={require('../../images/item/icon_88.png')}
                  ></Image>
                </View>
                <View className='trade-col'>
                  {item.list.map((value, i) => {
                    return (
                      <View className='trade-box'
                        key={String(i)}
                        onClick={() => { this.gotodetail(value.productId, value.storeId) }}
                      >
                        <Image src={imageurl + value.productIcon}></Image>
                        <Text className='trade-name'>{value.productName}</Text>
                        <View className='trade-prc'>{value.spec1Value}</View>
                        <View className='trade-price'>
                          {/* <Text style='font-size:24rpx !important;margin-top:6rpx;'>
                            ￥<Text style='font-size:30rpx;'>{value.productPrice}</Text>
                          </Text> */}
                          <Text style='font-size:30rpx;'>{value.productPrice}<Text style='font-size:24rpx !important;margin-top:6rpx;margin-left:5rpx'>元/{value.unit}</Text></Text>
                          <Image src={require('../../images/item/gy-icon_06.png')}></Image>
                        </View>
                      </View>
                    )
                  })}
                </View>
              </View>
            )
          })
        }
      </View >
    );
  }
}