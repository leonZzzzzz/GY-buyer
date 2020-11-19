import Taro, { Component, Config } from "@tarojs/taro";
import {
  View,
  Text,
  Image,
  Input
} from "@tarojs/components";
import "./phone-login.scss";
import { phonelogin, isvalid, verilPhone } from "@/api/common"

export default class Index extends Component {

  state = {
    imageurl: 'https://guyu-1300342109.cos.ap-guangzhou.myqcloud.com',
    phone: '',
    mobileCode: '',
    timer: '',
    countDownNum: '获取验证码',
  };
  placePhone(e) {
    this.setState({ phone: e.detail.value })
  }
  // 获取验证码
  async getVeril() {
    let { phone } = this.state
    if (!phone) {
      Taro.showToast({
        title: '请先输入手机号',
        icon: 'none'
      })
      return
    } else {
      if (!(/^1[3456789]\d{9}$/.test(phone))) {
        Taro.showToast({
          title: '手机号码有误，请重填',
          icon: 'none'
        })
        return;
      }
    }
    await verilPhone(this.state.phone)
    let that = this
    let countDownNum = 60
    that.setState({
      timer: setInterval(function () {
        //每隔一秒countDownNum就减一，实现同步
        countDownNum--;
        //然后把countDownNum存进data，好让用户知道时间在倒计着
        that.setState({
          countDownNum: countDownNum + 's'
        })
        //在倒计时还未到0时，这中间可以做其他的事情，按项目需求来
        if (countDownNum == 0) {
          //这里特别要注意，计时器是始终一直在走的，如果你的时间为0，那么就要关掉定时器！不然相当耗性能
          //因为timer是存在data里面的，所以在关掉时，也要在data里取出后再关闭
          clearInterval(that.state.timer);
          that.setState({
            countDownNum: '获取验证码'
          })
          //关闭定时器之后，可作其他处理codes go here
        }
      }, 1000)
    })
  }
  componentWillUnmount() {
    clearInterval(this.state.timer);		// 清除计时器
  }
  // 输入验证码
  inputVeril(e) {
    console.log(e)
    this.setState({ mobileCode: e.detail.value })
  }
  // 下一步
  nextstep() {
    const params = {
      mobile: this.state.phone,
      mobileCode: this.state.mobileCode
    }
    this.nexttype(params)
  }
  nexttype = async (params) => {
    const res = await phonelogin(params)
    console.log(res)
    if (res.data.code == 20000) {
      Taro.setStorageSync('phone', res.data.message)
      this.isuserInfo(res.data.message)
    }
  }

  // 信息是否认证
  isuserInfo = async (message) => {
    if (!this.state.phone) {
      Taro.showToast({
        title: '请填写手机号',
        icon: 'none'
      })
      return
    }
    const res = await isvalid()
    if (res.data.data) {
      Taro.switchTab({
        url: '../../pages/personal/index'
      })
    } else {
      Taro.reLaunch({
        url: '../auth-msg/auth-msg?phone=' + this.state.phone
      })
    }
  }
  config: Config = {
    navigationBarTitleText: "手机号登录"
  };
  render() {
    return (
      <View style="flex-direction:column;">
        <View className='logo'><Image src={imageurl + '/attachments/null/78cf7bb11e154e649a169deaa8922f6f.png'}></Image></View>
        <View className='phone'>
          <Input placeholder='请输入手机号码' onInput={this.placePhone}></Input>
          {countDownNum == '获取验证码' ? (
            <Text onClick={this.getVeril}>{countDownNum}</Text>
          ) : (
              <Text>{countDownNum}</Text>
            )}

        </View>
        <View className='phone'>
          <Input placeholder='请输入验证码' onInput={this.inputVeril}></Input>
        </View>
        <View className='btn' onClick={this.nextstep}><Text>下一步</Text></View>
      </View>
    );
  }
}
