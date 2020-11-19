import Taro, { Component, Config } from "@tarojs/taro";
import {
  Block,
  View,
  Text,
  Image
} from "@tarojs/components";
import "./setting.scss";
import { loginout } from "@/api/userInfo"

export default class Index extends Component {
  // 去设置密码
  gopasswod() {
    Taro.navigateTo({
      url: '../setpsd/setpsd?phone=' + this.state.phone
    })
  }
  // 退出登录
  logout() {
    Taro.showModal({
      content: '确定要退出吗？',
      success: (res) => {
        if (res.confirm) {
          this.outlogin()
          Taro.removeStorageSync('phone')
          Taro.removeStorageSync('sessionid')
          Taro.removeStorageSync('memberid')
          Taro.removeStorageSync('openid')
          Taro.removeStorageSync('code')
        }
      }
    })
  }
  outlogin = async () => {
    const res = await loginout()
    if (res.data.code == 20000) {
      Taro.showToast({
        title: '下次见~',
        icon: 'none'
      })
      setTimeout(() => {
        Taro.navigateBack({ delta: 1 })
      }, 1500);
    }
  }
  state = {
    phone: '', ispsd: false
  };

  componentDidShow() {
    const phone = Taro.getStorageSync('phone')
    const ispsd = Taro.getStorageSync('ispsd')
    this.setState({ phone, ispsd: ispsd ? ispsd : false })
  }
  config: Config = {
    navigationBarTitleText: "设置"
  };
  render() {
    const { phone } = this.state
    return (
      <Block>
        <View className='set'>
          <View className='set-row'>
            <Text>当前手机号</Text>
            <Text className='phone'>{phone}</Text>
          </View>
          <View className='set-row' onClick={this.gopasswod}>
            <Text>支付密码</Text>
            <View className='gtset'>
              {ispsd ? (
                <Text>已设置密码 </Text>
              ) : (
                  <Text>去设置 </Text>
                )}
              <Image src='../../images/item/qt_125.png'></Image>
            </View>
          </View>
          <View className='btn' onClick={this.logout}>
            <Text>退出登录</Text>
          </View>
        </View>
        <View className='version'><Text>版本信息：V1.2.3</Text></View>
      </Block>
    );
  }
}
