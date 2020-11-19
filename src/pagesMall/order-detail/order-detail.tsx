import Taro, { Component, Config, navigateTo } from "@tarojs/taro";
import {
  Block,
  View,
  Text,
  Image
} from "@tarojs/components";
import { getOrder, cancelOrder, confirmOrder, finishOrder, cancelAccounOrder, queryPayOrder } from "@/api/order";
import { wechatservice } from "@/api/userInfo"
import "./order-detail.scss";
import { IMG_HOST } from "@/config";
import { toPriceYuan } from "@/utils/format";
let app = Taro.getApp();

export default class Index extends Component {
  config: Config = {
    navigationBarTitleText: "订单详情"
  };
  state = {
    imageurl: "https://guyu-1300342109.cos.ap-guangzhou.myqcloud.com",
    send_type: "2",
    model: {},
    clock: '',
    duringMs: 1,
    Loadingtime: '',
    type: '',
    iswechat: false,
    wxQrcode: '',
    qrcode: false
  };

  componentDidShow() {
    console.log(this.$router.params)
    app.globalData.type = this.$router.params.type
    this.setState({ type: this.$router.params.type })
    getOrder({ id: this.$router.params.id }).then(res => {
      const expireTime = res.data.data.expireTime
      this.count_down(expireTime)
      const model = res.data.data
      model.productAmount = parseFloat(model.productAmount / 100).toFixed(2)
      model.transportAmount = parseFloat(model.transportAmount / 100).toFixed(2)
      model.storeCouponPayAmount = parseFloat(model.storeCouponPayAmount / 100).toFixed(2)
      model.couponPayAmount = parseFloat(model.couponPayAmount / 100).toFixed(2)
      model.totalAmount = parseFloat(model.totalAmount / 100).toFixed(2)
      model.needPayTotalAmount = parseFloat(model.needPayTotalAmount / 100).toFixed(2)
      const storeImageRemark = model.storeImageRemark
      if (storeImageRemark) {
        model.storeImageRemark = storeImageRemark.split('_')
      }
      this.setState({ model: model });
      console.log(model)
    });
  }
  componentDidHide() {
    clearInterval(this.state.Loadingtime);
    Taro.setStorageSync('detailData', this.state.model)
  }
  componentWillUnmount() {
    clearInterval(this.state.Loadingtime);
    Taro.setStorageSync('detailData', this.state.model)
  }
  // 取消订单
  async apiCancelOrder(id: string) {
    const res = await Taro.showModal({
      title: "提示",
      content: "是否取消该订单？"
    });
    if (res.confirm) {
      Taro.showLoading();
      const data = await cancelOrder({ id });
      if (data.data.code == 20000) {
        Taro.hideLoading();
        Taro.showToast({
          title: '订单已取消',
          icon: 'none'
        })
        this.componentDidShow()
        // search.pageNum = 1
        // await apiPageOrder();
      }
    }
  }
  // 确认收货
  async getConfirm(id) {
    console.log(id)
    const res = await Taro.showModal({
      title: "提示",
      content: "是否确认收货？"
    });
    if (res.confirm) {
      Taro.showLoading();
      const data = await confirmOrder(id);
      if (data.data.code == 20000) {
        // 订单完成
        // const res = await finishOrder({ id })
        // if (res.data.code == 20000) {
        Taro.hideLoading();
        Taro.showToast({
          title: '订单已收货',
          icon: 'none'
        })
        this.componentDidShow()
      }
      // }
    }
  }

  // 取消账期订单
  async apiCancelAccounOrder(id: string) {
    const res = await Taro.showModal({
      title: '提示',
      content: '是否取消该订单？'
    });
    if (res.confirm) {
      Taro.showLoading({ title: 'loading' });
      const data = await cancelAccounOrder({ id });
      if (data.data.code == 20000) {
        Taro.hideLoading();
        Taro.showToast({
          title: '订单已取消',
          icon: 'none'
        })
        this.componentDidShow()
      }
    }
  }



  // 日期转时间戳
  // getUnixTime(dateStr) {
  //   var newstr = dateStr.replace(/-/g, '/');
  //   var date = new Date(newstr);
  //   var time_str = date.getTime().toString();
  //   return time_str.substr(0, 10);
  // }
  /* 毫秒级倒计时 */
  count_down(expireTime) {
    var that = this;
    const Loadingtime = setInterval(() => {
      if (this.state.duringMs > 0) {
        var time = new Date(expireTime.replace(/-/g, '/'));
        // var b = 10; //分钟数
        // time.setMinutes(time.getMinutes() + b, time.getSeconds(), 1000);
        var duringMs = (time.getTime()) - (new Date()).getTime();
        var clock1 = that.date_format(duringMs);
        this.setState({ duringMs })
        // console.log(duringMs)
        // 渲染倒计时时钟
        if (duringMs > 0) {
          that.setState({
            clock: clock1
          });
        } else {
          that.setState({
            clock: "付款时间已截止，请重新下单"
          });
          return;
        }
      } else {
        clearInterval(this.state.Loadingtime)
      }
    }, 1000);
    this.setState({ Loadingtime })
  }


