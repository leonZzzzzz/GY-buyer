import Taro, { useState } from "@tarojs/taro";
import { View, Image, Text } from "@tarojs/components";
import "./index.scss";

function QcMall2(props) {
  const [list] = useState([{}, {}, {}]);
  const { options } = props;
  return (
    <View className="mall2">
      <View className="mall2__banner">
        <Image
          className="cover"
          src="http://athena-1255600302.cosgz.myqcloud.com//attachments/null/99ebda1e0a9f4b97bfa90dd6eca44099.png"
        />
      </View>
      <View className="mall2__products">
        {list.map((item, index) => {
          return (
            <View className="mall2__product" key={index}>
              <Image
                className="cover"
                mode="aspectFill"
                src="http://athena-1255600302.cosgz.myqcloud.com//attachments/null/99ebda1e0a9f4b97bfa90dd6eca44099.png"
              />
              <View className="mall2__product-title">
                我最哎的商品名称，尼克快来买把
              </View>
              <View className="mall2__product-info">
                <View className="money">
                  <Text className="price">
                    ￥<Text className="count">299</Text>
                  </Text>
                </View>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

export default QcMall2;
