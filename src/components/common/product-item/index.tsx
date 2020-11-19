import Taro from '@tarojs/taro'
import { View, Text, Image } from '@tarojs/components';
import './index.scss'

interface IProductItem {
  iconUrl: string;
  name: string;
  specs: string;
  price?: string;
  origPrice?: string;
  children?: JSX.Element
}

function QcProductItem(props: IProductItem) {
  return <View className="qc-product-item">
    <Image
      className="qc-product-item__cover"
      src={props.iconUrl}
      mode="aspectFill"
    ></Image>
    <View className="qc-product-item__content">
      <View className="qc-product-item__info">
        <View className="qc-product-item__name">{props.name}</View>
        <View className="qc-product-item__specs">{props.specs}</View>
      </View>
      <View className="qc-product-item__other">
        <View>
          <Text className="qc-product-item__price">
            {props.price}
          </Text>
          <Text className="qc-product-item__origPrice">
            {props.origPrice}
          </Text>
        </View>
        <View>{props.children}</View>
      </View>
    </View>
  </View>
}

QcProductItem.options = {
  addGlobalClass: true
}
export default QcProductItem
