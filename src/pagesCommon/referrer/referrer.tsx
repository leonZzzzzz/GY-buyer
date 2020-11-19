import Taro, { Component, Config } from "@tarojs/taro";
import {
  Block,
  View,
  Image
} from "@tarojs/components";
import "./referrer.scss";
import { recommendUser, wechatCode } from "@/api/userInfo"
import data from "../address/edit/data";

export default class Index extends Component {

  state = {
    type: 'user',
    data: '',
    showposter: false,
    showmodel: false,
    imageurl: "https://guyu-1300342109.cos.ap-guangzhou.myqcloud.com",
    imageTempPath: '',
    wxcode: '',
    headImage: '',
    nickName: '',
    phone: Taro.getStorageSync('phone')
  };
  config: Config = {
    navigationBarTitleText: "我要推荐"
  };
  componentDidMount() {
    console.log(this.state.phone)
    this.getData()
    wechatCode().then(res => {
      let { posterPath, nickName, headImage } = res.data.data
      this.setState({ wxcode: posterPath, nickName, headImage })
    })
  }
  getData = async () => {
    const res = await recommendUser(this.state.type)
    if (res.data.code == 20000) {
      const data = res.data.data
      data.reward = parseFloat(data.reward / 100)
      data.factor = parseFloat(data.factor / 100)
      this.setState({ data: res.data.data })
    }
  }
  onShareAppMessage(e) {
    //这个分享的函数必须写在入口中，写在子组件中不生效
    return {
      title: '丰盈e鲜',
      path: '/pages/home/index?jump=1&scene=' + this.state.phone,
      success: function (res) {
        console.log("转发成功:" + JSON.stringify(res));
      },
      fail: function (res) {
        // 转发失败
        console.log("转发失败:" + JSON.stringify(res));
      }
    }
  }
  // 点击分享显示弹窗
  onshare() {
    this.setState({ showmodel: true })
  }
  // 显示海报
  showposter() {
    this.setState({ showposter: true, showmodel: false })
    this.drawBall()
  }
  // 隐藏海报
  hideposter() {
    this.setState({ showposter: false })
  }
  // 分享好友
  share() {
    this.setState({ showposter: false, showmodel: false })
    return {
      title: '丰盈e鲜',
      path: '/pages/home/index?jump=1&scene=' + this.state.phone,
      success: function (res) {
      }
    }
  }

  drawBall() {
    let { wxcode, nickName, headImage } = this.state
    Taro.showLoading()
    const context = Taro.createCanvasContext('canvas', this)
    const imgPath = headImage;//头像
    const imgPath1 = this.state.imageurl + '/attachments/null/ceea29aa71da4fbda274566ca0569b94.png';//背景
    const imgPath2 = this.state.imageurl + wxcode;
    const _this = this;
    Taro.getImageInfo({
      src: imgPath
    }).then(res => {
      Taro.hideLoading()
      context.drawImage(res.path, 135, 18, 60, 60);
      Taro.getImageInfo({
        src: imgPath1,
      }).then((res) => {
        context.drawImage(res.path, 0, 0, 325, 510);
        Taro.getImageInfo({
          src: imgPath2,
        }).then((res2) => {
          context.drawImage(res2.path, 115, 313, 90, 90);
          // const h = _this.fillTextWrap(context, '润百颜玻尿酸，告别黄脸婆，一白这白丑', 10, 310, 130, 20);
          // context.font = 'normal 11px ArialMT sans-serif';
          // context.setFontSize(20);
          // context.setFillStyle('#FF6066');
          // context.fillText('￥66', 10, 390);
          // context.font = 'normal 11px  PingFangSC-Regular sans-serif';
          context.setFontSize(19);
          // context.setFillStyle('#FA2E9A');
          context.fillText(nickName, 135, 95);
          context.draw(false, () => {
            Taro.canvasToTempFilePath({
              canvasId: 'canvas',
              success: function (res) {
                // 获得图片临时路径
                _this.setState({
                  imageTempPath: res.tempFilePath
                })
              }
            })
          });
        });
      });
    })
  }


