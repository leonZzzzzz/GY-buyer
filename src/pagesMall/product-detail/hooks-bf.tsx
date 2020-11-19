import Taro, { useRouter, useDidShow, useState } from '@tarojs/taro'
import { View, Swiper, SwiperItem, Image, Text, RichText } from '@tarojs/components'
import { getProduct } from '@/api/product'
import { IMG_HOST } from '@/config'
import WxParse from '@/components/wxParse/wxParse';
import { toPriceYuan } from '@/utils/format'
import './index.scss'

function ProductDetail() {
  const { id } = useRouter().params
  // 商品基本信息
  const [product, setProduct] = useState()
  // 轮播图
  const [imgUrls, setImgUrls] = useState<string[]>([])
  // 是否关注
  const [collected, setCollected] = useState<boolean>(false)

  useDidShow(() => {
    apiGetProduct()
  })
  async function apiGetProduct() {
    const res = await getProduct({ id, storeId: '' })
    const { product } = res.data.data
    WxParse.wxParse('article', 'html', product.content, this.$scope, 5);
    setProduct(product)
    console.log(product)
    setImgUrls(product.rollingImgUrl.split('_'))
  }
  return <View className='product-detail'>
    <Swiper
      className='swiper'
      indicator-dots='true'
      indicatorColor='#b3b3b3'
      indicatorActiveColor='#eee'
      autoplay={true}
      interval={5000}
      duration={300}
    >
      {imgUrls.map((item, index) => {
        return (
          <SwiperItem key={index}>
            <Image mode='aspectFill' src={IMG_HOST + item} className='slide-image'></Image>
          </SwiperItem>
        )
      })}
    </Swiper>

    <View className="title-wrap">
      <View className="top">
        <View className="left">
          <View className="title">{product.name}</View>
          <View className="price-wrap">
            <Text className="price">{toPriceYuan(product.price)}</Text>
            <Text className="origin-price">￥{toPriceYuan(product.origPrice)}</Text>
          </View>
        </View>
        <View className="right" >
          <Text className={`qcfont ${collected ? 'qc-icon-like' : 'qc-icon-like-o'}`}></Text>
          <Text>喜欢</Text>
        </View>
      </View>
      <View className="bottom">
        <View className="kuai">快递：包邮</View>
        <View className="gou">已售{product.salesQuantity || 0}件</View>
      </View>
    </View>
    <View className="content">
      <import src='../../components/wxParse/wxParse.wxml' />
      <template is='wxParse' data='{{wxParseData:article.nodes}}' />
    </View>
  </View>
}

export default ProductDetail
