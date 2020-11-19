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
import "./pay-success.scss";

export default class Index extends Component {

  componentDidMount() {
    const amount = this.$router.params.amount
    this.setState({ amount: parseFloat(amount / 100).toFixed(2) })
    Taro.setStorageSync('payamount', amount)
  }
  // 查看我的账户
  getMyBank() {
    Taro.navigateBack({ delta: 2 })
  }
  state = {
    amount: ''
  };
  config: Config = {
    navigationBarTitleText: "支付结果"
  };
  render() {
    return (
      <View style='flex-direction:column;padding:30rpx'>
        <Image src={require('../../images/item/guoyu-917_90.png')}></Image>
        <View className='balance'>支付成功</View>
        <View className='price'><Text style='font-size:40rpx;'>￥</Text>{amount}</View>
        <View className='btns' onClick={this.getMyBank}>
          <Text>查看我的账户</Text>
        </View>
      </View>
    );
  }
}
