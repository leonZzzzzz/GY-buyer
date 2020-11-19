import Taro, { Component, Config } from "@tarojs/taro";
import {
  Block,
  View,
  Text,
  Image,
  Input
} from "@tarojs/components";
import { AtIcon } from "taro-ui"
import "./payback.scss";
import { toPriceYuan } from "@/utils/format"
import { deductMoney, getbalance } from "@/api/repay"
import { wechatPay, remaining } from "@/api/order"

export default class Index extends Component {

  state = {
    imageurl: "https://guyu-1300342109.cos.ap-guangzhou.myqcloud.com",
    amount: '',
    array: [],
    storeId: '',
    type: 'wechat',
    walletamount: '',
    pwdVal: '',
    lines: '', nowLimit: '', timeLimit: '', logoIconUrl: '', name: '', needPayAmount: '',
    showPayPwdInput: false,
    payFocus: true,
  };
  componentDidMount() {
    const { storeId, lines, nowLimit, timeLimit, logoIconUrl, name, needPayAmount } = this.$router.params
    this.setState({ storeId, logoIconUrl, name, needPayAmount, lines, nowLimit, timeLimit, })
    getbalance().then(res => {
      this.setState({ walletamount: toPriceYuan(res.data.data) })
    })
  }

  getmoney(e) {
    this.setState({ amount: e.detail.value })
  }
  // 还清
  getclear() {
    this.setState({ amount: this.state.needPayAmount })
  }
  // 选择支付方式
  singlechange(e) {
    this.setState({ type: e.detail.value })
  }
  closeClick = () => {
    this.setState({
      showPayPwdInput: false
    })
  }
  // 检验密码 输完6位数字密码时候调用
  hidePayLayer = async () => {
    let val = this.state.pwdVal
    this.setState({
      showPayPwdInput: false,
      pwdVal: ''
    }, () => {
      this.password(val)
    })
  }
  // 密码接口
  password = async (val) => {
    const res = await remaining(val)
    if (res.data.code == 20000) {
      const walletToken = res.data.data.walletToken
      this.setState({ walletToken })
      this.walletpay(val)
    }
  }

