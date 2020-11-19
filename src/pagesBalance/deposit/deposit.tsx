import Taro, { Component, Config } from "@tarojs/taro";
import {
  Block,
  View,
  Text,
  Image,
  Input,
  Textarea
} from "@tarojs/components";
import "./deposit.scss";
import { drawMsg, withdraw } from "@/api/userInfo"

export default class Index extends Component {

  state = {
    isremark: false,
    bankRecord: '',
    withdrawableMoney: '',
    id: '',
    bankNumber: '',
    money: '',
    note: ''
  };

  componentDidShow() {
    Taro.showLoading()
    this.getDraw()
  }
  getDraw = async () => {
    const res = await drawMsg()
    Taro.hideLoading()
    console.log(res)
    const { bankRecord, withdrawableMoney } = res.data.data
    this.setState({ bankRecord: bankRecord ? bankRecord : '', withdrawableMoney: parseFloat(withdrawableMoney / 100).toFixed(2) })
    if (bankRecord) {
      let bankNumber = bankRecord.bankNumber
      bankNumber = bankNumber.slice(-4)
      this.setState({ id: bankRecord.id, bankNumber })
    }
  }
  gotobank() {
    const { id } = this.state
    console.log(id)
    if (id) {
      Taro.navigateTo({ url: '../bankinfo/bankinfo?id=' + id })
    } else {
      Taro.navigateTo({ url: '../bankinfo/bankinfo' })
    }
  }
  // 提现金额
  getmoney(e) {
    this.setState({ money: e.detail.value })
  }
  // 备注
  getremark(e) {
    this.setState({ note: e.detail.value })
  }
  // 确认提现
  async confirm() {
    const { bankRecord, money, note } = this.state
    if (!bankRecord) {
      Taro.showToast({
        title: '请先设置银行卡信息',
        icon: 'none'
      })
      return
    }
    if (!money) {
      Taro.showToast({
        title: '请先输入提现金额',
        icon: 'none'
      })
      return
    }
    const params = { amount: Number(money * 100), bankNumber: bankRecord.bankNumber, receiverName: bankRecord.receiverName, note }
    const res = await withdraw(params)
    Taro.hideLoading()
    if (res.data.code == 20000) {
      Taro.setStorageSync('deamount', money)
      Taro.showToast({
        title: res.data.message,
        icon: 'none'
      })
      setTimeout(() => {
        Taro.navigateBack()
      }, 1000);
    }
  }
  // 全部提现
  alldeposit() {
    this.setState({ money: this.state.withdrawableMoney })
  }
  addremark() {
    this.setState({ isremark: true })
  }
  config: Config = {
    navigationBarTitleText: "提现"
  };
  render() {
    const { bankRecord, bankNumber, withdrawableMoney, isremark, money } = this.state
    return (
      <Block>
        <View className='post'>可提现余额：￥{withdrawableMoney}</View>
        <View className='account'>
          <Text>到账账户</Text>
          <View className='post-a' onClick={this.gotobank}>
            {bankRecord ? (
              <View className='post-b'>
                <View className='post-c'>
                  尾号{bankNumber}
                  {/* <Image src='../../images/item/guoyu-917_06.png'></Image> */}
                  {/* <Text>尾号1234</Text> */}
                </View>
                <Text>1-3个工作日到账</Text>
              </View>
            ) : (
                <View className='setting'>去设置银行卡信息</View>
              )}
            <View className='qcfont qc-icon-chevron-right'></View>
          </View>
        </View>

        <View className='price'>
          <Text className='price-a'>提现金额</Text>
          <View className='price-b'>
            <View className='price-d'>
              <Text>￥</Text>
              <Input placeholder='请输入提现金额' value={money} onInput={this.getmoney}></Input>
            </View>
            <Text onClick={this.alldeposit}>全部提现</Text>
          </View>
          {!isremark && (
            <Text className='price-c' onClick={this.addremark}>添加备注</Text>
          )}
        </View>
        {isremark && (
          <Textarea className='area' maxlength='100' placeholder='请填写备注信息(限100字)' onInput={this.getremark}></Textarea>
        )}
        <View className='btn' onClick={this.confirm}>
          <Text>确定提现</Text>
        </View>
        <View className='regard' onClick={() => { Taro.navigateTo({ url: '../../pagesCommon/protocol/protocol?type=WITHDRAWAL_MEMBER_FAQ' }) }}>
          <Image src='../../images/item/gy-icon_27.png'></Image>
          <Text>相关问题</Text>
        </View>
      </Block>
    );
  }
}
