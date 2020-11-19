// import Taro, { useRouter, useEffect, useState, useDidShow } from "@tarojs/taro";
import Taro, { Component, Config } from "@tarojs/taro";
import { View, Text, Picker, Image, Label, Radio, RadioGroup, Input } from "@tarojs/components";
import { getOrderPreview, postOrder, transportamount, getOrderCreate } from "@/api/order";
import { toPriceYuan } from "@/utils/format";
import "./index.scss";
import DatetimePicker from "@/components/datetime-picker";

export default class Index extends Component {
  state = {
    imageurl: "https://guyu-1300342109.cos.ap-guangzhou.myqcloud.com",
    orderItemIds: "",
    bution: [
      { value: "platformsend", name: "丰盈配送", checked: false },
      { value: "distribution", name: "店铺配送", checked: false },
      { value: "takeout", name: "店铺自提", checked: false }
    ],
    orderData: {},
    address: {},
    model: [],
    totalAmount: "",
    amount: "",
    wuliu: "",
    dankou: "",
    totalPrice: "",
    sellType: "",
    sellindex: "",
    platCouponInfo: {},
    yunfei: 0,
    freightCoupon: {},
    orderToken: "",
    storeCoupon: {},
    selDate: "",
    selStartTime: "",
    selEndTime: "",
    currentDate: "",
    nextdate: '',
    dateSel: '',
    isShowtime: false,
    isDate: false,
    isTime: true,
    selTime: "",
    isplat: false,
    transportAmount: '',
    deliveryTime: '',
    platDeliveryLowestAmount: '', checkplat: false,
    deliveryTimeList: [],
    datatime: [],
    distTime: [],
    advert: '',
    n_tine: '',
    // 重试请求次数
    rqerustSum: 0,
    ischeckbuy: true
  };

  componentDidShow() {
    const currentDate = new Date().getTime();
    const newDate = this.getLocalTime(currentDate);
    const nextdate = this.getNextDay()
    console.log('newDate', newDate, nextdate)
    this.setState({ currentDate: newDate, nextdate });
    const orderItemIds = this.$router.params.orderItemIds;
    const params = { orderItemIds }
    // 优先使用用户选择的地址
    let address = Taro.getStorageSync("address");
    if (address) {
      address = address
      params.addressId = address.id
      this.setState({ address });
    }
    Taro.showLoading()
    this.getProductList(params, this.state.model);
  }

