import Taro, { useState, useEffect, useReachBottom } from "@tarojs/taro";
import { View, Text, Image, Block } from "@tarojs/components";
import { QcEmptyPage } from "@/components/common";
import { toPriceYuan } from "@/utils/format";
import { IMG_HOST } from "@/config";
import "./after-sale.scss";
import { pageAfterSale } from "@/api/after-order";


function AfterOrderList() {
  const [lock, setLock] = useState<boolean>(false);
  const [search, setSearch] = useState<any>({
    status: "",
    pageSize: 15,
    pageNum: 1
  });
  const [orderList, setOrderList] = useState<any[]>([]);

  useEffect(() => {
    search.status = this.$router.params.type || "";
    if (search.status !== "") {
      search.status = Number(search.status);
    }
    setSearch(search);
  }, []);

  useEffect(() => {
    Taro.showLoading()
    setLock(false);
    apiPageAfterSale();
  }, [search.status]);

  useReachBottom(() => {
    if (!lock) {
      search.pageNum += 1;
      Taro.showLoading()
      apiPageAfterSale();
    }
  });


  async function apiPageAfterSale() {
    const res = await pageAfterSale(search);
    Taro.hideLoading()
    const { list } = res.data.data;
    if (list.length > 0) {
      setOrderList([...orderList, ...list]);
    } else {
      setLock(true);
    }
  }
  function gotodetail(id, orderId, orderItemId) {
    Taro.navigateTo({
      url: `../purchase-detail/purchase-detail?id=${id}&orderId=${orderId}&orderItemId=${orderItemId}`
    });
  }

  return (
    <View style="margin-top:10px">
      {orderList.length > 0 ? (
        <Block>
          {orderList.map(item => {
            return (
              <View className="aftre-sale-item" key={item.id}>
                <View className="content">
                  <View className="store-name">{item.storeName}</View>
                  {item.afterSalesItemList.map(product => {
                    return (
                      <View className="order-store" key={product.id}>
                        <Image
                          className="order-store-img"
                          src={IMG_HOST + product.icon}
                        ></Image>
                        <View className="order-store-name">
                          <View className="order-content">
                            <Text className="order-store-name-t">
                              {product.name}
                            </Text>
                            <View className="order-store-price">
                              <Text className="order-store-price-p">
                                ￥{toPriceYuan(product.price)}
                              </Text>
                              <Text className="order-store-price-n">
                                x{product.qty}{product.unit}
                              </Text>
                            </View>
                          </View>
                          <View className="apply">
                            <Text className="order-store-name-g">
                              {product.spec}
                            </Text>
                          </View>
                        </View>
                      </View>
                    );
                  })}
                </View>
                <View className="apply-sale">
                  {/* <Image src="../../images/item/clock.png"></Image> */}
                  {(item.status == 1 || item.status == 2) && (
                    <Image src="../../images/item/clock.png"></Image>
                  )}
                  {item.status == 0 && (
                    <Image src="../../images/item/success.png"></Image>
                  )}

                  {item.status == -1 && (
                    <Image src="../../images/item/refuse.png"></Image>
                  )}
                  <Text>{item.statusName}</Text>
                </View>
                <View className="checkdetail">
                  <Text
                    onClick={() => { gotodetail(item.id, item.orderId, item.afterSalesItemList[0].orderItemId) }}
                  >
                    查看详情
                  </Text>
                </View>
              </View>
            );
          })}
        </Block>
      ) : (
          <QcEmptyPage icon="order"></QcEmptyPage>
        )}
    </View>
  );
}
AfterOrderList.config = {
  navigationBarTitleText: "订单售后"
};
export default AfterOrderList;
