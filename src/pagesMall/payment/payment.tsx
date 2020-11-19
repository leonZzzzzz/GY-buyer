import Taro, { Component, Config } from "@tarojs/taro";
import {
  Block,
  View,
  Text,
  Image,
  Checkbox,
  CheckboxGroup
} from "@tarojs/components";
import { AtInput, AtList, AtListItem, AtIcon, AtButton, AtToast } from "taro-ui"
import "./payment.scss";
import { getOrderCreate, advancePay, wechatPay, orderListPay, remaining, productInfo } from "@/api/order"

export default class Index extends Component {
  // componentDidShow() {
  //   this.setState({ showPayPwdInput: false })
  // }
  componentWillUnmount() {
    Taro.switchTab({
      url: '../../pages/cart/index.scss'
    })
  }
  componentDidMount() {
    Taro.removeStorageSync('address')
    let { id, type, params } = this.$router.params
    if (type == 'order') {
      this.setState({ type })
      Taro.showLoading()
      this.orderpay(id)
    } else {
      params = JSON.parse(params)
      this.getpayment(params)
    }
  }


  // 正常提交订单支付
  getpayment = async (params) => {
    // const res = await getOrderCreate(params)
    // Taro.hideLoading()
    // let { checkoutList, supplementaryCheckoutList, needPayAmount, orderToken, walletAmount } = res.data.data
    let { checkoutList, supplementaryCheckoutList, needPayAmount, orderToken, walletAmount } = params
    let suppletotal = 0
    if (supplementaryCheckoutList.length > 0) {
      supplementaryCheckoutList.map(item => {
        suppletotal += item.needPayAmount
      })
    }
    // 应付金额-接单时间外订单金额
    needPayAmount = Number(needPayAmount - suppletotal)
    console.log(needPayAmount)
    needPayAmount = parseFloat(needPayAmount / 100).toFixed(2)
    walletAmount = parseFloat(walletAmount / 100).toFixed(2)
    let totalMoney = 0
    const support = [], nonsupport = []
    checkoutList.map(item => {
      item.newmoney = parseFloat(item.needPayAmount / 100).toFixed(2)
      totalMoney += item.needPayAmount
      item.checked = false
      if (item.debtAllowed) {
        support.push(item)
      } else {
        nonsupport.push(item)
      }
    })
    supplementaryCheckoutList.map(item => {
      item.newmoney = parseFloat(item.needPayAmount / 100).toFixed(2)
      // totalMoney += item.needPayAmount
    })
    this.setState({ walletAmount, support, nonsupport, checkoutList, supplementaryCheckoutList, needPayAmount, orderToken, totalMoney, totalAmount: parseFloat(totalMoney / 100).toFixed(2) })

  }
  // 订单列表支付
  orderpay = async (id) => {
    const res = await orderListPay(id)
    Taro.hideLoading()
    let { checkoutList, needPayAmount, orderToken, walletAmount } = res.data.data
    needPayAmount = parseFloat(needPayAmount / 100).toFixed(2)
    walletAmount = parseFloat(walletAmount / 100).toFixed(2)
    let totalMoney = 0
    const support = [], nonsupport = []
    checkoutList.map(item => {
      item.newmoney = parseFloat(item.needPayAmount / 100).toFixed(2)
      totalMoney += item.needPayAmount
      item.checked = false
      if (item.debtAllowed) {
        support.push(item)
      } else {
        nonsupport.push(item)
      }
    })
    this.setState({ walletAmount, support, nonsupport, checkoutList, needPayAmount, orderToken, totalMoney, totalAmount: parseFloat(totalMoney / 100).toFixed(2) })
  }