  getProductList = async (params, models) => {
    const res = await getOrderPreview(params);
    Taro.hideLoading()
    let orderData = res.data.data
    let stores = res.data.data.stores
    // console.log(stores)
    let { deliveryTimeList, coupon, orderToken, amount, transportAmount, couponPayAmount, storeCouponPayAmount, platDeliveryLowestAmount } = res.data.data;
    const totalAmount = amount;
    let wuliu = 0, dankou = 0, totalPrice = 0;
    if (!params.addressId) {
      let address = res.data.data.address ? res.data.data.address : ''
      this.setState({ address });
    }

    console.log(models)
    // ---------------------------start没有去选择档口优惠，平台优惠的情况start-----------------金额格式化
    stores.map((item, index) => {
      if (models.length > 0) {
        // console.log(Number(models[index].transportAmount) * 100)
        // item.transportAmount = models[index].transportAmount * 100
        // item.subtotalAmount = Number(models[index].subtotalAmount) * 100
        item.deliveryWays = models[index].deliveryWays
        item.deliveryWay = models[index].deliveryWay
        item.deliveryTime = models[index].deliveryTime
        item.deliveryMobile = models[index].deliveryMobile
        item.selfTakeAddress = models[index].selfTakeAddress
      }
      // 补贴赋值新的字段 本地切换配送时 计算用
      item.transportDiscountAmount_2 = item.transportDiscountAmount || 0

      const orderItems = item.orderItems;
      let deliveryWays = item.deliveryWays
      let productTotalProduct = 0
      orderItems.map(list => {
        productTotalProduct += list.productAmount
        list.price = toPriceYuan(list.price)
      });
      item.productTotalProduct = productTotalProduct

      if (JSON.stringify(deliveryWays) == "{}") {
        item.isdeliveryWays = true
      } else {
        item.isdeliveryWays = false
        if (deliveryWays.platformsend) {
          this.setState({ isplat: true, deliveryTime: deliveryWays.platformsend.timeQuantum })
        }
      }
      if (models.length > 0) {
        item.newsubtotalAmount = Number(models[index].newsubtotalAmount);
      } else {
        item.newsubtotalAmount = item.productTotalProduct;
      }
      // 默认有店铺优惠券
      if (item.coupon) {
        // 档口优惠
        item.coupon.amount = parseFloat(item.coupon.amount / 100).toFixed(2)
        // 档口小计
        // console.log(Number(item.subtotalAmount), Number(item.coupon.amount))
        // item.subtotalAmount = Number(item.subtotalAmount) - Number(item.coupon.amount)
        // 档口总优惠
        dankou += Number(item.coupon.amount);
      }
      if (Number(item.subtotalAmount) > 0) {//当金额不为负数时计算
        totalPrice += Number(item.subtotalAmount);//使用店铺优惠券后的商品总金额
        item.subtotalAmount = toPriceYuan(item.subtotalAmount);
      } else {
        item.subtotalAmount = '0.00'
      }
      // 总物流费
      wuliu += item.transportAmount;
      // 店铺物流费
      item.transportAmount = toPriceYuan(item.transportAmount);

    });
    // 默认有平台优惠券
    if (coupon) {
      if (coupon.type == 2) {
        // 折扣 =  商品金额 * 折扣 - 结果
        coupon.amount = amount - (amount * (coupon.amount / 100))
        coupon.amount = Math.max(0, coupon.amount)
        coupon.amount = toPriceYuan(coupon.amount)
      } else {
        coupon.amount = toPriceYuan(coupon.amount)
      }
    } else {
      coupon = "";
    }

    let transportCoupon = res.data.data.transportCoupon
    //运费优惠券
    let yunfei = 0;
    if (wuliu && transportCoupon && transportCoupon.id) {
      // 接口默认返回的优惠券 类型字段 从couponType 改成 type，自己手动选的不变
      if (transportCoupon.type == 2) {
        yunfei = wuliu - (wuliu * (transportCoupon.amount / 100))
        yunfei = Math.max(0, yunfei)
      } else {
        if (wuliu >= orderData.transportCouponAmount) yunfei = orderData.transportCouponAmount
        else yunfei = wuliu
        // totalPrice -= yunfei
      }
    }

    // 如果运费券金额 > 物流费 - 补贴，那么运费券金额 = 物流费 - 补贴
    if (yunfei > (wuliu - orderData.transportDiscountAmount)) yunfei = wuliu - orderData.transportDiscountAmount
    let datatime = []
    deliveryTimeList.map((item, index) => {
      let array = {}
      var houer = item.slice(6, 8)
      array.time = item
      array.houer = houer
      datatime.push(array)
    })
    console.log(datatime)
    this.setState({
      orderData,
      wuliu: toPriceYuan(wuliu),
      yunfei: toPriceYuan(yunfei),
      freightCoupon: transportCoupon || {},
      transportAmount: toPriceYuan(transportAmount),
      dankou: parseFloat(dankou).toFixed(2),
      // totalPrice: toPriceYuan(totalPrice),
      model: stores,
      totalAmount: toPriceYuan(amount),
      orderToken,
      amount: toPriceYuan(amount),
      storeCoupon: coupon,
      orderItemIds: params.orderItemIds,
      platDeliveryLowestAmount,
      deliveryTimeList, datatime
    });

    // ---------------------end没有去选择档口优惠，平台优惠的情况--------------------金额格式化

    const couponInfo = Taro.getStorageSync("couponInfo"); //档口优惠券
    const platCouponInfo = Taro.getStorageSync("platCouponInfo"); //平台优惠券
    const freightCoupon = Taro.getStorageSync("freightCoupon"); //运费优惠券

    // 重新选择的平台优惠券
    if (platCouponInfo) {
      if (platCouponInfo.couponType == 2) {
        // 折扣 =  商品金额 * 折扣 - 结果
        platCouponInfo.amount = amount - (amount * (platCouponInfo.amount / 100))
        platCouponInfo.amount = Math.max(0, platCouponInfo.amount)
        platCouponInfo.amount = toPriceYuan(platCouponInfo.amount)
      } else {
        // 固定金额
        platCouponInfo.amount = toPriceYuan(platCouponInfo.amount)
      }
      this.setState({
        storeCoupon: platCouponInfo,
      })
    }

    // 获取档口优惠券----重新选择档口优惠券
    let wuliu1 = 0, dankou1 = 0, totalPrice1 = 0;
    if (couponInfo) {
      couponInfo.amount = toPriceYuan(couponInfo.amount);
      const model = this.state.model;
      model.map((item, i) => {
        if (couponInfo.storeId == item.storeId) {
          item.coupon = couponInfo;
          // 小计=商品金额-档口优惠+物流费
          item.subtotalAmount = Number(item.productTotalProduct) - Number(couponInfo.amount * 100);
          if (item.subtotalAmount > 0) {
            item.subtotalAmount = Number(item.subtotalAmount) + Number(item.transportAmount * 100)
          } else {
            item.subtotalAmount = Number(item.transportAmount * 100)
          }
          item.subtotalAmount = toPriceYuan(item.subtotalAmount);
        }
        if (item.coupon) {
          // 档口优惠
          dankou1 += Number(item.coupon.amount);
        }
        // 总物流费
        wuliu1 += Number(item.transportAmount);
      });

      this.setState({
        model: model,
        wuliu: parseFloat(wuliu1).toFixed(2),
        dankou: parseFloat(dankou1).toFixed(2),
      });
    }

    // 重新选择运费券
    if (wuliu && freightCoupon && freightCoupon.id) {
      let yunfei_1 = 0;
      if (freightCoupon.id == '1002') {
        // let oldYunfei_1 = Taro.getStorageSync('oldYunfei_1') || yunfei
        // totalPrice += oldYunfei_1
        // Taro.setStorageSync('oldYunfei_1', 0)
      } else {
        // 折扣券
        if (freightCoupon.couponType == 2) {
          yunfei_1 = wuliu - (wuliu * (freightCoupon.amount / 100))
        } else {
          // 固定金额
          if (wuliu >= Number(freightCoupon.amount)) yunfei_1 = Number(freightCoupon.amount)
          else yunfei_1 = wuliu
        }
      }

      // 如果运费券金额 > 物流费 - 补贴，那么运费券金额 = 物流费 - 补贴
      if (yunfei_1 > (wuliu - orderData.transportDiscountAmount)) yunfei_1 = wuliu - orderData.transportDiscountAmount

      yunfei_1 = Math.max(0, yunfei_1)
      this.setState({
        yunfei: toPriceYuan(yunfei_1),
        freightCoupon,
      })
    }

    // 页面进来根据配送方式显示正确的物流费
    this.state.model.forEach((item, index) => {
      console.log(item.deliveryWay)
      if (!item.deliveryWay) return true
      this.singlechange({ detail: { value: item.deliveryWay } }, index)
    })

    // 计算总金额
    // this.computeAmount()

    setTimeout(() => {
      let totalPrice6 = 0
      console.log('>>>>>>>>>>>>>>>>>>>>>>>>')
      console.log('运费券金额 > 运费-运费补贴，运费券金额 = 运费-运费补贴')
      console.log('总金额 = (商品金额 - 档口优惠 - 平台优惠)  + (物流费 - 运费券 - 运费补贴)')
      console.log('>>>>>>>>>>>>>>>>>>>>>>>>')

      // 总金额 = (商品金额 - 档口优惠 - 平台优惠) + (物流费 - 运费券 - 运费补贴) 
      console.log(Number(this.state.amount) * 100, Number(this.state.wuliu) * 100, Number(this.state.yunfei) * 100, Number(this.state.dankou) * 100, this.state.storeCoupon)
      let transportDiscountAmount = this.state.orderData.transportDiscountAmount || 0
      // 最终优惠后的物流费
      let lastWuliu = (Number(this.state.wuliu) * 100 - Number(this.state.yunfei) * 100) - Number(transportDiscountAmount)
      lastWuliu = Math.max(0, lastWuliu)
      totalPrice6 += lastWuliu
      // 最终优惠后的商品金额
      let lastAmout = Number(this.state.amount) * 100 - Number(this.state.dankou) * 100
      if (this.state.storeCoupon && this.state.storeCoupon.amount) {
        lastAmout -= Number(this.state.storeCoupon.amount) * 100
      }
      lastAmout = Math.max(0, lastAmout)
      totalPrice6 += lastAmout
      console.log('需支付金额===》', totalPrice6)
      this.setState({
        totalPrice: toPriceYuan(totalPrice6)
      })
    }, 500)
    // this.getlogist(stores, address)
  };

