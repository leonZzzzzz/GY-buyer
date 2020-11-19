import Taro, { Component, Config, pageScrollTo } from "@tarojs/taro";
import WxParse from '@/components/wxParse/wxParse';
import {
  Block,
  View,
  Text,
  Image,
  Swiper,
  SwiperItem,
  Navigator,
  Input,
  Button
} from "@tarojs/components";
import "./goods-detail.scss";
import {
  getProduct,
  onCellect,
  cancelCellect,
  addCart,
  cartNum,
  getProductStock,
  storeEng, getStoreId
} from "@/api/product";
import { wechatCodeUrl } from "@/api/userInfo"
import { myuser } from "@/api/common"

import util from '@/utils/util';
import DrawImageData from './json';
import { AtBadge } from 'taro-ui'
import {
  ShareWrap,
  Dialog,
} from '@/components/common';

export default class Index extends Component {
  state = {
    imageurl: "https://guyu-1300342109.cos.ap-guangzhou.myqcloud.com",
    amount: "1", //加入购物车数量
    cart_list_number: "0", //购物车已有商品数量
    valueList: [
      {
        txt: "一手货源",
        src: "../../images/item/gy-icon_27.png"
      },
      {
        txt: "新鲜保证",
        src: "../../images/item/gy-icon_27.png"
      },
      {
        txt: "品质质检",
        src: "../../images/item/gy-icon_27.png"
      },
      {
        txt: "商家直供",
        src: "../../images/item/gy-icon_27.png"
      }
    ],
    attr_detail: [],
    store_info: {},
    collected: false,
    deliverHours: "",
    paramList: [],
    product: {},
    productone: {},
    productItem: "",
    propertyList: [],
    transportExpenses: {},
    rollingImgUrl: [],
    id: "",
    storeId: "",
    cartnum: "",
    norm: "", //规格
    valueList2: [],
    sku_arr: [],
    manager: {},
    coupons: [],
    phone: '',
    skuList: [],
    iswechat: false,
    wxQrcode: '',
    qrcode: false,
    shareVisible: false,
    posterVisible: false,
    posterLoading: false,
    posterUrl: '',
    template: ''
  };
  componentDidMount() {
    const phone = Taro.getStorageSync('phone')
    let query = this.$router.params
    // let query = { scene: '23ccbf00a03f4037a17da946b90ca3ff' }
    console.log(query)
    if (query.scene) {
      let queryArr = query.scene.split('_')
      console.log(queryArr)
      // id = queryArr[0]
      this.getStoreId(queryArr[0], phone)
    } else {
      this.setState({ id: query.id, storeId: query.storeId, phone });
      Taro.showLoading()
      var params = { id: query.id, storeId: query.storeId };
      this.getProducts(params);
      if (query.storeId) this.getstoreEng(query.storeId);
    }
    if (phone) {
      this.getCartNum();
    }
  }

  componentDidShow() {

  }
  // 扫码进入获取storeid
  getStoreId = async (id, phone) => {
    const res = await getStoreId(id)
    let storeId = res.data.data.storeId
    console.log('页面参数===》', storeId, id)
    this.setState({ id, storeId, phone });
    Taro.showLoading()
    var params = { id: id, storeId: storeId };
    this.getProducts(params);
    if (storeId) this.getstoreEng(storeId);
  }

