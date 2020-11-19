import Taro, { Component, Config } from "@tarojs/taro";
import {
  View,
  Text,
  Image,
  Input,
  RadioGroup,
  Label,
  Radio
} from "@tarojs/components";
import { toPriceYuan } from "@/utils/format";
import { IMG_HOST } from "@/config";
import { refundReasonType, refundApply } from "@/api/after-order";
import { upload } from "@/api/common";
import "./apply-draw.scss";

export default class Index extends Component {
  state = {
    isreason: false,
    reasonType: [],
    model: {
      orderId: "",
      voucherImage: "",
      afterSalesItemList: [
        {
          orderItemId: "",
          qty: 0
        }
      ],
      reasonType: "",
      reason: ""
    },
    reasonTypeName: "请选择申请原因",
    product: {
      id: "",
      qty: 0
    },
    voucherImage: [],
    orderNo: ''
  };
  config: Config = {
    navigationBarTitleText: "申请退款"
  };
  componentDidMount() {
    console.log(this.$router.params.product)
    this.setState({ product: JSON.parse(this.$router.params.product), orderNo: this.$router.params.orderNo }, () => {
      this.state.model.afterSalesItemList[0].orderItemId = this.state.product.id;
      this.state.model.afterSalesItemList[0].qty = this.state.product.qty;
      this.state.model.orderId = this.$router.params.id;
    });

    this.refundReasonType();
  }
  // 选择退款原因
  toggleReason(flag: boolean) {
    this.setState({ isreason: flag });
  }
  refundReasonType() {
    refundReasonType({ orderId: this.$router.params.id }).then(res => {
      this.setState({ reasonType: res.data.data });
    });
  }
  radioChange(e) {
    let data: any = this.state.reasonType[e.detail.value];
    this.state.model.reasonType = data.value;
    this.setState({
      model: this.state.model,
      reasonTypeName: data.name
    });
  }
  changeInput(e) {
    this.state.model.reason = e.detail.value;
    this.setState({
      model: this.state.model
    });
  }
  chooseImage() {
    let { voucherImage } = this.state;
    Taro.chooseImage({ count: Math.abs(voucherImage.length - 3), sizeType: ["compressed"] }).then(res => {
      this.handleWxChooseImage(res.tempFiles, 3);
    });
  }
  // 处理小程序端的选择图片上传
  handleWxChooseImage(tempFiles: any[], count: number) {
    if (!tempFiles.length) return;
    let { voucherImage } = this.state;
    if (tempFiles.length + voucherImage.length > count) {
      Taro.showToast({ title: `最多上传${count}张图片` });
      return;
    } else {
      Taro.showLoading({
        title: "上传中"
      });
      let promiseArray: any[] = [];
      for (let file of tempFiles) {
        // 判断选择的图片大小
        const fileSize = file.size / 1024 / 1024;
        if (fileSize > 2) {
          Taro.showToast({ title: `大于${2}MB的图片将不会上传` });
        } else {
          let promise = upload(file.path, { imageType: "afterSale" });
          promiseArray.push(promise);
        }
      }
      Promise.all(promiseArray)
        .then(result => {
          console.log("[result] :", result);
          for (let res of result) {
            voucherImage.push(res.data.data.imageUrl);
          }
          this.setState({ voucherImage }, () => {
            console.log("上传完成:", this.state.voucherImage);
          });
          Taro.hideLoading();
        })
        .catch(err => {
          console.error("upload err :", err);
          Taro.hideLoading();
        });
    }
  }

