import Taro from "@tarojs/taro";
import { View } from "@tarojs/components";

type Props = {
  options: {
    backgroundColor: string;
    color: string;
    fontSize: string;
    lineHeight: string;
    textAlign: "left" | "right" | "center";
    fontWeight: number;
    value: string;
  };
};

export default function QcText(props: Props) {
  let { options } = props;
  const style = {
    padding: "5px",
    backgroundColor: options.backgroundColor,
    color: options.color,
    fontSize: options.fontSize + "px",
    lineHeight: options.lineHeight + "px",
    textAlign: options.textAlign,
    fontWeight: options.fontWeight
  };
  return <View style={style}>{options.value}</View>;
}

QcText.defaultProps = {
  options: {}
};
