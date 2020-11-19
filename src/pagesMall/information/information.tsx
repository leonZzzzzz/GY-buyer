import Taro, { Component, Config } from "@tarojs/taro";
import {
  Block,
  View,
  Text,
  Image
} from "@tarojs/components";
import "./information.scss";
import { ByOrderId } from "@/api/order"

export default class Index extends Component {


  state = {
    info: ''
  };

  componentDidShow() {
    const id = this.$router.params.id
    // this.setState({ id: this.$router.params.id })
    ByOrderId(id).then(res => {
      if (res.data.code == 20000) {
        const info = res.data.data
        this.setState({ info: info ? info : '' })
      }
    })
  }
  callphone(phone) {
    Taro.makePhoneCall({
      phoneNumber: phone
    });
  }
  config: Config = {
    navigationBarTitleText: "配送信息"
  };
  render() {
    const { info } = this.state
    return (
      <Block>
        {info && info.driverName? (
          <View className='set'>
            <View className='set-row'>
              <Text>车牌号</Text>
              <Text className='phone'>{info.driverCarNumber}</Text>
            </View>
            <View className='set-row'>
              <Text>司机姓名</Text>
              <Text className='phone'>{info.driverName}</Text>
            </View>
            <View className='set-row'>
              <Text>司机电话</Text>
              <Text className='phone' onClick={() => { this.callphone(info.driverPhoneNumber) }}>{info.driverPhoneNumber}</Text>
            </View>
          </View>
        ) : (
            <View className="no-data-view">
              <Image
                src={Taro.getStorageSync('imgHostItem')+'qt_89.png'}
                mode="widthFix"
                className="no-data-image"
              ></Image>
              <View className="no-data-text">暂无配送信息，可能还没分配司机</View>
            </View>
          )}

      </Block>
    );
  }
}
