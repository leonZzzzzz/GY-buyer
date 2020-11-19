
import Taro, { useEffect, useState } from "@tarojs/taro";
import { View } from "@tarojs/components";
import classnames from "classnames";
import './index.scss'

interface IQcFixedWrap {
  type: 'top' | 'bottom';
  children: JSX.Element
}
function QcFixedWrap(props: IQcFixedWrap) {
  const [height, setHeight] = useState(0)
  useEffect(() => {
    const query = Taro.createSelectorQuery().in(this.$scope)
    query.select('.qc-fixed-wrap').boundingClientRect(res => {
      setHeight(res.height + 10)
    }).exec()
  }, [])
  return <View>
    <View className="qc-fixed-height" style={{ 'height': height + 'px' }}></View>
    <View className={classnames('qc-fixed-wrap', `qc-fixed-wrap--${props.type}`)}>{props.children}</View>
  </View>
}
QcFixedWrap.defaultProps = {
  type: 'bottom',
}
export default QcFixedWrap;