  async getlogist(stores, address) {
    // 加载物流费
    let { model, storeCoupon } = this.state
    let coupon = storeCoupon
    let totalPrice = 0, wuliu = 0
    stores.map(item => {
      const orderItems = item.orderItems;
      let deliveryWays = item.deliveryWays
      if (JSON.stringify(deliveryWays) == "{}") {
        item.isdeliveryWays = true
      } else {
        item.isdeliveryWays = false
        // 当有丰盈配送店铺时，默认加载物流费接口
        if (deliveryWays.platformsend) {
          let ids = ''
          orderItems.map(res => {
            ids += res.id + '_'
          })
          ids = ids.slice(0, -1)
          const params = { orderItemIds: ids, addressId: address.id }
          transportamount(params).then(res => {
            if (res.data.code == 20000) {
              item.transportAmount = toPriceYuan(res.data.data.transportAmount)
              if (Number(item.subtotalAmount) <= 0) {
                item.subtotalAmount = toPriceYuan(res.data.data.transportAmount)
              } else {
                if (item.coupon) {
                  item.subtotalAmount = parseFloat(Number(item.newsubtotalAmount / 100) - Number(item.coupon.amount)).toFixed(2)
                  if (Number(item.subtotalAmount) < 0) {
                    item.subtotalAmount = parseFloat(Number(item.transportAmount)).toFixed(2)
                  } else {
                    item.subtotalAmount = parseFloat(Number(item.subtotalAmount) + Number(item.transportAmount)).toFixed(2)
                  }
                } else {
                  item.subtotalAmount = parseFloat(Number(item.newsubtotalAmount / 100) + Number(item.transportAmount)).toFixed(2)
                }
              }
              // 总物流费
              wuliu += Number(item.transportAmount)
              // 合计
              totalPrice += Number(item.subtotalAmount)
              if (coupon.amount) {
                totalPrice = Number(totalPrice) - Number(wuliu) - Number(coupon.amount)
              } else {
                totalPrice = Number(totalPrice) - Number(wuliu)
              }
              if (Number(totalPrice) > 0) {
                totalPrice = Number(totalPrice) + Number(wuliu)
              } else {
                totalPrice = Number(wuliu)
              }
              if (this.state.yunfei) totalPrice -= (Number(this.state.yunfei) * 100);
              this.setState({ model: stores, wuliu: parseFloat(wuliu).toFixed(2), totalPrice: parseFloat(totalPrice).toFixed(2) })
            }
          })
        }
      }
    })
  }

  // 去领档口优惠
  stallCoupon(index, storeId, couponId) {
    const { model } = this.state
    const orderItems = model[index].orderItems
    let money = 0
    orderItems.map(item => {
      money += parseInt(item.productAmount / 100)
    })
    if (couponId) {
      Taro.navigateTo({
        url: "../stallcoupon/stallcoupon?storeId=" + storeId + "&couponId=" + couponId + "&money=" + money
      });
    } else {
      Taro.navigateTo({
        url: "../stallcoupon/stallcoupon?storeId=" + storeId + "&money=" + money
      });
    }
  }
  // 去领平台优惠
  platCoupon(id) {
    const { amount, dankou } = this.state
    // const money = Number(amount * 100) - Number(dankou * 100)
    // const money = Number(amount * 100)
    Taro.navigateTo({
      url: "../platcoupon/platcoupon?productMoney=" + this.state.totalPrice + "&id=" + id + "&money=" + amount
    });
  }
  // 去领运费券
  toFreightCoupon(id) {
    const { amount, dankou } = this.state
    // const money = Number(amount * 100)
    Taro.navigateTo({
      url: "../freight-coupon/index?productMoney=" + this.state.totalPrice + "&id=" + id + "&money=" + amount
    });
  }

