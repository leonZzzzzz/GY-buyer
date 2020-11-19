import Taro, { Component } from '@tarojs/taro'
import { View, Button, Text } from '@tarojs/components'
import { AtInput, AtList, AtListItem, AtIcon, AtButton, AtToast } from "taro-ui"
import './psd.scss'

class Index extends Component {
  constructor() {
    super(...arguments)
    this.state = ({
      switchIsCheck: false,
      showPayPwdInput: true,
      payFocus: true,
      pwdVal: '',
      toastText: '',
      isOpened: false
    })
  }
  // 打开关闭免密  用了在Switch开关上面遮挡一个透明的View，来显示弹窗，控制Switch的开关
  switchIsCheckBtn = () => {
    this.setState({
      showPayPwdInput: true
    })
  }
  closeClick = () => {
    this.setState({
      showPayPwdInput: false
    })
  }
  // 检验密码 输完6位数字密码时候调用
  hidePayLayer = () => {
    let val = this.state.pwdVal
    this.setState({
      showPayPwdInput: false,
      pwdVal: ''
    }, () => {
      Taro.request({
        method: 'post',
        url:
          API.URL,
        header: {
          'Content-Type': 'application/json',
          'Data-Type': 'json',
          'weixinauth': this.state.tookenData
        },
        data: JSON.stringify({
          password: val
        }),
        success: res => {
          if (res.data.status == 0) {
            this.setState({
              switchIsCheck: !this.state.switchIsCheck
            })
          } else {
            this.setState({
              isOpened: true,
              toastText: '密码错误'
            })
          }
        }
      })
    })
  }
  // 密码输入
  inputPwd = (e) => {
    this.setState({
      pwdVal: e.detail.value
    }, () => {
      if (e.detail.value.length >= 6) {
        this.hidePayLayer()
      }
    })
  }
  render() {
    return (
      <View className='box-passward'>
        {
          this.state.showPayPwdInput ?
            <View className="dialog">
              <View className="input_main">
                <View className="input_title">
                  <AtIcon onClick={this.closeClick} value='close' size='18' className="input_title-close"></AtIcon>
                  <Text>免密修改</Text>
                </View>
                <View className="write-title">请输入密码</View>
                <View className="input_row">
                  {
                    [0, 1, 2, 3, 4, 5].map((item, index) => {
                      return (
                        <View key={index} className="pwd_item">
                          {
                            this.state.pwdVal.length > index ? <Text className="pwd_itemtext"></Text> : null
                          }
                        </View>
                      )
                    })
                  }
                </View>
                <Input focus={this.state.payFocus} password type="number" maxLength="6" onInput={this.inputPwd} className="input_control"></Input>
              </View>
            </View>
            : null
        }
      </View>
    )
  }
}

export default Index