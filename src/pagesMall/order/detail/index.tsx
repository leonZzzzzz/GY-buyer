import Taro, { useEffect, useState, useRouter } from "@tarojs/taro";
import { View, Image, Text } from "@tarojs/components";
import {
  getOrder,
  cancelOrder,
  postResOrder,
  finishOrder,
  shopOrderCancelTime,
  wechatPay
} from "@/api/order";
import QcProductItem from "@/components/common/product-item";
import { toPriceYuan } from "@/utils/format";
import { IMG_HOST } from "@/config";
import "./index.scss";
import s_1 from "./img/s-1.png";
import s0 from "./img/s0.png";
import s1 from "./img/s1.png";
import s3 from "./img/s3.png";
import { QcFixedWrap } from "@/components/common";

const iconImg = {
  "-2": s_1,
  "-1": s_1,
  0: s0,
  1: s1,
  2: s1,
  3: s3,
  4: s_1,
  5: s1,
  6: s_1,
  7: s1,
  10: s3
};

interface IOrderDetail extends IOrder {
  receiver: string;
  mobile: string;
  address: string;
  logisticsNo: string;
  logisticsCompany: string;
  deliverTime: string;
  orderToken: string;
}

function OrderDetail() {
  let timer: any;
  const { id } = useRouter().params;
  const [model, setModel] = useState<IOrderDetail>({
    orderItems: [] as IProduct[]
  } as IOrderDetail);
  const [timeOut, setTimeOut] = useState<string>("");

  useEffect(() => {
    apiShopOrderCancelTime();
  }, []);

  async function apiGetOrder(timeOut?: number) {
    const res = await getOrder({ id });
    if (res.data.data.status == 0) {
      let newStr = res.data.data.createTime.replace(/\-/g, "/");
      countDown(new Date(newStr).valueOf() + (timeOut as number));
    }
    setModel(res.data.data);
  }
  async function apiShopOrderCancelTime() {
    const res = await shopOrderCancelTime();
    apiGetOrder(res.data.data.value * 60000);
  }
  async function apiCancelOrder() {
    const res = await Taro.showModal({
      title: "提示",
      content: "是否取消该订单？"
    });
    if (res.confirm) {
      Taro.showLoading();
      await cancelOrder({ id });
      Taro.hideLoading();
      await apiGetOrder();
    }
  }

  async function apiPostResOrder() {
    try {
      const res = await postResOrder({ id, orderToken: model.orderToken });
      model.orderToken = res.data.data.orderToken;
      if (res.data.data.needPay) {
        const payRes = await wechatPay({ token: res.data.data.payId });
        const {
          timeStamp,
          nonceString,
          pack,
          signType,
          paySign
        } = payRes.data.data;
        await Taro.requestPayment({
          timeStamp: timeStamp,
          nonceStr: nonceString,
          package: pack,
          signType: signType,
          paySign: paySign
        })
          .then(() => {
            apiGetOrder();
          })
          .catch(() => {
            Taro.showToast({
              title: "支付取消",
              icon: "none"
            });
          });
      }
    } catch (error) {
      console.log(error);
      model.orderToken = error.data.data.orderToken;
    }
  }

  // async function apiFinishOrder() {
  //   await finishOrder({ id });
  // }

  function countDown(TimeOut: number) {
    let now = new Date().valueOf();
    //时间差
    let lastTime = TimeOut - now;
    if (lastTime < 0) {
      clearTimeout(timer);
      cancelOrder({ id }).then(() => {
        apiGetOrder();
      });
      return;
    }
    let [m, s] = [
      // Math.floor(lastTime / 1000 / 60 / 60 / 24),
      // Math.floor((lastTime / 1000 / 60 / 60) % 24),
      Math.floor((lastTime / 1000 / 60) % 60),
      Math.floor((lastTime / 1000) % 60)
    ];
    timer = setTimeout(() => {
      countDown(TimeOut);
    }, 1000);
    setTimeOut(`${m}分${s}秒`);
  }

  return (
    <View className="order-detail">
      <View className="status-wrap">
        <View>
          <View className="tip">订单{model.statusName}</View>
          {model.status == 0 && (
            <View className="time">订单{timeOut}后自动关闭</View>
          )}
        </View>
        <Image className="img" mode="widthFix" src={iconImg[model.status]} />
      </View>

      <View className="address-wrap">
        <View className="qcfont qc-icon-dizhi" />
        <View>
          <View className="user">
            收货人：{model.receiver} {model.mobile}
          </View>
          <View>收货地址：{model.address}</View>
        </View>
      </View>

      <View className="order-wrap">
        <View className="order-wrap__header">商品信息</View>
        <View>
          {model.orderItems.map(product => {
            return (
              <View className="order-wrap__body" key={product.id}>
                <QcProductItem
                  iconUrl={IMG_HOST + product.iconUrl}
                  name={product.name}
                  specs={product.specs}
                  price={`￥${toPriceYuan(product.price)}`}
                >
                  <Text>x{product.qty}</Text>
                </QcProductItem>
              </View>
            );
          })}
        </View>
        <View className="order-wrap__total">
          共<Text className="qty">{model.qty}</Text>件商品
          <Text className="amount">
            订单金额￥{toPriceYuan(model.totalAmount)}
          </Text>
        </View>
      </View>

      <View className="info-wrap">
        <View className="title">订单信息</View>
        <View className="list">订单编号：{model.orderNo}</View>
        <View className="list">创建时间：{model.createTime}</View>
      </View>

      {model.logisticsNo && (
        <View className="info-wrap">
          <View className="title">物流信息</View>
          <View className="list">物流公司：{model.logisticsCompany}</View>
          <View className="list">物流单号：{model.logisticsNo}</View>
          <View className="list">发货时间：{model.deliverTime}</View>
        </View>
      )}

      {model.status == 2 || model.status == 0 ? (
        <QcFixedWrap>
          <View className="fixed-wrap">
            {model.status == 0 && (
              <View>
                <View
                  className="status-button"
                  onClick={() => {
                    apiCancelOrder();
                  }}
                >
                  取消订单
                </View>
                <View
                  className="status-button status-button--pay"
                  onClick={() => {
                    apiPostResOrder();
                  }}
                >
                  支付
                </View>
              </View>
            )}
            {model.status == 2 && (
              <View
                className="status-button"
                onClick={() => {
                  // apiFinishOrder();
                }}
              >
                确认收货
              </View>
            )}
          </View>
        </QcFixedWrap>
      ) : (
        ""
      )}
    </View>
  );
}
OrderDetail.config = {
  navigationBarTitleText: "订单详情"
};
export default OrderDetail;
