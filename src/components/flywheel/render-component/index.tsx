import Taro from "@tarojs/taro";
import { Block } from "@tarojs/components";
import QcSplit from "@/components/flywheel/custom/split";
import QcText from "@/components/flywheel/custom/text";
import QcMall1 from '@/components/flywheel/mall/mall1';
import QcMall2 from '@/components/flywheel/mall/mall2';

type Props = {
  is: string;
  options: any;
};

export default function RenderComponet(props: Props) {
  const { is, options } = props;
  return (
    <Block>
      {
        {
          'QcSplit': <QcSplit options={options}></QcSplit>,
          'QcText': <QcText options={options}></QcText>,
          'QcMall1': <QcMall1></QcMall1>,
          'QcMall2': <QcMall2></QcMall2>
        }[is]
      }
    </Block>
  );
}
