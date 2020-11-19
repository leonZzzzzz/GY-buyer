import Taro, { Component, Config } from "@tarojs/taro";
import {
  Block,
  View,
  Text, Image, Picker
} from "@tarojs/components";
// import RenderComponent from "@/components/flywheel/render-component";
import "./bal-list.scss";
import { balaccount } from "@/api/userInfo"
import { toPriceYuan } from "@/utils/format";
export default class Index extends Component {
  // 选择支付方式
  gocashier() {
    Taro.navigateTo({
      url: '../cash-desk/cash-desk'
    })
  }
  state = {
    value: '0',
    showpicker: false,
    selector: ['按月选择', '按日选择'],
    selectorChecked: '按月选择',
    startdateSel: '', enddateSel: '',
    monthdateSel: '',
    monthpicker: true, daypicker: false,

    list: [],
    lists: [],
    pageNum: '1',
    loading: false,
    datalist: {}
  };

  // 选择月日
  onChange = e => {
    console.log(e)
    let now = this.state.selector[e.detail.value]
    let monthpicker = false, daypicker = false
    if (now == '按月选择') {
      monthpicker = true,
        daypicker = false
    } else {
      monthpicker = false,
        daypicker = true
    }
    this.setState({
      value: e.detail.value,
      showpicker: true,
      selectorChecked: now,
      monthpicker, daypicker
    })
  }

  // 月份选择
  onmonthChange(e) {
    this.setState({ monthdateSel: e.detail.value })
  }
  // 日期选择
  onstartDateChange = e => {
    this.setState({
      startdateSel: e.detail.value
    })
  }
  onendDateChange = e => {
    this.setState({
      enddateSel: e.detail.value
    })
  }
  // 搜索
  searchData = async () => {
    let pageNum = 1
    this.setState({ lists: [], list: [], pageNum: 1 })
    this.getBalList(pageNum, this.state.monthdateSel)

  }


  componentDidMount() {
    var date = new Date();
    var year = date.getFullYear();
    let month = date.getMonth() + 1;
    if (month < 10) {
      month = '0' + month
    } else {
      month = month
    }
    let monthdateSel = year + '-' + month
    this.setState({ monthdateSel })
    this.getBalList(this.state.pageNum, monthdateSel)
  }
  getBalList = async (pageNum, monthdateSel) => {
    const { value, startdateSel, enddateSel } = this.state
    let params = {}
    if (value == '0') {
      params = { pageNum, dateType: 'month', monthTime: monthdateSel + '-01' }
    } else if (value == '1') {
      params = { pageNum, dateType: 'day', startTime: startdateSel, endTime: enddateSel }
    }
    // else {
    //   params = { pageNum }
    // }
    const res = await balaccount(params)
    this.setState({ loading: true })
    const list = res.data.data.list
    const lists = this.state.lists
    // if (list.length < 1) {
    //   Taro.showToast({
    //     title: '加载完啦~',
    //     icon: 'none'
    //   })
    //   return
    // }
    if (list.length > 0) {
      list.map(item => {
        item.amount = parseFloat(item.amount / 100).toFixed(2)
        if (Number(item.amount) > 0) {
          item.amount = '+' + item.amount
        }
        lists.push(item)
      })
      this.setState({ list: lists, datalist: res.data.data })
    }
  }

  onReachBottom() {
    this.state.pageNum++
    this.getBalList(this.state.pageNum, this.state.monthdateSel)
  }

  gojump(businessType, type, businessId, refundId) {
    if (businessType == 'order') {
      if (type == 'consume') {
        Taro.navigateTo({ url: '../../pagesMall/order-detail/order-detail?id=' + businessId })
      } else if (type == 'refund') {
        Taro.navigateTo({ url: '../../pagesMall/purchase-detail/purchase-detail?id=' + refundId })
      }
    }
  }
  config: Config = {
    navigationBarTitleText: "余额明细"
  };
  render() {
    const { list, loading, datalist } = this.state
    return (
      <Block>
        {loading && (
          <Block>
            <View className='pichoose'>

              <Picker mode='selector' className='selector' range={this.state.selector} onChange={this.onChange}>
                <Text className='selectorpicker'>
                  {this.state.selectorChecked}
                </Text>
                <Image className='selectorimage' src='../../images/item/qt_111.png'></Image>
              </Picker>
              {monthpicker && (
                <View>
                  <Picker className='daypic-one' mode='date' fields='month' onChange={this.onmonthChange}>
                    <View className='picker'>
                      {this.state.monthdateSel ? this.state.monthdateSel : '选择月份'}
                    </View>
                  </Picker>
                </View>
              )}

              {daypicker && (
                <View className='daypic'>
                  <Picker className='daypic-one' mode='date' onChange={this.onstartDateChange}>
                    <View className='picker'>
                      {this.state.startdateSel ? this.state.startdateSel : '开始时间'}
                    </View>
                  </Picker>
                  <Text>至</Text>
                  <Picker mode='date' className='daypic-one' onChange={this.onendDateChange}>
                    <View className='picker'>
                      {this.state.enddateSel ? this.state.enddateSel : '结束时间'}
                    </View>
                  </Picker>
                </View>
              )}
              {/* {showpicker && (
                <View className='search' onClick={this.searchData}>搜索</View>
              )} */}
              <View className='search' onClick={this.searchData}>搜索</View>
            </View>
            {list.length > 0 && (
              <View className='type-order'>
                {datalist.consume != 0 && <Text>消费:￥{toPriceYuan(datalist.consume)}</Text>}
                {datalist.income != 0 && <Text>收入:￥{toPriceYuan(datalist.income)}</Text>}
                {datalist.refund != 0 && <Text>退款:￥{toPriceYuan(datalist.refund)}</Text>}
                {datalist.withdraw != 0 && <Text>提现:￥{toPriceYuan(datalist.withdraw)}</Text>}
              </View>
            )}

            {list.length > 0 ? (
              <Block>
                {list.map(item => {
                  return (
                    <View className='row top' onClick={() => { this.gojump(item.businessType, item.type, item.businessId, item.refundId) }}>
                      <View className='row-col'>
                        {item.type == 'withdraw' && (
                          <View className='title'>{item.detail}</View>
                        )}
                        {item.type == 'consume' && (
                          <View className='title'>支付</View>
                        )}
                        {item.type == 'refund' && (
                          <View className='title'>退款</View>
                        )}
                        {item.type == 'recharge' && (
                          <View className='title'>充值</View>
                        )}
                        {item.type == 'income' && (
                          <View className='title'>收入</View>
                        )}
                        <View className='detail'>{item.detail}</View>
                      </View>
                      <View className='row-col'>
                        <View className='col-price'>{item.amount} 元</View>
                        <View className='time'>{item.createTime}</View>
                      </View>
                    </View>
                  )
                })}
              </Block>
            ) : (
                <View className="no-data-view">
                  <Image src='../../images/item/qt_89.png' mode="widthFix" className="no-data-image"></Image>
                  <View className="no-data-text mText">还没有明细哦~</View>
                </View>
              )}
          </Block>
        )}
      </Block>

    );
  }
}