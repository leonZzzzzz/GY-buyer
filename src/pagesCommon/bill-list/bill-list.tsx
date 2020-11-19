import Taro, { Component, Config } from "@tarojs/taro";
import {
  Block,
  View,
  Text,
  Image,
  Input
} from "@tarojs/components";
import "./bill-list.scss";
import { paymentorder } from "@/api/repay"

export default class Index extends Component {

  state = {
    imageurl: "https://guyu-1300342109.cos.ap-guangzhou.myqcloud.com",
    pageNum: 1,
    array: [],
    id: '',
    storeId: '',
    allPayAmount: '',
    logoIconUrl: '',
    name: '',
    needPayAmount: '',
    lines: '',
    nowLimit: '', timeLimit: ''
  };
  componentDidMount() {
    console.log(this.$router.params)
    const { id, lines, storeId, allPayAmount, logoIconUrl, name, needPayAmount, nowLimit, timeLimit } = this.$router.params
    this.setState({ id, lines, storeId, allPayAmount, logoIconUrl, name, needPayAmount, nowLimit, timeLimit })
    let params = { pageNum: this.state.pageNum, pageSize: 15, id, storeId }
    this.getdetail(params)
  }
  getdetail = async (params) => {
    const res = await paymentorder(params)
    const array = res.data.data.list
    array.map(item => {
      item.totalAmount = parseFloat(item.totalAmount / 100).toFixed(2)
    })
    this.setState({ array })
  }
  config: Config = {
    navigationBarTitleText: "账期订单"
  };
  render() {
    const { id, lines, storeId, allPayAmount, logoIconUrl, name, needPayAmount, nowLimit, timeLimit } = this.state
    return (
      <Block>
        <View className='content'>
          <View className='content-a'>
            <View className='content-a-name'>
              <Image className='content-a-name-pic' src={imageurl + logoIconUrl}></Image>
              <View className='content-a-name-user'>{name}</View>
            </View>
            <View className='content-statis'>
              <View className='statis-a'>
                <Text>累计账期金额(元)</Text>
                <Text>{allPayAmount}</Text>
              </View>
              <View className='statis-a'>
                <Text>未支付账期金额(元)</Text>
                <Text className='orange'>{needPayAmount}</Text>
              </View>

            </View>
          </View>
          <View className='content-b'>
            <View className='content-title'>
              <Image src='../../images/item/gy-icon_31.png'></Image>
              <Text>账期列表</Text>
              <Image src='../../images/item/gy-icon_33.png'></Image>
            </View>
            {array.map(item => {
              return (
                <View className='con-row'>
                  <Text>￥{item.totalAmount}</Text>
                  <View className='con-col'>

                    <Text>{item.status == 3 ? "已支付" : "未支付"}</Text>
                    <View>{item.createTime}</View>
                  </View>
                </View>
              )
            })}
          </View>
          <View style='height:150rpx'></View>

          <View className='confirm-order' onClick={() => {
            Taro.navigateTo({
              url: '../payback/payback?storeId=' + storeId + '&lines=' + lines + '&timeLimit=' + timeLimit + '&name=' + name + '&logoIconUrl=' + logoIconUrl + '&needPayAmount=' + needPayAmount + '&nowLimit=' + nowLimit
            })
          }}>
            <View className='btn'>
              <View>还账</View>
            </View>
          </View>
        </View>
      </Block>
    );
  }
}
