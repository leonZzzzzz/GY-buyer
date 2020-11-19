import Taro, { Component, Config } from "@tarojs/taro";
import {
  Block,
  View,
  Text,
  Image,
  Input,
  Swiper,
  SwiperItem,
  Navigator
} from "@tarojs/components";
import { IMG_HOST } from "@/config";
import "./grade.scss";
import { orderGrade } from '@/api/order'
let app = Taro.getApp()

export default class Index extends Component {

  state = {
    stars: [0, 1, 2, 3, 4],
    normalSrc: '../../images/item/xingxing1.png',
    selectedSrc: '../../images/item/xingxing.png',
    key: 0,
    eva: '',
    orderItems: [],
    storeId: ''
  };
  componentWillUnmount() {
    Taro.navigateTo({ url: '../order/list/index?type=10' })
  }
  componentDidMount() {
    let { orderItems, storeId } = this.$router.params
    orderItems = JSON.parse(orderItems)
    orderItems.map(item => {
      item.stars = this.state.stars
    })
    this.setState({ orderItems, storeId })
  }
  selectRight(e) {
    console.log(e)
    let { orderItems } = this.state
    var key = e.currentTarget.dataset.key;  //评分
    var index = e.currentTarget.dataset.index;  //评分
    // if (this.state.key == 1 && e.currentTarget.dataset.key == 1) {
    //只有一颗星的时候,再次点击,变为0颗
    // key = 0;
    // }

    var eva = this.state.eva
    if (key == 1) {
      eva = '非常差'
    } else if (key == 2) {
      eva = '差'
    } else if (key == 3) {
      eva = '一般'
    } else if (key == 4) {
      eva = '好'
    } else if (key == 5) {
      eva = '非常好'
    }
    orderItems[index].key = key
    orderItems[index].eva = eva
    this.setState({ orderItems })
    console.log(orderItems)
    // this.setState({
    //   key: key, eva: eva
    // })
  }
  // 提交
  async save() {
    let { orderItems, storeId } = this.state
    let orderItemList = []
    orderItems.map(item => {
      let array = {}
      array.orderItemId = item.id
      array.score = item.key
      orderItemList.push(array)
    })
    const params = { orderId: storeId, orderItemList }
    const res = await orderGrade(params)
    if (res.data.code == 20000) {
      Taro.showToast({ title: '评价成功', icon: 'none' })
      setTimeout(() => {
        app.globalData.type = 10
        Taro.navigateBack({ delta: 1 })
      }, 1000);
    }
  }
  config: Config = {
    navigationBarTitleText: "评分"
  };
  render() {
    return (
      <Block>
        <View className='grade'>
          <View className='grade-name'>请对这次服务进行评分</View>
          {orderItems.map((list, index) => {
            return (
              <View className='content'>
                <View className='form'>
                  <Image className='grade-img' src={IMG_HOST + list.iconUrl}></Image>
                  <View className='stars'>
                    <View className='star_list'>
                      {list.stars.map(item => {
                        return (
                          <Image className="star-image" name="defen" value={list.key} style="left: {{item*30}}rpx" src={list.key > item ? (list.key - item == 0 ? normalSrc : selectedSrc) : normalSrc}>
                            <View className="item" style="left:0rpx" data-key={item + 1} data-index={index} onClick={this.selectRight}></View>
                          </Image>
                        )
                      })}
                    </View>
                  </View>
                  <View className='textarea'>
                    <View className='fontNum'>{list.eva}</View>
                  </View>
                </View>
              </View>
            )
          })}
        </View >
        <View className='btn' onClick={this.save}>提交</View>
      </Block>

    );
  }
}