  // 保存海报
  saveImage1() {
    // 查看是否授权
    Taro.getSetting({
      // complete() {
      // }
    }).then(res => {
      console.log(res)
      if (res.authSetting['scope.writePhotosAlbum']) {
        this.download()
      } else {
        // Taro.authorize({
        //   scope: 'scope.writePhotosAlbum',
        // }).then(() => {
        //   Taro.saveImageToPhotosAlbum({
        //     filePath: this.state.imageTempPath
        //   }).then(res => {
        //     console.log(res)
        //   })
        // })
      }
    }).catch((e) => {
      console.log(e)
    })
  }
  saveImage() {
    Taro.saveImageToPhotosAlbum({
      filePath: this.state.imageTempPath
    }).then(res => {
      console.log(res)
      if (res.errMsg == 'saveImageToPhotosAlbum:ok') {
        Taro.showToast({
          title: '保存成功',
          icon: 'none'
        })
      } else {
        Taro.showToast({
          title: '保存失败',
          icon: 'none'
        })
      }
    }).catch((e) => {
      console.log(e)
      if (e.errMsg == "saveImageToPhotosAlbum:fail auth deny" || e.errMsg === "saveImageToPhotosAlbum:fail auth deny") {
        Taro.showModal({
          title: '提示',
          content: '需要您授权保存相册',
          showCancel: true,
          success: modalSuccess => {
            if (modalSuccess.confirm) {
              Taro.openSetting({
                success(settingdata) {
                  console.log("settingdata", settingdata)
                  if (settingdata.authSetting['scope.writePhotosAlbum']) {
                    // Taro.showModal({
                    //   title: '提示',
                    //   content: '获取权限成功,再次点击图片即可保存',
                    //   showCancel: false,
                    // })
                  } else {
                    // Taro.showModal({
                    //   title: '提示',
                    //   content: '获取权限失败，将无法保存到相册哦~',
                    //   showCancel: false,
                    // })
                  }
                },
                fail(failData) {
                  console.log("failData", failData)
                },
                complete(finishData) {
                  console.log("finishData", finishData)
                }
              })
            }

          }
        })
      }
    })
  }

  // 文字换行
  fillTextWrap(ctx, text, x, y, maxWidth, lineHeight) {
    console.log(ctx, text, x, y, maxWidth, lineHeight)
    // 设定默认最大宽度
    const systemInfo = Taro.getSystemInfoSync();
    const deciveWidth = systemInfo.screenWidth;
    // 默认参数
    maxWidth = maxWidth || deciveWidth;
    lineHeight = lineHeight || 20;
    // 校验参数
    if (typeof text !== 'string' || typeof x !== 'number' || typeof y !== 'number') {
      return;
    }
    // 字符串分割为数组
    const arrText = text.split('');
    // 当前字符串及宽度
    let currentText = '';
    let currentWidth;
    ctx.font = 'normal 11px sans-serif';
    ctx.setFontSize(16);
    ctx.setFillStyle('#3A3A3A');
    ctx.setTextAlign('justify');
    for (let letter of arrText) {
      currentText += letter;
      currentWidth = ctx.measureText(currentText).width;
      if (currentWidth > maxWidth) {
        ctx.fillText(currentText, x, y);
        currentText = '';
        y += lineHeight;
      }
    }
    if (currentText) {
      ctx.fillText(currentText, x, y);
    }
  }



  render() {
    const { imageurl } = this.state
    return (
      <Block>
        {showmodel && (
          <View className='modelNum'>
            <View className='modelopa' onClick={this.hidewechat}></View>
            <View className='modelContent'>
              {/* <Text>分享好友</Text> */}
              <Button className='modelRow invite-button' open-type='share' onClick={this.share}>
                <Image src='../../images/item/sharefrd.png'></Image>
                <Text>分享好友</Text>
              </Button>
              <View className='modelRow' onClick={this.showposter}>
                <Image style='margin-top:42rpx;height:115rpx !important;width:115rpx !important;' src='../../images/item/postor.png'></Image>
                <Text style='margin-top:62px !important;'>生成海报</Text>
              </View>
            </View>
          </View>
        )}

        {/* 海报 */}
        {showposter && (
          <View className='refund-model'>
            <View className='layer'></View>
            <View className='poster'>
              <Image src='../../images/item/delete1.png' onClick={this.hideposter}></Image>
              <canvas canvas-id='canvas'></canvas>
              <View className='save-image' onClick={this.saveImage.bind(this)}>保存图片</View>
            </View>
          </View>
        )}

        <View>
          <Image src={imageurl + '/attachments/null/448c49fe96a64e1da3c299eda200b2fd.png'}></Image>
          <View className='title-money'>现金<Text className='wait'> {data.reward} </Text>元等你拿</View>
          <View className='rule'>
            <View className='rule-a'>— 推荐规则 —</View>
            <View className='rule-b'>
              <View>1.分享丰盈e鲜小程序给推荐人；</View>
              <View>2.被推荐人入驻平台时在推荐人处填写您的手机号；</View>
              <View>3.被推荐人累计消费金额达到{data.factor}元，平台将赠送您{data.reward}元优惠券。</View>
            </View>
            {/* <Button className='btn' open-type='share' onClick={this.onshare}> */}
            <View className='btn' onClick={this.onshare}>分享给好友</View>
            {/* </Button> */}
          </View>
        </View>
      </Block>
    );
  }
}




