import Taro, { Component, Config } from "@tarojs/taro";
import {
  Block,
  View,
  Text,
  Image,
  Input,
  Swiper,
  SwiperItem,
  Navigator
} from "@tarojs/components";
import "./recharge.scss";
import { discount } from '@/api/userInfo'

export default class Index extends Component {
  componentDidMount() {
    const { discount } = this.$router.params
    this.setState({ discount })
  }
  // 选择支付方式
  async gocashier() {
    let amount = this.state.amount
    amount = parseInt(amount * 100)
    const res = await discount(amount)
    const payData = res.data.data
    const arr = {
      'timeStamp': payData.timeStamp,
      'nonceStr': payData.nonceString,
      'package': payData.pack,
      'signType': payData.signType,
      'paySign': payData.paySign
    }
    var obj = Object.assign({
      success: res => this._onPaySuccess(res, amount),
      fail: err => this._onPayFail(err)
    }, arr);
    console.log(obj)
    Taro.requestPayment(obj)
  }
  // 支付成功
  _onPaySuccess(res, amount) {
    if (res.errMsg == 'requestPayment:ok') {
      setTimeout(() => {
        Taro.navigateTo({
          url: '../pay-success/pay-success?amount=' + amount
        })
      }, 1000);
    }
  }
  // 支付失败
  _onPayFail(err) {
    Taro.showModal({
      title: '支付失败',
      content: '订单支付失败，请重新支付',
      // cancelColor: '#FF0000',
      showCancel: false,
      confirmText: '好的',
      success: function (res) {
        // Taro.navigateBack({
        //   delta:1
        // })
      },
    });
  }
  getMoney(e) {
    this.setState({ amount: e.detail.value })
  }
  state = {
    amount: '',
    discount: '',
  };
  config: Config = {
    navigationBarTitleText: "充值"
  };
  render() {
    return (
      <Block>
        <View className='set'>
          <Text className='vou'>充值金额</Text>
          <View className='price'>
            <Text>￥</Text>
            <Input value='' placeholder='请输入充值金额' onInput={this.getMoney}></Input>
            <Text></Text>
          </View>
          <View className='btn' onClick={this.gocashier}>
            <Text>提交</Text>
          </View>
          <Text className='tip'>平台优惠：充值可享受{discount}折优惠</Text>
        </View>
      </Block>
    );
  }
}
