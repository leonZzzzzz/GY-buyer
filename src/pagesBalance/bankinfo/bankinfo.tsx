import Taro, { Component, Config } from "@tarojs/taro";
import {
  Block,
  View,
  Text,
  Image,
  Input,
  Textarea
} from "@tarojs/components";
import "./bankinfo.scss";
import { backcardInfo, getBack, updataCard } from "@/api/userInfo"

export default class Index extends Component {

  state = {
    name: '', card: '', list: '', id: ''
  };
  componentDidMount() {
    const id = this.$router.params.id
    console.log(id)
    if (id) {
      this.setState({ id })
      this.getBank(id)
    }
  }
  // 获取银行卡信息
  getBank = async (id) => {
    const res = await getBack(id)
    if (res.data.code == 20000) {
      this.setState({ list: res.data.data })
    }
  }
  // 获取姓名
  getname(e) {
    this.setState({ name: e.detail.value })
  }
  getCard(e) {
    this.setState({ card: e.detail.value })
  }
  // 保存
  async addCard() {
    const { name, card, list } = this.state
    const params = {
      receiverName: name ? name : list.receiverName,
      bankNumber: card ? card : list.bankNumber
    }
    const res = await backcardInfo(params)
    if (res.data.code == 20000) {
      Taro.showToast({
        title: '银行卡信息保存成功',
        icon: 'none'
      })
      setTimeout(() => {
        Taro.navigateBack({ delta: 1 })
      }, 1500);
    }
  }
  // 修改
  async uodata() {
    const { name, card, list, id } = this.state
    const params = {
      receiverName: name ? name : list.receiverName,
      bankNumber: card ? card : list.bankNumber,
      id
    }
    const res = await updataCard(params)
    if (res.data.code == 20000) {
      Taro.showToast({
        title: '银行卡信息修改成功',
        icon: 'none'
      })
      setTimeout(() => {
        Taro.navigateBack({ delta: 1 })
      }, 1500);
    }
  }

  config: Config = {
    navigationBarTitleText: "银行卡信息"
  };
  render() {
    const { list } = this.state
    return (
      <Block>
        <View className='account martop'>
          <Text>姓名</Text>
          <View className='post-a'>
            <Input placeholder='请输入收款人姓名' value={list.receiverName} onInput={this.getname}></Input>
          </View>
        </View>
        <View className='account'>
          <Text>卡号</Text>
          <View className='post-a'>
            <Input placeholder='请输入储蓄卡号' value={list.bankNumber} onInput={this.getCard}></Input>
          </View>
        </View>
        {/* <View className='account'>
          <Text>银行</Text>
          <View className='post-a'>
            <Input placeholder='请选择银行'></Input>
            <Image src='../../images/item/qt_111.png'></Image>
          </View>
        </View> */}

        {!id ? (
          <View className='btn' onClick={this.addCard}>
            <Text>保存</Text>
          </View>
        ) : (
            <View className='btn' onClick={this.uodata}>
              <Text>修改</Text>
            </View>
          )}


      </Block>
    );
  }
}
