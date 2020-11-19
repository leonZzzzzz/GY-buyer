import Taro, { Component, Config } from "@tarojs/taro";
import { aboutus } from "@/api/userInfo"
import WxParse from '@/components/wxParse/wxParse';
import {
  View,
  Text,
  Image,
} from "@tarojs/components";
import "./aboutus.scss";

export default class Index extends Component {

  state = {

  };

  componentWillMount() {

  }
  componentDidMount() {
    this.getaboutus()

  }
  getaboutus = async () => {
    const res = await aboutus()
    // console.log(res.data.data.content)
    WxParse.wxParse('article', 'html', res.data.data.content, this.$scope, 5)
  }
  config: Config = {
    navigationBarTitleText: "关于我们"
  };
  render() {
    return (
      <View style='flex-direction:column;margin-left:5px;font-size:13px;'>
        <import src='../../components/wxParse/wxParse.wxml' />
        <template is='wxParse' data='{{wxParseData:article.nodes}}' />
      </View>
    );
  }
}
