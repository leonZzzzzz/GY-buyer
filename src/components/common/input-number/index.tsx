import Taro from "@tarojs/taro";
import { View } from "@tarojs/components";

import "./index.scss";

interface IQcInputNumber {
  /**
   * 默认值
   */
  value: number;
  /**
   * 输入框宽度
   */
  width?: number;
  /**
   * 最小值
   */
  min?: number;
  /**
   * 最大值
   */
  max?: number;
  /**
   * 数据变化间隔
   */
  step?: number;
  /**
   * 减少执行的方法
   */
  onChange: Function;
}

const QcInputNumber = (props: IQcInputNumber) => {
  function onNumberAdd() {
    if (props.value + (props.step as number) <= (props.max as number)) {
      props.value += props.step as number;
      props.onChange(props.value);
    }
  }
  function onNumberSub() {
    if (props.value - (props.step as number) >= (props.min as number)) {
      props.value -= props.step as number;
      props.onChange(props.value);
    }
  }
  return (
    <View className="qc-input-number">
      <View
        className={`qc-input-number__icon qc-input-number__icon--sub ${
          props.min === props.value ? "qc-input-number__icon--disabled" : ""
          }`}
        onClick={onNumberSub}
      >
        <View className="qcfont qc-icon-jian"></View>
      </View>
      <View className="qc-input-number__value">{props.value}</View>
      <View
        className={`qc-input-number__icon qc-input-number__icon--add ${
          props.max === props.value ? "qc-input-number__icon--disabled" : ""
          }`}
        onClick={onNumberAdd}
      >
        <View className="qcfont qc-icon-jia"></View>
      </View>
    </View>
  );
};

export default QcInputNumber;
QcInputNumber.options = {
  addGlobalClass: true
}
QcInputNumber.defaultProps = {
  value: 0,
  min: 1,
  max: 15,
  step: 1,
  width: 0
};
