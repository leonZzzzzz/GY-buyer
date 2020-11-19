import { View, Button } from '@tarojs/components'
import Taro, { useState, useEffect } from '@tarojs/taro'

import './index.scss'

import { Dialog } from '@/components/common'
// import Dialog from '../dialog'

function ShareWrap(props: any) {

  const { visible, onClose, onPoster, onShare } = props

  const [ shareVisible, setShareVisible ] = useState(false)


  useEffect(() => {
    visible ? setShareVisible(true) : ''
    console.log('visible', visible)
  }, [visible])
  
  const handleClose = () => {
    console.log('share-wrap handleClose')
    setShareVisible(false)
    onClose && onClose()
  }

  const onSendFriend = (e) => {
    onShare && onShare(e)
    handleClose()
  }

  const generatePoster = () => {
    onPoster && onPoster()
    handleClose()
  }

  return (
    <View>
      <Dialog
        visible={shareVisible}
        onClose={handleClose}
        position="bottom"
      >
        <View className="share-btn-dialog">
          <Button className="item" plain hoverClass="hover-item" openType="share" onClick={onSendFriend}>
            <View className="iconfont icon-weixin" />
            <View>发送给朋友</View>
          </Button>
          <Button className="item" plain hoverClass="hover-item" onClick={generatePoster}>
            <View className="iconfont icon-haibao1" />
            <View>生成海报</View>
          </Button>
        </View>
      </Dialog>
    </View>
  )
}

ShareWrap.options = {
  addGlobalClass: true
}

export default ShareWrap