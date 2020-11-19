import { View } from '@tarojs/components'

import './index.scss';

function LoadingBox(props: any) {

  const { visible, text } = props
  console.log('ppppp' + visible, text)
  return (
    visible && (
      <View className="loading-wrapper">
        <View className="loading-box absolute">
          <View className="loading-border" />
          <View className="loading-text">{text}</View>
        </View>
      </View>
    )
  )
}

LoadingBox.defaultProps = {
  visible: false,
  text: '加载中',
}

export default LoadingBox
