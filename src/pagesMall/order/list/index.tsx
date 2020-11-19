// import Taro, { useState, useEffect, useReachBottom } from "@tarojs/taro";
import Taro, { Component, Config } from "@tarojs/taro";
import { View, Text, Image, ScrollView, Block } from "@tarojs/components";
import { QcEmptyPage } from "@/components/common";
import { pageOrder, cancelOrder, cancelAccounOrder, confirmOrder, finishOrder, queryPayOrder } from "@/api/order";
import { toPriceYuan } from "@/utils/format";
import { IMG_HOST } from "@/config";
import "./index.scss";
let app = Taro.getApp()


export default class Index extends Component {
  state = {
    tabList: [
      { title: "全部", id: -1 },
      { title: "待付款", id: 0 },
      { title: "待发货", id: 1 },
      { title: "配送中", id: 2 },
      { title: "待评分", id: 10 }
    ],
    total: '',
    status: -1,
    pageNum: 1,
    orderList: [],
    loading: false
  }
  config: Config = {
    navigationBarTitleText: "我的订单"
  };
  componentWillUnmount() {
    Taro.switchTab({
      url: '/pages/personal/index'
    })
    Taro.removeStorageSync('detailData')
  }
  componentDidShow() {
    const detailData = Taro.getStorageSync('detailData')
    console.log(detailData)
    const { orderList } = this.state
    orderList.map(item => {
      if (item.id == detailData.id) {
        item.status = detailData.status
        item.statusName = detailData.statusName
        item.supplementStatusName = detailData.supplementStatusName
      }
    })
    this.setState({ orderList })
  }
  componentDidMount() {
    let status = ''
    if (app.globalData.type) {
      status = app.globalData.type
    } else {
      status = this.$router.params.type
    }
    // let status = this.$router.params.type
    if (status) {
      status = status
      this.setState({ status })
    } else {
      status = this.state.status
      this.setState({ status: status })
    }
    // let status = this.$router.params.type
    // console.log(this.$router.params.detail)
    // this.setState({ status })
    Taro.showLoading({ title: '' })
    this.setState({ orderList: [], pageNum: 1, loading: false })
    this.getorder(1, status)
    app.globalData.type = ''
  }

  getorder = async (pageNum, status) => {
    if (status == 10) {
      var params = { pageNum: pageNum, pageSize: 15, status: status == '-1' ? '' : status, evaluateStatus: 0 }
    } else {
      var params = { pageNum: pageNum, pageSize: 15, status: status == '-1' ? '' : status }
    }
    pageOrder(params).then(res => {
      this.setState({ loading: true })
      Taro.hideLoading()
      if (res.data.code == 20000) {
        const total = res.data.data.total
        const list = res.data.data.list
        const orderList = this.state.orderList
        let coupontotal = 0
        list.map(item => {
          coupontotal = item.couponPayAmount + item.storeCouponPayAmount
          item.coupontotal = coupontotal
          item.totalAmount = item.totalAmount - item.coupontotal
          orderList.push(item)
        })
        this.setState({ orderList, total })
      }
    })
  }
  onReachBottom() {
    this.state.pageNum++
    this.getorder(this.state.pageNum, this.state.status)
  }
  // 切换title
  swichSwiperItem(e) {
    Taro.showLoading({ title: '' })
    const status = e.currentTarget.dataset.id
    this.setState({ loading: false, pageNum: 1, status, orderList: [] })
    this.getorder(1, status)
  }
  // 取消订单
  async apiCancelOrder(id: string) {
    const res = await Taro.showModal({
      title: '提示',
      content: '是否取消该订单？'
    });
    if (res.confirm) {
      Taro.showLoading();
      await cancelOrder({ id });
      Taro.hideLoading();
      this.setState({ orderList: [] })
      this.getorder(1, this.state.status)
    }
  }
  // 取消账期订单
  async apiCancelAccounOrder(id: string) {
    const res = await Taro.showModal({
      title: '提示',
      content: '是否取消该订单？'
    });
    if (res.confirm) {
      Taro.showLoading();
      await cancelAccounOrder({ id });
      Taro.hideLoading();
      this.setState({ orderList: [] })
      this.getorder(1, this.state.status)
    }
  }
  // 确认收货
  async getConfirm(id: string) {
    const res = await Taro.showModal({
      title: '提示',
      content: '是否确认收货？'
    });
    if (res.confirm) {
      Taro.showLoading();
      const res = await confirmOrder(id);
      Taro.hideLoading();
      if (res.data.code == 20000) {
        // await finishOrder(id)
        this.setState({ orderList: [] })
        this.getorder(1, this.state.status)
      }
    }
  }
  // 去支付
  async goPayMoney(id) {
    const res = await queryPayOrder(id)
    if (res.data.data.success) {
      Taro.showToast({
        title: '订单已支付',
        icon: 'none'
      })
      this.getorder(1, this.state.status)
    } else {
      Taro.navigateTo({
        url: '../../payment/payment?id=' + id + '&type=order'
      })
    }
  }

