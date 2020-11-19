import Taro, { Component, Config } from "@tarojs/taro";
import {
  Block,
  View,
  Text,
  Image,
  Input,
  Icon
} from "@tarojs/components";
import "./search-list.scss";
import { getCateProduct, getStore } from "@/api/category"

export default class Index extends Component {

  state = {
    imageurl: 'https://guyu-1300342109.cos.ap-guangzhou.myqcloud.com',
    productlist: [],//商品列表
    serTxt: '',
    isShow: false,
    type: 'product',
    providerList: [],//店铺列表

    order_by_field: '',
    highLevel: ["所有", "尊品", "优品", "好品"],
    islevel: false,
    leveltxt: '',
    isScreen: true,
    downshow: false,
    upshow: false,
    downshow1: false,
    upshow1: false,
    pageNum: 1,
    asc: '',
    productdata: [],
    levelshow: false,
    qtyasc: '',
    level: '',
    priceasc: '',
    goodasc: '',
    ascy: false,
    isSearch: false,
    loading: false,
    loading1: false
  };
  config: Config = {
    navigationBarTitleText: "搜索商品",

  };
  componentDidMount() {

  }
  onReachBottom() {
    this.state.pageNum++;
    Taro.showLoading({
      title: '加载中...'
    })
    if (this.state.type == 'product') {
      if (this.state.leveltxt == '所有') {
        this.getCateProduct(this.state.pageNum, this.state.order_by_field, this.state.asc, '')
      } else {
        this.getCateProduct(this.state.pageNum, this.state.order_by_field, this.state.asc, this.state.leveltxt)
      }
    } else {
      this.getCateStore(this.state.pageNum, this.state.serTxt)
    }


  }
  // 输入商品
  focusInput(e) {
    this.setState({ serTxt: e.detail.value })
  }
  // 搜索
  async searchClick() {
    Taro.showLoading()
    this.setState({ pageNum: 1, loading: false, loading1: false, isSearch: true, providerList: [], productlist: [], order_by_field: '', upshow: false, downshow: false, downshow1: false, upshow1: false, levelshow: false })
    if (this.state.type == 'product') {
      this.getCateProduct(1, '', '', '')
    } else {
      this.getCateStore(1, this.state.serTxt)
    }
  }
  // 获取商品
  getCateProduct = async (pageNum, orderBy, asc, level) => {
    let params = { pageNum: pageNum, pageSize: 10, name: this.state.serTxt, orderBy: orderBy, asc: asc, level: level }
    const res = await getCateProduct(params)
    this.setState({ loading: true })
    if (res.data.code == 20000) {
      Taro.hideLoading()
      const productdata = res.data.data.list
      const productlist = this.state.productlist
      if (productdata.length > 0) {
        productdata.map(item => {
          item.price = parseFloat(item.price / 100).toFixed(2)
          productlist.push(item)
        })
        this.setState({ productlist, isShow: true, islevel: false })
      } else {
        if (pageNum > 1) {
          Taro.showToast({
            title: '没有数据啦',
            icon: 'none'
          })
        }
      }
    }
  }

  // 获取店铺信息
  getCateStore = async (pageNum, serTxt) => {
    const params = { pageNum: pageNum, pageSize: 10, productName: serTxt }
    const res = await getStore(params)
    this.setState({ loading1: true })
    Taro.hideLoading()
    const list = res.data.data.list
    const providerList = this.state.providerList
    if (list.length > 0) {
      list.map(item => {
        providerList.push(item)
      })
      this.setState({ providerList, isShow: true })
    } else {
      if (pageNum > 1) {
        Taro.showToast({
          title: '没有数据啦',
          icon: 'none'
        })
      }
    }
  }
  // 切换商品或店铺
  checkClass(e) {
    const type = e.currentTarget.dataset.type
    let { isSearch, leveltxt } = this.state
    if (leveltxt == '所有') {
      leveltxt = ''
    } else {
      leveltxt = leveltxt
    }
    console.log(leveltxt)
    this.setState({ providerList: [], productlist: [] })
    if (type == 'product') {
      this.setState({ loading: false, loading1: false, type: e.currentTarget.dataset.type, pageNum: 1, isScreen: true })
      if (isSearch) {
        Taro.showLoading()
        this.getCateProduct(1, this.state.order_by_field, this.state.asc, leveltxt);
      }
    } else {
      this.setState({ type: e.currentTarget.dataset.type, pageNum: 1, isScreen: false })
      if (isSearch) {
        Taro.showLoading()
        this.getCateStore(1, this.state.serTxt)
      }
    }

  }