  getProducts = async params => {
    const res = await getProduct(params);
    Taro.hideLoading()
    WxParse.wxParse('article', 'html', res.data.data.product.content, this.$scope, 5)
    const {
      collected,
      deliverHours,
      paramList,
      product,
      productItem,
      propertyList,
      transportExpenses
    } = res.data.data;
    const rollingImgUrl = product.rollingImgUrl.split("_");
    product.price = parseFloat(product.price / 100).toFixed(2);
    product.origPrice = parseFloat(product.origPrice / 100).toFixed(2);
    product.productId = product.id;
    if (product.storeId && !this.$router.params.storeId) {
      this.getstoreEng(product.storeId);
      this.setState({ storeId: product.storeId })
    }
    propertyList.map(item => {
      const valueList = item.valueList;
      item.val = [];
      valueList.map(val => {
        const a = { name: val, checked: false };
        item.val.push(a);
      });
    });
    this.setState({
      rollingImgUrl,
      collected,
      deliverHours,
      paramList,
      productone: res.data.data.product,
      product,
      productItem,
      propertyList,
      transportExpenses
    });
  };
  // 门店经营信息
  getstoreEng = async storeId => {
    const res = await storeEng(storeId);
    this.setState({ manager: res.data.data, wxQrcode: res.data.data.wxQrcode });
  };
  // 获取购物车数量
  getCartNum = async () => {
    const res = await cartNum();
    this.setState({ cartnum: res.data.data.qty });
  };
  //收藏
  getCollect(e) {
    console.log(e)
    const { id, storeid } = e.currentTarget.dataset;
    const params = { productId: id, storeId: storeid };
    if (this.state.phone) {
      this.enshrine(params);
    } else {
      Taro.showModal({
        content: '请先登录',
        showCancel: false,
        success(res) {
          if (res.confirm) {
            Taro.navigateTo({
              url: '../../pages/authorize/index'
            })
          }
        }
      })
    }
  }
  enshrine = async params => {
    const res = await onCellect(params);
    if (res.data.code == 20000) {
      Taro.showToast({
        title: "收藏成功",
        icon: "none"
      });
      var par = { id: this.state.id, storeId: this.state.storeId };
      this.getProducts(par);
    }
  };
  // 取消收藏
  async collect(id) {
    const res = await cancelCellect(id)
    if (res.data.code == 20000) {
      Taro.showToast({
        title: '已取消收藏',
        icon: 'none'
      })
      var par = { id: this.state.id, storeId: this.state.storeId };
      this.getProducts(par);
    }
  }

