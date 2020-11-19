import Taro, { Component, Config } from "@tarojs/taro";
import {
  View,
  Text,
  Input,
  RadioGroup,
  Radio,
  Label
} from "@tarojs/components";
import "./invoice.scss";
import { applyInvoice, getInvoiceMsg } from "@/api/common"

export default class Index extends Component {

  state = {
    invoiceType: 'person',
    phone: '',
    taxNumber: '',
    invoiceName: '',
    email: '',
    orderId: '',
    type: '',
  };
  config: Config = {
    navigationBarTitleText: "开具发票"
  };

  componentWillMount() {
    let { orderId, type, invoiceData } = this.$router.params
    this.setState({ orderId, type  })
    if (invoiceData && invoiceData != 'undefined' && invoiceData != '{}') {
      invoiceData = JSON.parse(invoiceData)
      this.setState({
        invoiceName: invoiceData.invoiceName,
        taxNumber: invoiceData.taxNumber,
        email: invoiceData.email,
        invoiceType: invoiceData.invoiceType
      })
      return
    }
    getInvoiceMsg().then(res => {
      let { invoiceName, taxNumber, email, invoiceType } = res.data.data
      this.setState({ invoiceName, taxNumber, email, invoiceType })
    })
  }
  //  选择个人或企业
  singlechange(e) {
    this.setState({ invoiceType: e.detail.value })
  }
  // 税号
  getcom(e) {
    this.setState({ taxNumber: e.detail.value })
  }
  // 抬头
  getusername(e) {
    this.setState({ invoiceName: e.detail.value })
  }
  //邮箱
  getrefphone(e) {
    this.setState({ email: e.detail.value })
  }
  nextStep() {
    let { orderId, invoiceType, taxNumber, invoiceName, email } = this.state
    if (invoiceType == 'business') {
      if (!taxNumber) {
        Taro.showToast({
          title: '请填写税号',
          icon: 'none'
        })
        return
      }
    } else {
      taxNumber = ''
    }
    if (!invoiceName) {
      Taro.showToast({
        title: '请填写抬头',
        icon: 'none'
      })
      return
    }
    if (!email) {
      Taro.showToast({
        title: '请填写邮箱',
        icon: 'none'
      })
      return
    } else {
      var pattern = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/
      if (!pattern.test(email)) {
        Taro.showToast({
          title: '邮箱格式不正确',
          icon: 'none'
        })
        return
      }
    }
    var params = {
      orderId,
      invoiceName,
      invoiceType,
      taxNumber,
      email,
    }
    this.approve(params)
  }
  approve = async (params) => {
    const res = await applyInvoice(params)
    if (res.data.code == 20000) {
      Taro.showToast({
        title: '申请已提交，请等待店家开票',
        icon: 'none'
      })
      setTimeout(() => {
        Taro.navigateBack()
      }, 2000);
    }
  }
  render() {
    let {
      email,
      invoiceType,
      taxNumber,
      invoiceName,
      type
    } = this.state
    return (
      <View style="flex-direction:column;border-top:1px solid #eee;">
        <View className='phone'>
          <Text>抬头类型</Text>
          { type == 2 ? (
          <RadioGroup className='radio-group'>
            {invoiceType == 'person' ? ( <Label className='radio-list__label'>
              <View className="the_list_label">
                <Radio className='radio-list__radio' value='person' checked='true'></Radio>
                <Text>个人或事业单位</Text>
              </View>
            </Label>)
            :(<Label className='radio-list__label '>
              <View className="the_list_label">
                <Radio className='radio-list__radio' value='business' checked='true'></Radio>
                <Text>企业</Text>
              </View>
            </Label>)}
          </RadioGroup>)
          : (
          <RadioGroup onChange={this.singlechange} className='radio-group'>
            <Label className='radio-list__label'>
              <View className="the_list_label">
                <Radio className='radio-list__radio' value='person' checked='true'></Radio>
                <Text>个人或事业单位</Text>
              </View>
            </Label>
            <Label className='radio-list__label '>
              <View className="the_list_label">
                <Radio className='radio-list__radio' value='business' checked={invoiceType == 'business' ? true : false}></Radio>
                <Text>企业</Text>
              </View>
            </Label>
          </RadioGroup>
          )}
        </View>
        {invoiceType == 'business' && (
          <View className='phone'>
            <Text>税号</Text>
            <Input placeholder='纳税人识别号' maxLength='32' value={taxNumber} onInput={this.getcom} disabled={type === 2 ? true : false}></Input>
          </View>
        )}
        <View className='phone'>
          <Text>发票抬头</Text>
          <Input placeholder='抬头名称' value={invoiceName} onInput={this.getusername} disabled={type == 2 ? true : false}></Input>
        </View>
        <View className='phone'>
          <Text>邮箱</Text>
          <Input placeholder='输入可使用邮箱' value={email} onInput={this.getrefphone} disabled={type == 2 ? true : false}></Input>
        </View>
        <View className='tips'>注：邮箱用于接收已开具的电子发票</View>
        {type == 1 && (
          <View className='btn' onClick={this.nextStep}><Text>完成</Text></View>
        )}

      </View>
    );
  }
}