// import Taro, { Component, Config } from '@tarojs/taro'
// // import './index.scss'
// import { View } from '@tarojs/components'

// class Auth extends Component {
//   config: Config = {
//     navigationBarTitleText: 'canvas测试'
//   }
//   constructor(props) {
//     super(props)
//     this.state = {
//       imageurl: "https://guyu-1300342109.cos.ap-guangzhou.myqcloud.com",
//       imageTempPath: ''
//     }
//   }
//   componentWillMount(): void {
//     this.drawBall()
//   }
//   drawBall() {
//     const context = Taro.createCanvasContext('canvas', this)
//     const imgPath1 = this.state.imageurl + '/attachments/null/ce95846fc5f343cb8d4c68fc28386621.png';
//     const imgPath2 = this.state.imageurl + '/attachments/afterSale/55a1424040ac4fb3b4d7c1930b36a6a6.jpg';
//     const _this = this;
//     Taro.getImageInfo({
//       src: imgPath1,
//     }).then((res) => {
//       context.drawImage(res.path, 0, 0, 375, 190);
//       Taro.getImageInfo({
//         src: imgPath2,
//       }).then((res2) => {
//         context.drawImage(res2.path, 250, 195, 86, 86);
//         const h = _this.fillTextWrap(context, '【润百颜玻尿酸】告别黄脸婆，一百这白丑', 20, 230, 190, 20);
//         context.font = 'normal 11px ArialMT sans-serif';
//         context.setFontSize(16);
//         context.setFillStyle('#FF6066');
//         context.fillText('￥66', 40, 290);
//         context.font = 'normal 11px  PingFangSC-Regular sans-serif';
//         context.setFontSize(12);
//         context.setFillStyle('#FA2E9A');
//         context.fillText('扫描小程序码查看', 245, 300);
//         context.draw(false, () => {
//           Taro.canvasToTempFilePath({
//             canvasId: 'canvas',
//             success: function (res) {
//               // 获得图片临时路径
//               _this.setState({
//                 imageTempPath: res.tempFilePath
//               })
//             }
//           })
//         });
//       });
//     });
//   }

//   saveImage() {
//     // 查看是否授权
//     Taro.getSetting({
//       complete() {
//         console.log(444)
//       }
//     }).then(res => {
//       if (res.authSetting['scope.writePhotosAlbum']) {
//         Taro.saveImageToPhotosAlbum({
//           filePath: this.state.imageTempPath
//         }).then(res => {
//           console.log(res)
//         })
//       } else {
//         Taro.authorize({
//           scope: 'scope.writePhotosAlbum',
//         }).then(() => {
//           Taro.saveImageToPhotosAlbum({
//             filePath: this.state.imageTempPath
//           }).then(res => {
//             console.log(res)
//           })
//         })
//       }
//     }).catch((e) => {
//       console.log(e)
//     })
//   }
//   // 文字换行
//   fillTextWrap(ctx, text, x, y, maxWidth, lineHeight) {
//     // 设定默认最大宽度
//     const systemInfo = Taro.getSystemInfoSync();
//     const deciveWidth = systemInfo.screenWidth;
//     // 默认参数
//     maxWidth = maxWidth || deciveWidth;
//     lineHeight = lineHeight || 20;
//     // 校验参数
//     if (typeof text !== 'string' || typeof x !== 'number' || typeof y !== 'number') {
//       return;
//     }
//     // 字符串分割为数组
//     const arrText = text.split('');
//     // 当前字符串及宽度
//     let currentText = '';
//     let currentWidth;
//     ctx.font = 'normal 11px sans-serif';
//     ctx.setFontSize(16);
//     ctx.setFillStyle('#3A3A3A');
//     ctx.setTextAlign('justify');
//     for (let letter of arrText) {
//       currentText += letter;
//       currentWidth = ctx.measureText(currentText).width;
//       if (currentWidth > maxWidth) {
//         ctx.fillText(currentText, x, y);
//         currentText = '';
//         y += lineHeight;
//       }
//     }
//     if (currentText) {
//       ctx.fillText(currentText, x, y);
//     }
//   }
//   render() {
//     return (
//       <View>
//         <canvas style="width: 375px; height: 320px;background:#fff" canvas-id="canvas"></canvas>
//         <View className='btn btn-pink save-image' onClick={this.saveImage.bind(this)}>保存图片</View>
//       </View>
//     )
//   }
// }
// export default Auth