  CheckboxGroup(e) {
    const values = e.detail.value
    const { checkoutList, supplementaryCheckoutList, needPayAmount } = this.state
    let toMoney = 0, outmoney = 0
    if (values.length > 0) {
      values.map(list => {
        checkoutList.map(item => {
          if (list == item.orderId) {
            console.log(item.needPayAmount)
            item.checked = true
            outmoney += item.needPayAmount
          } else {
            // item.checked = false
            // console.log(item.needPayAmount)
            // toMoney += item.needPayAmount
          }
        })
      })
      console.log(needPayAmount, outmoney / 100)
      toMoney = Number(needPayAmount) - Number(outmoney / 100)
      toMoney = parseFloat(toMoney).toFixed(2)
      console.log('yes', toMoney)
    } else {
      checkoutList.map(item => {
        item.checked = false
      })
      toMoney = needPayAmount
      console.log('no', toMoney)
    }
    if (supplementaryCheckoutList.length > 0) {
      supplementaryCheckoutList.map(item => {
        item.newmoney = parseFloat(item.needPayAmount / 100).toFixed(2)
      })
    }
    console.log(checkoutList)
    this.setState({ checkoutList, totalAmount: toMoney })
  }
  // 支付方式
  singlechange(e) {

    this.setState({ payChannel: e.detail.value })
  }
  // 去支付
  async gopay() {
    this.setState({ btnshow: false })
    Taro.showLoading()
    const { orderToken, payChannel, checkoutList, supplementaryCheckoutList, type, totalAmount, walletAmount } = this.state
    if (payChannel == 'wallet') {
      this.setState({ btnshow: true })
      Taro.hideLoading()
      if (Number(totalAmount) > Number(walletAmount)) {
        Taro.showToast({
          title: '余额不足，请选择其他支付方式',
          icon: 'none'
        })
        return
      } else {
        this.setState({
          showPayPwdInput: true
        })
      }
    } else {
      this.advancePay(orderToken, '')
    }
  }
  advancePay = async (orderToken, walletToken) => {
    const { payChannel, checkoutList, supplementaryCheckoutList, type } = this.state
    let debtOrderIds = '', ordinaryOrderIds = '', outBusinessOrderIds = '';
    if (!payChannel) {
      Taro.showToast({
        title: '请选择支付方式',
        icon: 'none'
      })
      return
    }
    checkoutList.map(item => {
      if (item.checked) {
        debtOrderIds += item.orderId + ','//账期订单
      } else {
        ordinaryOrderIds += item.orderId + ','//普通订单
      }

    })
    ordinaryOrderIds = ordinaryOrderIds.slice(0, -1)
    debtOrderIds = debtOrderIds.slice(0, -1)
    let params = {}
    if (type == 'order') {
      params = { orderToken, payChannel, ordinaryOrderIds, accounPeriodOrderIds: debtOrderIds, walletToken: walletToken }
    } else {
      supplementaryCheckoutList.map(item => {
        outBusinessOrderIds += item.orderId//补单订单
      })
      params = {
        orderToken, payChannel, ordinaryOrderIds, accounPeriodOrderIds: debtOrderIds, supplementOrderIds: outBusinessOrderIds, walletToken: walletToken
      }
    }

    const res = await advancePay(params)
    Taro.hideLoading()
    const { totalAmount, walletAmount } = this.state
    if (res.data.code == 20000) {
      this.setState({ btnshow: false })
      if (totalAmount == '0.00') {
        if (supplementaryCheckoutList.length > 0) {
          if (checkoutList.length == 0) {
            console.log(111)
            Taro.redirectTo({
              url: '../pay-for/pay-for?type=checkout'
            })
          } else {
            console.log(222)
            Taro.redirectTo({
              url: '../pay-for/pay-for?amount=' + totalAmount + '&type=aunnal'
            })
          }
        } else {
          console.log(333)
          Taro.redirectTo({
            url: '../pay-for/pay-for?amount=' + totalAmount + '&type=aunnal'
          })
        }
        return
      } else {
        if (res.data.data.needPay) {
          this.payfor(res.data.data.payId)
        } else {
          if (parseInt(walletAmount * 100) > parseInt(totalAmount * 100)) {
            Taro.redirectTo({
              url: '../pay-for/pay-for?amount=' + totalAmount
            })
          }
        }
      }
    } else {
      this.setState({ orderToken: res.data.data.orderToken })
    }
  }
  payfor = async (payId) => {
    const pay = await wechatPay(payId)
    const payData = pay.data.data
    const arr = {
      'timeStamp': payData.timeStamp,
      'nonceStr': payData.nonceString,
      'package': payData.pack,
      'signType': payData.signType,
      'paySign': payData.paySign
    }
    const { totalAmount } = this.state
    var obj = Object.assign({
      success: res => this._onPaySuccess(res, totalAmount),
      fail: err => this._onPayFail(err)
    }, arr);
    Taro.requestPayment(obj)
  }
  // 支付成功
  _onPaySuccess(res, totalAmount) {
    if (res.errMsg == 'requestPayment:ok') {
      Taro.redirectTo({
        url: '../pay-for/pay-for?amount=' + totalAmount
      })
    }
  }
  // 支付失败
  _onPayFail(err) {
    let isCancel = false
    if (err && err.errMsg == "requestPayment:fail cancel") isCancel = true;
    Taro.showModal({
      title: isCancel ? '取消支付' : '支付失败',
      content: isCancel ? '您已取消支付，请到订单列表里重新支付' : '订单支付失败，请到订单列表里重新支付',
      // cancelColor: '#FF0000',
      showCancel: false,
      confirmText: '好的',
      success: function (res) {
        Taro.redirectTo({
          url: '../order/list/index',
        })
      },
    });
  }