  // 选择配送方式
  async singlechange(e, index) {
    var sellType = e.detail.value;
    const { model, address, amount, dankou, storeCoupon, transportAmount, orderData } = this.state;
    if (sellType == "platformsend" || sellType == "distribution") {
      // this.setState({ model })
      if (!address.id) {
        Taro.showToast({
          title: '请选择收货地址',
          icon: 'none'
        })
        return
      }
    }

    if (model[index].deliveryWays.platformsend) {
      if (sellType != 'platformsend') {
        // console.log(model[index].deliveryWays)
        model[index].deliveryWays.platformsend['isCheck'] = false
      } else {
        model[index].deliveryWays.platformsend['isCheck'] = true
      }
    }
    model[index].deliveryWay = sellType;
    if (model[index].deliveryWay == "platformsend") {
      this.setState({ isplat: true, deliveryTime: model[index].deliveryWays.platformsend.timeQuantum })
      const orderItems = model[index].orderItems
      let ids = ''
      orderItems.map(res => {
        ids += res.id + '_'
      })
      ids = ids.slice(0, -1)
      // 加上运费补贴
      if (model[index].transportDiscountAmount_2 === 0) {
        orderData.transportDiscountAmount += model[index].transportDiscountAmount || 0
      }
      if (orderData.transportDiscountAmount < 0) orderData.transportDiscountAmount = 0
      model[index].transportDiscountAmount_2 = model[index].transportDiscountAmount || 0
      // 当选择丰盈配送时获取物流费
      // const params = { orderItemIds: ids, addressId: address.id }
      // const res = await transportamount(params)
      // Taro.hideLoading()
      // if (res.data.code == 20000) {
      //   model[index].transportAmount = toPriceYuan(res.data.data.transportAmount)
      //   if (model[index].subtotalAmount == '0.00') {
      //     model[index].subtotalAmount = toPriceYuan(res.data.data.transportAmount)
      //   } else {
      //     if (model[index].coupon) {
      //       model[index].subtotalAmount = parseFloat(Number(model[index].newsubtotalAmount / 100) - Number(model[index].coupon.amount)).toFixed(2)
      //       if (Number(model[index].subtotalAmount) < 0) {
      //         model[index].subtotalAmount = parseFloat(Number(model[index].transportAmount)).toFixed(2)
      //       } else {
      //         model[index].subtotalAmount = parseFloat(Number(model[index].subtotalAmount) + Number(model[index].transportAmount)).toFixed(2)
      //       }
      //     } else {
      //       model[index].subtotalAmount = parseFloat(Number(model[index].newsubtotalAmount / 100) + Number(model[index].transportAmount)).toFixed(2)
      //     }
      //   }
      //   this.setState({ checkplat: true })
      // } else {
      //   Taro.showToast({ title: res.data.message, icon: 'none' })
      //   this.setState({ checkplat: false })
      // }
    } else {
      model[index].transportAmount = '0.00'
      if (model[index].coupon) {
        model[index].subtotalAmount = parseFloat(Number(model[index].newsubtotalAmount / 100) - Number(model[index].coupon.amount)).toFixed(2)
        if (model[index].subtotalAmount < 0) {
          model[index].subtotalAmount = '0.00'
        }
      } else {
        model[index].subtotalAmount = parseFloat(Number(model[index].newsubtotalAmount / 100)).toFixed(2)
      }
      // 预览商品默认选中丰盈配送 ，不选择丰盈配送就减去运费补贴
      orderData.transportDiscountAmount -= model[index].transportDiscountAmount_2 || 0
      if (orderData.transportDiscountAmount < 0) orderData.transportDiscountAmount = 0
      model[index].transportDiscountAmount_2 = 0
    }

    // console.log(model)
    let prodtotal = 0
    let totalTransport = 0;
    let totals = 0
    let coupontotal = 0
    // 店铺优惠+平台优惠
    if (storeCoupon.amount) {
      coupontotal = Number(storeCoupon.amount) + Number(dankou)
    } else {
      coupontotal = Number(dankou)
    }
    let storeNum = 0
    model.map(item => {
      // 1.当前选择丰盈的店铺数量
      if (item.deliveryWay == 'platformsend') {
        storeNum++
      } else {
        if (item.deliveryWays.platformsend && item.deliveryWays.platformsend.isCheck) {
          storeNum++
        }
      }

    })
    console.log(storeNum)
    // model.map(item => {
    //   prodtotal += Number(item.newsubtotalAmount / 100)
    //   totalTransport += Number(item.transportAmount)
    //   if (prodtotal > 0) {
    //     if (prodtotal > coupontotal) {
    //       if (storeCoupon.amount) {
    //         totals = prodtotal - Number(storeCoupon.amount) - Number(dankou) + totalTransport
    //       } else {
    //         totals = prodtotal - Number(dankou) + totalTransport
    //       }
    //     } else {
    //       totals = totalTransport
    //     }
    //   }
    // })

    // if (storeCoupon.amount) {
    //   totals = totals - Number(storeCoupon.amount)
    //   if (Number(totals) < 0) {
    //     totals = totalTransport
    //   }
    // }

    const deliveryWays = model[index].deliveryWays;
    const delivey = JSON.stringify(deliveryWays);
    // 判断是否有返回自提地址和电话
    if (delivey == "{}") {
      model[index].deliveryMobile = "";
      model[index].selfTakeAddress = "";
      model[index].deliveryTime = "";
    } else {
      for (let key in deliveryWays) {
        if (key == sellType) {
          model[index].deliveryMobile = deliveryWays[key].phoneNumber;
          model[index].selfTakeAddress = deliveryWays[key].address;
          model[index].deliveryTime = deliveryWays[key].timeQuantum;
        }
      }
    }
    console.log(model)
    let tranmoney = 0
    let con = 0, dot = 0
    model.map(item => {
      if (item.deliveryWays.platformsend && item.deliveryWays.platformsend.isCheck) {
        if (item.deliveryWay = 'platformsend') {
          item.transportAmount = item.startTransportAmount / storeNum + item.basicTransportAmount
          item.transportAmount = parseFloat(item.transportAmount / 100).toFixed(2)
          totalTransport += Number(item.transportAmount)
          tranmoney = (totalTransport * orderData.transportAllowance.percent) * 100
        } else {
          item.transportAmount = 0.00
        }
      }
      if (item.deliveryWay) {
        con++
      }
    })
    console.log('tranmoney', tranmoney)
    orderData.transportDiscountAmount = tranmoney
    if (con == model.length) {
      model.map(item => {
        if (item.deliveryWay == 'platformsend') {
          dot++
        }
      })
      if (dot > 0) {
        this.setState({ isplat: true })
      } else {
        this.setState({ isplat: false })
      }
    }
    if (con < model.length) {
      model.map(item => {
        if (item.deliveryWays.platformsend && item.deliveryWays.platformsend.isCheck) {
          this.setState({ isplat: true })
        }
      })
    }

    // this.setState({ model, sellType: sellType, sellindex: index, wuliu: parseFloat(totalTransport).toFixed(2), totalPrice: parseFloat(totals).toFixed(2) });
    this.setState({ orderData, model, sellType: sellType, sellindex: index, wuliu: parseFloat(totalTransport).toFixed(2) }, () => {
      // 重新计算运费券
      let wuliu = totalTransport * 100
      let freightCoupon = this.state.freightCoupon
      console.log('重新计算运费券==>', wuliu, freightCoupon)
      if (wuliu && freightCoupon && freightCoupon.id) {
        let yunfei_1 = 0;
        if (freightCoupon.id != '1002') {
          // 折扣券
          if (freightCoupon.couponType == 2) {
            yunfei_1 = wuliu - (wuliu * (freightCoupon.amount / 100))
          } else {
            // 固定金额
            if (wuliu >= Number(freightCoupon.amount)) yunfei_1 = Number(freightCoupon.amount)
            else yunfei_1 = wuliu
          }
        }
        // 如果运费券金额 > 物流费 - 补贴，那么运费券金额 = 物流费 - 补贴
        if (yunfei_1 > (wuliu - orderData.transportDiscountAmount)) yunfei_1 = wuliu - orderData.transportDiscountAmount
        yunfei_1 = Math.max(0, yunfei_1)
        this.setState({
          yunfei: toPriceYuan(yunfei_1)
        })
      }

      // 计算总金额
      // this.computeAmount()
      setTimeout(() => {
        let totalPrice6 = 0
        console.log('>>>>>>>>>>>>>>>>>>>>>>>>')
        console.log('运费券金额 > 运费-运费补贴，运费券金额 = 运费-运费补贴')
        console.log('总金额 = (商品金额 - 档口优惠 - 平台优惠)  + (物流费 - 运费券 - 运费补贴)')
        console.log('总物流费===>' + this.state.wuliu)
        console.log('>>>>>>>>>>>>>>>>>>>>>>>>')
        // 总金额 = (商品金额 - 档口优惠 - 平台优惠) + (物流费 - 运费券 - 运费补贴) 
        console.log(Number(this.state.amount) * 100, Number(this.state.wuliu) * 100, Number(this.state.yunfei) * 100, Number(this.state.dankou) * 100, this.state.storeCoupon)
        // let transportDiscountAmount = this.state.orderData.transportDiscountAmount || 0
        let transportDiscountAmount = tranmoney || 0
        // 最终优惠后的物流费
        let lastWuliu = (Number(this.state.wuliu) * 100 - Number(this.state.yunfei) * 100) - Number(transportDiscountAmount)
        lastWuliu = Math.max(0, lastWuliu)
        totalPrice6 += lastWuliu
        // 最终优惠后的商品金额
        let lastAmout = Number(this.state.amount) * 100 - Number(this.state.dankou) * 100
        if (this.state.storeCoupon && this.state.storeCoupon.amount) {
          lastAmout -= Number(this.state.storeCoupon.amount) * 100
        }
        lastAmout = Math.max(0, lastAmout)
        totalPrice6 += lastAmout
        console.log('需支付金额===》', totalPrice6)
        this.setState({
          totalPrice: toPriceYuan(totalPrice6)
        })
      }, 500)
    });

  }


