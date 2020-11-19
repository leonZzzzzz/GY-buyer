import Taro, { Component, Config } from "@tarojs/taro";
import {
  Block,
  View,
  Text,
  Image,
  Input,
  ScrollView
} from "@tarojs/components";
import "./index.scss";
import { getCategorys, getCateProduct } from "@/api/category";
import { cartNum } from "@/api/index";
const app = Taro.getApp();

export default class Index extends Component {
  // 去到商品详情
  gotodetail(e) {
    const { prodid, storeid } = e.currentTarget.dataset;
    Taro.navigateTo({
      url:
        "../../pagesCommon/goods/goods-detail?id=" +
        prodid +
        "&storeId=" +
        storeid
    });
  }
  // 进入批发商
  gowholesaler(e) {
    // var storeid = e.currentTarget.dataset.storeid
    Taro.navigateTo({
      url: "../../pagesCommon/wholesaler/wholesaler"
    });
  }
  state = {
    imageurl: "https://guyu-1300342109.cos.ap-guangzhou.myqcloud.com",
    order_by_field: "",
    showup: false,
    secondup: false,
    firstid: "",
    secondid: "",
    thirdid: "",
    productlist: [],
    next_page: false,
    firstData: [],
    secondData: [],
    thirdData: [],
    secondname: "",
    highLevel: ["所有", "尊品", "优品", "好品"],
    islevel: false,
    leveltxt: '', levelshow: false, toView: '',
    asc: '',
    qtyasc: '',
    level: '',
    priceasc: '',
    goodasc: '',
    ascy: false,
    pageNum: 1,
    oneId: '',
    loading: false, second: ''
  };
  config: Config = {
    navigationBarTitleText: "商品分类"
  };
  // 搜索商品
  gosearch() {
    Taro.navigateTo({
      url: "../../pagesCommon/search/search-list"
    });
  }
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
  componentDidMount() {
    const firstid = app.globalData.firstId;
    console.log('firstid', firstid)
    if (!firstid) {
      this.setState({ firstid: '' })
      this.getfirstCate(firstid);
    }
  }
  componentDidShow() {
    const firstid = app.globalData.firstId;
    const toView = app.globalData.toView;
    console.log('toView', toView)
    if (toView) {
      this.setState({ toView })
    }

    if (firstid) {
      this.setState({ firstid })
      this.getfirstCate(firstid);
    }
    if (Taro.getStorageSync("memberid")) {
      this.getCartNum()
    }
  }
  componentDidHide() {
    app.globalData.firstId = ''
  }
  componentWillUnmount() {
    app.globalData.firstId = ''
  }
  // 获取一级分类
  getfirstCate = async (firstid) => {
    const params = { type: 1, parentId: "" };
    const res = await getCategorys(params);
    Taro.hideLoading()
    if (res.data.code == 20000) {
      var firstData = res.data.data;
      if (firstid) {
        firstid = firstid;
        this.setState({ pageNum: 1, secondid: '', oneId: '', thirdid: '', second: '' })
        this.getCateProduct(1, firstid, "", "", "");
      } else {
        firstid = firstData[0].id;
        this.getCateProduct(this.state.pageNum, firstid, "", "", "");
      }
      Taro.showLoading()
      this.getSecondCate(firstid);
      this.setState({
        productlist: [],
        firstData: firstData,
        firstid: firstid,
        oneId: firstid
      });
      // this.getCateProduct(this.state.pageNum, firstid, "", "", "");

    }
  };
  // 获取二级分类
  getSecondCate = async firstid => {
    const params = { type: 1, parentId: firstid };
    const res = await getCategorys(params);
    Taro.hideLoading()
    if (res.data.code == 20000) {
      if (res.data.data.length > 0) {
        let secondData = res.data.data;
        this.setState({
          secondData: secondData,
          secondid: secondData[0].id,
          // second: secondData[0].id,
          // oneId: secondData[0].id,
          secondname: secondData[0].name
        });
        const pes = { type: 1, parentId: secondData[0].id };
        this.getThirdCate(pes);

        // this.getCateProduct(this.state.pageNum, secondData[0].id, "", "", "")
      } else {
        this.setState({ secondData: [], thirdData: [], secondname: "" });
      }
    }
  };
  // 获取三级分类
  getThirdCate = async params => {
    const res = await getCategorys(params);
    if (res.data.code == 20000) {
      if (res.data.data.length > 0) {
        const thirdData = res.data.data;
        // const thirdid = thirdData[0].id;
        this.setState({ thirdData: thirdData });
        // this.getCateProduct(thirdid)
      } else {
        this.setState({ thirdData: [] });
      }
    }
  };
  // 切换一级分类
  swichSwiperItem(e) {
    const firstid = e.currentTarget.dataset.firstid;
    const name = e.currentTarget.dataset.name;
    console.log('toView2', name)
    this.setState({
      leveltxt: '', level: '', levelshow: false, second: '', loading: false, pageNum: 1, productlist: [], toView: name, firstid: firstid, oneId: firstid, thirdid: '',
      order_by_field: '', qtyasc: '', priceasc: '', goodasc: ''
    });
    Taro.showLoading()
    this.getCateProduct(1, firstid, "", "", "");
    this.getSecondCate(firstid);
  }
  // 切换二级分类
  secondSwiperItem(name, id) {
    const pes = { type: 1, parentId: id };
    this.getThirdCate(pes);
    this.setState({
      leveltxt: '', level: '', levelshow: false, loading: false, pageNum: 1, productlist: [], secondname: name, secondid: id, second: id, oneId: id, thirdid: '',
      order_by_field: '', qtyasc: '', priceasc: '', goodasc: ''
    });
    Taro.showLoading()
    this.getCateProduct(1, id, "", "", "");
  }
  // 切换三级分类
  thirdSwiperItem(id) {
    this.setState({ leveltxt: '', level: '', levelshow: false, loading: false, pageNum: 1, productlist: [], thirdid: id, oneId: id, qtyasc: '', priceasc: '', goodasc: '' })
    Taro.showLoading()
    this.getCateProduct(1, id, "", "", "");
  }
  // 获取分类商品
  getCateProduct = async (pageNum, thirdid, orderBy, asc, level) => {
    let params = {
      pageNum: pageNum,
      pageSize: 10,
      categoryId: thirdid,
      orderBy: orderBy,
      asc: asc,
      level: level
    };
    const res = await getCateProduct(params);
    this.setState({ loading: true })
    Taro.hideLoading()
    if (res.data.code == 20000) {
      const list = res.data.data.list;
      const productlist = this.state.productlist;
      if (list.length > 0) {
        list.map(item => {
          item.price = parseFloat(item.price / 100).toFixed(2);
          productlist.push(item)
        });
        this.setState({ productlist, islevel: false });
      } else {
        if (pageNum > 1) {
          Taro.showToast({
            title: '数据加载完毕',
            icon: 'none'
          })
        }
      }
    }
  };
  onReachBottom() {
    Taro.showLoading()
    this.state.pageNum++
    if (this.state.leveltxt == '所有') {
      this.getCateProduct(this.state.pageNum, this.state.oneId, this.state.order_by_field, this.state.asc, '')
    } else {
      this.getCateProduct(this.state.pageNum, this.state.oneId, this.state.order_by_field, this.state.asc, this.state.leveltxt)
    }

  }

