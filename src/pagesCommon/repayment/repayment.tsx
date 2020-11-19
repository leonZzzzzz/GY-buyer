import Taro, { Component, Config } from "@tarojs/taro";
import {
  Block,
  View,
  Text,
  Image,
  Input
} from "@tarojs/components";
import "./repayment.scss";
import { paybill } from "@/api/repay"

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
    needPayAmount: ''
  };
  componentDidMount() {
    const { storeId, allPayAmount, logoIconUrl, name, needPayAmount } = this.$router.params
    this.setState({ storeId, allPayAmount, logoIconUrl, name, needPayAmount })
    let params = { pageNum: this.state.pageNum, pageSize: 15, storeId }
    this.getdetail(params)
  }
  getdetail = async (params) => {
    const res = await paybill(params)
    const array = res.data.data.list
    array.map(item => {
      item.amount = parseFloat(item.amount / 100).toFixed(2)
    })
    this.setState({ array })
  }
  config: Config = {
    navigationBarTitleText: "还账记录"
  };
  render() {
    const { array } = this.state
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
              <Text>还账列表</Text>
              <Image src='../../images/item/gy-icon_33.png'></Image>
            </View>
            {array.length > 0 ? (
              <Block>
                {array.map(item => {
                  return (
                    <View className='con-row'>
                      <Text>￥{item.amount}</Text>
                      <View className='con-col'>
                        <Text>{item.payType == 'offline' ? "线下支付" : "线上支付"}</Text>
                        <View>{item.createTime}</View>
                      </View>
                    </View>
                  )
                })}
              </Block>
            ) : (
                <View className='nolist'>暂无还账记录</View>
              )}

          </View>

          {/* <View className='confirm-order' onClick={() => { Taro.navigateTo({ url: '../payback/payback' }) }}>
            <View className='btn'>
              <View>还账</View>
            </View>
          </View> */}
        </View>
      </Block>
    );
  }
}
