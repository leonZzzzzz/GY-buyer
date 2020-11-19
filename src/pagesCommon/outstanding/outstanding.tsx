import Taro, { Component, Config } from "@tarojs/taro";
import {
  Block,
  View,
  Text,
  Image,
  Input
} from "@tarojs/components";
import "./outstanding.scss";
import { toPriceYuan } from "@/utils/format"
import { outlist } from "@/api/repay"

export default class Index extends Component {

  state = {
    imageurl: "https://guyu-1300342109.cos.ap-guangzhou.myqcloud.com",
    list: [],
    phone: ''
  };
  componentDidShow() {
    this.getlist()
  }
  getlist = async () => {
    const res = await outlist()
    if (res.data.code == 20000) {
      const list = res.data.data
      list.map(item => {
        item.allPayAmount = toPriceYuan(item.allPayAmount)
        item.lines = toPriceYuan(item.lines)
        item.needPayAmount = toPriceYuan(item.needPayAmount)
        if (!item.nowLimit) {
          item.nowLimit = 0
        }
      })
      this.setState({ list: list })
    }
  }
  // 取消/启用
  stopUse(e, id) {
    console.log(e)
    const type = e.currentTarget.dataset.type
    const params = { status: type, paymentDaysId: id }
    if (type == 'normal') {
      Taro.showModal({
        content: '确定要启用该用户吗？',
        success: (res => {
          if (res.confirm) {
            this.stop(params)
          }
        })
      })
    } else {
      Taro.showModal({
        content: '确定要停用该用户吗？',
        success: (res => {
          if (res.confirm) {
            this.stop(params)
          }
        })
      })
    }

  }
  stop = async (params) => {
    const res = await cancelCust(params)
    if (res.data.code == 20000) {
      this.getlist()
    }
  }
  getvalue(e) {
    this.setState({ phone: e.detail.value })
  }
  search() {
    this.getlist()
  }
  config: Config = {
    navigationBarTitleText: "我的欠账"
  };
  render() {
    const { list, imageurl } = this.state
    return (
      <Block>
        {list.length > 0 ? (
          <View className='content'>
            {list.map((item, index) => {
              return (
                <View className='content-a' key={String(index)}>
                  <View className='content-a-name'>
                    <Image className='content-a-name-pic' src={imageurl + item.logoIconUrl}></Image>
                    <View className='content-a-name-user'>{item.name}</View>
                  </View>
                  <View className='content-statis'>
                    <View className='statis-a'>
                      <Text>金额上限(元)</Text>
                      <Text>{item.lines}</Text>
                    </View>
                    <View className='statis-a'>
                      <Text>结算账期(天)</Text>
                      <Text>{item.timeLimit}</Text>
                    </View>
                    <View className='statis-a'>
                      <Text>未支付账期金额</Text>
                      <Text className='orange'>{item.needPayAmount}</Text>
                    </View>
                    <View className='statis-a'>
                      <Text>当前账期(天)</Text>
                      <Text className='orange'>{item.nowLimit}</Text>
                    </View>

                  </View>
                  <View className='btns'>
                    <Text onClick={() => {
                      Taro.navigateTo({
                        url: '../bill-list/bill-list?id=' + item.id + '&storeId=' + item.storeId + '&lines=' + item.lines + '&timeLimit=' + item.timeLimit + '&nowLimit=' + item.nowLimit + '&allPayAmount=' + item.allPayAmount + '&needPayAmount=' + item.needPayAmount + '&name=' + item.name + '&logoIconUrl=' + item.logoIconUrl
                      })
                    }}>账期订单</Text>
                    <Text onClick={() => {
                      Taro.navigateTo({
                        url: '../repayment/repayment?storeId=' + item.storeId + '&allPayAmount=' + item.allPayAmount + '&needPayAmount=' + item.needPayAmount + '&name=' + item.name + '&logoIconUrl=' + item.logoIconUrl
                      })
                    }}>还账记录</Text>
                    <Text className='repay' onClick={() => {
                      Taro.navigateTo({
                        url: '../payback/payback?storeId=' + item.storeId + '&lines=' + item.lines + '&timeLimit=' + item.timeLimit + '&name=' + item.name + '&logoIconUrl=' + item.logoIconUrl + '&needPayAmount=' + item.needPayAmount + '&nowLimit=' + item.nowLimit
                      })
                    }}>还账</Text>

                  </View>
                </View>
              )
            })}
          </View>
        ) : (
            <View className="no-data-view">
              <Image
                src={require('../../images/item/qt_89.png')}
                mode="widthFix"
                className="no-data-image"
              ></Image>
              {/* <View className="no-data-text">没有可领取的优惠券</View> */}
            </View>
          )}


        {/* <View className='confirm-order' onClick={() => { Taro.navigateTo({ url: '../addcredit/addcredit' }) }}>
          <View className='btn'>
            <View>+ 添加账期客户</View>
          </View>
        </View> */}
      </Block>
    );
  }
}
