import Taro from "@tarojs/taro";
import { View } from "@tarojs/components";

interface Options {
  height: string,
  backgroundColor: string
}
type Props = {
  options: Options
}
export default function QcSplit(props: Props) {
  const { options } = props;
  let style = {
    height: options.height + "px",
    backgroundColor: options.backgroundColor
  };
  return (
    <View style={style} />
  )
}

QcSplit.defaultProps = {
  options: {}
}
