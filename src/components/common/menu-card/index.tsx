import Taro from "@tarojs/taro";
import { View, Text } from "@tarojs/components";
import "./index.scss";

interface IQcMenuCard {
  title: string;
  info?: string;
  children?: any;
  onMore?: any;
}

function QcMenuCard(props: IQcMenuCard) {
  return (
    <View className="qc-menu-card">
      <View className="qc-menu-card__header">
        <View>{props.title}</View>
        {props.info && (
          <View className="qc-menu-card__more" onClick={props.onMore}>
            <Text>{props.info}</Text>
            <Text className="qc-menu-card__icon qcfont qc-icon-chevron-right" />
          </View>
        )}
      </View>
      <View className="qc-menu-card__body">{props.children}</View>
    </View>
  );
}

QcMenuCard.options = {
  addGlobalClass: true
};

export default QcMenuCard;
