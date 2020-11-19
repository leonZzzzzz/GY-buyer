import Taro, { Component, Config } from "@tarojs/taro";
import {
  View,
  Text,
  Input
} from "@tarojs/components";
import "./auth-msg.scss";
import { infoComfirm } from "@/api/common"

export default class Index extends Component {

  state = {
    isfor: 'personal',
    phone: '',
    com: '',
    name: '',
    recMobile: ''
  };
  config: Config = {
    navigationBarTitleText: "信息认证"
  };

  componentWillMount() {
    let recMobile = Taro.getStorageSync('recMobile')
    if (recMobile) {
      this.setState({ recMobile })
    }
    let query = this.$router.params
    // let query = { scene: '23ccbf00a03f4037a17da946b90ca3ff' }
    let { phone } = query
    if (phone) {
      phone = phone
    } else {
      phone = Taro.getStorageSync('phone')
    }
    this.setState({ phone: phone })
  }
  singlechange(e) {
    this.setState({ isfor: e.detail.value })
  }
  // 单位
  getcom(e) {
    this.setState({ com: e.detail.value })
  }
  // 联系人
  getusername(e) {
    this.setState({ name: e.detail.value })
  }
  // 推荐人电话
  getrefphone(e) {
    this.setState({ recMobile: e.detail.value })
  }
  nextStep() {
    let { phone, isfor, com, name, recMobile } = this.state
    var params = {
      mobilePhoneNumber: phone,
      type: isfor,
      unitName: com,
      recMobile: recMobile,
      name: name
    }
    this.approve(params)
  }
  approve = async (params) => {
    const res = await infoComfirm(params)
    if (res.data.code == 20000) {
      Taro.showToast({
        title: '认证成功'
      })
      setTimeout(() => {
        Taro.switchTab({
          url: '../../pages/home/index'
        })
      }, 1500);
    }
  }
  render() {
    return (
      <View style="flex-direction:column;border-top:1px solid #eee;">
        <View className='phone'>
          <Text>手机号</Text>
          <Input placeholder='请输入手机号码' value={this.state.phone} disabled></Input>
        </View>
        <View className='phone'>
          <Text>身份</Text>
          <RadioGroup onChange={this.singlechange} className='radio-group'>
            <Label className='radio-list__label'>
              <View className="the_list_label">
                <Radio className='radio-list__radio' value='personal' checked='true'></Radio>
                <Text>个人</Text>
              </View>
            </Label>
            <Label className='radio-list__label '>
              <View className="the_list_label">
                <Radio className='radio-list__radio' value='company'></Radio>
                <Text>企业</Text>
              </View>
            </Label>
          </RadioGroup>
        </View>
        {isfor == 'company' && (
          <View className='phone'>
            <Text>单位</Text>
            <Input placeholder='名称' onInput={this.getcom}></Input>
          </View>
        )}
        <View className='phone'>
          <Text>联系人</Text>
          <Input placeholder='姓名' onInput={this.getusername}></Input>
        </View>
        <View className='phone'>
          <Text>推荐人电话</Text>
          <Input placeholder='选填' value={this.state.recMobile} onInput={this.getrefphone}></Input>
        </View>
        <View className='btn' onClick={this.nextStep}><Text>下一步</Text></View>
      </View>
    );
  }
}