  // 数量加减
  reducecart() {
    var amount = this.state.amount;
    if (amount <= 1) {
      return;
    } else {
      amount--;
    }
    this.setState({ amount: amount });
  }
  addcart() {
    const qty = this.state.product.qty
    var amount = this.state.amount;
    if (amount >= qty) {
      Taro.showToast({
        title: '库存不足',
        icon: 'none'
      })
      return
    } else {
      amount++;
    }
    this.setState({ amount: amount });
  }
  // 加入购物车
  addShopCart() {
    if (this.state.phone) {
      this.cartReducen();
    } else {
      Taro.showModal({
        content: '请先登录',
        showCancel: false,
        success(res) {
          if (res.confirm) {
            Taro.navigateTo({
              url: '../../pages/authorize/index'
            })
          }
        }
      })
    }
  }
  onPageScroll(e) {
    // console.log(e.scrollTop) //这个就是滚动到的位置,可以用这个位置来写判断
  }
  cartReducen = async () => {
    const { skuList, productItem, storeId, amount, propertyList, product } = this.state;
    if (skuList.length < propertyList.length) {
      Taro.showToast({
        title: '还有规格未选择',
        icon: 'none'
      })
      // Taro.pageScrollTo({
      //   scrollTop: 130,
      //   duration: 300
      // })
      var query = Taro.createSelectorQuery();
      query.select('#topscoll').boundingClientRect((res) => {
        console.log('res: ', res)
        Taro.pageScrollTo({
          scrollTop: res.height - 550
        })
      }).exec()
      return
    }
    if (amount > product.qty) {
      Taro.showToast({
        title: '库存不足',
        icon: 'none'
      })
      return
    }
    if (JSON.stringify(productItem) == "{}") {
      Taro.showToast({
        title: "请选择规格",
        icon: "none"
      });
      Taro.pageScrollTo({
        scrollTop: 100,
        duration: 300
      })
      return;
    }
    if (amount < product.minOrderQuantity) {
      Taro.showToast({
        title: product.name + '最低起购量' + product.minOrderQuantity + product.unit,
        icon: 'none'
      })
      return
    }

    const params = { id: productItem.id, storeId: storeId, qty: amount };
    const res = await addCart(params);
    if (res.data.code == 20000) {
      Taro.showToast({
        title: '加入购物车成功',
      })
      this.getCartNum();
    }
  };
  // 选择属性
  chooseProperty(e) {
    const { i, j, spec, value } = e.currentTarget.dataset;
    const { propertyList, sku_arr } = this.state;
    var arr = propertyList[i]["val"];
    for (let k = 0; k < arr.length; k++) {
      if (k == j) {
        arr[k].checked = arr[k].checked ? false : true;
        if (arr[k].checked) {
          sku_arr[i] = j;
        } else {
          sku_arr[i] = null;
        }
      } else {
        arr[k].checked = false;
      }
    }
    let properties = "",
      num = 0,
      propList = [];
    console.log(propertyList, sku_arr)
    for (let n = 0; n < sku_arr.length; n++) {
      if (sku_arr[n] !== null) {
        num++;
        properties = properties + propertyList[n].name + ":" + propertyList[n]["val"][sku_arr[n]].name + ";";
      } else {
        num--;
      }
    }
    this.setState({ norm: value, propertyList });
    // if (num < propertyList.length) {
    //   console.log("属性没有选择完");
    //   return;
    // } else {
    properties = properties.slice(0, -1);
    let skus = properties.split(";");
    let skuList = [];
    let bb = {};
    skus.forEach(item => {
      let sku = item.split(":");
      bb = { spe: sku[0], name: sku[1] };
      skuList.push(bb);
    });
    this.setState({ skuList })
    this.SelectNorm(skuList);
    // }

  }
  SelectNorm = async skuList => {
    let params;
    const { id } = this.state;
    skuList.map(item => {
      if (item.spe) {
        if (skuList.length == 1) {
          params = { productId: id, spec1Value: skuList[0].name };
        } else if (skuList.length == 2) {
          params = {
            productId: id,
            spec1Value: skuList[0].name,
            spec2Value: skuList[1].name
          };
        } else if (skuList.length == 3) {
          params = {
            productId: id,
            spec1Value: skuList[0].name,
            spec2Value: skuList[1].name,
            spec3Value: skuList[2].name
          };
        }
        this.getSku(params)
      } else {
        this.setState({ product: this.state.productone, productItem: {} });
      }
    })


  };
  // 获取多规格数据
  async getSku(params) {
    const res = await getProductStock(params);
    const productItem = res.data.data;
    productItem.price = parseFloat(productItem.price / 100).toFixed(2);
    productItem.origPrice = parseFloat(productItem.origPrice / 100).toFixed(2);
    productItem.salesQuantity = this.state.product.salesQuantity
    productItem.salesQty = this.state.product.salesQty
    this.setState({ product: productItem, productItem: productItem });
  }
  // 去领券
  goCoupon() {
    Taro.navigateTo({
      url:
        "../../pagesCommon/coupons/coupon/coupon?storeId=" +
        this.state.storeId +
        "&jump=goods"
    });
  }
  // 回到首页
  goNewIndex() {
    Taro.switchTab({
      url: "../../pages/home/index"
    });
  }
  // 去到购物车
  goCart() {
    Taro.switchTab({
      url: "../../pages/cart/index"
    });
  }
  // 进入店铺
  enterStore(storeId) {
    Taro.navigateTo({
      url: "../wholesaler/wholesaler?storeId=" + storeId
    });
  }
  // 输入数量
  getAmount(e) {
    this.setState({ amount: e.detail.value })
  }