  // 查看配送信息
  getshipping(id) {
    Taro.navigateTo({
      url: '../../information/information?id=' + id
    })
  }


  // 丰盈配送显示配送信息
  render() {
    const { orderList, loading, status, tabList, total } = this.state
    return (
      <View>
        <ScrollView scroll-x='true' className="nav-header-view" scroll-into-view="{{curSwiperIdx=='5'?'listReturn':''}}">
          {tabList.map(item => {
            return (
              <View className={item.id == status ? 'show-border-bottom  header-col-view ' : 'header-col-view '} data-id={item.id} onClick={this.swichSwiperItem}>
                {/* {item.id == status ? (
                  <Text data-idx='0'>{item.title}({total})</Text>
                ) : ( */}
                <Text data-idx='0'>{item.title}</Text>
                {/* )} */}
              </View>
            )
          })}
        </ScrollView>

        {loading && (
          <Block>
            {orderList.length > 0 ? (
              <View style='margin-top:90rpx'>
                {orderList.map(item => {
                  return (
                    <View className="order-form" key={item.id}>
                      <View className="order-form-name">
                        <View className='order-form-name-create'>
                          <Text className="order-form-name-create-n">
                            {item.storeName}
                            {item.isSupplementary && (
                              <Text className="replace">补单</Text>
                            )}
                            {item.isAccounPeriod && (
                              <Text className="name-charge">账期结算({item.accounPeriod}天)</Text>
                            )}
                          </Text>
                          {item.evaluateStatus == 2 ? (
                            <Text className="order-form-name-create-p">{item.payStatusName}</Text>
                          ) : (
                              <Block>
                                {item.isSupplementary ? (
                                  <Block>
                                    {item.status == -1 ? (
                                      <Text className="order-form-name-create-p">{item.statusName}</Text>
                                    ) : (
                                        <Block>
                                          {item.supplementStatus == 1 ? (
                                            <Text className="order-form-name-create-p">{item.statusName}</Text>
                                          ) : (
                                              <Text className="order-form-name-create-p">{item.supplementStatusName}</Text>
                                            )}
                                        </Block>
                                      )}
                                  </Block>
                                ) : (
                                    <Text className="order-form-name-create-p">{item.statusName}</Text>
                                  )}
                              </Block>
                            )}
                        </View>
                        <View className='order-form-name-time'>{item.createTime}</View>
                      </View>
                      <View>
                        {item.orderItems && (
                          <Block>
                            {item.orderItems.map((product, index) => {
                              return (
                                <View className="order-store" data-status={status} key={String(index)}
                                  onClick={() => {
                                    Taro.navigateTo({
                                      url: `../../order-detail/order-detail?id=${item.id}&type=${status}&invoiceStatus=${item.invoiceStatus || ''}`
                                    });
                                  }}>
                                  <Image
                                    className="order-store-img"
                                    src={IMG_HOST + product.iconUrl}
                                  ></Image>
                                  <View className="order-store-name">
                                    <Text className="order-store-name-t">
                                      {product.name}
                                    </Text>
                                    <Text className="order-store-name-g">
                                      {product.specs}
                                    </Text>
                                  </View>
                                  <View className="order-store-price">
                                    <Text className="order-store-price-p">
                                      ￥{toPriceYuan(product.price)}
                                    </Text>
                                    <Text className="order-store-price-n">
                                      x{product.qty}{product.unit}
                                    </Text>
                                  </View>
                                </View>
                              )
                            })}
                          </Block>
                        )}
                      </View>
                      <View className="heji">
                        <Text>共{item.orderItems.length}件</Text>
                        {Number(item.transportAmount) > 0 && (
                          <Text>物流费:￥{toPriceYuan(item.transportAmount)}</Text>
                        )}
                        {/* {Number(item.transportCouponAmount) > 0 && (
                          <Text>运费券:￥{toPriceYuan(item.transportCouponAmount)}</Text>
                        )} */}
                        {Number((item.storeCouponPayAmount + item.couponPayAmount)) > 0 && (
                          <Text>其他优惠:￥{toPriceYuan(item.storeCouponPayAmount + item.couponPayAmount + item.transportCouponAmount + item.transportDiscountAmount)}</Text>
                        )}

                        {item.needPayTotalAmount > 0 ? (
                          <Text>合计:￥{toPriceYuan(item.needPayTotalAmount)} </Text>
                        ) : (
                            <Text>合计:￥0.00 </Text>
                          )}

                        {/* <Text>优惠券:￥{toPriceYuan(item.coupontotal)} </Text> */}
                        {/* {(item.payStatus == 2 || item.payStatus == 3) && (
                          <Block>
                            {item.status != 0 && (
                              <Text>支付:￥{toPriceYuan(item.cashPayAmount)}</Text>
                            )}
                          </Block>
                        )} */}
                      </View>

                      {/* 订单状态：status=>REFUND(-2, "已退款"),CANCEL(-1, "已取消"), PAY(0, "待支付"), UN_DELIVER(1, "待发货"), DELIVER(2, "已发货"),
                RECEIVED(3, "已收货"),RETURN_ING(4, "退货中"), EXCHANGE_ING(5, "换货中"), REFUND_ING(6, "退款中"), SOME_DELIVER(7,"部分发货"), 
                FINISH(10, "已完成");
支付状态：payStatus=> NEW(0，"取消订单"),(1, "未支付"), FAIL(-1, "失败"), ONGOING(2, "进行中"), SUCCESS(3, "交易成功") */}
                      {/* evaluateStatus 评价状态，-1： 关闭评价；0：未评价；1： 部分评价； 2：已评价 */}

                      {item.status != -1 && (
                        <Block>
                          {item.payStatus == 1 ? (//没支付
                            <Block>
                              {item.status == 2 ? (//没支付已发货
                                <View className="butn">
                                  <Text className="tips"></Text>
                                  <View className="btn">
                                    {item.deliveryWay == 'platformsend' && (
                                      <Text onClick={() => { this.getshipping(item.id) }}>查看配送信息</Text>
                                    )}
                                    <Text className='btn-two' onClick={() => { Taro.navigateTo({ url: '../../../pagesCommon/outstanding/outstanding' }) }}>去支付</Text>
                                    <Text onClick={() => { this.getConfirm(item.id) }}>确认收货</Text>
                                  </View>
                                </View>
                              ) : (
                                  <Block>
                                    {(item.status == 1 || item.status == 0) ? (//没支付没发货
                                      <Block>
                                        {(item.status == 0) && (
                                          <View className="butn">
                                            {item.isAccounPeriod ? (
                                              <Text className="tips">避免过账期期限，请尽快支付货款</Text>
                                            ) : (
                                                <Text className="tips"></Text>
                                              )}
                                            <View className="btn">
                                              {item.status == 0 && (
                                                <Text onClick={() => { this.apiCancelOrder(item.id) }}>取消订单</Text>
                                              )}
                                              {!item.isSupplementary && (//是否补单未确认
                                                <Text onClick={() => { this.goPayMoney(item.id) }}>去支付</Text>
                                              )}
                                              {(item.isSupplementary && item.supplementStatus == 1) && (//是否补单已确认
                                                <Text onClick={() => { this.goPayMoney(item.id) }}>去支付</Text>
                                              )}
                                            </View>
                                          </View>
                                        )}
                                        {item.status == 1 && (
                                          <View className="butn">
                                            {item.isAccounPeriod ? (
                                              <Text className="tips">避免过账期期限，请尽快支付货款</Text>
                                            ) : (
                                                <Text className="tips"></Text>
                                              )}
                                            <View className="btn">
                                              {item.isAccounPeriod && <Text onClick={() => { this.apiCancelAccounOrder(item.id) }}>取消订单</Text>}
                                              {item.status == 0 && (
                                                <Text onClick={() => { this.apiCancelOrder(item.id) }}>取消订单</Text>
                                              )}
                                              <Text onClick={() => { Taro.navigateTo({ url: '../../../pagesCommon/outstanding/outstanding' }) }}>去支付</Text>
                                            </View>
                                          </View>
                                        )}
                                      </Block>
                                    ) : (
                                        <View className="butn">
                                          {item.isAccounPeriod && (
                                            <Text className="tips">避免过账期期限，请尽快支付货款</Text>
                                          )}
                                          <View className="btn">
                                            {item.status == 10 ? (
                                              <Block>
                                                <Text className='btn-two' onClick={() => { Taro.navigateTo({ url: '../../../pagesCommon/outstanding/outstanding' }) }}>去支付</Text>
                                                <Text onClick={() => {
                                                  Taro.navigateTo({ url: "../../grade/grade?orderItems=" + JSON.stringify(item.orderItems) + '&storeId=' + item.id });
                                                }}>评分</Text>
                                              </Block>
                                            ) : (
                                                <Block>
                                                  {item.status == 3 ? (
                                                    <Text onClick={() => { Taro.navigateTo({ url: '../../../pagesCommon/outstanding/outstanding' }) }}>去支付</Text>
                                                  ) : (
                                                      <Text onClick={() => { this.goPayMoney(item.id) }}>去支付</Text>
                                                    )}
                                                </Block>

                                              )}

                                          </View>
                                        </View>
                                      )}
                                  </Block>
                                )}
                            </Block>
                          ) : (
                              <Block>
                                {item.payStatus == 3 && (
                                  <Block>
                                    {item.status == 10 && (
                                      <Block>
                                        {item.evaluateStatus != 2 && (
                                          <View className="butn">
                                            <Text className="tips"></Text>
                                            <View className="btn">
                                              {(item.isOrderInvoice || item.invoiceStatus == 'finish' || item.invoiceStatus == 'apply') && (
                                                <Block>
                                                  {item.invoiceStatus == 'not_apply' && (
                                                    <Text onClick={() => { Taro.navigateTo({ url: '../../invoice/invoice?orderId=' + item.id + '&type=1' }) }}>开具发票</Text>
                                                  )}
                                                  {item.invoiceStatus == 'finish' && (
                                                    <Text onClick={() => {
                                                      let invoiceData = {
                                                        invoiceName: item.invoiceName,
                                                        email: item.email,
                                                        taxNumber: item.taxNumber,
                                                        invoiceType: item.taxNumber ? 'business' : 'person'
                                                      }
                                                      Taro.navigateTo({ url: '../../invoice/invoice?orderId=' + item.id + '&type=2&invoiceData=' + JSON.stringify(invoiceData) })
                                                    }}>已开票</Text>
                                                  )}
                                                  {item.invoiceStatus == 'apply' && (
                                                    <Text onClick={() => {
                                                      let invoiceData = {
                                                        invoiceName: item.invoiceName,
                                                        email: item.email,
                                                        taxNumber: item.taxNumber,
                                                        invoiceType: item.taxNumber ? 'business' : 'person'
                                                      }
                                                      Taro.navigateTo({ url: '../../invoice/invoice?orderId=' + item.id + '&type=2&invoiceData=' + JSON.stringify(invoiceData) })
                                                    }}>申请开票中</Text>
                                                  )}
                                                </Block>

                                              )}
                                              <Text onClick={() => {
                                                Taro.navigateTo({ url: "../../grade/grade?orderItems=" + JSON.stringify(item.orderItems) + '&storeId=' + item.id });
                                              }}>评分</Text>
                                            </View>
                                          </View>
                                        )}
                                      </Block>

                                    )}
                                    {item.status == 2 && (
                                      <View className="butn">
                                        <Text className="tips"></Text>
                                        <View className="btn">
                                          {item.deliveryWay == 'platformsend' && (
                                            <Text onClick={() => { this.getshipping(item.id) }}>查看配送信息</Text>
                                          )}

                                          <Text onClick={() => { this.getConfirm(item.id) }}>确认收货</Text>
                                        </View>
                                      </View>
                                    )}
                                  </Block>
                                )}

                                {/* {item.status == -2 && (
                            <View className="butn">
                              <Text className="tips"></Text>
                              <View className="btn">
                                <Text onClick={() => { againBuy(item.id, item.storeId) }}>再次购买</Text>
                              </View>
                            </View>
                          )} */}
                              </Block>
                            )}
                        </Block>
                      )}
                    </View>
                  );
                })}
              </View>
            ) : (
                <QcEmptyPage icon="order"></QcEmptyPage>
              )}
          </Block>
        )}
      </View>
    );
  }
}

