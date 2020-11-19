import Taro, { Component, Config } from "@tarojs/taro";
import {
  Block,
  View,
  Text,
  Image
} from "@tarojs/components";
import "./lesdetail.scss";
import { storeInfo } from "@/api/product"

export default class Index extends Component {

  state = {
    imageurl: "https://guyu-1300342109.cos.ap-guangzhou.myqcloud.com",
    datalist: ''
  };
  componentDidMount() {
    const storeId = this.$router.params.storeId
    this.getdetail(storeId)
  }
  getdetail = async (storeId) => {
    const res = await storeInfo(storeId)
    this.setState({ datalist: res.data.data })
  }
  config: Config = {
    navigationBarTitleText: "供应商详情"
  };
  render() {
    const { datalist, imageurl } = this.state
    return (
      <Block>
        <View className='detail-one'>
          <View className='details'>
            <Text>店铺名称</Text>
            <Text>{datalist.storeName}</Text>
          </View>
          <View className='details'>
            <Text>经营种类</Text>
            <Text>{datalist.categoryName}</Text>
          </View>
          <View className='details'>
            <Text>接单时间</Text>
            <Text>{datalist.businessTime}</Text>
          </View>
          <View className='details'>
            <Text>店铺地址</Text>
            <Text>{datalist.address}</Text>
          </View>
          <View className='details'>
            <Text>联系人</Text>
            <Text>{datalist.personInCharge}</Text>
          </View>
          <View className='details'>
            <Text>联系电话</Text>
            <Text>{datalist.customerServiceNumbers}</Text>
          </View>
        </View>
        <View className='detail-one'>
          <View className='details'>
            <Text>门店正面照</Text>
            <Image src={imageurl + datalist.businessLicenseUrl}></Image>
          </View>
        </View>
        <View className='detail-one'>
          <View className='letter'>
            <Text>店铺介绍</Text>
            <Text style='margin-top:20rpx;'>{datalist.storeInfo}</Text>
          </View>
        </View>
      </Block>
    );
  }
}
