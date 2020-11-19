import Taro, { Component, Config } from "@tarojs/taro";
import { View, Button, Text, Image } from "@tarojs/components";
import { login, getphone, authorize, isvalid, usermember, myuser } from "@/api/common";
import './index.scss';

export default class Index extends Component {

  config: Config = {
    navigationBarTitleText: "用户登录"
  };
  state = {
    imageurl: 'https://guyu-1300342109.cos.ap-guangzhou.myqcloud.com',
    code: '',
    encryptedData: '',
    iv: '',
    ismodel: true
  }
  componentDidMount() {

    var code = Taro.getStorageSync('code')
    // if (code) {
    //   code = code
    //   const params = { code: code }
    //   this.getAuthorize(params, true)
    //   this.setState({ code: code })
    // } else {
    //   Taro.login().then(res => {
    //     code = res.code
    //     const params = { code: code }
    //     this.getAuthorize(params, true)
    //     Taro.setStorageSync('code', res.code)
    //     this.setState({ code: code })
    //   })
    // }
    this.setState({ code })
  }
  // 判断是否授权头像昵称
  getuserinfo = async () => {
    const res = await myuser()
    if (res.data.data.isLogin) {
      this.setState({ ismodel: true })
    }
  }
  // 微信授权
  onGetPhoneNumber(e) {
    let { encryptedData, iv } = e.detail
    this.setState({ encryptedData, iv })
    var params = {
      code: this.state.code,
      encryptedData: encryptedData,
      iv: iv
    }
    this.decyPhone(params)
  }
  // 用户登录获取手机号
  decyPhone = async (params: any) => {
    console.log(params)
    const res = await getphone(params)
    if (res.data.code == 63020 || res.data.code == 63021) {//静默授权
      const params = { code: this.state.code }
      this.getAuthorize(params)
    } else if (res.data.code == 20000) {
      Taro.setStorageSync('phone', res.data.message)
      this.isuserInfo(res.data.message)
      // const data = await textget()
    }
  }
  // 信息是否认证
  isuserInfo = async (message) => {
    var params = { mobile: message }
    const res = await isvalid()
    if (res.data.data) {
      Taro.navigateBack({
        delta: 1
      })
    } else {
      Taro.reLaunch({
        url: '../../pagesCommon/auth-msg/auth-msg?phone=' + message
      })
    }
  }
  // 静默授权获取sessionid和openid
  getAuthorize = async (params: any, isGetUser?: Boolean) => {
    const res = await authorize(params)
    console.log(res)
    if (res.data.code == 20000) {
      Taro.setStorageSync('sessionid', res.data.data.sessionId)
      Taro.setStorageSync('openid', res.data.data.openId)
      Taro.setStorageSync('memberid', res.data.data.memberId)
      // var par = {
      //   code: params.code,
      //   encryptedData: this.state.encryptedData,
      //   iv: this.state.iv
      // }
      // this.decyPhone(par)
      if (isGetUser) this.getuserinfo()
    }
  }

  // 获取用户昵称头像
  getUserInfo(e) {
    const code = Taro.getStorageSync('code')
    const { encryptedData, iv, userInfo } = e.target
    const { nickName, gender, avatarUrl } = userInfo
    const params = { encryptedData, iv, appellation: nickName, sex: gender, headImage: avatarUrl, code: code }
    this.loginuser(params)
  }
  // 将用户信息传给后台并获取登录信息
  loginuser = async (params) => {
    const res = await usermember(params)
    if (res.data.code == 20000) {
      Taro.setStorageSync('memberId', res.data.data.memberId)
      Taro.setStorageSync('openId', res.data.data.openId)
      this.setState({ ismodel: false })
    }
  }


  render() {
    const { imageurl } = this.state
    return (
      <View>
        {/* 弹出框 start*/}
        {/* {this.state.ismodel && (
          <View className='refund-model'>
            <View className='layer'></View>
            <View className='model-content'>
              <Image src={require('../../images/item/logo-v.png')}></Image>

              <Button style='position:absolute;bottom:0;width:100%;border-top-left-radius: 0rpx;border-top-right-radius:0rpx;' className='bottom' lang="zh_CN" type="primary" open-type="getUserInfo" onGetUserInfo={this.getUserInfo}>授权头像和昵称</Button>
            </View>
          </View>
        )} */}
        {/* 弹出框 end*/}
        <View className='logo'><Image src={imageurl + '/attachments/null/d9a6c7c49b92453996cec79d1fc4d410.png'}></Image></View>

        <Button className="wxlogin" openType="getPhoneNumber" onGetPhoneNumber={this.onGetPhoneNumber}>
          <Text className="text">微信用户快速登录</Text>
        </Button>
        <Button className='phonelogin' onClick={() => { Taro.navigateTo({ url: '../../pagesCommon/phone-login/phone-login' }) }}>
          <Text className="text">手机号验证登录</Text>
        </Button>
        <View className='tips'>新用户将自动注册，登录&注册表示同意 <Text style='color:#FF840B' onClick={() => { Taro.navigateTo({ url: '../../pagesCommon/protocol/protocol?type=MEMBER_TOS' }) }}> 丰盈e鲜服务条款</Text></View>
      </View>
    );
  }
}


// function Authorize() {
//   const [code, setCode] = useState<string>("");
//   useEffect(() => {
//     Taro.login().then(res => {
//       setCode(res.code);
//     });
//   }, []);
//   function onGetPhoneNumber(e) {
//     console.log(e)
//     if (e.detail.encryptedData) {
//       getphone({
//         code,
//         encryptedData: e.detail.encryptedData,
//         ivData: e.detail.iv
//       }).then(res => {
//         let memberId = res.data.data.memberId;
//         Taro.setStorageSync("user", res.data.data);
//         Taro.setStorageSync("memberId", memberId);
//         Taro.navigateBack();
//       });
//     } else {
//       Taro.showToast({
//         title: "为了更好的体验，请允许授权",
//         icon: "none"
//       });
//     }
//   }
//   return (
//     <View>
//       <View className='logo'><Image src='../../images/item/logo-v.png'></Image></View>

//       <Button className="wxlogin" openType="getPhoneNumber" onGetPhoneNumber={this.onGetPhoneNumber}>
//         <Text className="text">微信用户快速登录</Text>
//       </Button>
//       <Button className='phonelogin' onClick={() => { Taro.navigateTo({ url: '../../pagesCommon/phone-login/phone-login' }) }}>
//         <Text className="text">手机号验证登录</Text>
//       </Button>
//       <View className='tips'>新用户将自动注册，登录&注册表示同意 <Text style='color:#FF840B'> 谷裕优鲜服务条款</Text></View>
//     </View>
//   );
// }

// export default Authorize;