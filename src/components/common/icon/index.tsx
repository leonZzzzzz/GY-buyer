import Taro from '@tarojs/taro'
import { Text } from "@tarojs/components";

interface IICont {
  color: string;
  size: number;
  value: string;
}
function QcIcon(props: IICont) {
  return <Text  className={`qcfont qc-icon-${props.value}`}></Text>
}

QcIcon.options = {
  addGlobalClass: true
}

export default QcIcon;
