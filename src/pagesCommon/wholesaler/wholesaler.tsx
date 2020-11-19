import Taro, { Component, Config } from "@tarojs/taro";
import {
  Block,
  View,
  Text,
  Image,
  ScrollView,
  Swiper,
  Input,
  Button,
  SwiperItem,
} from "@tarojs/components";
import {
  ShareWrap,
  Dialog,
} from '@/components/common';

import "./wholesaler.scss";
import { storeEng, storeBanner, getSecondClass, getStoreClass } from "@/api/product"
import { getCateProduct } from "@/api/category"
import { myuser } from "@/api/common"
import { wechatCodeUrl } from "@/api/userInfo"
import util from '@/utils/util';
import DrawImageData from './json';

export default class Index extends Component {

  state = {
    imageurl: 'https://guyu-1300342109.cos.ap-guangzhou.myqcloud.com',
    bannerList: [],
    manager: {},
    storeId: '',
    productlist: [],
    order_by_field: '',
    highLevel: ['所有', "尊品", "优品", "好品"],
    islevel: false,
    level: '',
    leveltxt: '',
    levelshow: false,
    pageNum: 1,
    asc: '',
    qtyasc: '',
    priceasc: '',
    goodasc: '',
    ascy: false,
    name: '',
    shareVisible: false,
    posterVisible: false,
    posterLoading: false,
    posterUrl: '',
    template: '',
    titleList: [],
    categoryId: '',
  };
  onReachBottom() {
    this.state.pageNum++;
    if (this.state.leveltxt == '所有') {
      this.getCateProduct(this.state.categoryId, this.state.pageNum, this.state.storeId, this.state.order_by_field, this.state.asc, '', this.state.name)
    } else {
      this.getCateProduct(this.state.categoryId, this.state.pageNum, this.state.storeId, this.state.order_by_field, this.state.asc, this.state.leveltxt, this.state.name)
    }

  }
  componentDidMount() {
    let query = this.$router.params
    const storeId = query.scene || query.storeId;
    this.setState({ storeId })
    this.getstoreEng(storeId)
    this.getbanner(storeId)
    this.getStoreClass(storeId)
    // this.getSecondClass(storeId)
    this.getCateProduct(this.state.categoryId, 1, storeId, '', '', '', '')
  }
  // 门店经营信息
  getstoreEng = async (storeId) => {
    const res = await storeEng(storeId)
    this.setState({ manager: res.data.data })
  }
  // 轮播图
  getbanner = async (storeId) => {
    const res = await storeBanner(storeId)
    this.setState({ bannerList: res.data.data })
  }
  // 进入店铺详情
  golesalerDetail() {
    Taro.navigateTo({
      url: '../lesdetail/lesdetail?storeId=' + this.state.storeId
    })
  }
  // 去领券
  goCoupon() {
    Taro.navigateTo({
      url: '../coupons/coupon/coupon?storeId=' + this.state.storeId + '&jump=who'
    })
  }
  // 获取店铺分类
  getStoreClass = async (storeId) => {
    const res = await getStoreClass(storeId)
    let titleList = res.data.data
    titleList.unshift({ id: '', name: '全部' })
    this.setState({ titleList })
  }
  // 获取二级分类
  getSecondClass = async (storeId) => {
    const res = await getSecondClass(storeId)
    let titleList = res.data.datastoreId
    titleList.unshift({ id: '', name: '全部' })
    this.setState({ titleList })
  }
  // 切换二级分类
  checkSecond(id) {
    console.log(id)
    this.setState({ categoryId: id ? id : '', productlist: [], pageNum: 1 })
    const { storeId, order_by_field, asc, leveltxt, name } = this.state
    this.getCateProduct(id, 1, storeId, order_by_field, asc, leveltxt, name)
  }

  // 获取分类商品
  getCateProduct = async (categoryId, pageNum, storeId, orderBy, asc, level, name) => {
    let params = { categoryId, pageNum: pageNum, pageSize: 10, storeId: storeId, orderBy: orderBy, asc: asc, level: level, name }
    const res = await getCateProduct(params)
    if (res.data.code == 20000) {
      const list = res.data.data.list
      const productlist = this.state.productlist
      list.map(item => {
        item.price = parseFloat(item.price / 100).toFixed(2)
        productlist.push(item)
      })
      this.setState({ productlist: productlist, islevel: false })
    }
  }

