import Taro, { Component, Config } from "@tarojs/taro";
import {
  View,
  Swiper,
  SwiperItem,
  Image,
  Text,
  Block
} from "@tarojs/components";
import { getProduct, getProductStock, addProduct } from "@/api/product";
import WxParse from "@/components/wxParse/wxParse";
import { IMG_HOST } from "@/config";
import { toPriceYuan } from "@/utils/format";
import { QcInputNumber } from "@/components/common";
import { addCart } from "@/api/cart";
import { addCollection, delCollection } from "@/api/collenction";
import "./index.scss";

enum ButtonType {
  CART = 0,
  BUY,
  ALL
}
interface IProductDetail extends IProduct {
  salesQuantity: number;
}
interface ISearchStock {
  productId: string;
  [propsName: string]: any;
}
interface IProductSpecList {
  name: string;
  note: string;
  valueList: string[];
}
interface IModel {
  storeId: string;
  id: string;
  qty: number;
}
interface IState {
  /**按钮类型 */
  type: ButtonType;
  /**是否关注 */
  collected: boolean;
  /**控制弹窗 */
  dialogVisible: boolean;
  /**轮播图 */
  imgUrls: string[];
  /**选中的规格 */
  searchStock: ISearchStock;
  /**创建预览订单的数据 */
  model: IModel;
  /**规格数据 */
  propertys: IProductSpecList[];
  /**商品详情 */
  product: IProductDetail;
  /**选好规格后的商品数据，主要用于做展示 */
  selectedProduct: IProductDetail;
}
class ProductDetail extends Component<{}, IState> {
  config: Config = {
    navigationBarTitleText: "商品详情"
  };
  constructor() {
    super();
    this.state = {
      type: ButtonType.ALL,
      collected: false,
      product: {} as IProductDetail,
      selectedProduct: {} as IProductDetail,
      propertys: [],
      imgUrls: [],
      searchStock: {
        productId: ""
      },
      // 购买或添加购物车的数据
      model: {
        storeId: "",
        id: "",
        qty: 1
      },
      dialogVisible: false
    };
  }
  componentDidShow() {
    this.apiGetProduct();
  }

  onDialogToggle(dialogVisible: boolean, type = ButtonType.ALL) {
    this.setState({
      dialogVisible,
      type
    });
  }

  onChangeStock(key: string, value: string) {
    this.state.searchStock[key] = value;
    this.setState({
      searchStock: this.state.searchStock
    });
    this.apiGetProductStock();
  }

  async apiGetProductStock() {
    let isAll = true;
    Object.keys(this.state.searchStock).forEach(keys => {
      if (keys !== "productId") {
        if (this.state.searchStock[keys] === "") {
          isAll = false;
        }
      }
    });
    if (isAll) {
      const res = await getProductStock(this.state.searchStock);
      this.state.product.qty = res.data.data.qty;
      this.state.product.price = res.data.data.price;
      this.setState({
        model: {
          storeId: "",
          id: res.data.data.id,
          qty: 1
        },
        selectedProduct: res.data.data,
        product: this.state.product
      });
    }
  }
  async apiGetProduct() {
    const res = await getProduct({ id: this.$router.params.id, storeId: "" });
    const { product, productItem, propertyList, collected } = res.data.data;
    WxParse.wxParse("article", "html", product.content, this.$scope, 5);
    this.setState({
      product,
      selectedProduct: product,
      imgUrls: product.rollingImgUrl.split("_"),
      propertys: propertyList,
      collected: collected
    });
    console.log(product);
    this.state.searchStock.productId = product.id;
    // 单规格商品
    if (productItem.id) {
      this.state.searchStock[propertyList[0].name] =
        propertyList[0].valueList[0];
      this.state.model.id = productItem.id;
      this.setState({
        model: this.state.model,
        searchStock: this.state.searchStock
      });
    } else {
      propertyList.forEach((property: IProductSpecList) => {
        this.state.searchStock[property.name] = ""; // property.valueList[0]
      });
      this.setState({
        searchStock: this.state.searchStock
      });
    }
  }
  async apiAddProduct() {
    const res = await addProduct(this.state.model);
    Taro.navigateTo({
      url: `/pagesMall/product-confirm/index?ids=${res.data.data.id}`
    });
  }
  async apiAddCart() {
    await addCart(this.state.model);
    Taro.showToast({
      title: "已添加到购物车"
    });
    this.setState({
      dialogVisible: false
    });
  }

  onCollectionToggle() {
    if (this.state.collected) {
      delCollection(this.state.product.id).then(() => {
        this.setState({
          collected: !this.state.collected
        });
      });
    } else {
      addCollection({ productId: this.state.product.id, storeId: "" }).then(
        () => {
          this.setState({
            collected: !this.state.collected
          });
        }
      );
    }
  }

