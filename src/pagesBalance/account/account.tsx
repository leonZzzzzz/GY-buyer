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
import RenderComponent from "@/components/flywheel/render-component";
import "./account.scss";

export default class Index extends Component {
  // 去充值
  recharge() {
    Taro.navigateTo({
      url: '../recharge/recharge?discount=' + this.state.discount
    })
  }
  state = {
    amount: '', discount: '', payamount: ''
  };

  componentDidHide() {
    Taro.removeStorageSync('payamount')
    Taro.removeStorageSync('deamount')
  }
  componentDidShow() {
    const payamount = Taro.getStorageSync('payamount')
    const deamount = Taro.getStorageSync('deamount')
    let { amount, discount } = this.$router.params
    let money = 0
    if (payamount) {
      console.log('mai', payamount)
      money = Number(amount) + Number(payamount / 100)
      this.setState({ amount: money, discount })
    } else if (deamount) {
      console.log(amount, '吗', deamount)
      money = Number(amount * 100) - Number(deamount * 100)
      this.setState({ amount: parseFloat(money / 100).toFixed(2), discount })
    } else {
      this.setState({ amount, discount })
    }
  }
  config: Config = {
    navigationBarTitleText: "我的账户"
  };
  render() {
    const { amount } = this.state
    return (
      <View style='flex-direction:column;padding:30rpx'>
        <View className='detail' onClick={() => { Taro.navigateTo({ url: '../bal-list/bal-list' }) }}>余额明细</View>
        <Image src={require('../../images/item/guoyu-917_06.png')}></Image>
        <View className='balance'>余额（元）</View>
        <View className='price'><Text>￥</Text>{amount}</View>
        <View className='btns'>
          <Text onClick={this.recharge}>充值</Text>
          <Text onClick={() => { Taro.navigateTo({ url: '../deposit/deposit?amount=' + amount }) }}>提现到银行卡</Text>
        </View>
      </View>
    );
  }
}
