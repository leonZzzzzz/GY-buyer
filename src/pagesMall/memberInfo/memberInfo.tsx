import Taro, { Component, Config } from "@tarojs/taro";
import {
  Block,
  View,
  Text,
  Image
} from "@tarojs/components";
import "./memberInfo.scss";
import { myInfo } from "@/api/userInfo"

export default class Index extends Component {


  state = {
    memberInfo: ''
  };

  componentDidShow() {
    this.getmyinfo()
  }
  getmyinfo = async () => {
    const res = await myInfo()
    if (res.data.data.isValid) {
      this.setState({ memberInfo: res.data.data.memberInfo })
    } else {
      Taro.showModal({
        content: '您的信息未认证，请先认证',
        success: (res => {
          if (res.confirm) {
            Taro.navigateTo({
              url: '../../pagesCommon/auth-msg/auth-msg'
            })
          }
        })
      })
    }
  }
  config: Config = {
    navigationBarTitleText: "我的信息"
  };
  render() {
    const { memberInfo } = this.state
    return (
      <Block>
        <View className='set'>
          <View className='set-row'>
            <Text>姓名</Text>
            <Text className='phone'>{memberInfo.name}</Text>
          </View>
          <View className='set-row'>
            <Text>手机号</Text>
            <Text className='phone'>{memberInfo.mobilePhoneNumber}</Text>
          </View>
          <View className='set-row'>
            <Text>身份类型</Text>
            <Text className='phone'>{memberInfo.type == 'personal' ? '个人' : '企业'}</Text>
          </View>
          {memberInfo.unitName && (
            <View className='set-row'>
              <Text>单位名称</Text>
              <Text className='phone'>{memberInfo.unitName}</Text>
            </View>
          )}

          {/* <View className='set-row' onClick={this.gopasswod}>
            <Text>支付密码</Text>
            <View className='gtset'>
              <Text>未设置 </Text>
              <Image src='../../images/item/gy-icon_112.png'></Image>
            </View>
          </View> */}


        </View>
        {/* <View className='version'><Text>版本信息：V1.0.2</Text></View> */}
      </Block>
    );
  }
}