  // 删除上传的凭证
  deleteProofImg = (index: number) => (e) => {
    e.stopPropagation()
    let voucherImage = this.state.voucherImage;
    voucherImage.splice(index, 1);
    this.setState({ voucherImage });
  }
  // 提交
  refundApply() {
    Taro.showLoading()
    this.state.model.voucherImage = this.state.voucherImage.join(",");
    console.log(this.state.model)
    if (!this.state.model.reasonType) {
      Taro.showToast({
        title: '请选择申请原因',
        icon: 'none'
      })
      return
    }
    refundApply(this.state.model).then(res => {
      Taro.hideLoading()
      if (res.data.code == 20000) {
        Taro.showToast({
          title: res.data.message,
          icon: 'none'
        })
        setTimeout(() => {
          // Taro.navigateBack({ delta: 1 })
          Taro.navigateTo({
            url: '../../pagesMall/purchase-detail/purchase-detail?id=' + res.data.data
          })
        }, 1000);
      }
    });
  }
  xx(e) {
    console.log(e);
  }
  render() {
    const {
      isreason,
      reasonType,
      reasonTypeName,
      product,
      model,
      voucherImage, orderNo
    } = this.state;
    return (
      <View className="aftersale-confirm">
        <View className="aftersale-confirm__order-no">
          <View>订单号：{orderNo}</View>
        </View>
        <View className="aftersale-confirm__product">
          <Image
            className="aftersale-confirm__product-img"
            src={IMG_HOST + product.iconUrl}
          ></Image>
          <View className="aftersale-confirm__product-right">
            <View className="header">
              <View className="aftersale-confirm__product-right__title">
                {product.name}
              </View>
              <View className="aftersale-confirm__product-right__price">
                <View className="price">￥{toPriceYuan(product.price)}</View>
                <View className="qty">x{product.qty}</View>
              </View>
            </View>
            <View className="aftersale-confirm__product-right__apply">
              {product.specs}
            </View>
          </View>
        </View>
        <View className="totalprice">
          <View className="dist" onClick={this.toggleReason.bind(this, true)}>
            <Text className="dist-title">申请原因</Text>
            <View className="dist-apply">
              <Text className="apply-rea">{reasonTypeName}</Text>
              <View className="qcfont qc-icon-chevron-right"></View>
            </View>
          </View>
          <View className="dist">
            <Text className="dist-title">退款金额</Text>
            <View className="dist-apply">
              <Text className="apply-rea orange">提交后与商家协商</Text>
            </View>
          </View>
          <View className="dist">
            <Text className="dist-title">备注信息</Text>
            <View className="dist-apply">
              <Input
                onInput={this.changeInput.bind(this)}
                value={model.reason}
                className="apply-rea"
                placeholder="最多可填写200字"
                maxLength='200'
              ></Input>
            </View>
          </View>
        </View>
        <View className="totalprice">
          <View className="dist-col">
            <Text className="dist-title">图片举证</Text>
            <View className="img-list">
              {voucherImage.map((item, index) => {
                return (
                  <View className="img-list__item" key={item}>
                    <Image
                      className="img-item"
                      mode="aspectFit"
                      src={IMG_HOST + item}
                      onClick={() => {
                        Taro.previewImage({
                          current: IMG_HOST + item,
                          urls: voucherImage.map(img => IMG_HOST + img)
                        })
                      }}
                    />
                    <View
                      className="qcfont qc-icon-close"
                      onClick={this.deleteProofImg(index)}
                    />
                  </View>
                );
              })}
              {voucherImage.length < 3 && (
                <View
                  className="img-list__item"
                  onClick={this.chooseImage.bind(this)}
                >
                  <View className="iconfont icon-tupian1" />
                  <View>上传凭证</View>
                  <View className="desc">(最多{3}张)</View>
                </View>
              )}
            </View>
            <View className="zixun">*如有疑问请先咨询客服</View>
          </View>
        </View>
        <View className="confirm-order">
          <View className="btn" onClick={this.refundApply.bind(this)}>
            提交
          </View>
        </View>
        {isreason && (
          <View className="reason-model">
            <View className="reason"></View>
            <View className="reason-content">
              <View className="content-res">申请原因</View>
              <RadioGroup onChange={this.radioChange.bind(this)}>
                {reasonType.map((item, index) => {
                  return (
                    <Label className="choose-rea" key={index}>
                      <Text className="label">{item.name}</Text>
                      <Radio value={index}></Radio>
                    </Label>
                  );
                })}
              </RadioGroup>
              <View
                className="close"
                onClick={this.toggleReason.bind(this, false)}
              >
                关闭
              </View>
            </View>
          </View>
        )}
      </View>
    );
  }
}