  // 分享
  onshare(e) {
    return {
      title: this.state.product.name || '丰盈e鲜',
      imageUrl: '',
      success: function (res) {

      }
    }
    // Taro.showShareMenu({
    //   withShareTicket: false
    // })
  }
  onShareAppMessage() {
    return {
      title: this.state.product ? this.state.product.name : '丰盈e鲜',
      success: function (res) {
        console.log("转发成功:" + JSON.stringify(res));
      },
      fail: function (res) {
        // 转发失败
        console.log("转发失败:" + JSON.stringify(res));
      }
    }
  }
  // 显示客服弹窗
  async showservice() {
    this.setState({ iswechat: true })
    // Taro.showLoading()
    // const res = await wechatservice(this.state.storeId)
    // Taro.hideLoading()
    const wxQrcode = this.state.wxQrcode
    if (wxQrcode) {
      this.setState({ wxQrcode })
    }
  }
  hidewechat() {
    this.setState({ iswechat: false })
  }
  // 客服电话
  openphone() {
    Taro.makePhoneCall({
      phoneNumber: this.state.manager.customerServiceNumbers
    });
  }
  // 客服微信
  async getwechat() {
    // Taro.showLoading()
    // const res = await wechatservice(this.state.storeId)
    // Taro.hideLoading()
    const wxQrcode = this.state.wxQrcode
    if (wxQrcode) {
      this.setState({ wxQrcode, qrcode: true })
    } else {
      Taro.showToast({
        title: '商家未配置客服微信，请电话联系',
        icon: 'none'
      })
    }
  }

  hidecode() {
    this.setState({ qrcode: false })
  }
  // 下载客服微信
  downloadImg() {
    let { imageurl, wxQrcode } = this.state
    let url = imageurl + wxQrcode
    Taro.downloadFile({
      url: url,
      success: function (res) {
        let path = res.tempFilePath
        Taro.saveImageToPhotosAlbum({
          filePath: path,
          success() {
            Taro.showToast({
              title: '下载成功',
              icon: 'success'
            })
          },
          fail() {
            Taro.showToast({
              title: '下载失败，请重新下载',
              icon: 'none'
            })
          },
          complete() {
          }
        })
      }, fail: function () {
      }
    })
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
    const bgUrl: string = '/public/poster/shareProduct.png';
    try {
      // let _QRCodeUrl = '/public/poster/textQrcode.png' //测试用
      let _QRCodeUrl = ''
      const res = await wechatCodeUrl({ path: 'pagesCommon/goods/goods-detail', scene: this.state.id });
      _QRCodeUrl = res.data.message;
      let detail = this.state.product
      detail.shareText = '我在丰盈e鲜发现了好物，快来看看吧！'
      console.log(detail)
      let template = new DrawImageData().palette(memberInfo, bgUrl, _QRCodeUrl, detail)
      this.setState({ template: template })
    } catch (err) {
      console.log(err)
      // this.setState({posterVisible: false})
    }
  };

  setShareVisible(state) {
    this.setState({ shareVisible: state })
  }