  // 切换销量，价格，好评
  checkItem(e) {
    const ascy = !this.state.ascy
    const asc = ascy ? '1' : '0'
    const meth = e.currentTarget.dataset.meth;
    let { storeId, leveltxt, name, categoryId, } = this.state
    leveltxt = leveltxt == '所有' ? '' : leveltxt
    this.setState({ order_by_field: meth, pageNum: 1, asc, ascy, qtyasc: asc, priceasc: asc, goodasc: asc, level: '' })
    if (meth == 'salesQty') {
      this.setState({ levelshow: false, productlist: [], priceasc: '', goodasc: '' })
      this.getCateProduct(categoryId, 1, storeId, meth, asc, leveltxt, name);
    } else if (meth == 'price') {
      this.setState({ levelshow: false, productlist: [], qtyasc: '', goodasc: '' })
      this.getCateProduct(categoryId, 1, storeId, meth, asc, leveltxt, name);
    } else if (meth == 'appraise') {
      this.setState({ levelshow: false, productlist: [], priceasc: '', qtyasc: '' })
      this.getCateProduct(categoryId, 1, storeId, meth, asc, leveltxt, name);
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
    const leveltxt = e.currentTarget.dataset.level;
    this.setState({ productlist: [], pageNum: 1, islevel: false, asc: '', leveltxt: leveltxt });
    if (leveltxt == "所有") {
      this.getCateProduct(this.setState.categoryId, 1, this.state.storeId, "", "", "", this.state.name);
    } else {
      this.getCateProduct(this.setState.categoryId, 1, this.state.storeId, "", "", leveltxt, this.state.name);
    }
  }

  // 去到商品详情
  gotodetail(id, storeId) {
    Taro.navigateTo({
      url: '../goods/goods-detail?id=' + id + '&storeId=' + storeId
    })
  }
  // 分享
  onshare() {
    return {
      title: '丰盈e鲜',
      imageUrl: '',
      success: function (res) {

      }
    }
  }
  onShareAppMessage() {
    return {
      title: this.state.manager ? this.state.manager.storeName : '丰盈e鲜',
      success: function (res) {
        console.log("转发成功:" + JSON.stringify(res));
      },
      fail: function (res) {
        // 转发失败
        console.log("转发失败:" + JSON.stringify(res));
      }
    }
  }
  // 轮播图跳转
  bannerJump(type, link, id) {
    if (type == 'product') {
      Taro.navigateTo({
        url: '../../pagesCommon/goods/goods-detail?storeId=' + id + '&id=' + link
      })
    }
  }
  getstore(e) {
    this.setState({ name: e.detail.value })
  }
  serach() {
    this.setState({ productlist: [], list: [], pageNum: 1 })
    if (this.state.leveltxt == '所有') {
      this.getCateProduct(this.state.categoryId, 1, this.state.storeId, this.state.order_by_field, this.state.asc, '', this.state.name)
    } else {
      this.getCateProduct(this.state.categoryId, 1, this.state.storeId, this.state.order_by_field, this.state.asc, this.state.leveltxt, this.state.name)
    }
  }

  async generatePoster() {
    this.setState({ posterVisible: true })
    const myuserRes = await myuser()
    const memberInfo = myuserRes.data.data.member
    console.log('memberInfo', memberInfo);
    if (!memberInfo.headImage && (!memberInfo.name || !memberInfo.appellation)) {
      const { userInfo } = (await Taro.getUserInfo()) as any;
      console.log('getUserInfo', userInfo);
      memberInfo.headImage = userInfo.avatarUrl;
      memberInfo.name = userInfo.nickName;
    }
    const bgUrl: string = '/public/poster/shareStore.png';
    try {
      Taro.showLoading()
      // let _QRCodeUrl = '/public/poster/textQrcode.png' // 测试用
      const res = await wechatCodeUrl({ path: 'pagesCommon/wholesaler/wholesaler', scene: this.state.storeId });
      let _QRCodeUrl = res.data.message;
      console.log(_QRCodeUrl)
      let detail = {
        storeName: this.state.manager.storeName,
        storeInfo: this.state.manager.storeInfo,
        title: '我在丰盈e鲜发现了好店，快来看看吧！'
      }
      let template = new DrawImageData().palette(memberInfo, bgUrl, _QRCodeUrl, detail)
      console.log(template)
      Taro.hideLoading()
      this.setState({ template: template })
    } catch (err) {
      console.log(err)
      // this.setState({posterVisible: false})
    }
  };

  setPosterVisible(state) {
    this.setState({ posterVisible: state })
  }
  setShareVisible(state) {
    console.log(state)
    this.setState({ shareVisible: state })
  }

  handleImgOK(e: any) {
    console.warn('handleImgOK', e);
    this.setState({ posterLoading: false, posterUrl: e.detail.path });
  };

  async savePoster() {
    Taro.showLoading({
      title: '生成图片中',
      mask: true
    });
    this.setState({ posterLoading: true });
    try {
      const res = await Taro.saveImageToPhotosAlbum({
        filePath: this.state.posterUrl
      });
      console.log(res);
      Taro.hideLoading();
      Taro.showToast({
        title: '已保存到本地'
      });
      this.setState({ posterLoading: false })
    } catch (err) {
      this.setState({ posterLoading: false })
      console.log(err);
      Taro.hideLoading();
      if (/saveImageToPhotosAlbum/.test(err.errMsg)) util.checkAuthorizeWritePhotosAlbum();
      else {
        Taro.showToast({
          title: '取消保存，可重试',
          icon: 'none'
        });
      }
    }
  };

  render() {
    const { titleList, categoryId, goodasc, manager, productlist, imageurl, leveltxt, levelshow, bannerList, priceasc, order_by_field, islevel, highLevel, qtyasc, level } = this.state
    return (
      <Block>
        <View className="search" >
          <Input style='width:82%' placeholder="请输入商品名称" placeholderClass="placestyle" onInput={this.getstore}></Input>
          <View onClick={this.serach}>搜索</View>
        </View>
        {bannerList.length > 0 && (
          <Swiper
            autoplay="autoplay"
            className="list-header-image"
            indicatorDots="true"
            indicatorActiveColor="#ff3030"
            indicatorColor="#ffffff"
            interval="3000"
            circular="true"
            style='margin-top:80rpx'
          >
            {bannerList.map((item, index) => {
              return (
                <SwiperItem className="list-header-image">
                  <View className="header-image">
                    <Image className="header-image" mode="aspectFill" lazyLoad="true" src={imageurl + item.imgLinks}
                      onClick={() => { this.bannerJump(item.skipType, item.skipLinks, item.pdtStoreId) }}></Image>
                  </View>
                </SwiperItem>
              )
            })}
          </Swiper>
        )}
        <View className='facadeUrl'>
          <View className='facadeUrl-img-box'>
            {/* <Image className='facadeUrl-img' mode='aspectFit' src={imageurl + manager.facadeUrl}></Image>  */}
            {manager.facadeUrl ? <Image className='facadeUrl-img' src={imageurl + manager.facadeUrl}></Image>
              : <Image className='facadeUrl-img' src={imageurl + '/attachments/null/4d16eec6a0e9498fb0ceb0706f0d59df.png'}></Image>
            }
          </View>
          <View className='facadeUrl-mask'></View>
          <View className='facadeUrl-info'>
            <View className='con-name' onClick={this.golesalerDetail}>
              <Text>{manager.storeName}</Text>
              {manager.storeInfo && (
                <Text className="store_main">{"主营：" + manager.storeInfo}</Text>
              )}
              <View className='support'>
                {manager.isPlatformDelivery && (
                  <Text>支持丰盈配送</Text>
                )}
                {manager.isOrderInvoice && (
                  <Text>支持开票</Text>
                )}
              </View>
            </View>
          </View>
          {/* <View className='invite-button share-btn' onClick={() => { this.setShareVisible(true) }}>
            <Text className='iconfont icon-fenxiang share-icon'></Text>
          </View> */}
          <View className='facadeUrl-btn-2' onClick={() => { this.setShareVisible(true) }}>店铺分享 > </View>
          <View className='facadeUrl-btn' onClick={this.golesalerDetail}>店铺详情 > </View>
        </View>

        <View className="container">
          {false && <View className='con-title'>
            <Image onClick={this.golesalerDetail} src={imageurl + manager.storeLogoUrl}></Image>
            <View className='con-name' onClick={this.golesalerDetail}>
              <Text>{manager.storeName}</Text>
              {manager.storeInfo && (
                <Text className="store_main">{"主营：" + manager.storeInfo}</Text>
              )}
              <View className='support'>
                {manager.isPlatformDelivery && (
                  <Text>支持丰盈配送</Text>
                )}
                {manager.isOrderInvoice && (
                  <Text>支持开票</Text>
                )}
              </View>
            </View>
            <Button className='invite-button' open-type='share' onClick={() => this.onshare}>
              <Image
                className="share"
                src={require("../../images/item/gy-icon_17.png")}></Image>
            </Button>
            {/* <Image className="share" src={require('../../images/item/gy-icon_17.png')}></Image> */}
          </View>}
          {/* <View className='lesaldetail' onClick={this.golesalerDetail}><Text>店铺详情</Text></View> */}

        </View>
        <View className='coupons'>
          <View className='coupons-a'>
            <Text>领券</Text>
            {/* <Text>满200减50</Text>
            <Text>满100减20</Text> */}
          </View>
          <Text className='coupons-b' onClick={this.goCoupon}>立即领取 ></Text>
        </View>


        <View className='rank'>
          <View>
            <Text className={order_by_field == "salesQty" ? "rank-name" : ""}
              data-meth="salesQty"
              onClick={this.checkItem}>销量</Text>
            <View className='sort'>
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
          <View>
            <Text className={order_by_field == "price" ? "rank-name" : ""}
              data-meth="price"
              onClick={this.checkItem}>价格</Text>
            <View className='sort'>
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
          <View>
            <Text className={order_by_field == "appraise" ? "rank-name" : ""}
              data-meth="appraise"
              onClick={this.checkItem}>好评</Text>
            <View className='sort'>
              {/* {greatshow ? (
                <Image src={require('../../images/item/gy-icon_36.png')}></Image>
              ) : (
                  <Image src={require('../../images/item/gy-icon_38.png')}></Image>
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
          <View onClick={this.showLevel} className='screen'>
            <Text className={level == "level" ? "rank-name" : ""}>优质等级:{leveltxt ? leveltxt : '所有'}</Text>
            <View className='sort'>
              {levelshow ? (
                <Image
                  src={Taro.getStorageSync('imgHostItem') + 'gy-icon_36.png'}
                ></Image>
              ) : (
                  <Image
                    src={Taro.getStorageSync('imgHostItem') + 'gy-icon_38.png'}
                  ></Image>
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
        <View className='container'>
          <View className='conleft'>
            {titleList.map((item, index) => {
              return (
                <View className={item.id == categoryId ? 'seback left-child' : 'left-child'} onClick={() => { this.checkSecond(item.id) }}>
                  <Text>{item.name}</Text>
                </View>
              )
            })}
          </View>
          <View className='conright'>
            {productlist.length > 0 ? (
              <View className='partition'>
                {productlist.map((item, i) => {
                  return (
                    <View className='part-img' key={String(i)} onClick={() => { this.gotodetail(item.id, item.storeId) }}>
                      <Image src={imageurl + item.iconUrl}></Image>
                      <View className='list-content'>
                        <Text>{item.name}</Text>
                        <View className='nameinfo'>{item.introduce}</View>
                        <View className='part-a'>
                          <View className='part-b'>
                            <Text>{item.price}
                              <Text style="font-size:24rpx !important;margin-top:6rpx;margin-left:5rpx">元/{item.unit}</Text>
                            </Text>

                            {(item.isSalesQtyDisplay && item.salesQty) && (
                              <Text>已售<Text style='color:#FF840B'>{item.salesQty}</Text>件</Text>
                            )}
                            <View>
                              {item.spec1Name && (
                                <Text>{item.spec1Name}:{item.spec1Value}</Text>
                              )}
                            </View>
                          </View>
                          {/* <Image src={require('../../images/item/gy-icon_06.png')} onClick={() => { this.addShopCart(item.id) }}></Image> */}
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
                    className="no-data-image"
                  ></Image>
                  <View className="no-data-text">此分类没有商品</View>
                  <View style='height:150px;'></View>
                </View>
              )}
            {productlist.length == 1 && (
              <View style='height:500rpx;background:#fff;'></View>
            )}
            {productlist.length == 2 && (
              <View style='height:300rpx;background:#fff;'></View>
            )}

          </View>
        </View>


        {/* 分享组件 */}
        <ShareWrap visible={this.state.shareVisible} onClose={() => { this.setShareVisible(false) }} onPoster={() => { this.generatePoster() }} />
        {/* 海报弹窗 */}
        <Dialog visible={this.state.posterVisible} position='center' onClose={() => this.setPosterVisible(false)}>
          <View className='poster-dialog'>
            <View className='poster-wrap'>{this.state.posterUrl && <Image src={this.state.posterUrl} mode='widthFix' />}</View>
            <Button type='primary' onClick={() => { this.savePoster() }} loading={this.state.posterLoading}>
              {this.state.posterLoading ? '生成海报中...' : '保存到手机'}
            </Button>
          </View>
        </Dialog>
        <painter palette={this.state.template} onImgOK={this.handleImgOK} style='position:fixed;top:-9999rpx' />
      </Block>
    );
  }

  config: Config = {
    navigationBarTitleText: "丰盈e鲜",
    usingComponents: {
      painter: '../../components/painter/painter'
    }
  };
}