  // 钱包支付
  async walletpay(val) {
    let { amount, storeId, type } = this.state
    let params = { amount: parseInt(amount * 100), storeId, type, password: val }
    const res = await deductMoney(params)
    var pages = getCurrentPages();//页面指针数组 
    var prepage = pages[pages.length - 2];
    if (res.data.data.payType == 'wallet') {
      Taro.showToast({
        title: '还账成功',
        icon: 'none'
      })
      setTimeout(() => {
        if (prepage.route == 'pagesCommon/bill-list/bill-list') {
          Taro.navigateBack({ delta: 2 })
        } else {
          Taro.navigateBack({ delta: 1 })
        }

      }, 1000);
    }
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
  async save() {
    let { amount, storeId, type } = this.state
    let params = { amount: parseInt(amount * 100), storeId, type }
    if (!amount) {
      Taro.showToast({
        title: '请输入还账金额',
        icon: 'none'
      })
      return
    }
    if (!type) {
      Taro.showToast({
        title: '请选择付款方式',
        icon: 'none'
      })
      return
    }
    if (type == 'wallet') {
      this.setState({ showPayPwdInput: true })
    } else {
      Taro.showLoading()
      this.payfor(params)
    }
  }
  payfor = async (params) => {
    const pay = await deductMoney(params)
    Taro.hideLoading()
    const payData = pay.data.data.payParameter
    const arr = {
      'timeStamp': payData.timeStamp,
      'nonceStr': payData.nonceString,
      'package': payData.pack,
      'signType': payData.signType,
      'paySign': payData.paySign
    }

    var obj = Object.assign({
      success: res => this._onPaySuccess(res),
      fail: err => this._onPayFail(err)
    }, arr);
    Taro.requestPayment(obj)
  }
  // 支付成功
  _onPaySuccess(res) {
    var pages = getCurrentPages();//页面指针数组 
    var prepage = pages[pages.length - 2];
    if (res.errMsg == 'requestPayment:ok') {
      Taro.showToast({
        title: '还账成功',
        icon: 'none'
      })
      setTimeout(() => {
        setTimeout(() => {
          if (prepage.route == 'pagesCommon/bill-list/bill-list') {
            Taro.navigateBack({ delta: 2 })
          } else {
            Taro.navigateBack({ delta: 1 })
          }
        }, 1000);
      }, 1000);
    }
  }
  // 支付失败
  _onPayFail(err) {
    Taro.showModal({
      title: '还账失败',
      content: '请重新还账',
      // cancelColor: '#FF0000',
      showCancel: false,
      confirmText: '好的',
      success: function (res) {
        // Taro.navigateTo({
        //   url: '../order/list/index',
        // })
      },
    });
  }
  config: Config = {
    navigationBarTitleText: "还账"
  };
  render() {
    const { needPayAmount, walletamount } = this.state
    return (
      <Block>
        {/* 钱包支付密码 */}
        < View className='box-passward' >
          {
            this.state.showPayPwdInput ?
              <View className="dialog">
                <View className="input_main">
                  <View className="input_title">
                    <AtIcon onClick={this.closeClick} value='close' size='18' className="input_title-close"></AtIcon>
                    <Text>输入密码</Text>
                  </View>
                  <View className="write-title">请输入密码</View>
                  <View className="input_row">
                    {[0, 1, 2, 3, 4, 5].map((item, index) => {
                      return (
                        <View key={index} className="pwd_item">
                          {
                            this.state.pwdVal.length > index ? <Text className="pwd_itemtext"></Text> : null
                          }
                        </View>
                      )
                    })}
                  </View>
                  <View className='dialogpsd' onClick={() => { Taro.navigateTo({ url: '../../pagesCommon/setpsd/setpsd' }) }}>未设置支付密码？去设置</View>
                  <Input focus={this.state.payFocus} password type="number" maxLength="6" onInput={this.inputPwd} className="input_control"></Input>

                </View>
              </View>
              : null
          }
        </View >
        {/* 钱包支付密码end */}
        <View className='content'>
          <View className='content-a'>
            <View className='content-a-name'>
              <Image className='content-a-name-pic' src={imageurl + logoIconUrl}></Image>
              <View className='content-a-name-user'>{name}</View>
            </View>
            <View className='content-statis'>
              <View className='statis-a'>
                <Text>金额上限(元)</Text>
                <Text>{lines}</Text>
              </View>
              <View className='statis-a'>
                <Text>结算账期(天)</Text>
                <Text>{timeLimit}</Text>
              </View>
              <View className='statis-a'>
                <Text>未支付账期金额</Text>
                <Text className='orange'>{needPayAmount}</Text>
              </View>
              <View className='statis-a'>
                <Text>当前账期(天)</Text>
                <Text className='orange'>{nowLimit}</Text>
              </View>
            </View>

            <View className='payfor'>
              <View >请输入还账金额</View>
              <View className='paycontent'>
                <View>￥</View>
                <Input placeholder='输入还账金额' value={amount} onInput={this.getmoney}></Input>
                <Text onClick={this.getclear}>还清</Text>
              </View>
            </View>
          </View>

          <View>
            <View className='way'>选择支付方式</View>
            <RadioGroup className='paytype' onChange={this.singlechange}>
              <Label className='radio-list__label '>
                <View className="the_list_label">
                  <View className='choosePay choose-a'>
                    <View className='wxpay'>
                      <Image src='../../images/item/qt_59.png'></Image>
                      <Text>微信支付</Text>
                    </View>
                    <Radio className='radio-list__radio linh' value='wechat' checked></Radio>
                  </View>
                </View>
              </Label>
              {/* {Number(needPayAmount) < Number(walletamount) && ( */}
              <Label className='radio-list__label'>
                <View className="the_list_label">
                  <View className='choosePay'>
                    <View className='wxpay'>
                      <Image src='../../images/item/card-1.png'></Image>
                      <Text>账户余额支付</Text>
                    </View>
                    <View className='linh'>
                      <Text className='bal'>余额：￥{walletamount}</Text>
                      <Radio className='radio-list__radio' value='wallet'></Radio>
                    </View>
                  </View>
                </View>
              </Label>
              {/* )} */}
            </RadioGroup>
          </View>
          <View className='btn' onClick={this.save}>确定</View>
        </View>
      </Block>
    )
  }
}
