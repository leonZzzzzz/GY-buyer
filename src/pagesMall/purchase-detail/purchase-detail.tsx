import Taro, { Component, Config } from "@tarojs/taro";
import { View, Text, Image, Block } from "@tarojs/components";
import { getAfterSale, getStoreAddress } from "@/api/after-order";
import { wechatservice } from "@/api/userInfo"
import { IMG_HOST } from "@/config";
import { toPriceYuan } from "@/utils/format";
import "./purchase-detail.scss";


export default class Index extends Component<{}, any> {
  constructor() {
    super();
    this.state = {
      imageUrl: "https://guyu-1300342109.cos.ap-guangzhou.myqcloud.com",
      send_type: "2",
      model: {},
      store: {}, imglist: [], afterSaleOrderId: '', items: [], orderItemId: '',
      iswechat: false,
      wxQrcode: '',
      qrcode: false
    };
  }
  config: Config = {
    navigationBarTitleText: "售后详情"
  };
  // componentWillUnmount() {
  //   Taro.redirectTo({ url: '../after-sale/after-sale' })
  // }
  componentDidMount() {
    Taro.showLoading()
    const { id, orderId, orderItemId } = this.$router.params
    this.setState({ orderItemId })
    this.getAfterSale(id);
  }
  getAfterSale(id) {
    getAfterSale({ afterSaleOrderId: id }).then(res => {
      Taro.hideLoading()
      const proofImgUrl = res.data.data.proofImgUrl
      const imglist = proofImgUrl.split(',')
      this.setState({ model: res.data.data, imglist, items: res.data.data.items }, () => {
        if (this.state.model.statusValue == 2) {
          getStoreAddress({ id: this.state.model.storeId }).then(res => {
            this.setState({ store: res.data.data, });
          });
        }
      });
    });
  }
  gotodetail() {
    console.log(888888)
    const { model, orderItemId } = this.state
    console.log(model.items)
    let product = {}
    product.name = model.items[0].name
    product.iconUrl = model.items[0].icon
    product.price = model.items[0].price
    product.qty = model.items[0].quantity
    product.specs = model.items[0].spec
    product.id = orderItemId
    Taro.navigateTo({
      url: `../apply-draw/apply-draw?id=${
        model.orderId
        }&product=${JSON.stringify(product)}`
    });
  }

  callphone() {
    Taro.makePhoneCall({
      phoneNumber: this.state.model.customerServiceMobile
    });
  }

  // 显示客服弹窗
  showservice() {
    this.setState({ iswechat: true })
  }
  hidewechat() {
    this.setState({ iswechat: false })
  }
  // 隐藏二维码弹窗
  hidecode() {
    this.setState({ qrcode: false })
  }
  // 客服微信
  async getwechat() {
    Taro.showLoading()
    const res = await wechatservice(this.state.model.storeId)
    Taro.hideLoading()
    const wxQrcode = res.data.data.wxQrcode
    if (wxQrcode) {
      this.setState({ wxQrcode, qrcode: true })
    } else {
      Taro.showToast({
        title: '商家未配置客服微信，请电话联系',
        icon: 'none'
      })
    }
  }
  // 客服电话
  openphone() {
    Taro.makePhoneCall({
      phoneNumber: this.state.model.customerServiceMobile
    });
  }
  // 下载客服微信
  downloadImg() {
    let { imageUrl, wxQrcode } = this.state
    let url = imageUrl + wxQrcode
    Taro.downloadFile({
      url: url,
      success: function (res) {
        let path = res.tempFilePath
        Taro.saveImageToPhotosAlbum({
          filePath: path,
          success(res) {
            console.log(res)
            Taro.showToast({
              title: '下载成功',
              icon: 'success'
            })
          },
          fail(res) {
            Taro.showToast({
              title: '下载失败，请重新下载',
              icon: 'none'
            })
          },
          complete(res) {
          }
        })
      }, fail: function (res) {
      }
    })
  }

