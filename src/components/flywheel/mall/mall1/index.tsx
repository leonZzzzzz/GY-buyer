import Taro, { useState } from "@tarojs/taro";
import { View, Image, Text } from "@tarojs/components";
import "./index.scss";

function QcMall1(props) {
  const [list] = useState([{}, {}]);
  const { options } = props;
  return (
    <View className="mall1">
      <View className="mall1__banner">
        <Image
          className="cover"
          src="http://athena-1255600302.cosgz.myqcloud.com//attachments/null/99ebda1e0a9f4b97bfa90dd6eca44099.png"
        />
      </View>
      <View className="mall1__products">
        {list.map((item, index) => {
          return (
            <View className="mall1__product" key={index}>
              <Image
                className="cover"
                mode="aspectFill"
                src="http://athena-1255600302.cosgz.myqcloud.com//attachments/null/99ebda1e0a9f4b97bfa90dd6eca44099.png"
              />
              <View className="mall1__product-title">
                我最哎的商品名称，尼克快来买把
              </View>
              <View className="mall1__product-info">
                <View className="money">
                  <Text className="price">
                    ￥<Text className="count">299</Text>
                  </Text>
                </View>
                <View className="orgin-price">￥199</View>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

export default QcMall1;
