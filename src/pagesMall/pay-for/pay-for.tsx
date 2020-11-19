import Taro, { Component, Config } from "@tarojs/taro";
import {
  View,
  Text,
  Image,
} from "@tarojs/components";
import "./pay-for.scss";

export default class Index extends Component {
  // 我的订单
  recharge() {
    Taro.navigateTo({
      url: '../order/list/index'
    })
  }

  componentDidMount() {
    console.log(this.$router.params)
    let { type, amount } = this.$router.params
    this.setState({ amount, type })
  }
  componentWillUnmount() {
    Taro.switchTab({
      url: '../../pages/cart/index'
    })
  }
  state = {
    type: '',
    amount: ''
  };
  config: Config = {
    navigationBarTitleText: "支付结果"
  };
  render() {
    const { type } = this.state
    return (
      <View style='flex-direction:column;padding:30rpx'>
        <Image src={require('../../images/item/guoyu-917_90.png')}></Image>
        {type == 'checkout' ? (
          <Block>
            <View className='balance'>申请补单成功，待卖家确认</View>
          </Block>
        ) : (
            <Block>
              <View className='balance'>支付成功</View>
              <View className='price'><Text style='font-size:40rpx;'>￥</Text>{amount}</View>
            </Block>
          )}

        <View className='btns' onClick={this.recharge}>
          <Text>查看我的订单</Text>
        </View>
      </View>
    );
  }
}
