import Taro, { Component, Config } from "@tarojs/taro";
import {
  Block,
  View,
  Text
} from "@tarojs/components";
import "./setpsd.scss";
import { authCode, setpassward } from "@/api/userInfo"

export default class Index extends Component {

  state = {
    phone: '',
    code: '',
    onepass: '',
    twopass: '',
    timer: '',
    countDownNum: '获取验证码',
  };
  componentDidMount() {
    let phone = this.$router.params.phone
    if (phone) {
      phone = phone
    } else {
      phone = Taro.getStorageSync('phone')
    }
    this.setState({ phone })
  }
  // 获取验证码
  async gecode() {
    await authCode(this.state.phone)
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

  // 获取输入的验证码
  inputCode(e) {
    console.log(e)
    this.setState({ code: e.detail.value })
  }

  onePasd(e) {
    this.setState({ onepass: e.detail.value })
  }
  againPasd(e) {
    this.setState({ twopass: e.detail.value })
  }
  // 提交设置
  async save() {
    let { phone, code, onepass, twopass } = this.state
    if (!code || !onepass || !twopass) {
      Taro.showToast({
        title: '请输入完整信息',
        icon: 'none'
      })
      return
    }
    let reg = /^\d{6}$/
    if (!reg.test(onepass)) {
      Taro.showToast({
        title: '密码格式不对，请输入6位数字的密码',
        icon: 'none'
      })
      return
    }
    if (onepass != twopass) {
      Taro.showToast({
        title: '确认密码与新密码不一致',
        icon: 'none'
      })
      return
    }
    const params = { phone, code, password: onepass, confirmPassword: twopass }
    const res = await setpassward(params)
    if (res.data.code == 20000) {
      Taro.setStorageSync('ispsd', true)
      Taro.showToast({
        title: '支付密码设置成功',
        icon: 'none'
      })
      setTimeout(() => {
        Taro.navigateBack()
      }, 1000);
    }
  }

  config: Config = {
    navigationBarTitleText: "设置支付密码"
  };
  render() {
    const { countDownNum } = this.state
    return (
      <Block>
        <View className='set'>
          <View className='set-row'>
            <Input value={phone} disabled></Input>
          </View>
          <View className='set-row'>
            <Input className='yanzheng' type='number' placeholder='输入验证码' onInput={this.inputCode}></Input>
            <View className='gtset'>
              {countDownNum == '获取验证码' ? (
                <Text className='code' onClick={this.gecode}>{countDownNum}</Text>
              ) : (
                  <Text className='code'>{countDownNum}</Text>
                )}

            </View>
          </View>
          <View className='set-row'>
            <Input placeholder='请输入6位数字的新密码' onInput={this.onePasd} type='password'></Input>
          </View>
          <View className='set-row'>
            <Input placeholder='确认密码' onInput={this.againPasd} type='password'></Input>
          </View>
          <View className='btn' onClick={this.save}>
            <Text>提交</Text>
          </View>
        </View>
      </Block>
    );
  }
}
