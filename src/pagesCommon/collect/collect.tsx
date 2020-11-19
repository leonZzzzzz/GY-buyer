import Taro, { Component, Config } from "@tarojs/taro";
import {
  Block,
  View,
  Text,
  Image
} from "@tarojs/components";
import { toPriceYuan } from "@/utils/format";
import "./collect.scss";
import { mycollect, deleteCollect } from "@/api/userInfo"

export default class Index extends Component {

  state = {
    imageurl: 'https://guyu-1300342109.cos.ap-guangzhou.myqcloud.com',
    collectList: [],
    loading: false
  };
  config: Config = {
    navigationBarTitleText: "我的收藏"
  };
  componentDidMount() {
    this.getcollect()
  }
  getcollect = async () => {
    const params = { pageNum: 1, pageSize: 20 }
    const res = await mycollect(params)
    this.setState({ collectList: res.data.data.list, loading: true })
  }

  // 删除
  cancelCel(id) {
    Taro.showModal({
      content: '确定要删除收藏吗？',
      success: (res => {
        if (res.confirm) {
          this.detele(id)
        }
      })
    })
  }
  detele = async (id) => {
    const res = await deleteCollect(id)
    if (res.data.code == 20000) {
      this.getcollect()
    }
  }
  render() {
    const { collectList, imageurl, loading } = this.state
    return (
      <Block>
        {loading && (
          <Block>
            {collectList.length > 0 ? (
              <Block>
                {collectList.map(item => {
                  return (
                    <View className="list-one">
                      {!item.isSell && (
                        <Image className='sell' src='../../images/item/pic1.png'></Image>
                      )}
                      {item.isDeleted && (
                        <Image className='sell' src='../../images/item/pic2.png'></Image>
                      )}
                      <Image src={imageurl + item.productIconUrl} onClick={() => { Taro.navigateTo({ url: '../goods/goods-detail?id=' + item.productId + '&storeId=' + item.storeId }) }}></Image>
                      <View className="list-two">
                        <View style="justify-content:space-between;display:flex">
                          <Text className="list-name">{item.productName}</Text>
                          <Text className="cancel" onClick={() => { this.cancelCel(item.id) }}>删除</Text>
                        </View>
                        <View className="list-head">{item.productIntroduce}</View>
                        <View className="list-price">
                          <Text>￥</Text>
                          <Text>{toPriceYuan(item.price)}</Text>
                        </View>
                        <View className="stand">
                          {item.spec ? (
                            <View>{item.spec}</View>
                          ) : (
                              <View></View>
                            )}
                          {item.salesQty && (
                            <Text>销量<Text style='color:#FF840B'>{item.salesQty}</Text>件</Text>
                          )}
                          <Image className="isadd" src={require('../../images/item/gy-icon_06.png')}></Image>
                        </View>
                      </View>
                    </View>
                  )
                })}
              </Block>
            ) : (
                <View className="detail-list">
                  <View className="no-data-view">
                    <Image src={require('../../images/item/qt_107.png')}></Image>
                    <Text className="no-data-text">您还没有收藏过商品喔</Text>
                  </View>
                </View>
              )
            }
          </Block>
        )}
      </Block>

    );
  }
}