  // 切换销量，价格，好评
  checkItem(e) {
    const ascy = !this.state.ascy
    const asc = ascy ? '1' : '0'
    const meth = e.currentTarget.dataset.meth;
    let { oneId, firstid, secondid, thirdid, leveltxt } = this.state
    leveltxt = leveltxt == '所有' ? '' : leveltxt
    Taro.showLoading()
    this.setState({ loading: false, order_by_field: meth, pageNum: 1, asc, ascy, qtyasc: asc, priceasc: asc, goodasc: asc, level: '' })
    if (meth == 'salesQty') {
      this.setState({ levelshow: false, productlist: [], priceasc: '', goodasc: '' })
      this.getCateProduct(1, oneId, meth, asc, leveltxt);
    } else if (meth == 'price') {
      this.setState({ levelshow: false, productlist: [], qtyasc: '', goodasc: '' })
      this.getCateProduct(1, oneId, meth, asc, leveltxt);
    } else if (meth == 'appraise') {
      this.setState({ levelshow: false, productlist: [], priceasc: '', qtyasc: '' })
      this.getCateProduct(1, oneId, meth, asc, leveltxt);
    }
  }

  // 显示优质等级
  showLevel() {
    let islevel = this.state.islevel
    islevel = !islevel
    this.setState({ level: 'level', pageNum: 1, levelshow: true, islevel, order_by_field: '', qtyasc: '', priceasc: '', goodasc: '' });
  }
  // 获取优质等级
  chooselevel(e) {
    Taro.showLoading()
    const leveltxt = e.currentTarget.dataset.level;
    const { oneId } = this.state
    this.setState({ loading: false, productlist: [], pageNum: 1, islevel: false, asc: '', leveltxt: leveltxt });
    if (leveltxt == "所有") {
      this.getCateProduct(1, oneId, "", "", "");
    } else {
      this.getCateProduct(1, oneId, "", "", leveltxt);
    }
  }


