import Taro, { Component, Config } from "@tarojs/taro";
import { Block, View, Image, Text, Input, Icon } from "@tarojs/components";
import "./index.scss";
import {
  pageCart,
  addCartNum,
  deducteCartNumber,
  deleteCart
} from "@/api/cart";
import { cartNum } from "@/api/index"
// import { S_IFIFO } from "constants";

export default class Index extends Component {
  config: Config = {
    navigationBarTitleText: "购物车"
  };
  state = {
    imageurl: "https://guyu-1300342109.cos.ap-guangzhou.myqcloud.com",
    cartData: [],
    allCheckbox: false,
    totalPrice: "0", //合计
    phone: '',
    iseven: true,
    loading: false, showinput: false, amount: ''
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
  componentDidMount() { }
  componentDidShow() {
    Taro.removeStorageSync("address");
    Taro.removeStorageSync("couponInfo");
    Taro.removeStorageSync("platCouponInfo");
    Taro.removeStorageSync("freightCoupon");
    const phone = Taro.getStorageSync("phone");
    this.setState({ phone: phone ? phone : '', totalPrice: '0' });
    if (phone) {
      Taro.showLoading()
      this.getCartList();
    } else {
    }
    if (Taro.getStorageSync("memberid")) {
      this.getCartNum()
    }
  }
  getCartList = async () => {
    const res = await pageCart();
    Taro.hideLoading()
    const cartData = res.data.data.list;
    cartData.map(item => {
      item.allBtn = false;
      const orderItems = item.orderItems;
      orderItems.map(list => {
        list.checked = false;
        list.price = parseFloat(list.price / 100).toFixed(2);
      });
    });
    this.setState({ cartData: cartData, allCheckbox: false, loading: true });
  };

  // 去结算
  gobuy() {
    let { totalPrice, cartData } = this.state;
    console.log(cartData)
    if (totalPrice == '0' || totalPrice == '0.00') {
      Taro.showToast({
        title: "请选择要结算的商品",
        icon: "none"
      });
    } else {
      let orderItemIds = "";
      cartData.map((item, i) => {
        const orderItems = cartData[i].orderItems;
        orderItems.map(list => {
          if (list.checked) {
            if (list.stockQty < list.minOrderQuantity) {
              Taro.showToast({
                title: '商品库存不足',
                icon: 'none'
              })
              return
            }
            if (list.minOrderQuantity && list.minOrderQuantity > list.qty) {
              Taro.showToast({
                title: list.name + '最低起购量' + list.minOrderQuantity + list.unit,
                icon: 'none'
              })
              return
            }
            else {
              if (list.status == 0 && list.stockQty > 0) {
                orderItemIds += list.id + "_";
              }
            }
          }
        });
      });

      orderItemIds = orderItemIds.slice(0, -1);
      console.log(orderItemIds)
      if (orderItemIds) {
        Taro.navigateTo({
          url:
            "../../pagesMall/product-confirm/index?orderItemIds=" + orderItemIds
        });
      }

    }
  }
  // 计算总价
  totalPrice() {
    let totalPrice = 0;
    let { cartData } = this.state;
    cartData.map(item => {
      const orderItems = item.orderItems;
      orderItems.map(list => {
        if (list.checked) {
          totalPrice += list.price * list.qty;
        }
      });
    });
    this.setState({ totalPrice: parseFloat(totalPrice).toFixed(2) });
  }
  // 全选
  allselectBtn() {
    let { allCheckbox, cartData } = this.state;
    // 取反
    allCheckbox = !allCheckbox;
    if (allCheckbox) {
      cartData.map(item => {
        item.allBtn = true;
        const orderItems = item.orderItems;
        orderItems.map(list => {
          if (list.stockQty < list.minOrderQuantity) {
            Taro.showToast({
              title: '商品库存不足',
              icon: 'none'
            })
            return
          }
          if (list.minOrderQuantity && list.minOrderQuantity > list.qty) {
            Taro.showToast({
              title: list.name + '最低起购量' + list.minOrderQuantity + list.unit,
              icon: 'none'
            })
            return
          }
          list.checked = true;
        });
      });
    } else {
      cartData.map(item => {
        item.allBtn = false;
        const orderItems = item.orderItems;
        orderItems.map(list => {
          list.checked = false;
        });
      });
    }
    this.setState({ allCheckbox: allCheckbox, cartData: cartData }, () => {
      this.totalPrice();
    });
  }
  // 选择店铺
  StoreCheckbox(index) {
    let { cartData } = this.state;
    cartData[index].allBtn = !cartData[index].allBtn;
    let listFlag = 0;
    // 判断点击的商品
    if (cartData[index].allBtn) {
      const orderItems = cartData[index].orderItems;
      orderItems.map(list => {
        if (list.stockQty < list.minOrderQuantity) {
          Taro.showToast({
            title: '商品库存不足',
            icon: 'none'
          })
          return
        }
        if (list.minOrderQuantity && list.minOrderQuantity > list.qty) {
          Taro.showToast({
            title: list.name + '最低起购量' + list.minOrderQuantity + list.unit,
            icon: 'none'
          })
          return
        }
        list.checked = true;
      });
    } else {
      const orderItems = cartData[index].orderItems;
      orderItems.map(list => {
        list.checked = false;
      });
    }
    // 判断点击的门店
    cartData.map(item => {
      if (item.allBtn) {
        listFlag++;
      }
    });
    if (listFlag == cartData.length) {
      this.setState({ cartData, allCheckbox: true });
    } else {
      this.setState({ cartData, allCheckbox: false });
    }
    this.totalPrice();
  }
  // 商品单选
  bindCheckbox(index, listindex) {
    let { cartData } = this.state;
    if (cartData[index].orderItems[listindex].stockQty < cartData[index].orderItems[listindex].minOrderQuantity) {
      Taro.showToast({
        title: '商品库存不足',
        icon: 'none'
      })
      return
    }
    if (cartData[index].orderItems[listindex].minOrderQuantity && cartData[index].orderItems[listindex].minOrderQuantity > cartData[index].orderItems[listindex].qty) {
      Taro.showToast({
        title: cartData[index].orderItems[listindex].name + '最低起购量' + cartData[index].orderItems[listindex].minOrderQuantity + cartData[index].orderItems[listindex].unit,
        icon: 'none'
      })
      return
    }
    cartData[index].orderItems[listindex].checked = !cartData[index].orderItems[listindex].checked;
    let flag = 0,
      listFlag = 0;
    const orderItems = cartData[index].orderItems;
    orderItems.map(list => {
      if (list.checked) {
        flag++;
      }
      if (flag == orderItems.length) {
        cartData[index].allBtn = true;
      } else {
        cartData[index].allBtn = false;
      }
    });
    // 判断点击门店
    cartData.map(item => {
      if (item.allBtn) {
        listFlag++;
      }
    });
    if (listFlag == cartData.length) {
      this.setState({ cartData: cartData, allCheckbox: true });
    } else {
      this.setState({ cartData: cartData, allCheckbox: false });
    }
    this.totalPrice();
  }
  // 减少数量
  async bindMinus(index, listindex, id) {
    let { cartData } = this.state;
    console.log(cartData)
    let cartstock = cartData[index].orderItems[listindex].stockQty//库存
    if (cartData[index].orderItems[listindex].newqty > cartstock) {
      Taro.showToast({
        title: '请输入不超过' + cartstock + '件的数量',
        icon: 'none'
      })
      return
    }
    let params = { id }
    const res = await deducteCartNumber(params);

    if (cartData[index].orderItems[listindex].qty <= 1) {
      return
    } else {
      cartData[index].orderItems[listindex].qty--;
    }
    this.setState({ cartData });
    this.totalPrice();
  }

  // 增加数量
  async bindPlus(index, listindex, id) {
    let { cartData } = this.state;
    console.log(cartData)
    const params = { id }
    const res = await addCartNum(params);
    if (res.data.code == 20000) {
      if (cartData[index].orderItems[listindex].stockQty < cartData[index].orderItems[listindex].qty) {
        Taro.showToast({
          title: '该商品库存不足',
          icon: 'none'
        })
      } else {
        cartData[index].orderItems[listindex].qty++;
      }

    }
    this.setState({ cartData });
    this.totalPrice();
  }

  // 输入数量
  async getqtyNum(e) {
    let value = e.detail.value//输入数量
    let { index, listindex, id } = e.currentTarget.dataset
    let { cartData } = this.state;
    console.log(cartData)
    cartData[index].orderItems[listindex].newqty = value
    let cartqty = cartData[index].orderItems[listindex].qty//当前商品数量
    let cartstock = cartData[index].orderItems[listindex].stockQty//库存
    if (cartData[index].orderItems[listindex].stockQty < value) {
      Taro.showToast({
        title: '库存不足,请输入不超过' + cartstock + '件的数量',
        icon: 'none'
      })
      return
    }
    if (Number(value) > Number(cartqty)) {
      const params = { id, qty: Number(value) - Number(cartqty) }
      const res = await addCartNum(params);
      if (res.data.code == 20000) {
        cartData[index].orderItems[listindex].qty = value;
      }
    } else if (Number(value) < Number(cartqty)) {
      const params = { id, qty: Number(cartqty) - Number(value) }
      const res = await deducteCartNumber(params);
      if (res.data.code == 20000) {
        if (cartData[index].orderItems[listindex].stockQty < cartData[index].orderItems[listindex].qty) {
          Taro.showToast({
            title: '该商品库存不足',
            icon: 'none'
          })
        } else {
          cartData[index].orderItems[listindex].qty = value;
        }
      }
    }


    this.setState({ cartData });
    this.totalPrice();
  }
  // 删除购物车商品
  deteleNum(id) {
    Taro.showModal({
      content: '确定要删除该商品？',
      success: (res => {
        if (res.confirm) {
          this.cannum(id)
        }
      })
    })
  }
  cannum = async id => {
    const res = await deleteCart(id);
    if (res.data.code == 20000) {
      this.getCartList();
      // this.getCartNum()
      const res = await cartNum()
      if (res.data.code == 20000) {
        let text = res.data.data.qty
        text = JSON.stringify(text)
        Taro.setTabBarBadge({
          index: 3,
          text: text
        })
      }
    } else {
      Taro.showToast({
        title: "删除失败",
        icon: "none"
      });
    }
  };
  // 去领券
  goGetCoupon(id) {
    Taro.navigateTo({
      url: "../../pagesCommon/coupons/coupon/coupon?storeId=" + id
    });
  }
  // status; //状态  -2:删除；-1：下架；0:加入购物车；1：生成订单；
  render() {
    const { cartData, allCheckbox, phone, totalPrice, loading, showinput, amount, imageurl } = this.state;
    return (
      <Block>

        {loading && (
          <Block>
            {phone ? (
              <View>
                {cartData.length > 0 ? (
                  <Block>
                    <View style="flex-direction:column;width:100%;display:flex">
                      {cartData.map((item, index) => {
                        return (
                          <View key={String(index)} style="flex-direction:column;background:#fff;margin-top:20rpx;">
                            <View className="store">
                              <View style='display:flex'>
                                {item.allBtn ? (
                                  <Icon
                                    type="success"
                                    size="20"
                                    color="#1BBC3D"
                                    onClick={() => {
                                      this.StoreCheckbox(index);
                                    }}
                                    data-index={index}
                                  ></Icon>
                                ) : (
                                    <Icon
                                      type="circle"
                                      size="20"
                                      color="#1BBC3D"
                                      onClick={() => {
                                        this.StoreCheckbox(index);
                                      }}
                                      data-index={index}
                                    ></Icon>
                                  )}
                                <View className="store-name">
                                  <View>{item.storeName}</View>
                                  <View className='support'>
                                    {item.isPlatformDelivery && (
                                      <Text>支持丰盈配送</Text>
                                    )}
                                    {item.isOrderInvoice && (
                                      <Text>支持开票</Text>
                                    )}
                                  </View>
                                </View>
                              </View>
                              <Text
                                className="coupon"
                                onClick={() => {
                                  this.goGetCoupon(item.storeId);
                                }}
                              >
                                领券
                          </Text>
                            </View>
                            {item.orderItems.map((value, listindex) => {
                              return (
                                <View key={String(listindex)} className="cartproduct">
                                  <View style="display:flex;justify-content:space-between">
                                    {item.stockQty == 0 ? (
                                      <View className="cart-icon">售罄</View>
                                    ) : (
                                        <Block>
                                          {value.status == 0 && (
                                            <Block>
                                              {value.checked && (
                                                <Icon
                                                  className="cart-icon"
                                                  type="success"
                                                  size="20"
                                                  color="#1BBC3D"
                                                  data-index={index}
                                                  data-listindex={listindex}
                                                  data-catid={value.pigcms_id}
                                                  onClick={() => {
                                                    this.bindCheckbox(index, listindex);
                                                  }}
                                                ></Icon>
                                              )}
                                              {!value.checked && (
                                                <Icon
                                                  className="cart-icon"
                                                  type="circle"
                                                  size="20"
                                                  color="#1BBC3D"
                                                  data-index={index}
                                                  data-listindex={listindex}
                                                  data-catid={value.pigcms_id}
                                                  onClick={() => {
                                                    this.bindCheckbox(index, listindex);
                                                  }}
                                                ></Icon>
                                              )}
                                            </Block>
                                          )}
                                        </Block>
                                      )}
                                    {value.status == -1 && (
                                      <Image className='sell' src='../../images/item/pic1.png'></Image>
                                    )}
                                    {value.status == -2 && (
                                      <Image className='sell' src='../../images/item/pic2.png'></Image>
                                    )}
                                    <Image onClick={() => { Taro.navigateTo({ url: '../../pagesCommon/goods/goods-detail?id=' + value.productId + '&storeId=' + value.storeId }) }}
                                      className="cart-image" src={imageurl + value.iconUrl}></Image>
                                    <View className="cartdetail" onClick={() => { Taro.navigateTo({ url: '../../pagesCommon/goods/goods-detail?id=' + value.productId + '&storeId=' + value.storeId }) }}>
                                      <View className="cansen">
                                        <Text className="detail-name">
                                          {value.name}
                                        </Text>
                                      </View>
                                      <View style="min-height:32rpx;flex-direction:column;margin-bottom:10rpx">
                                        <Text className="detail-weight">
                                          {value.specs}
                                        </Text>
                                      </View>
                                      <View className="cart-add">
                                        <View className="cart-price">
                                          <Text style="font-size:20rpx;margin-top:7rpx">￥</Text>
                                          <Text style="font-size:28rpx;">{value.price} </Text>
                                        </View>
                                      </View>
                                    </View>
                                  </View>
                                  <View className='dle' onClick={() => { this.deteleNum(value.id); }} data-cartid={value.pigcms_id}>
                                    <Image src={require("../../images/item/gy-icon_87.png")}></Image>
                                  </View>

                                  <View className="cart-add-reduce">
                                    <Text
                                      className="cart-reduce cart-common"
                                      onClick={() => {
                                        this.bindMinus(
                                          index, listindex, value.id);
                                      }}
                                      data-listindex={listindex}
                                      data-index={index}
                                    >-</Text>
                                    <Input className="cart-text-num cart-common-two" data-index={index} data-listindex={listindex} data-id={value.id} onBlur={this.getqtyNum} value={value.qty}></Input>
                                    {/* <Text onClick={() => { this.showInput(index, listindex, value.id,value.qty)}} className="cart-text-num cart-common-two" type="number">{value.qty}</Text> */}
                                    <Text
                                      className="cart-add cart-common"
                                      onClick={() => {
                                        this.bindPlus(
                                          index,
                                          listindex,
                                          value.id
                                        );
                                      }}
                                      data-listindex={listindex}
                                      data-index={index}
                                    >+{" "}</Text>
                                  </View>

                                </View>
                              );
                            })}
                          </View>
                        );
                      })}
                      <View style="height:160rpx;"></View>
                    </View>
                    <View className="settle">
                      <View className="checkall">
                        {allCheckbox ? (
                          <Icon
                            type="success"
                            size="20"
                            color="#1BBC3D"
                            onClick={this.allselectBtn}
                          ></Icon>
                        ) : (
                            <Icon
                              type="circle"
                              size="20"
                              color="#1BBC3D"
                              onClick={this.allselectBtn}
                            ></Icon>
                          )}
                        <Text>全选</Text>
                      </View>
                      <View className="settle_price">
                        <View>
                          <Text>
                            合计
                        <Text style="color:#1BBC3D;font-size:32rpx">{"￥" + totalPrice}</Text>
                          </Text>
                          <Text style="color:#999;font-size:24rpx">未含物流服务费</Text>
                        </View>
                        <Text className="account" onClick={this.gobuy}>
                          去结算
                    </Text>
                      </View>
                    </View>
                  </Block>
                ) : (
                    <View className="no-data-view">
                      <Image
                        src={require("../../images/item/cart_99.png")}
                        mode="widthFix"
                        className="no-data-image"
                      ></Image>
                      <Text className="no-data-text">
                        购物车还是空的喔
                </Text>
                    </View>
                  )}
              </View>
            ) : (
                <View className="overlay">
                  <View className="overlay-content tel-content">
                    <View className="title">
                      <Image
                        className="overlay_image"
                        src={imageurl + '/attachments/null/d9a6c7c49b92453996cec79d1fc4d410.png'}
                      ></Image>
                      <View className="modal-firstText">
                        您还没有登录，请登录后查看订单
                </View>
                    </View>
                    <View
                      className="modal-button"
                      onClick={() => {
                        Taro.navigateTo({ url: "../authorize/index" });
                      }}
                    >
                      <View>去登录</View>
                    </View>
                  </View>
                </View>
              )}
          </Block>
        )}
      </Block>
    );
  }
}
