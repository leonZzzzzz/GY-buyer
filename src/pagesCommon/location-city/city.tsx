import Taro, { Component, Config } from "@tarojs/taro";
import {
  Block,
  View,
  Text
} from "@tarojs/components";
import "./city.scss";
import { allCity } from "@/api/index"

export default class Index extends Component {

  state = {
    city: []
  };
  config: Config = {
    navigationBarTitleText: "选择城市"
  };
  componentDidMount() {
    this.getCity()
  }
  getCity = async () => {
    const res = await allCity()
    if (res.data.code == 20000) {
      const city = res.data.data
      this.setState({ city: res.data.data })

    }
  }
  render() {
    const { city } = this.state
    return (
      <View style="flex-direction:column;">
        <View className='current'>
          <Text className='city'>当前城市</Text>
          <View className='oncity'><Text>广州</Text></View>
        </View>
        <View style='margin:30rpx;'>
          <Text className='city'>选择收货城市</Text>
          <View className='oncity'>
            {city.length > 0 && (
              <Block>
                {city.map((item, index) => {
                  return (
                    <Text>{item.city}</Text>
                  )
                })}
              </Block>
            )}
          </View>
        </View>
      </View>
    );
  }
}