  // 获取备注信息
  getmark(e, storeId) {
    const { model } = this.state;
    const val = e.detail.value;
    // let perpes = '';
    model.map(item => {
      if (item.storeId == storeId) {
        item.remark = val;
      }
      // perpes += '"' + storeId + '"' + ':' + '"' + val + '"' + ',';
    });
    this.setState({ model: model });
  }
  // 配送最早时间
  onTimeStareChange(e) {
    this.setState({ selStartTime: e.detail.value });
  }
  // 配送最晚时间
  onTimeEndChange(e) {
    this.setState({ selEndTime: e.detail.value });
  }

  // geticon() {
  //   Taro.showToast({
  //     title: '收货地址不在配送范围内',
  //     icon: 'none'
  //   })
  // }
  // 提交订单
  dobuy() {
    Taro.showLoading()
    // this.setState({ ischeckbuy: false })
    let { n_tine, nextdate, currentDate, dateSel, advert, deliveryTime, selDate, selTime, model, address, orderToken, orderItemIds, storeCoupon, platDeliveryLowestAmount, totalPrice, freightCoupon } = this.state;
    let orderItem = "";
    orderItem = orderItemIds.replace(/_/g, ",");
    orderItem = orderItem.split(",");
    let couponIds: string | Array<string> = "";
    let stores = [];
    model.map(item => {
      let odd = {};
      if (!item.deliveryWay) {
        if (item.deliveryWays.platformsend) {
          odd.deliveryWay = item.deliveryWays.platformsend.type;
          odd.deliveryTime = item.deliveryWays.platformsend.timeQuantum;
          odd.remark = item.remark ? item.remark : "";
          odd.deliveryMobile = '';
          odd.selfTakeAddress = '';
        }

      } else {
        odd.deliveryWay = item.deliveryWay;
        odd.deliveryTime = item.deliveryTime;
        odd.remark = item.remark ? item.remark : "";
        odd.deliveryMobile = item.deliveryMobile;
        odd.selfTakeAddress = item.selfTakeAddress;
      }

      if (item.coupon) {
        couponIds += item.coupon.id + ",";
      }
      var orderItems = item.orderItems;
      orderItems.map(list => {
        odd.storeId = list.storeId;
      });
      stores.push(odd);
    })
    let guyuTime = selDate + "-" + selTime;
    guyuTime = selDate ? guyuTime : ''
    if (storeCoupon.id) {
      couponIds = couponIds + storeCoupon.id;
    } else {
      couponIds = couponIds
      couponIds = couponIds.slice(0, -1)
    }
    if (!couponIds || couponIds == 'undefined') {
      couponIds = []
    } else {
      couponIds = couponIds.split(",");
    }
    if (couponIds.length > 0) {
      couponIds = couponIds.filter(item => (item && item != '1002'))
      // couponIds.map((item, index) => {
      //   if (item == '') {
      //     couponIds.splice(index, 1)
      //   }
      //   if (item == '1002') {
      //     couponIds.splice(index, 1)
      //   }
      // })

    }
    const params = {
      orderItemIds: orderItem,
      addressId: address.id ? address.id : '',
      orderToken: orderToken,
      couponIds: couponIds,
      stores: stores,
      deliveryTime: dateSel + ' ' + advert,
      transportCouponId: freightCoupon ? freightCoupon.id : ''
    };
    if (freightCoupon && freightCoupon.id && freightCoupon.id != '1002') {
      params.transportCouponId = freightCoupon.id
    } else {
      params.transportCouponId = ''
    }
    if (!address || !address.id) {
      // Taro.showToast({
      //   title: '请选择收货地址',
      //   icon: 'none'
      // })
      // return
      let num = 0
      stores.map(item => {
        if (item.deliveryWay != 'takeout') {
          Taro.showToast({
            title: '请选择收货地址',
            icon: 'none'
          })
          return
        } else {
          num++
          if (num == stores.length) {
            this.getpayment(params)
            // Taro.navigateTo({
            //   url: "../payment/payment?params=" + JSON.stringify(params)
            // });
          } else {
            // Taro.showToast({
            //   title: '您还有配送方式没有选择',
            //   icon: 'none'
            // })
            // return
          }
        }
      })
    } else {
      let con = 0, way = 0
      stores.map(item => {
        if (item.deliveryWay) {
          con++;
        }
        if (item.deliveryWay == 'platformsend') {
          way++;
        }
      })
      let total = 0, coupon = 0, fengyingtotal = 0

      model.map(data => {
        if (!data.supplementary) {//非补单商品
          if (data.deliveryWays.platformsend) {//且选择的丰盈配送
            if (data.deliveryWay != 'distribution') {
              total += Number(data.newsubtotalAmount)
              if (data.coupon) {
                coupon += Number(data.coupon.amount)
                // 选择丰盈配送的商品金额-店铺优惠金额
                if (Number(data.newsubtotalAmount) > Number(data.coupon.amount * 100)) {
                  fengyingtotal += Number(data.newsubtotalAmount) - Number(data.coupon.amount * 100)
                }
              } else {
                fengyingtotal += Number(data.newsubtotalAmount)
              }
            }
          }
        }
      })
      if (storeCoupon.amount) {
        fengyingtotal = Number(fengyingtotal) - Number(storeCoupon.amount * 100)
      } else {
        fengyingtotal = Number(fengyingtotal)
      }
      let nowhouer = new Date().getHours()
      // console.log(Number(fengyingtotal))
      if (con == stores.length) {
        if (way > 0) {
          if (!dateSel) {
            Taro.showToast({
              title: '请选择丰盈配送时间',
              icon: 'none'
            })
            return
          }
          if (!advert) {
            Taro.showToast({
              title: '请选择丰盈配送时间',
              icon: 'none'
            })
            return
          }
          if (currentDate == dateSel) {
            if (Number(nowhouer) > Number(n_tine[0])) {
              Taro.showToast({
                title: '配送时间已过，请重新选择',
                icon: 'none'
              })
              return
            }
          }

          // 订单金额
          let orderAmount = Number(this.state.totalPrice) * 100
          if (platDeliveryLowestAmount > orderAmount) {
            console.log(platDeliveryLowestAmount, orderAmount)
            const needcart = parseFloat(Number(platDeliveryLowestAmount / 100) - Number(orderAmount / 100)).toFixed(2)
            Taro.showToast({
              title: '还需要购买' + Number(needcart) + '元的商品才可以使用丰盈配送',
              icon: 'none'
            })
            return
          } else {
            this.getpayment(params)
            // Taro.navigateTo({
            //   url: "../payment/payment?params=" + JSON.stringify(params)
            // });
          }

        } else {
          this.getpayment(params)
          // Taro.navigateTo({
          //   url: "../payment/payment?params=" + JSON.stringify(params)
          // });
        }
      } else {
        Taro.showToast({
          title: '您还有配送方式没有选择',
          icon: 'none'
        })
        return
      }
    }
  }