  closeClick = () => {
    this.setState({
      showPayPwdInput: false
    })
  }
  // 检验密码 输完6位数字密码时候调用
  hidePayLayer = async () => {
    let val = this.state.pwdVal
    this.setState({
      showPayPwdInput: false,
      pwdVal: ''
    }, () => {
      this.password(val)
    })
  }
  // 密码接口
  password = async (val) => {
    const res = await remaining(val)
    if (res.data.code == 20000) {
      const walletToken = res.data.data.walletToken
      this.setState({ walletToken })
      this.advancePay(this.state.orderToken, walletToken)
    }
  }
  // 密码输入
  inputPwd = (e) => {
    this.setState({
      pwdVal: e.detail.value
    }, () => {
      if (e.detail.value.length >= 6) {
        this.hidePayLayer()
      }
    })
  }
  getprodetail(orderId) {
    productInfo(orderId).then(res => {
      let productInfo = res.data.data
      productInfo.map(item => {
        item.price = parseFloat(item.price / 100).toFixed(2)
      })
      let { isdetail } = this.state
      isdetail = !isdetail
      this.setState({ productInfo, detailId: orderId, isdetail })
    })
  }

  state = {
    detailId: '',
    isdetail: false,
    imageurl: "https://guyu-1300342109.cos.ap-guangzhou.myqcloud.com",
    type: '',
    checkoutList: [],//接单时间内
    supplementaryCheckoutList: [],//接单时间外订单
    needPayAmount: '',
    totalAmount: '',
    payChannel: 'wechat',
    orderToken: '',
    support: [],
    nonsupport: [],
    btnshow: true,
    walletAmount: '',
    walletToken: '',

    switchIsCheck: false,
    showPayPwdInput: false,
    payFocus: true,
    pwdVal: '',
    toastText: '',
    isOpened: false,
    isorder: true,
    productInfo: []
  };
  config: Config = {
    navigationBarTitleText: "确认订单"
  };
  render() {
    const { detailId, isdetail, imageurl, checkoutList, needPayAmount, totalAmount, walletAmount, nonsupport, support, isorder, supplementaryCheckoutList } = this.state
    return (
      <View>
        {/* 钱包支付密码 */}
        <View className='box-passward'>
          {
            this.state.showPayPwdInput ?
              <View className='dialog'>
                <View className='input_main'>
                  <View className='input_title'>
                    <AtIcon onClick={this.closeClick} value='close' size='18' className='input_title-close'></AtIcon>
                    <Text>输入密码</Text>
                  </View>
                  <View className='write-title'>请输入密码</View>
                  <View className='input_row'>
                    {[0, 1, 2, 3, 4, 5].map((item, index) => {
                      return (
                        <View key={index} className='pwd_item'>
                          {
                            this.state.pwdVal.length > index ? <Text className='pwd_itemtext'></Text> : null
                          }
                        </View>
                      )
                    })}
                  </View>
                  <View className='dialogpsd' onClick={() => { Taro.navigateTo({ url: '../../pagesCommon/setpsd/setpsd' }) }}>未设置支付密码？去设置</View>
                  <Input focus={this.state.payFocus} password type='number' maxLength='6' onInput={this.inputPwd} className='input_control'></Input>

                </View>
              </View>
              : null
          }
        </View>
        {/* 钱包支付密码end */}
        <View className='dealpay'>
          <Text className='deal'>应付金额</Text>
          <Text className='money'>￥{needPayAmount > 0 ? needPayAmount : '0.00'}</Text>
        </View>
        <View className='contentpay'>
          {nonsupport.length > 0 && (
            <View className='bortop'>
              {isorder && (
                <View className='charge'>以下是不支持账期结算的店铺</View>
              )}
              {checkoutList.map(item => {
                return (
                  <Block>
                    {!item.debtAllowed && (
                      <Block>
                        <View className='store' onClick={() => { this.getprodetail(item.orderId) }}>
                          <View>
                            <Text>{item.storeName}</Text>
                          </View>
                          <View style='display:flex'>
                            <Text>￥{item.newmoney > 0 ? item.newmoney : '0.00'}</Text>
                            {(detailId == item.orderId && isdetail) ? (
                              <Image src='../../images/item/qt_111.png'></Image>
                            ) : (
                                <Image src='../../images/item/qt_106-31.png'></Image>
                              )}
                          </View>
                        </View>
                        {(detailId == item.orderId && isdetail) && (
                          <View style='margin-top:20rpx;border-top: 1px solid #eee;'>
                            {productInfo.map(pro => {
                              return (
                                <View className='productInfo'>
                                  <Image src={imageurl + pro.iconUrl}></Image>
                                  <View className='info-name infowidth'>
                                    <Text>{pro.name}</Text>
                                    <Text>{pro.specs}</Text>
                                  </View>
                                  <View className='info-name inforight'>
                                    <Text>￥{pro.price}</Text>
                                    <Text>x{pro.qty}</Text>
                                  </View>
                                </View>
                              )
                            })}
                          </View>
                        )}
                      </Block>

                    )}
                  </Block>
                )
              })}

            </View>
          )}

          {supplementaryCheckoutList.length > 0 && (
            <View className='order-charge'>
              <View className='order-charge-title'>以下是接单时间外，需要通过商家确认后再结算货款</View>
              {supplementaryCheckoutList.map(item => {
                return (
                  <Block>
                    <View className='order-charge-detail' onClick={() => { this.getprodetail(item.orderId) }}>
                      <Text>{item.storeName}</Text>
                      <View style='display:flex'>
                        <Text>￥{item.newmoney > 0 ? item.newmoney : '0.00'}</Text>
                        {(detailId == item.orderId && isdetail) ? (
                          <Image className='order-charge-detail-img' src='../../images/item/qt_111.png'></Image>
                        ) : (
                            <Image className='order-charge-detail-img' src='../../images/item/qt_106-31.png'></Image>
                          )}
                      </View>
                    </View>
                    {(detailId == item.orderId && isdetail) && (
                      <View style='margin-top:20rpx;border-top: 1px solid #eee;'>
                        {productInfo.map(pro => {
                          return (
                            <View className='productInfo'>
                              <Image src={imageurl + pro.iconUrl}></Image>
                              <View className='info-name infowidth'>
                                <Text>{pro.name}</Text>
                                <Text>{pro.specs}</Text>
                              </View>
                              <View className='info-name inforight'>
                                <Text>￥{pro.price}</Text>
                                <Text>x{pro.qty}</Text>
                              </View>
                            </View>
                          )
                        })}
                      </View>
                    )}
                  </Block>
                )
              })}
            </View>
          )}
        </View>

        <View>
          <View className='way'>选择支付方式</View>
          {support.length > 0 && (
            <View className='dealpay'>
              {isorder && (
                <View className='charge'>以下是支持账期结算的店铺</View>
              )}
              <View className='contentbox'>
                <CheckboxGroup onChange={this.CheckboxGroup} style='width:670rpx;'>
                  {checkoutList.map((item, index) => {
                    return (
                      <Block>
                        {item.debtAllowed && (
                          <Block>
                            <Label className='store'>
                              <View>
                                {isorder && (
                                  <Checkbox style='transform:scale(0.6)' value={item.orderId}></Checkbox>
                                )}
                                <Text>{item.storeName}</Text>
                              </View>
                              <Text>￥{item.newmoney}</Text>
                            </Label>
                            {(detailId == item.orderId && isdetail) && (
                              <View style='margin-top:20rpx;border-top: 1px solid #eee;'>
                                {productInfo.map(pro => {
                                  return (
                                    <View className='productInfo'>
                                      <Image src={imageurl + pro.iconUrl}></Image>
                                      <View className='info-name infowidth'>
                                        <Text>{pro.name}</Text>
                                        <Text>{pro.specs}</Text>
                                      </View>
                                      <View className='info-name inforight'>
                                        <Text>￥{pro.price}</Text>
                                        <Text>x{pro.qty}</Text>
                                      </View>
                                    </View>
                                  )
                                })}
                              </View>
                            )}
                          </Block>
                        )}
                      </Block>
                    )
                  })}
                </CheckboxGroup>
                <View>
                  {checkoutList.map((item, index) => {
                    return (
                      <Block>
                        {item.debtAllowed && (
                          <Block>
                            {(detailId == item.orderId && isdetail) ? (
                              <View className='unagree'>
                                <Image className='order-charge-detail-img martop' src='../../images/item/qt_111.png' onClick={() => { this.getprodetail(item.orderId) }}></Image>
                              </View>
                            ) : (
                                <View className='unagree'>
                                  <Image className='order-charge-detail-img martop' src='../../images/item/qt_106-31.png' onClick={() => { this.getprodetail(item.orderId) }}></Image>
                                </View>
                              )}
                          </Block>
                        )}
                      </Block>
                    )
                  })}
                </View>
              </View>
            </View>
          )}
          <RadioGroup onChange={this.singlechange}>
            <Label className='radio-list__label '>
              <View className='the_list_label'>
                <View className='choosePay choose-a'>
                  <View className='wxpay'>
                    <Image src='../../images/item/qt_59.png'></Image>
                    <Text>微信支付</Text>
                  </View>
                  <Radio className='radio-list__radio linh' value='wechat' checked></Radio>
                </View>
              </View>
            </Label>
            {Number(totalAmount) < Number(walletAmount) && (
              <Label className='radio-list__label'>
                <View className='the_list_label'>
                  <View className='choosePay'>
                    <View className='wxpay'>
                      <Image src='../../images/item/card-1.png'></Image>
                      <Text>账户余额支付</Text>
                    </View>
                    <View className='linh'>
                      <Text className='bal'>余额：￥{walletAmount}</Text>
                      <Radio className='radio-list__radio' value='wallet'></Radio>
                    </View>
                  </View>
                </View>
              </Label>
            )}
          </RadioGroup>
        </View>

        <View className='dealpay pay'>
          <Text>需付金额</Text>
          <Text>￥{totalAmount}</Text>
        </View>

        {btnshow ? (
          <View className='btn' onClick={this.gopay}>
            <Text>去支付</Text>
          </View>
        ) : (
            <View className='btn gray'>
              <Text>您已确认支付</Text>
            </View>
          )}

      </View>
    );
  }
}