  render() {
    const { model, store, imglist, imageUrl, items, iswechat, qrcode, wxQrcode } = this.state;
    return (
      <Block>
        {/* 客服弹窗 */}
        {iswechat && (
          <View className='modelNum'>
            <View className='modelopa' onClick={this.hidewechat}></View>
            <View className='modelContent'>
              <View className='modelRow' onClick={this.getwechat}>
                <Image src='../../images/item/WeChat.png'></Image>
                <Text>客服微信</Text>
              </View>
              <View className='modelRow' onClick={this.openphone}>
                <Image src='../../images/item/phoneservice.png'></Image>
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
              <Image src='../../images/item/delete.png' onClick={this.hidecode}></Image>
              <Image src={imageUrl + wxQrcode}></Image>
              <View onClick={this.downloadImg}><Text>下载二维码</Text></View>
            </View>
          </View>
        )}

        <View className="product-confirm">
          <View className="apply-sale">
            {(model.statusValue == 1 || model.statusValue == 2) && (
              <Image src="../../images/item/clock.png"></Image>
            )}
            {model.statusValue == 0 && (
              <Image src="../../images/item/success.png"></Image>
            )}

            {model.statusValue == -1 && (
              <Image src="../../images/item/refuse.png"></Image>
            )}

            <Text>{model.status} </Text>
          </View>
          {model.result && (
            <View className="apply-address">
              <View>拒绝理由：{model.result}</View>
            </View>
          )}

          {model.statusValue == 2 && (
            <View className="apply-address">
              <Text className="apply-address__tip">
                商家已同意退款申请，如需退货，请退货到以下地址
            </Text>
              <View className="apply-a">
                <Text>退货地址</Text>
                <View className="apply-b">
                  <Text>{store.address}</Text>
                  <Text>
                    {store.personInCharge} {store.mobile}
                  </Text>
                </View>
              </View>
              <View className="apply-c">如有疑问请联系商家客服</View>
            </View>
          )}

          <View className="">
            <View className="content">
              <View className="store-name">售后详情</View>
              {model &&
                items.map(item => {
                  return (
                    <View className="order-store" key={item.id}>
                      <Image
                        className="order-store-img"
                        src={IMG_HOST + item.icon}
                      ></Image>
                      <View className="order-store-name">
                        <View className="order-content">
                          <Text className="order-store-name-t">{item.name}</Text>
                          <View className="order-store-price">
                            <Text className="order-store-price-p">
                              ￥{toPriceYuan(item.price)}
                            </Text>
                            <Text className="order-store-price-n">
                              x{item.quantity}
                            </Text>
                          </View>
                        </View>
                        <View className="apply">
                          <Text className="order-store-name-g">{item.spec}</Text>
                        </View>
                      </View>
                    </View>
                  );
                })}
              <View>
                <View className="apply-list">
                  <Text>订单编号</Text>
                  <Text>{model.orderNumber}</Text>
                </View>
                <View className="apply-list">
                  <Text>退款金额</Text>
                  <Text>最终退款金额由双方协商</Text>
                </View>
                <View className="apply-list">
                  <Text>申请时间</Text>
                  <Text>{model.createTime}</Text>
                </View>
                <View className="apply-list">
                  <Text>退款原因</Text>
                  <Text>{model.reasonType}</Text>
                </View>
                <View className="apply-list">
                  <Text>备注信息</Text>
                  <Text>{model.reason || "--"}</Text>
                </View>
                <View className="apply-list">
                  <Text>图片举证</Text>
                  <View className="apply-pic">
                    {imglist.map(item => {
                      return (
                        <Image src={IMG_HOST + item} mode='aspectFit' onClick={ () => { 
                          Taro.previewImage({
                            current: IMG_HOST + item,
                            urls: [IMG_HOST + item]
                          })
                        }}></Image>
                      )
                    })}
                    {/* {model.proofImgUrl != ""
                    ? model.proofImgUrl.split(",").map(item => {
                      return <Image src={IMG_HOST + item}></Image>;
                    })
                    : "--"} */}
                  </View>
                </View>

              </View>
            </View>
          </View>
          {model.statusValue == -1 && (
            <View className='btn' onClick={this.gotodetail}>再次申请售后</View>
          )}
          <View className="server" onClick={this.showservice}>
            <Image src="../../images/item/server.png"></Image>
          </View>
        </View>
      </Block>

    );
  }
}
