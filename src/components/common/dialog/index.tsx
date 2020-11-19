import Taro, { useState, useEffect } from '@tarojs/taro'
import { View } from '@tarojs/components';


import './index.scss';

function Dialog(props: any): JSX.Element {

  const { visible, zIndex, position, mask, isMaskClick, onClose, styles } = props


  const [ show, setShow ] = useState(false)
  const [ animShow, setSnimShow ] = useState(false)

  useEffect(() => {
    visible ? showAnim() : animHide()
  }, [visible])

  // 组件显示动画
  function showAnim(): void {
    setShow(true)
    setTimeout(() => {
      setSnimShow(true)
    }, 250);
  }

  // 组件关闭动画
  function animHide(): void {
    setSnimShow(false)
    setTimeout(() => {
      onHide()
    }, 250);
  }

  // 整个组件关闭
  function onHide(): void {
    setShow(false)
    onClose && onClose()
  }

  // 点击遮罩层
  function onMaskClick(): void {
    isMaskClick && animHide();
  }

  const customStyle = {
    zIndex: zIndex,
  };

  const preventTouchMove = (e) => {
    e.stopPropagation()
  }

  return (
    <View>
      {show && (
        <View className={`dialog ${animShow ? 'visible' : ''}`} style={customStyle}>
          {mask && <View className="dialog__mask" onClick={onMaskClick} onTouchMove={preventTouchMove} />}
          <View className={`dialog__container ${position}`} style={styles} onTouchMove={preventTouchMove}>{props.children}</View>
        </View>
      )}
    </View>
  )
}

Dialog.defaultProps = {
  visible: false,
  zIndex: 999,
  position: 'center',
  mask: true,
  isMaskClick: true,
  onClose: () => {},
}

export default Dialog