  // 正常提交订单支付
  getpayment = async (params) => {
    console.log('getpayyment====>', params)
    const res = await getOrderCreate(params)
    Taro.hideLoading()
    if (res.data.code == 20000) {
      Taro.navigateTo({
        url: "../payment/payment?params=" + JSON.stringify(res.data.data)
      });
    } else {
      // if (res.data.data && res.data.data.orderToken && this.state.rqerustSum < 1 ) {
      //   this.state.rqerustSum ++
      //   this.setState({ orderToken: res.data.data.orderToken, rqerustSum: this.state.rqerustSum  })
      //   params.orderToken = res.data.data.orderToken 
      //   this.getpayment(params)
      // }
      console.log(4444, res.data)
      this.setState({ orderToken: res.data.data.orderToken })
      Taro.showToast({
        title: res.data.message,
        icon: "none"
      })
      return
    }

    let { checkoutList, supplementaryCheckoutList, needPayAmount, orderToken, walletAmount } = res.data.data
    needPayAmount = parseFloat(needPayAmount / 100).toFixed(2)
    walletAmount = parseFloat(walletAmount / 100).toFixed(2)
    let totalMoney = 0
    const support = [], nonsupport = []
    checkoutList.map(item => {
      item.newmoney = parseFloat(item.needPayAmount / 100).toFixed(2)
      totalMoney += item.needPayAmount
      item.checked = false
      if (item.debtAllowed) {
        support.push(item)
      } else {
        nonsupport.push(item)
      }
    })
    supplementaryCheckoutList.map(item => {
      item.newmoney = parseFloat(item.needPayAmount / 100).toFixed(2)
      // totalMoney += item.needPayAmount
    })
    this.setState({ walletAmount, support, nonsupport, checkoutList, supplementaryCheckoutList, needPayAmount, orderToken, totalMoney, totalAmount: parseFloat(totalMoney / 100).toFixed(2) })

  }

  // 联系卖家
  getphone() {
    Taro.makePhoneCall({
      phoneNumber: "15888888888"
    });
  }