  setPosterVisible(state) {
    this.setState({ posterVisible: state })
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
    const {
      qrcode,
      product,
      collected,
      rollingImgUrl,
      cartnum,
      manager,
      imageurl,
      coupons, iswechat, wxQrcode,
      propertyList, valueList, paramList, amount,
    } = this.state;
    return (
      <View style='flex-direction:column;position:relative'>
        {/* 客服弹窗 */}
        {iswechat && (
          <View className='modelNum'>
            <View className='modelopa' onClick={this.hidewechat}></View>
            <View className='modelContent'>
              {wxQrcode && (
                <View className='modelRow' onClick={this.getwechat}>
                  <Image src={require('../../images/item/WeChat.png')}></Image>
                  <Text>客服微信</Text>
                </View>
              )}

              <View className='modelRow' onClick={this.openphone}>
                <Image src={require('../../images/item/phoneservice.png')}></Image>
                <Text>客服电话</Text>
              </View>
            </View>
          </View>
        )}
        {/* 客服微信二维码弹窗 */}
        {qrcode && (
          <View className='modelwechat'>
            <View className='modelopa'></View>
            <View className='wechatcontent'>
              <Image src={require('../../images/item/delete.png')} onClick={this.hidecode}></Image>
              <Image src={imageurl + wxQrcode}></Image>
              <View onClick={this.downloadImg}><Text>下载二维码</Text></View>
            </View>
          </View>
        )}

        <View id='topscoll'>
          {rollingImgUrl.length > 0 ? (
            <Swiper
              autoplay='autoplay'
              className='list-header-image'
              indicatorDots={true}
              indicatorActiveColor='#ff3030'
              indicatorColor='#ffffff'
              interval={3000}
              circular={true}
            >
              {rollingImgUrl.map((item, index) => {
                return (
                  <SwiperItem className='list-header-image' key={String(index)}>
                    <View className='imgList'>
                      <View className='imgList-li'>
                        <Image
                          className='img'
                          src={imageurl + item}
                          data-index={index}
                        // onClick={this.previewImg}
                        ></Image>
                      </View>
                    </View>
                  </SwiperItem>
                );
              })}
            </Swiper>
          ) : (
              <Swiper
                autoplay='autoplay'
                className='list-header-image'
                indicatorDots={true}
                indicatorActiveColor='#ff3030'
                indicatorColor='#fff'
                interval={3000}
                circular={true}
              >
                <SwiperItem className='list-header-image'>
                  <Navigator className='header-image'>
                    <Image
                      src={require("../../images/tab/head-no.png")}
                      mode='aspectFill'
                      lazyLoad='true'
                    ></Image>
                  </Navigator>
                </SwiperItem>
              </Swiper>
            )}
          <View className='details'>
            <Text className='detail-name'>{product.name}</Text>
            <View className='detail-title'>
              <Text className='subhead'>{product.introduce}</Text>
            </View>
            <View className='detail-title'>
              <View className='detail-son'>
                <View>
                  <Text style='font-size:40rpx;margin-top:24rpx;color:#FF840B'>
                    ￥
                </Text>
                  <Text style='font-size:60rpx;color:#FF840B'>
                    {product.price}
                  </Text>
                  <Text style='color:#999'>/{product.unit}</Text>
                  {Number(product.origPrice) && (
                    <View className='outprint'>
                      <Text className='cost'>{"￥" + product.origPrice}/{product.unit}</Text>
                    </View>
                  )}

                </View>
                <View style='font-size:26rpx;color:#999;'>
                  {(product.isSalesQtyDisplay && product.salesQty > 0) && (
                    <Text>已售<Text style='color:#FF840B;'>{product.salesQty}</Text>件</Text>
                  )}
                  {product.isQtyDisplay && (
                    <Text style='padding-left:25rpx'>库存{product.qty}{product.unit}</Text>
                  )}

                </View>
              </View>
              <View style='display:flex'>
                {collected ? (
                  <View className='invite-button' onClick={() => { this.collect(product.productId) }}>
                    <Image
                      className='share'
                      src={require('../../images/item/collect2.png')}
                    ></Image>
                    <View className='collecticon'>取消收藏</View>
                  </View>
                ) : (
                    <View className='invite-button' data-id={product.productId}
                      data-storeid={product.storeId} onClick={this.getCollect}>
                      <Image
                        className='share'
                        src={require('../../images/item/gy-icon_14.png')}
                      ></Image>
                      <View className='collecticon'>收藏</View>
                    </View>
                  )}

                <View className='invite-button' onClick={() => { this.setShareVisible(true) }}>
                  <Image
                    className='share'
                    src={require("../../images/item/gy-icon_17.png")}
                  ></Image>
                  <View className='collecticon'>分享</View>
                </View>

              </View>
            </View>
            <View className='order-time'>
              <View>接单时间：{manager.businessTime}</View>
              <View>在商家接单时间外下单，需要通过商家确认后再支付货款</View>
            </View>
          </View>
          {propertyList.length > 0 && (
            <View className='property'>
              <Text>选择规格</Text>
              {propertyList.map((item, x) => {
                return (
                  <View className='prolist' key={String(x)}>
                    <Text className='detail-list'>{item.note}</Text>
                    <View className='sker-data'>
                      {item.val.map((val, j) => {
                        return (
                          <Text
                            key={String(j)}
                            data-spec={item.name}
                            data-i={x}
                            data-j={j}
                            data-value={val.name}
                            // data-image={val.image}
                            className={
                              "detail-info " + (val.checked ? "chooseTab" : "")
                            }
                            onClick={this.chooseProperty.bind(this)}
                          >
                            {val.name}
                          </Text>
                        );
                      })}
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>
        <View className='card-banner-area'>
          <Text style='font-weight:bold;'>优惠</Text>
          <View style='font-weight:bold;display:inline-block;margin-left:30rpx;'>
            {coupons.map((item, index) => {
              return <Text className='coupon-a' key={String(index)}>{item.couponTitle}</Text>;
            })}
          </View>
          <View style='display: inline-block;' onClick={this.goCoupon}>
            <Text>去领券</Text>
            <Text className='iconfont icon-youjiantou' style='font-size: 0.9em;'></Text>
          </View>

        </View>
        <View className='four'>
          {valueList.map((item, index) => {
            return (
              <View className='card-banner-item' key={String(index)}>
                <Image src={item.src}></Image>
                <Text>{item.txt}</Text>
              </View>
            );
          })}
        </View>
        <View className='storeinfo'>
          <Image src={imageurl + manager.storeLogoUrl}></Image>
          <View className='store_name'>
            <Text className='store_title'>{manager.storeName}</Text>
            {manager.storeInfo && (
              <Text className='store_main'>{"主营：" + manager.storeInfo}</Text>
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
          <Text
            className='getinto'
            onClick={() => {
              this.enterStore(manager.storeId);
            }}
          >
            进入店铺
          </Text>
        </View>
        {paramList.length > 0 && (
          <View className='standard'>
            <View className='standard_title'>商品参数</View>
            <View className='key_val'>
              {paramList.map((val, index) => {
                return (
                  <View className='range' key={String(index)}>
                    <Text style='color:#999;'>{val.paramName}</Text>
                    <Text>{val.paramValue}
                      {(val.paramName == '净重' || val.paramName == '皮重' || val.paramName == '重量') && (
                        <Text>公斤</Text>
                      )}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}
        <View className='standard'>
          <View className='standard_title'>商品详情</View>
          <View style='font-size:26rpx;margin:10rpx 0'>
            <import src='../../components/wxParse/wxParse.wxml' />
            <template is='wxParse' data='{{wxParseData:article.nodes}}' />
          </View>

          {/* <View>{product.content}</View> */}
        </View>
        <View style='height:150rpx;'></View>
        <View className='invite-friend-cluster'>
          <View className='invite-ke-server invite-total' onClick={this.showservice}>
            <Image className='invite-ke-server-img smart' src={require("../../images/item/gy-icon_13.png")}></Image>
            <Text className='invite-ke-server-text'>客服</Text>
          </View>
          <View className='invite-index invite-total' onClick={this.goNewIndex}>
            <Image className='invite-index-image' src={require("../../images/tabbar/gy-icon_80.png")}></Image>
            <Text className='invite-index-text'>首页</Text>
          </View>
          <View className='invite-car invite-total' onClick={this.goCart}>
            <Image className='invite-car-img' src={require("../../images/tabbar/gy-icon_90.png")}></Image>
            {cartnum > 0 && <View className='invite-car-num'><AtBadge value={cartnum} maxValue={999} /></View>}
            <Text className='cart-ke-server-text'>购物车</Text>
          </View>
          <View className='cartaddorlost'>
            <Text onClick={this.reducecart}>-</Text>
            <Input value={amount} onInput={this.getAmount}></Input>
            <Text onClick={this.addcart}>+</Text>
          </View>
          <View className='add-invite-car invite-total' onClick={this.addShopCart} data-type='addcart'>
            <Text className='add-invite-car-child'>加入购物车</Text>
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
      </View>
    );
  }
  config: Config = {
    navigationBarTitleText: "商品详情",
    usingComponents: {
      painter: '../../components/painter/painter'
    }
  };
}
