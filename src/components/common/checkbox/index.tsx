import Taro from "@tarojs/taro";
import { View, Text } from "@tarojs/components";
import "./index.scss";

const QcCheckbox = (props: any) => {
  function onChange() {
    props.onChange(!props.value);
  }
  return (
    <View className="qc-checkbox" onClick={onChange}>
      <Text
        className={`qc-checkbox__icon qcfont ${
          props.value ? "qc-icon-checked" : "qc-icon-check"
          }`}
      ></Text>
      <View className="qc-checkbox__text">{props.children}</View>
    </View>
  );
};
export default QcCheckbox;

QcCheckbox.options = {
  addGlobalClass: true
};
