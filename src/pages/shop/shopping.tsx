import Taro, { Component, Config } from "@tarojs/taro";
import {
  Block,
  View,
  Text,
  Image
} from "@tarojs/components";
import "./shopping.scss";
import { getstoreProduct, getClassTitle } from "@/api/shop"
import { unique } from "@/utils/format"
import { cartNum } from "@/api/index"

export default class Index extends Component {
  state = {
    imageurl: "https://guyu-1300342109.cos.ap-guangzhou.myqcloud.com",
    showup: true,
    titleList: [],
    providerList: [],
    list: [],
    next_page: false,
    titleid: '',
    pageNum: 1,
    ismodel: false,
    loading: false,
    storeName: ''
  };
  // 获取购物车数量
  getCartNum = async () => {
    const res = await cartNum()
    if (res.data.code == 20000) {
      let text = res.data.data.qty
      text = JSON.stringify(text)
      if (text > 0) {
        Taro.setTabBarBadge({
          index: 3,
          text: text
        })
      }
    }
  }

  componentDidShow() {
    this.setState({ ismodel: false, showup: true })
    this.getCartNum()
  }
  componentDidMount() {
    this.getHeadertitle()
    this.getstoreList(this.state.pageNum, '', this.state.storeName)
  }
  // 去到商品详情
  gotodetail() {
    Taro.navigateTo({
      url: '../../pagesCommon/goods/goods-detail'
    })
  }
  // 进入批发商
  gowholesaler(e) {
    var storeid = e.currentTarget.dataset.storeid
    Taro.navigateTo({
      url: '../../pagesCommon/wholesaler/wholesaler?storeId=' + storeid
    })
  }
  // 获取头部分类
  getHeadertitle = async () => {
    var params = { type: 20 }
    const res = await getClassTitle(params)
    this.setState({ titleList: res.data.data })
  }
  // 切换分类
  chooseSidebar(e) {
    const titleid = e.currentTarget.dataset.titleid
    this.setState({ titleid: titleid, pageNum: 1, list: [], ismodel: false, showup: true })
    this.getstoreList('1', titleid, this.state.storeName)
  }
  // 获取店铺分类
  getstoreList = async (pageNum, titleid, storeName) => {
    let params = {}
    if (titleid) {
      params = { pageNum: pageNum, pageSize: 20, businessType: titleid, storeName }
    } else {
      params = { pageNum: pageNum, pageSize: 20, businessType: '', storeName }
    }
    Taro.showLoading({
      title: '加载中'
    })
    const res = await getstoreProduct(params)
    this.setState({ loading: true })
    Taro.hideLoading()
    if (res.data.code == 20000) {
      let providerList = res.data.data.list
      // 数组去重
      var result = [];
      var obj = {};
      for (var i = 0; i < providerList.length; i++) {
        if (!obj[providerList[i].storeId]) {
          result.push(providerList[i]);
          obj[providerList[i].storeId] = true;
        }
      }

      const list = this.state.list
      if (result.length > 0) {
        result.map(item => {
          list.push(item)
        })
      }
      console.log(list)
      this.setState({ providerList: list })
    }
  }
  // 去到商品详情
  godetail(e) {
    console.log(e)
    const { id, storeid } = e.currentTarget.dataset
    Taro.navigateTo({
      url: '../../pagesCommon/goods/goods-detail?id=' + id + '&storeId=' + storeid
    })
  }
  onReachBottom() {
    this.state.pageNum++
    console.log(this.state.pageNum)
    this.getstoreList(this.state.pageNum, this.state.titleid, this.state.storeName)
  }
  // 显示全部分类
  showdetail() {
    this.setState({ ismodel: true, showup: false })
  }
  hidedetail() {
    this.setState({ ismodel: false, showup: true })
  }
  getstore(e) {
    this.setState({ storeName: e.detail.value })
  }
  serach() {
    this.setState({ providerList: [], list: [], pageNum: 1 })
    this.getstoreList(1, this.state.titleid, this.state.storeName)
  }

  config: Config = {
    navigationBarTitleText: "店铺"
  };
  render() {
    const { titleList, showup, titleid, ismodel, loading } = this.state
    return (
      <View className="container">
        <View className='confixed'>
          <View className="search" onClick={this.gosearch}>
            <Input placeholder="请输入供应商名称" placeholderClass="placestyle" onInput={this.getstore}></Input>
            <View onClick={this.serach}>搜索</View>
          </View>
          <View className='titlecheck'>
            <ScrollView scrollX="true" className="nav-header-view">
              {titleList.map((item, index) => {
                return (
                  <View
                    className={
                      'header-col-view ' + (titleid == item.id ? 'back' : '')
                    }
                    data-titleid={item.id}
                    onClick={this.chooseSidebar}
                  >
                    <Text>{item.name}</Text>
                  </View>
                )
              })}
            </ScrollView>
            {showup ? (
              <View className="down" onClick={this.showdetail}>
                <Image src={require('../../images/item/qt_111.png')}></Image>
              </View>
            ) : (
                <View className="down" onClick={this.hidedetail}>
                  <Image src={require('../../images/item/qt_106-31.png')}></Image>
                </View>
              )}
            {ismodel && (
              <View className='alltitle'>
                <View className='allflex'>
                  {titleList.map((li, index) => {
                    return (
                      <View data-titleid={li.id} onClick={this.chooseSidebar}>{li.name}</View>
                    )
                  })}
                </View>
              </View>
            )}

          </View>
        </View>

        {loading && (
          <View className="conright">
            {providerList.length > 0 ? (
              <Block>
                {providerList.map((item, index) => {
                  return (
                    <View className="conproducts">
                      <View className="shop_store">
                        <View style="flex-direction:column;display:flex;width:200px;">
                          <Text className="shopping">{item.storeName}</Text>
                          <Text className="subhead">{item.storeInfo}</Text>
                        </View>
                        <View className='gotos'>
                          <Text className="goinstore" data-storeid={item.storeId} onClick={this.gowholesaler}>进入店铺</Text>
                          <Text className="prod_quant">已售<Text style="color:#FF840B !important;">{item.salesQuantity ? item.salesQuantity : '0'}</Text>件</Text>
                        </View>
                      </View>
                      <View className="flex-con">
                        {item.productList.map((val, index) => {
                          return (
                            <View className="trade-box" onClick={this.godetail} data-id={val.id} data-storeid={val.storeId}>
                              <Image src={imageurl + val.iconUrl}></Image>
                              <Text className="trade-name">{val.name}</Text>
                            </View>
                          )
                        })}
                      </View>
                    </View>
                  )
                })}
              </Block>
            ) : (
                <View className="no-data-view">
                  <Image
                    src={require('../../images/item/qt_89.png')}
                    mode="widthFix"
                    className="no-data-image"
                  ></Image>
                  <Text className="mText" className="no-data-text">
                    此分类没有数据
              </Text>
                </View>
              )}
          </View>
        )}
      </View>
    );
  }
}