  // 切换销量，价格，好评
  checkItem(e) {
    const ascy = !this.state.ascy
    const asc = ascy ? '1' : '0'
    const meth = e.currentTarget.dataset.meth;
    let { leveltxt } = this.state
    leveltxt = leveltxt == '所有' ? '' : leveltxt
    Taro.showLoading()
    this.setState({ loading: false, loading1: false, order_by_field: meth, pageNum: 1, asc, ascy, qtyasc: asc, priceasc: asc, goodasc: asc, level: '' })
    if (meth == 'salesQty') {
      this.setState({ levelshow: false, productlist: [], priceasc: '', goodasc: '' })
      this.getCateProduct(1, meth, asc, leveltxt);
    } else if (meth == 'price') {
      this.setState({ levelshow: false, productlist: [], qtyasc: '', goodasc: '' })
      this.getCateProduct(1, meth, asc, leveltxt);
    } else if (meth == 'appraise') {
      this.setState({ levelshow: false, productlist: [], priceasc: '', qtyasc: '' })
      this.getCateProduct(1, meth, asc, leveltxt);
    }
  }

  // 显示优质等级
  showLevel() {
    let islevel = this.state.islevel
    islevel = !islevel
    this.setState({ level: 'level', pageNum: 1, levelshow: true, islevel, order_by_field: '', goodasc: '' });
  }
  // 获取优质等级
  chooselevel(e) {
    Taro.showLoading()
    const leveltxt = e.currentTarget.dataset.level;
    this.setState({ loading: false, loading1: false, productlist: [], pageNum: 1, islevel: false, asc: '', leveltxt: leveltxt });
    if (leveltxt == "所有") {
      this.getCateProduct(1, "", "", "");
    } else {
      this.getCateProduct(1, "", "", leveltxt);
    }
  }