  /* 格式化倒计时 */
  date_format(second) {
    var s = Math.floor(second / 1000)
    var day = parseInt(s / 3600 / 24, 10)
    let h = parseInt(s / 3600);
    h = h % 24
    var min = parseInt(s / 60 % 60, 10);
    var sec = parseInt(s % 60, 10);
    min = this.add(min);
    sec = this.add(sec);
    let time = ""
    if (day > 0) {
      time = day + '天' + h + '时' + min + '分' + sec + '秒';
    } else {
      time = h + '时' + min + '分' + sec + '秒';
    }
    return time
  }
  /* 分秒位数补0 */
  add(num) {
    return num < 10 ? "0" + num : num
  }

  callphone() {
    Taro.makePhoneCall({
      phoneNumber: this.state.model.customerServiceMobile
    });
  }

  // 去支付
  async goPayMoney(id) {
    const res = await queryPayOrder(id)
    if (res.data.data.success) {
      Taro.showToast({
        title: '订单已支付',
        icon: 'none'
      })
      this.componentDidShow()
    } else {
      Taro.navigateTo({
        url: '../payment/payment?id=' + id + '&type=order'
      })
    }
  }

  // 显示客服弹窗
  showservice() {
    this.setState({ iswechat: true })
  }
  hidewechat() {
    this.setState({ iswechat: false })
  }
  // 隐藏二维码弹窗
  hidecode() {
    this.setState({ qrcode: false })
  }
  // 客服微信
  async getwechat() {
    Taro.showLoading()
    const res = await wechatservice(this.state.model.storeId)
    Taro.hideLoading()
    const wxQrcode = res.data.data.wxQrcode
    if (wxQrcode) {
      this.setState({ wxQrcode, qrcode: true })
    } else {
      Taro.showToast({
        title: '商家未配置客服微信，请电话联系',
        icon: 'none'
      })
    }
  }
  // 客服电话
  openphone() {
    Taro.makePhoneCall({
      phoneNumber: this.state.model.customerServiceMobile
    });
  }
  // 下载客服微信
  downloadImg() {
    let { imageurl, wxQrcode } = this.state
    let url = imageurl + wxQrcode
    Taro.downloadFile({
      url: url,
      success: function (res) {
        let path = res.tempFilePath
        Taro.saveImageToPhotosAlbum({
          filePath: path,
          success(res) {
            console.log(res)
            Taro.showToast({
              title: '下载成功',
              icon: 'success'
            })
          },
          fail(res) {
            Taro.showToast({
              title: '下载失败，请重新下载',
              icon: 'none'
            })
          },
          complete(res) {
          }
        })
      }, fail: function (res) {
      }
    })
  }

  // 点击图片预览
  previewImg(e) {
    console.log(e)
    var imagelist = [];
    var index = e.currentTarget.dataset.index;
    var imgArr = this.state.model.storeImageRemark;
    var imageurl = this.state.imageurl
    // var imgArr = data
    imgArr.forEach(item => {
      var img = imageurl + item
      imagelist.push(img);
    })
    console.log(imagelist)
    Taro.previewImage({
      current: imagelist[index],     //当前图片地址
      urls: imagelist             //所有要预览的图片的地址集合 数组形式
    })
  }


  // 订单状态：status=>(-3,"拒绝退款")   REFUND(-2, "已退款"),CANCEL(-1, "已取消"), PAY(0, "待支付"), UN_DELIVER(1, "待发货"), 
  //                  DELIVER(2, "已发货"),RECEIVED(3, "已收货"),RETURN_ING(4, "退货中"), EXCHANGE_ING(5, "换货中"),
  //                  REFUND_ING(6, "退款中"), SOME_DELIVER(7,"部分发货"), FINISH(10, "已完成");

  // 支付状态：payStatus=> NEW(1, "未支付"), FAIL(-1, "失败"), ONGOING(2, "进行中"), SUCCESS(3, "交易成功")