  config: Config = {
    navigationBarTitleText: "确认订单"
  };
  getNextDay() {
    var timestamp = Date.parse(new Date());
    timestamp = timestamp / 1000;
    var date = new Date(timestamp * 1000);
    //获取年份
    var Y = date.getFullYear();
    //获取月份
    var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1);
    //获取当日日期
    var D = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
    //減7天的时间戳：
    let before_timetamp = timestamp + 24 * 60 * 60 * 6;
    //減7天的时间：
    var n_to = before_timetamp * 1000;
    before_timetamp = new Date(n_to);
    var Y_before = before_timetamp.getFullYear();
    //月份
    var M_before = (before_timetamp.getMonth() + 1 < 10 ? '0' + (before_timetamp.getMonth() + 1) : before_timetamp.getMonth() + 1);
    //日期
    var D_before = before_timetamp.getDate() < 10 ? '0' + before_timetamp.getDate() : before_timetamp.getDate();
    var nextdate = ''
    nextdate = Y_before + "-" + M_before + "-" + D_before;
    return nextdate
  }
  getLocalTime(nS) {
    //将时间戳（十三位时间搓，也就是带毫秒的时间搓）转换成时间格式
    // d.cTime = 1539083829787
    let date = new Date(nS);
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    let h = date.getHours();
    if (h < 10) {
      h = "0" + h;
    }
    let m = date.getMinutes();
    if (m < 10) {
      m = "0" + m;
    }
    let day = date.getDate();
    month = month < 10 ? "0" + month : month;
    day = day < 10 ? "0" + day : day;
    // date = year + "-" + month + "-" + day + " " + h + ":" + m;
    date = year + "-" + month + "-" + day;
    return date;
  }

  cancel() {
    this.setState({ isDate: false });
  }
  confirm(e) {
    if (!e) {
      this.setState({ isDate: this.state.currentDate });
    } else {
      const selDate = this.getLocalTime(e);
      this.setState({ selDate, isDate: false });
    }
  }
  // 丰盈配送时间
  chooseby(e) {
    const value = e.detail.value
    const distTime = this.state.distTime
    const advert = distTime[value].time
    let tine = advert.split('-')
    let n_tine = tine[1].split(':')
    console.log(n_tine)
    this.setState({ advert, n_tine })
  }
  // 日期
  onDateChange(e) {
    // this.setState({ isDate: true });
    let nowhouer = new Date().getHours()
    const { deliveryTimeList, currentDate } = this.state
    const datatime = this.state.datatime
    let distTime = []
    datatime.map((item, index) => {
      if (Number(item.houer) > Number(nowhouer)) {
        distTime.push(item)
      }
    })
    if (currentDate == e.detail.value) {
      distTime = distTime
    } else {
      distTime = datatime
    }
    if (distTime.length == 0) {
      Taro.showToast({
        title: '今天已停止配送，请另选日期',
        icon: 'none'
      })
    }
    this.setState({ dateSel: e.detail.value, isShowtime: true, distTime, advert: '' })
  }
  datehide() {
    this.setState({ isDate: false });
  }
  onTimeChange(e) {
    this.setState({ selTime: e.detail.value, isTime: false, isDate: false });
  }
  render() {
    let {
      orderData,
      isDate,
      currentDate,
      address,
      model,
      wuliu,
      transportAmount,
      dankou,
      sellType,
      sellindex,
      storeCoupon,
      selDate,
      amount, platDeliveryLowestAmount,
      freightCoupon,
      yunfei,
      isplat,
      totalPrice,
      advert,
      deliveryTimeList,
      dateSel, nextdate, distTime
    } = this.state;
    // let totalPrice = 0
    // console.log('>>>>>>>>>>>>>>>>>>>>>>>>')
    // console.log('总金额 = 商品金额  + (物流费 - 运费券 - 运费补贴) - 档口优惠 - 平台优惠')
    // console.log('>>>>>>>>>>>>>>>>>>>>>>>>')
    // // 总金额 = 商品金额  + (物流费 - 运费券 - 运费补贴) - 档口优惠 - 平台优惠
    // // Number(this.state.amount) * 100  + Number(this.state.wuliu) * 100 - Number(this.state.yunfei) * 100  - Number(this.state.dankou) * 100 - Number(this.state.storeCoupon.amount) * 100
    // console.log(Number(amount) * 100, Number(wuliu) * 100, Number(yunfei) * 100, Number(dankou) * 100, storeCoupon)

    // totalPrice += Number(amount) * 100
    // totalPrice += (Number(wuliu) * 100 - Number(yunfei) * 100)
    // totalPrice -= Number(dankou) * 100
    // if (storeCoupon) {
    //   totalPrice -= Number(storeCoupon.amount) * 100
    // }
    // console.log(totalPrice)
    // this.setState({totalPrice: totalPrice  })

    return (
      <View className='product-confirm'>
        {isDate && (
          <View className='choosedate'>
            <View className='mengc' onClick={this.datehide}></View>
            <DatetimePicker
              className='pickdata'
              type='datetime'
              value={currentDate}
              cancel={this.cancel.bind(this)}
              confirm={this.confirm.bind(this)}
            ></DatetimePicker>
          </View>
        )}
        <View
          className='address-wrap'
          onClick={() => {
            Taro.navigateTo({
              url: "/pagesCommon/address/list/index?action=true"
            });
          }}
        >
          {address ? (
            <View className='address-wrap__info'>
              <View className='address-wrap__user'>
                <Text className='name'>{address.receiver}</Text>
                <Text className='phone'>{address.mobile}</Text>
              </View>
              <View className='address-wrap__add'>
                {address.province}
                {address.city}
                {address.area}
                {address.address}
              </View>
            </View>
          ) : (
              <View className='address-wrap__info'>添加收货地址</View>
            )}
          <View className='address-wrap__icon qcfont qc-icon-chevron-right'></View>
        </View>

        <View className=''>
          {model.map((item, index) => {
            return (
              <View className='content' key={String(index)}>
                <View className='store-name'>{item.storeName}
                  {item.accountPeriod > 0 && (
                    <Text className='credit'>支持账期结算({item.accountPeriod}天)</Text>
                  )}
                  {item.supplementary && (
                    <View className='tips'>
                      接单时间外，需要通过商家确认后再结算货款
                    </View>
                  )}

                </View>
                {item.orderItems.map((list, listindex) => {
                  return (
                    <View className='order-store' key={String(listindex)}>
                      <Image
                        className='order-store-img'
                        src={imageurl + list.iconUrl}
                      ></Image>
                      <View className='order-store-name'>
                        <Text className='order-store-name-t'>{list.name}</Text>
                        <Text className='order-store-name-g'>{list.specs}</Text>
                      </View>
                      <View className='order-store-price'>
                        <Text className='order-store-price-p'>
                          ￥{list.price}
                        </Text>
                        <Text className='order-store-price-n'>x{list.qty}{list.unit}</Text>
                      </View>
                    </View>
                  );
                })}

                {/* 配送方式 */}
                {!item.isdeliveryWays && (
                  <View className='dist'>
                    <View className='dist-title'>配送方式</View>
                    <RadioGroup
                      className='radio-group'
                      onChange={e => {
                        this.singlechange(e, index);
                      }}
                    >

                      {item.deliveryWays.platformsend && (
                        <Block>
                          {/* {!checkplat ? (
                            <View className="the_list_label icon_type" onClick={this.geticon}>
                              <Icon type='circle' size='17'></Icon>
                              <Text>丰盈配送</Text>
                            </View>
                          ) : ( */}

                          <Label className='radio-list__label'>
                            <View className='the_list_label'>
                              <Radio className='radio-list__radio'
                                value='platformsend'
                                checked={item.deliveryWays.platformsend.isCheck ? true : false}
                              ></Radio>
                              <Text>丰盈配送</Text>
                            </View>
                          </Label>
                          {/* )} */}
                        </Block>

                      )}

                      {item.deliveryWays.distribution && (
                        <Label className='radio-list__label'>
                          <View className='the_list_label'>
                            <Radio
                              className='radio-list__radio'
                              value='distribution'
                            ></Radio>
                            <Text>店铺配送</Text>
                          </View>
                        </Label>
                      )}

                      {item.deliveryWays.takeout && (
                        <Label className='radio-list__label'>
                          <View className='the_list_label'>
                            <Radio
                              className='radio-list__radio'
                              value='takeout'
                            ></Radio>
                            <Text>店铺自提</Text>
                          </View>
                        </Label>
                      )}
                    </RadioGroup>
                    {sellType == "takeout" && (
                      <Block>
                        {sellindex == index && (
                          <View className='delivery'>
                            <View className='delivery-a'>
                              自提地址：{item.deliveryWays.takeout.address}
                            </View>
                            <View className='delivery-a'>
                              自提时间：{item.deliveryWays.takeout.timeQuantum}
                            </View>
                            <View className='delivery-a'>
                              <View className='delivery-a-tel'>
                                联系电话：{item.deliveryWays.takeout.phoneNumber}
                              </View>
                              <Image onClick={() => { Taro.makePhoneCall({ phoneNumber: item.deliveryWays.takeout.phoneNumber }) }}
                                className='delivery-a-img'
                                src='../../images/item/phone.png'
                              ></Image>
                            </View>
                            <View className='delivery-b'>
                              如有疑问请先联系档口卖家
                            </View>
                          </View>
                        )}
                      </Block>
                    )}
                    {sellType == "distribution" && (
                      <Block>
                        {sellindex == index && (
                          <View className='delivery'>
                            <View className='delivery-a'>
                              配送时间：{item.deliveryWays.distribution.timeQuantum}
                            </View>
                            <View className='delivery-a'>
                              <View className='delivery-a-tel'>
                                联系电话：
                              {item.deliveryWays.distribution.phoneNumber}
                              </View>
                              <Image onClick={() => { Taro.makePhoneCall({ phoneNumber: item.deliveryWays.distribution.phoneNumber }) }}
                                className='delivery-a-img' src={Taro.getStorageSync('imgHostItem') + 'phone.png'}
                              ></Image>
                            </View>
                            <View className='delivery-b'>
                              如有疑问请先联系档口卖家
                          </View>
                          </View>
                        )}
                      </Block>
                    )}
                  </View>
                )}


                {/* 档口优惠 */}
                {item.coupon ? (
                  <View
                    className='stall'
                    onClick={() => {
                      this.stallCoupon(index, item.storeId, item.coupon.id);
                    }}
                  >
                    <Text className='stall-title'>档口优惠</Text>
                    <Text className='stall-name'>{item.coupon.title}</Text>
                    <View className=' stall-img qcfont qc-icon-chevron-right'></View>
                  </View>
                ) : (
                    <View
                      className='stall'
                      onClick={() => {
                        this.stallCoupon(index, item.storeId, '');
                      }}
                    >
                      <Text className='stall-title'>档口优惠</Text>
                      <Text className='stall-name'>{item.coupon.title}</Text>
                      <View className=' stall-img qcfont qc-icon-chevron-right'></View>
                    </View>
                  )}

                {/* <View className='stall' onClick={() => { this.stallCoupon(item.storeId) }}>
                  <Text className='stall-title'>档口优惠</Text>
                  <Text className='stall-name'>{couponInfo.couponTitle}</Text>
                  <View className=" stall-img qcfont qc-icon-chevron-right"></View>
                </View> */}
                {/* 订单备注 */}
                <View className='stall'>
                  <Text className='stall-title'>订单备注</Text>
                  <Input
                    className='stall-input'
                    placeholder='选填，请先和卖家协商一致'
                    onInput={e => {
                      this.getmark(e, item.storeId);
                    }}
                  ></Input>
                </View>
                {/* 小计 */}
                <View className='total'>
                  <View>物流服务费：+￥{item.transportAmount}</View>
                  {item.coupon.amount ? (
                    <Blcok>
                      <View>档口优惠：-￥{item.coupon.amount}</View>
                    </Blcok>
                  ) : (
                      <Block>
                        <View>档口优惠：-￥0.00</View>
                      </Block>
                    )}
                  <View>
                    小计：
                    <Text style='color:#FF840B'>￥{item.subtotalAmount}</Text>
                  </View>
                </View>
              </View>
            );
          })}
          {/* 配送时间 */}
          {isplat && (
            <View className='del-time'>
              <View className='stall-title'>丰盈配送时间</View>
              <View style='display:flex;width:400rpx'>
                {/* <View className="picker">{selDate ? selDate : deliveryTime}</View> */}
                <Picker mode='date' start={currentDate} end={nextdate} onChange={this.onDateChange}>
                  <View className='picker' style='width:85px;'>
                    {dateSel ? dateSel : '请选择日期'}
                  </View>
                </Picker>
                {dateSel && (
                  <Picker style='width:100%' mode='selector' range={distTime} rangeKey='time' onChange={this.chooseby}>
                    <View className='picker'>{advert ? advert : '请选择时间'}</View>
                  </Picker>
                )}

              </View>
              <View className='stall-img qcfont '></View>
            </View>
          )}

          <View className='del-time plat'
            onClick={() => {
              this.platCoupon(storeCoupon.id);
            }}
          >
            <View className='stall-title'>平台优惠</View>
            {storeCoupon && <View className='picker' style='width:335rpx'>{storeCoupon.title}</View>}
            <View className='stall-img qcfont qc-icon-chevron-right'></View>
          </View>

          {Number(wuliu) &&
            <View className='del-time plat'
              onClick={() => {
                this.toFreightCoupon(freightCoupon.id);
              }}
            >
              <View className='stall-title'>运费券</View>
              {freightCoupon && <View className='picker' style='width:335rpx'>{freightCoupon.title}</View>}
              <View className='stall-img qcfont qc-icon-chevron-right'></View>
            </View>
          }

          {/* 合计 */}
          <View className='totalprice'>
            <View className='total-row'>
              <Text>商品金额</Text>
              <Text>￥{amount}</Text>
            </View>
            <View className='total-row'>
              <Text>总物流服务费</Text>
              <Text>+￥{wuliu}</Text>
            </View>
            {orderData.transportDiscountAmount &&
              <View className='total-row'>
                <Text>运费补贴</Text>
                <Text>-￥{toPriceYuan(orderData.transportDiscountAmount)}</Text>
              </View>
            }
            {(Number(wuliu) && Number(yunfei)) &&
              <View className='total-row'>
                <Text>运费券</Text>
                <Text>-￥{yunfei}</Text>
              </View>
            }
            <View className='total-row'>
              <Text>档口优惠</Text>
              <Text>-￥{dankou}</Text>
            </View>
            <View className='total-row'>
              <Text>平台优惠</Text>
              {storeCoupon ? (
                <Text>-￥{storeCoupon.amount}</Text>
              ) : (
                  <Text>-￥0.00</Text>
                )}
            </View>
            <View className='totals'>
              <Text>合计</Text>
              <Block>
                {
                  totalPrice > 0
                    ? (<Text>￥{totalPrice}</Text>)
                    : <Text>￥0.00</Text>}

              </Block>
              {/* )} */}
            </View>
          </View>
        </View>

        <View className='confirm-order'>
          {/* <View className='confirm-content'> */}
          <View className='payment'>
            应付金额
            <Block>
              {totalPrice > 0 ? (
                <Text style='color:#FF840B;margin-left:10px;'>￥{totalPrice}</Text>
              ) : (
                  <Text style='color:#FF840B;margin-left:10px;'>￥0.00</Text>
                )}

            </Block>
            {/* )} */}
          </View>
          {ischeckbuy ? (
            <View className='btn' onClick={this.dobuy}>
              提交订单
            </View>
          ) : (
              <View className='btn'>
                提交订单
              </View>
            )}

          {/* </View> */}
        </View>
      </View>
    );
  }
}