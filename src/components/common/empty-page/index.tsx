import Taro, { useEffect, useState } from '@tarojs/taro'
import { View, Image } from '@tarojs/components'
import cart from './img/cart.png'
import order from './img/order.png'
import favorite from './img/favorite.png'
import search from './img/search.png'
import './index.scss'

interface IQcEmptyPage {
  icon: 'cart' | 'order' | 'favorite' | 'search';
  text: string;
}
function QcEmptyPage(props: IQcEmptyPage) {
  const [imgUrl, setImgUrl] = useState<string>('')
  useEffect(() => {
    const imgUrl = { 'cart': cart, 'order': order, 'favorite': favorite, 'search': search }[props.icon]
    setImgUrl(imgUrl)
  })
  function onJumpPage() {
    Taro.switchTab({ url: '/pages/home/home' })
  }
  return (
    <View className='qc-empty-page'>
      <Image className='err-img' src={imgUrl} mode='widthFix' />
      <View className='err-text'>{props.text}</View>
      {/* <View className='err-button' onClick={() => onJumpPage()}>
        去首页购买
        </View> */}
    </View>
  )
}

QcEmptyPage.defaultProps = {
  icon: 'order',
  text: '此分类没有订单'
}
export default QcEmptyPage