  // 一级全部分类
  choosemeth(id, code) {
    console.log('toView3', code)
    Taro.showLoading()
    this.setState({ pageNum: 1, toView: code, firstid: id, oneId: id, showup: false, productlist: [] });
    this.getCateProduct(1, id, "", "", "");
    this.getSecondCate(id);

  }
  // 三级分类全部
  allThirdItem(id) {
    Taro.showLoading()
    this.getCateProduct(1, id, "", "", "");
    this.setState({ pageNum: 1, thirdid: id, secondup: false })
  }
  // 显示全部分类
  showAll() {
    this.setState({ showup: true });
  }
  hideAll() {
    this.setState({ showup: false });
  }
  // 显示次级分类
  showSecond() {
    this.setState({ secondup: true });
  }
  secondDown() {
    this.setState({ secondup: false });
  }


  render() {
    const {
      qtyasc,
      priceasc,
      goodasc,
      levelshow,
      productlist,
      firstid,
      secondData,
      firstData,
      thirdData,
      thirdid,
      order_by_field,
      highLevel,
      islevel,
      leveltxt, secondid, toView, loading, second
    } = this.state;
    return (
      <Block>
        <View style="background:#fff;position:fixed;top:0;z-index:99">
          <View className="search" onClick={this.gosearch}>
            <Input placeholder="请输入你想要采购的商品" placeholderClass="placestyle"></Input>
          </View>
          <View className="scroll-view">
            <ScrollView scrollX="true" className="nav-header-view" scrollIntoView={toView}>
              {firstData.map((item, index) => {
                return (
                  <View
                    className={"header-col-view " + (firstid == item.id ? "show-border-bottom" : "")}
                    data-firstid={item.id}
                    data-code={item.code}
                    onClick={this.swichSwiperItem}
                    key={item.id}
                    id={item.code}>
                    <Text>{item.name}</Text>
                  </View>
                );
              })}
            </ScrollView>

            <View className="down" onClick={this.showAll}>
              <Image src={Taro.getStorageSync('imgHostItem') + 'catelog.png'}></Image>
            </View>
          </View>
          {/*  全部分类  */}
          {this.state.showup && (
            <View className="allmodel">
              <View className='opamodel' onClick={this.hideAll}></View>
              <View className="allmethod">
                <View className="allin">
                  <Text>全部分类</Text>
                  <Image
                    onClick={this.hideAll}
                    src={Taro.getStorageSync('imgHostItem') + 'delete.png'}
                  ></Image>
                </View>
                <View className="fruitall">
                  <View className="fruitflex">
                    {firstData.map((item, index) => {
                      return (
                        <Text
                          key={item.id}
                          onClick={() => {
                            this.choosemeth(item.id, item.code);
                          }}
                          className={firstid == item.id ? "show-back" : ""}
                        >
                          {item.name}
                        </Text>
                      );
                    })}
                  </View>
                </View>
              </View>
            </View>

          )}
        </View>
        {/* 二级分类 */}
        <View className="container">
          <View className="conleft left-one">
            {secondData.map((seitem, index) => {
              return (
                <View key={seitem.id} className={second == seitem.id ? 'seback' : ''} onClick={() => { this.secondSwiperItem(seitem.name, seitem.id) }}>
                  <Text>{seitem.name}</Text>
                </View>
              );
            })}
          </View>
          <View className="conright">
            {/* 三级分类 */}
            {thirdData.length > 0 && (
              <View className="two-cate">
                <ScrollView
                  scrollX="true"
                  className="second"
                  scrollIntoView={firstid > "126" ? "listReturn_" + firstid : ""}>
                  {thirdData.map((item, index) => {
                    return (
                      <View
                        key={item.id}
                        className="second-bor"
                        onClick={() => { this.thirdSwiperItem(item.id) }}
                        id={
                          item.cat_id > "126" ? "listReturn_" + item.cat_id : ""
                        }>
                        <View className={thirdid == item.id ? "show-back" : ""}>
                          <Text>{item.name}</Text>
                        </View>
                      </View>
                    );
                  })}
                </ScrollView>
                <View className="two-down" onClick={this.showSecond}>
                  <Image src={Taro.getStorageSync('imgHostItem') + 'qt_111.png'}></Image>
                </View>
              </View>
            )}

            {/* 三级分类全部 */}
            {this.state.secondup && (
              <View className='secmodel'>
                <View className='secopa' onClick={this.secondDown}></View>
                <View className="subclass">
                  {/* <View className='secondmodel'></View> */}
                  <View className="subclass-title">
                    <Text>{secondname}</Text>
                    <Image
                      onClick={this.secondDown}
                      src={Taro.getStorageSync('imgHostItem') + 'qt_106-31.png'}
                    ></Image>
                  </View>
                  <View className="subclass-name">
                    {thirdData.map(item => {
                      return (
                        <View
                          key={item.id}
                          onClick={() => {
                            this.allThirdItem(item.id);
                          }}
                          className={thirdid == item.id ? " show-back" : ""}
                        >
                          {item.name}
                        </View>
                      );
                    })}
                  </View>
                </View>
              </View>

            )}

            {/* 排序类 */}
            <View className="contitle">
              <View className="screen">
                <Text
                  className={order_by_field == "salesQty" ? "reds" : ""}
                  data-meth="salesQty"
                  onClick={this.checkItem}
                >
                  销量
                </Text>
                <View className="screen-a">
                  {qtyasc == '1' ? (
                    <Image
                      src={Taro.getStorageSync('imgHostItem') + 'gy-icon_22.png'}
                    ></Image>
                  ) : (
                      <Image
                        src={Taro.getStorageSync('imgHostItem') + 'gy-icon_24.png'}
                      ></Image>
                    )}

                  {qtyasc == '0' ? (
                    <Image
                      src={Taro.getStorageSync('imgHostItem') + 'gy-icon_36.png'}
                    ></Image>
                  ) : (
                      <Image
                        src={Taro.getStorageSync('imgHostItem') + 'gy-icon_38.png'}
                      ></Image>
                    )}
                </View>
              </View>
              <View className="screen">
                <Text
                  className={order_by_field == "price" ? "reds" : ""}
                  data-meth="price"
                  onClick={this.checkItem}
                >
                  价格
                </Text>
                <View className="screen-a">
                  {priceasc == '1' ? (
                    <Image
                      src={Taro.getStorageSync('imgHostItem') + 'gy-icon_22.png'}
                    ></Image>
                  ) : (
                      <Image
                        src={Taro.getStorageSync('imgHostItem') + 'gy-icon_24.png'}
                      ></Image>
                    )}

                  {priceasc == '0' ? (
                    <Image
                      src={Taro.getStorageSync('imgHostItem') + 'gy-icon_36.png'}
                    ></Image>
                  ) : (
                      <Image
                        src={Taro.getStorageSync('imgHostItem') + 'gy-icon_38.png'}
                      ></Image>
                    )}
                </View>
              </View>
              <View className="screen">
                <Text
                  className={order_by_field == "appraise" ? "reds" : ""}
                  data-meth="appraise"
                  onClick={this.checkItem}>好评</Text>
                <View className='screen-a'>
                  {/* {!greatshow ? (
                    <Image src='../../images/item/gy-icon_38.png'></Image>
                  ) : (
                      <Image src='../../images/item/gy-icon_36.png'></Image>
                    )} */}
                  {goodasc == '1' ? (
                    <Image
                      src={Taro.getStorageSync('imgHostItem') + 'gy-icon_22.png'}
                    ></Image>
                  ) : (
                      <Image
                        src={Taro.getStorageSync('imgHostItem') + 'gy-icon_24.png'}
                      ></Image>
                    )}

                  {goodasc == '0' ? (
                    <Image
                      src={Taro.getStorageSync('imgHostItem') + 'gy-icon_36.png'}
                    ></Image>
                  ) : (
                      <Image
                        src={Taro.getStorageSync('imgHostItem') + 'gy-icon_38.png'}
                      ></Image>
                    )}

                </View>
              </View>
              <View className="screen screen-pos" onClick={this.showLevel}>
                <Text className={level == "level" ? "reds" : ""} data-meth="sales">
                  优质等级:{leveltxt ? leveltxt : '所有'}
                </Text>
                <View className="screen-a">
                  {!levelshow ? (
                    <Image src={Taro.getStorageSync('imgHostItem') + 'gy-icon_38.png'}></Image>
                  ) : (
                      <Image src={Taro.getStorageSync('imgHostItem') + 'gy-icon_36.png'}></Image>
                    )}

                </View>
                {islevel && (
                  <View className="levels">
                    {highLevel.map(lev => {
                      return (
                        <Text data-level={lev} onClick={this.chooselevel}>
                          {lev}
                        </Text>
                      );
                    })}
                  </View>
                )}
              </View>
            </View>
            {loading && (
              <View className="conproducts">
                <View className="flex-con">
                  {productlist.length > 0 ? (
                    <Block>
                      {productlist.map(item => {
                        return (
                          <View
                            className="trade-box"
                            data-storeid={item.storeId}
                            data-prodid={item.id}
                            key={item.id}
                            onClick={this.gotodetail}
                          >
                            <Image src={imageurl + item.iconUrl}></Image>
                            <Text className="trade-name">{item.name}</Text>
                            {item.spec1Name ? (
                              <View className="trade-prc">{item.spec1Name}:{item.spec1Value}</View>
                            ) : (
                                <View className="trade-prc"></View>
                              )}

                            <View className="trade-price">
                              <View className="trade-add">
                                <Text style="font-size:30rpx;">{item.price}</Text>
                                <Text style="font-size:24rpx !important;margin-top:6rpx;margin-left:5rpx">
                                  元/{item.unit}
                                </Text>
                              </View>
                              <Image src="../../images/item/gy-icon_06.png"></Image>
                            </View>
                          </View>
                        );
                      })}
                    </Block>
                  ) : (
                      <View className="no-data-view">
                        <Image
                          src={Taro.getStorageSync('imgHostItem') + 'qt_89.png'}
                          mode="widthFix"
                          className="no-data-image"
                        ></Image>
                        <View className="no-data-text">此分类没有商品</View>
                      </View>
                    )}
                </View>
              </View>
            )}

          </View>
        </View>
      </Block>
    );
  }
}
