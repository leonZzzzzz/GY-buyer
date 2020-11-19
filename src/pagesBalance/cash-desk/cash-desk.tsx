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
import "./cash-desk.scss";

export default class Index extends Component {
  singlechange(e) {
    console.log(e)
  }
  state = {

  };
  config: Config = {
    navigationBarTitleText: "选择城市"
  };
  render() {
    return (
      <Block style='flex-direction:column;'>
        <View className='set'>
          <View className='set-row'>
            <Text>需付金额</Text>
            <Text className='paymoney'>￥2000</Text>
          </View>
        </View>
        <View className='set'>
          <View className='way'>
            <Text className='yanzheng'>选择支付方式</Text>
          </View>
          <RadioGroup onChange={this.singlechange}>
            <Label className='radio-list__label '>
              <View className="the_list_label">
                <View className='set-row'>
                  <Image className='img' src='../../images/item/qt_12.png'></Image>
                  <Text>银联支付</Text>
                </View>
                <Radio className='radio-list__radio' value='1'></Radio>
              </View>
            </Label>
            <Label className='radio-list__label '>
              <View className="the_list_label">
                <View className='set-row'>
                  <Image className='img' src='../../images/item/qt_59.png'></Image>
                  <Text>微信支付</Text>
                </View>
                <Radio className='radio-list__radio' value='2'></Radio>
              </View>
            </Label>
          </RadioGroup>
          <View className='btn' onClick={() => {
            Taro.navigateTo({ url: '../pay-success/pay-success' })
          }}>
            <Text>提交</Text>
          </View>
        </View>
      </Block>
    );
  }
}