  render() {
    let { goodasc, productlist, isShow, type, providerList, leveltxt, isScreen, levelshow, loading, loading1 } = this.state
    return (
      <Block>

        <View className='search-msg'>
          <View className="search">
            <View className="searchview">
              <Input onInput={this.focusInput}
                placeholder="请输入你想要采购的商品"
                placeholderClass="placestyle"
              ></Input>
            </View>
            <Text className='sear' onClick={this.searchClick}>搜索</Text>
          </View>
          <View className='checkItem'>
            {type == "product" ? (
              <View className="green" data-type="product" onClick={this.checkClass}>商品</View>
            ) : (
                <View data-type="product" onClick={this.checkClass}>商品</View>
              )}
            {type == "store" ? (
              <View className="green" data-type="store" onClick={this.checkClass}>店铺</View>
            ) : (
                <View data-type="store" onClick={this.checkClass}>店铺</View>
              )}

          </View>
        </View>

        <View style='flex-direction:column;'>
          {isScreen && (
            <View className='sort'>
              <View className='sort-a'>
                <Text className={order_by_field == "salesQty" ? "rank-name" : ""}
                  data-meth="salesQty"
                  onClick={this.checkItem}>销量</Text>
                <View className='sort-img'>
                  {qtyasc == '1' ? (
                    <Image
                      src="../../images/item/gy-icon_22.png"
                    ></Image>
                  ) : (
                      <Image
                        src="../../images/item/gy-icon_24.png"
                      ></Image>
                    )}

                  {qtyasc == '0' ? (
                    <Image
                      src="../../images/item/gy-icon_36.png"
                    ></Image>
                  ) : (
                      <Image
                        src="../../images/item/gy-icon_38.png"
                      ></Image>
                    )}
                </View>
              </View>
              <View className='sort-a'>
                <Text className={order_by_field == "price" ? "rank-name" : ""}
                  data-meth="price"
                  onClick={this.checkItem}>价格</Text>
                <View className='sort-img'>
                  {priceasc == '1' ? (
                    <Image
                      src="../../images/item/gy-icon_22.png"
                    ></Image>
                  ) : (
                      <Image
                        src="../../images/item/gy-icon_24.png"
                      ></Image>
                    )}

                  {priceasc == '0' ? (
                    <Image
                      src="../../images/item/gy-icon_36.png"
                    ></Image>
                  ) : (
                      <Image
                        src="../../images/item/gy-icon_38.png"
                      ></Image>
                    )}
                </View>
              </View>
              <View className='sort-a'>
                <Text className={order_by_field == "appraise" ? "rank-name" : ""}
                  data-meth="appraise"
                  onClick={this.checkItem}>好评</Text>
                <View className='sort-img'>
                  {/* {greatshow ? (
                    <Image src={require('../../images/item/gy-icon_36.png')}></Image>
                  ) : (
                      <Image src={require('../../images/item/gy-icon_38.png')}></Image>
                    )} */}
                  {goodasc == '1' ? (
                    <Image
                      src="../../images/item/gy-icon_22.png"
                    ></Image>
                  ) : (
                      <Image
                        src="../../images/item/gy-icon_24.png"
                      ></Image>
                    )}

                  {goodasc == '0' ? (
                    <Image
                      src="../../images/item/gy-icon_36.png"
                    ></Image>
                  ) : (
                      <Image
                        src="../../images/item/gy-icon_38.png"
                      ></Image>
                    )}

                </View>
              </View>
              <View className='sort-a screen' onClick={this.showLevel} data-meth="level">
                <Text className={level == "level" ? "rank-name" : ""}>优质等级:{leveltxt ? leveltxt : '所有'}</Text>
                <View className='sort-img'>
                  {levelshow ? (
                    <Image src={require('../../images/item/gy-icon_36.png')}></Image>
                  ) : (
                      <Image src={require('../../images/item/gy-icon_38.png')}></Image>
                    )}

                </View>

                {islevel && (
                  <View className="levels">
                    {highLevel.map(lev => {
                      return (
                        <View data-level={lev} onClick={this.chooselevel}>
                          {lev}
                        </View>
                      );
                    })}
                  </View>
                )}
              </View>
            </View>
          )}

          {loading && (
            <Block>
              {type == "product" && (
                <Block>
                  {isShow && (
                    <View >
                      {productlist.length > 0 ? (
                        <View className='search-content'>
                          {productlist.map(item => {
                            return (
                              <View className='con-a' onClick={() => { Taro.navigateTo({ url: '../goods/goods-detail?id=' + item.id + '&storeId=' + item.storeId }) }}>
                                <Image src={imageurl + item.iconUrl}></Image>
                                <View className='con-name'>
                                  <Text>{item.name}</Text>
                                  {item.spec1Name ? (
                                    <Text className='name-spec'>{item.spec1Name}:{item.spec1Value}</Text>
                                  ) : (
                                      <Text className='name-spec'></Text>
                                    )}

                                  <View className='addcart'>
                                    <Text><Text style='font-size:22rpx;'>￥</Text>{item.price}</Text>
                                    <Image src='../../images/item/gy-icon_06.png'></Image>
                                  </View>
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
                              className="no-data-image"></Image>
                            <View className="mText" className="no-data-text">此分类没有商品</View>
                          </View>
                        )}
                    </View>
                  )}
                </Block>
              )}
            </Block>
          )}

          {loading1 && (
            <Block>
              {type == "store" && (
                <Block>
                  {isShow && (
                    <View className="conright">
                      {providerList.length > 0 ? (
                        <Block>
                          {providerList.map((item, index) => {
                            return (
                              <View className="conproducts">
                                <View className="shop_store">
                                  <View style="flex-direction:column;display:flex;">
                                    <Text className="shopping">{item.storeName}</Text>
                                    <Text className="subhead">{item.storeInfo}</Text>
                                  </View>
                                  <View className='gotos'>
                                    <Text className="goinstore" onClick={() => { Taro.navigateTo({ url: '../wholesaler/wholesaler?storeId=' + item.storeId }) }}>进入店铺</Text>
                                    <Text className="prod_quant">已售<Text style="color:#FF840B !important;">{item.salesQuantity}</Text>件</Text>
                                  </View>
                                </View>
                                <View className="flex-con">
                                  {item.productList.map((val, index) => {
                                    return (
                                      <View className="trade-box" onClick={() => { Taro.navigateTo({ url: '../goods/goods-detail?storeId=' + val.storeId + '&id=' + val.id }) }}>
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
                            <View className="mText" className="no-data-text"> 此分类没有数据</View>
                          </View>
                        )}
                    </View>
                  )}
                </Block>
              )}
            </Block>
          )}
        </View>
      </Block>
    );
  }
}
