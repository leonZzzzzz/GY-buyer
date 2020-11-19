import Taro from "@tarojs/taro";
import { Label, View } from "@tarojs/components";

import "./index.scss";

function QcFormItem(props: any) {
  return (
    <Label className="qc-form-item">
      <View className="qc-form-item__label">{props.label}</View>
      {props.children}
    </Label>
  );
}

export default QcFormItem;