  onJumpPage(url: string) {
    Taro.switchTab({ url });
  }
  render() {
    const {
      model,
      product,
      selectedProduct,
      imgUrls,
      collected,
      searchStock
    } = this.state;
    return (
      <View className="product-detail">
        <Swiper
          className="swiper"
          indicator-dots="true"
          indicatorColor="#b3b3b3"
          indicatorActiveColor="#eee"
          autoplay={true}
          interval={5000}
          duration={300}
        >
          {imgUrls.map((item, index) => {
            return (
              <SwiperItem key={index}>
                <Image
                  mode="aspectFill"
                  src={IMG_HOST + item}
                  className="slide-image"
                ></Image>
              </SwiperItem>
            );
          })}
        </Swiper>

        <View className="title-wrap">
          <View className="top">
            <View className="left">
              <View className="title">{product.name}</View>
              <View className="price-wrap">
                <Text className="price">{toPriceYuan(product.price)}</Text>
                <Text className="origin-price">
                  ￥{toPriceYuan(product.origPrice)}
                </Text>
              </View>
            </View>
            <View
              className="right"
              onClick={this.onCollectionToggle.bind(this)}
            >
              <Text
                className={`qcfont ${
                  collected ? "qc-icon-like" : "qc-icon-like-o"
                  }`}
              ></Text>
              <Text>喜欢</Text>
            </View>
          </View>

          <View className="bottom">
            <View className="kuai">快递：包邮</View>
            <View className="gou">已售{product.salesQuantity || 0}件</View>
          </View>

          <View
            className="specs-wrap"
            onClick={this.onDialogToggle.bind(this, true, ButtonType.ALL)}
          >
            <View className="unit">规格</View>
            <View className="value">
              {this.state.model.id ? (
                <View>
                  已选：
                  {Object.keys(searchStock).map(item => {
                    return (
                      /^spec\d+Value$/.test(item) && (
                        <Text key={item}>{searchStock[item]}</Text>
                      )
                    );
                  })}
                </View>
              ) : (
                  <View>请选择规格</View>
                )}
              <Text className="qcfont qc-icon-chevron-right"></Text>
            </View>
          </View>
        </View>

        <View className="content">
          <import src="../../components/wxParse/wxParse.wxml" />
          <template is="wxParse" data="{{wxParseData:article.nodes}}" />
        </View>

        <View className="button-group">
          <View
            className="button short home"
            onClick={this.onJumpPage.bind(this, "/pages/home/index")}
          >
            <View className="qcfont qc-icon-home" />
            <View>首页</View>
          </View>
          <View
            className="button short cart"
            onClick={this.onJumpPage.bind(this, "/pages/cart/index")}
          >
            <View className="qcfont qc-icon-gouwuche" />
            <View>购物车</View>
          </View>
          <Block>
            <View
              className="button length add"
              onClick={
                this.state.model.id
                  ? this.apiAddCart.bind(this)
                  : this.onDialogToggle.bind(this, true, ButtonType.CART)
              }
            >
              加入购物车
            </View>
            <View
              className="button length buy"
              onClick={
                this.state.model.id
                  ? this.apiAddProduct.bind(this)
                  : this.onDialogToggle.bind(this, true, ButtonType.BUY)
              }
            >
              立刻购买
            </View>
          </Block>
        </View>

        {this.state.dialogVisible && (
          <View className="mask">
            <View className="dialog">
              <View className="dialog__header">
                <View className="product-spec">
                  <Image
                    className="product-spec__cover"
                    src={IMG_HOST + selectedProduct.iconUrl}
                  />
                  <View className="product-spec__info">
                    <View className="price">
                      ￥{toPriceYuan(selectedProduct.price)}
                    </View>
                    {model.id ? (
                      <View className="select">
                        已选：
                        {Object.keys(searchStock).map(item => {
                          return (
                            /^spec\d+Value$/.test(item) && (
                              <Text key={item}>{searchStock[item]}</Text>
                            )
                          );
                        })}
                      </View>
                    ) : (
                        <View className="select">请选择规格</View>
                      )}
                    <View className="select">库存：{selectedProduct.qty}</View>
                  </View>
                </View>
                <View
                  className="dialog__header-close qcfont qc-icon-close"
                  onClick={this.onDialogToggle.bind(this, false)}
                />
              </View>
              <View className="dialog_main">
                {this.state.propertys.map((property, index) => {
                  return (
                    <View className="append" key={index}>
                      <View className="key">{property.note}</View>
                      <View className="value">
                        {property.valueList.map((stock, stockIndex) => {
                          return (
                            <View
                              key={stockIndex}
                              className={
                                searchStock[property.name] == stock
                                  ? "span span--active"
                                  : "span"
                              }
                              onClick={this.onChangeStock.bind(
                                this,
                                property.name,
                                stock
                              )}
                            >
                              {stock}
                            </View>
                          );
                        })}
                      </View>
                    </View>
                  );
                })}
                <View className="append list">
                  <View className="key">购买数量</View>
                  <View className="value">
                    <QcInputNumber
                      onChange={e => {
                        model.qty = e;
                        this.setState({ model: this.state.model });
                      }}
                      value={model.qty}
                      min={1}
                      max={selectedProduct.qty}
                    />
                  </View>
                </View>
              </View>
              <View className="dialog_footer flex">
                {(this.state.type === ButtonType.ALL ||
                  this.state.type === ButtonType.CART) && (
                    <View className="add" onClick={this.apiAddCart.bind(this)}>
                      加入购物车
                  </View>
                  )}
                {(this.state.type === ButtonType.ALL ||
                  this.state.type === ButtonType.BUY) && (
                    <View className="buy" onClick={this.apiAddProduct.bind(this)}>
                      立刻购买
                  </View>
                  )}
              </View>
            </View>
          </View>
        )}
      </View>
    );
  }
}
export default ProductDetail;