  render() {
    let model: any = this.state.model;
    let { invoiceStatus, iswechat, qrcode, wxQrcode, imageurl, clock } = this.$router.params
    return (
      <Block>
        {/* 客服弹窗 */}
        {iswechat && (
          <View className='modelNum'>
            <View className='modelopa' onClick={this.hidewechat}></View>
            <View className='modelContent'>
              <View className='modelRow' onClick={this.getwechat}>
                <Image src='../../images/item/WeChat.png'></Image>
                <Text>客服微信</Text>
              </View>
              <View className='modelRow' onClick={this.openphone}>
                <Image src='../../images/item/phoneservice.png'></Image>
                <Text>客服电话</Text>
              </View>
            </View>
          </View>
        )}
        {/* 客服微信二维码弹窗 */}
        {qrcode && (
          <View className='modelwechat'>
            <View className='modelopa'></View>
            <View className='wechatcontent'>
              <Image src='../../images/item/delete.png' onClick={this.hidecode}></Image>
              <Image src={imageurl + wxQrcode}></Image>
              <View onClick={this.downloadImg}><Text>下载二维码</Text></View>
            </View>
          </View>
        )}
        {model.storeRemark && (
          <View className='tips'>
            {/* <View className='qcfont qc-icon-qianbao'></View> */}
            <View>备注:{model.storeRemark}</View>
            <View style='display:flex;margin-top:5rpx'>
              {model.storeImageRemark && (
                <Block>
                  {model.storeImageRemark.map((img, index) => {
                    return (
                      <View className='imgList'>
                        <View className='imgList-li'>
                          <Image className='img' src={imageurl + img} data-index={index} onClick={(e) => { this.previewImg(e) }}></Image>
                        </View>
                      </View>
                    )
                  })}
                </Block>
              )}
            </View>
          </View>
        )}
        <View className="product-confirm">
          <View className="orderno">
            <View>
              订单号：{model.orderNo}
              {model.isAccounPeriod && (
                <Text className="charge">账期结算({model.accounPeriod}天)</Text>
              )}
            </View>
            {/* {model.evaluateStatus == 2 ? (
            <View>{model.payStatusName}</View>
          ) : (
              <View>{model.statusName}</View>
            )} */}

            {model.evaluateStatus == 2 ? (
              <View>{model.payStatusName}</View>
            ) : (
                <Block>
                  {model.isSupplementary ? (
                    <Block>
                      {model.status == -1 ? (
                        <View>{model.statusName}</View>
                      ) : (
                          <Block>
                            {model.supplementStatus == 1 ? (
                              <Text className="order-form-name-p">{model.statusName}</Text>
                            ) : (
                                <Text className="order-form-name-p">{model.supplementStatusName}</Text>
                              )}
                          </Block>
                        )}
                    </Block>
                  ) : (
                      <View>{model.statusName}</View>
                    )}
                </Block>
              )}
          </View>
          {model.deliveryWay != 'takeout' && (
            <View className="address-wrap">
              <Image
                className="address-wrap-img"
                src="../../images/item/address.png"
              ></Image>
              <View className="address-wrap__info">
                <View className="address-wrap__user">
                  <Text className="name">{model.receiver}</Text>
                  <Text className="phone">{model.mobile}</Text>
                </View>
                <View className="address-wrap__add">{model.address}</View>
              </View>
            </View>
          )}


          <View className="">
            <View className="content">
              <View className="store-name" onClick={() => { Taro.navigateTo({ url: '../../pagesCommon/wholesaler/wholesaler?storeId=' + model.storeId }) }}>{model.storeName}</View>
              {model.orderItems &&
                model.orderItems.map(item => {
                  return (
                    <View className="order-store" key={item.id} >
                      <Image
                        className="order-store-img"
                        src={IMG_HOST + item.iconUrl}
                        onClick={() => { Taro.navigateTo, navigateTo({ url: '../../pagesCommon/goods/goods-detail?id=' + item.productId + '&storeId=' + item.storeId }) }}
                      ></Image>
                      <View className="order-store-name">
                        <View className="order-content">
                          <Text className="order-store-name-t">{item.name}</Text>
                          <View className="order-store-price">
                            <Text className="order-store-price-p">
                              ￥{toPriceYuan(item.price)}
                            </Text>
                            <Text className="order-store-price-n">
                              x{item.qty}{item.unit}
                            </Text>
                          </View>
                        </View>

                        <View className="apply">
                          <Text className="order-store-name-g">{item.specs}</Text>
                          {model.payStatus != 1 && (
                            <Block>
                              {model.payStatus == 3 && (
                                <Block>
                                  {item.refundStatus ? (
                                    <Text className="order-store-name-button">
                                      {
                                        {
                                          finish: "退款完成",
                                          ongoing: "退款进行中"
                                        }[item.refundStatus]
                                      }
                                    </Text>
                                  ) : (
                                      <Text className="order-store-name-button order-store-name-button--ing"
                                        onClick={() => {
                                          Taro.navigateTo({
                                            url: `../apply-draw/apply-draw?id=${
                                              model.id
                                              }&product=${JSON.stringify(item)}&orderNo=${model.orderNo}`
                                          });
                                        }}
                                      >申请退款</Text>
                                    )}
                                </Block>
                              )}
                            </Block>
                          )}
                        </View>

                      </View>
                    </View>
                  );
                })}
            </View>
            {/* 配送方式 */}
            {model.deliveryWay == 'platformsend' && (
              <View className="totalprice">
                <View className="dist nobor">
                  <Text className="dist-title">配送方式</Text>
                  <Text>丰盈配送</Text>
                </View>
                <View className="dist">
                  <Text className="dist-title">配送时间</Text>
                  <Text>{model.expectDeliveryTime}</Text>
                </View>
                <View className="dist">
                  <Text className="dist-title">订单备注</Text>
                  <Text>{model.remark}</Text>
                </View>
              </View>
            )}
            {model.deliveryWay == 'takeout' && (
              <View className="totalprice">
                <View className="dist nobor">
                  <Text className="dist-title">配送方式</Text>
                  <Text>自提</Text>
                </View>
                <View className="dist">
                  <Text className="dist-title">自提地址</Text>
                  <Text>{model.selfTakeAddress}</Text>
                </View>
                <View className="dist">
                  <Text className="dist-title">自提时间</Text>
                  <Text>{model.expectDeliveryTime}</Text>
                </View>
                <View className="dist">
                  <Text className="dist-title">联系电话</Text>
                  <Text>{model.deliveryMobile}</Text>
                </View>
                <View className="dist">
                  <Text className="dist-title">订单备注</Text>
                  <Text>{model.remark}</Text>
                </View>
              </View>
            )}
            {model.deliveryWay == 'distribution' && (
              <View className="totalprice">
                <View className="dist nobor">
                  <Text className="dist-title">配送方式</Text>
                  <Text>店铺配送</Text>
                </View>
                <View className="dist">
                  <Text className="dist-title">配送时间</Text>
                  <Text>{model.expectDeliveryTime}</Text>
                </View>
                <View className="dist">
                  <Text className="dist-title">联系电话</Text>
                  <Text>{model.deliveryMobile}</Text>
                </View>
                <View className="dist">
                  <Text className="dist-title">订单备注</Text>
                  <Text>{model.remark}</Text>
                </View>
              </View>
            )}

            <View className="totalprice">
              <View className="dist nobor">
                <Text className="dist-title">商品金额</Text>
                <Text>￥{model.productAmount}</Text>
              </View>
              {model.transportAmount > 0 && (
                <View className="dist">
                  <Text>总物流服务费</Text>
                  <Text>+￥{model.transportAmount}</Text>
                </View>
              )}

              {model.transportDiscountAmount > 0 &&
                <View className="dist">
                  <Text>运费补贴</Text>
                  <Text>-￥{toPriceYuan(model.transportDiscountAmount)}</Text>
                </View>
              }
              {model.transportCouponAmount > 0 &&
                <View className="dist">
                  <Text>运费券</Text>
                  <Text>-￥{toPriceYuan(model.transportCouponAmount)}</Text>
                </View>
              }
              {model.storeCouponPayAmount > 0 && (
                <View className="dist">
                  <Text>档口优惠</Text>
                  <Text>-￥{model.storeCouponPayAmount}</Text>
                </View>
              )}
              {model.couponPayAmount > 0 && (
                <View className="dist">
                  <Text>平台优惠</Text>
                  <Text>-￥{model.couponPayAmount}</Text>
                </View>
              )}

            </View>
            <View className="totalprice">
              <View className="dist totals nobor">
                <Text>合计</Text>
                <Text>￥{model.needPayTotalAmount}</Text>
              </View>
            </View>
          </View>
          {model.status != -1 && (
            <Block>
              {model.payStatus == 1 ? (
                <Block>
                  {model.status == 0 && (
                    <View className="confirm-order">
                      {model.supplementStatus == 0 ? (
                        <Block>
                          {clock == '付款时间已截止，请重新下单' ? (
                            <View className="payment">
                              <Text style="color:#FF840B;"> {clock}</Text>
                            </View>
                          ) : (
                              <Block>
                                {model.isSupplementary ? (
                                  <View className="payment"> 等待商家确认补单，超时将自动取消<Text style="color:#FF840B;"> {clock}</Text>
                                  </View>
                                ) : (
                                    <View className="payment"> 请在倒计时内完成支付，超时将自动取消<Text style="color:#FF840B;"> {clock}</Text>
                                    </View>
                                  )}
                              </Block>
                            )}
                        </Block>
                      ) : (
                          <View className="payment"></View>
                        )}
                      {clock != '付款时间已截止，请重新下单' && (
                        <View className="btn">
                          <View onClick={() => { this.apiCancelOrder(model.id) }}>取消订单</View>
                          {!model.isSupplementary && (
                            <View onClick={() => { this.goPayMoney(model.id) }}>去支付</View>
                          )}
                          {(model.isSupplementary && model.supplementStatus == 1) && (
                            <View onClick={() => { this.goPayMoney(model.id) }}>去支付</View>
                          )}
                        </View>
                      )}
                    </View>
                  )}
                  {model.status == 1 && (
                    <View className="confirm-order">
                      <View className="payment"></View>
                      <View className="btn">
                        {model.isAccounPeriod && <View onClick={() => { this.apiCancelAccounOrder(model.id) }}>取消订单</View>}
                        <View onClick={() => { Taro.navigateTo({ url: '../../pagesCommon/outstanding/outstanding' }) }}>去支付</View>
                      </View>
                    </View>
                  )}
                  {model.status == 2 && (
                    <View className="confirm-order">
                      <View className="payment"></View>
                      <View className="btn">
                        {model.deliveryWay == 'platformsend' && (
                          <View onClick={() => { Taro.navigateTo({ url: '../information/information?id=' + model.id }) }}>查看配送信息</View>
                        )}
                        {/* onClick={() => { this.goPayMoney(model.id) }} */}
                        <View onClick={() => { Taro.navigateTo({ url: '../../pagesCommon/outstanding/outstanding' }) }}>去支付</View>
                      </View>
                    </View>
                  )}
                  {model.status == 10 && (
                    <View className="confirm-order">
                      <View className="payment"></View>
                      <View className="btn">
                        <View onClick={() => { Taro.navigateTo({ url: '../../pagesCommon/outstanding/outstanding' }) }}>去支付</View>
                        <View
                          onClick={() => {
                            Taro.navigateTo({ url: "../grade/grade?orderItems=" + JSON.stringify(model.orderItems) + '&storeId=' + model.id });
                          }}>评分</View>
                      </View>
                    </View>
                  )}

                </Block>
              ) : (
                  <Block>
                    {model.status == 2 && (
                      <Block>
                        {model.payStatus == 3 && (
                          <View className="confirm-order">
                            <View className="payment"></View>
                            <View className="btn">
                              {model.deliveryWay == 'platformsend' && (
                                <View onClick={() => { Taro.navigateTo({ url: '../information/information?id=' + model.id }) }}>查看配送信息</View>
                              )}

                              <View onClick={() => { this.getConfirm(model.id) }}>确认收货</View>
                            </View>
                          </View>
                        )}
                      </Block>
                    )}
                    {model.status == 10 && (
                      <Block>
                        {model.evaluateStatus != 2 && (
                          <View className="confirm-order">
                            <View className="payment"></View>
                            <View className="btn">
                              {invoiceStatus && (
                                <Block>
                                  {invoiceStatus == 'not_apply' && (
                                    <View onClick={() => { Taro.navigateTo({ url: '../invoice/invoice?orderId=' + model.id + '&type=1' }) }}>开具发票</View>
                                  )}
                                  {invoiceStatus == 'finish' && (
                                    <View onClick={() => { Taro.navigateTo({ url: '../invoice/invoice?orderId=' + model.id + '&type=2' }) }}>已开票</View>
                                  )}
                                  {invoiceStatus == 'apply' && (
                                    <View onClick={() => { Taro.navigateTo({ url: '../invoice/invoice?orderId=' + model.id + '&type=2' }) }}>申请开票中</View>
                                  )}
                                </Block>

                              )}
                              <View
                                onClick={() => {
                                  Taro.navigateTo({ url: "../grade/grade?orderItems=" + JSON.stringify(model.orderItems) + '&storeId=' + model.id });
                                }}>评分</View>
                            </View>
                          </View>
                        )}
                      </Block>
                    )}
                  </Block>
                )}
            </Block>
          )}

          <View className="server" onClick={this.showservice}>
            <Image src="../../images/item/server.png"></Image>
          </View>
        </View>
      </Block>
    );
  }
}
