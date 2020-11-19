import Taro, { useState, useRouter, useDidShow } from "@tarojs/taro";
import { View, Text } from "@tarojs/components";
import {
  listAddress,
  deleteAddress,
  updateDefaultAddress,
  addAddress
} from "@/api/address";
import "./index.scss";

interface IAddress {
  id: string;
  province: string;
  city: string;
  area: string;
  address: string;
  receiver: string;
  mobile: string;
  name: string;
  isDefault: boolean;
}
function AddressList() {
  const router = useRouter();
  const [list, setList] = useState<IAddress[]>([]);
  const [wxadd, setWxadd] = useState<IAddress[]>([]);
  useDidShow(() => {
    listAddress().then(res => {
      setList(res.data.data);
    });
    // console.log("list" + list);
    // Taro.setStorageSync("list", list)
  });
  // 删除地址
  async function apiDeleteAddress(id: string) {
    const res = await Taro.showModal({
      title: "提示",
      content: "是否删除该地址"
    });
    if (res.confirm) {
      const address = Taro.getStorageSync('address')
      if (address.id == id) {
        Taro.removeStorageSync('address')
      }
      const res1 = await deleteAddress({ id });
      Taro.showToast({
        title: "删除成功",
        icon: "none"
      });
      if (res1.data.code == 20000) {
        const res2 = await listAddress();
        setList(res2.data.data);
      }
    }
  }
  function selectAddress(item: IAddress) {
    if (router.params.action) {
      Taro.setStorageSync("address", item);
      Taro.navigateBack();
    }
  }

  // 微信添加
  function onWxAddClick(e: any) {
    Taro.getSetting({
      success(res) {
        console.log(res)
        if (res.authSetting["scope.address"] == undefined || res.authSetting["scope.address"] == true) {
          Taro.authorize({
            scope: "scope.address",
            success() {
              // 用户已经同意小程序使用录音功能，后续调用 wx.startRecord 接口不会弹窗询问
              Taro.chooseAddress({
                success: function (res) {
                  const params = {
                    address: res.detailInfo,
                    area: res.countyName,
                    city: res.cityName,
                    isDefault: false,
                    mobile: res.telNumber,
                    name: "默认",
                    province: res.provinceName,
                    receiver: res.userName,
                    wxMiniFornId: "the formId is a mock one"
                  };
                  addAddress(params).then(e => {
                    if (e.data.code == 20000) {
                      listAddress().then(even => {
                        setList(even.data.data);
                      });
                    }
                  });
                },
                fail: function (err) {
                  console.log(err || "用户收货地址调取失败");
                }
              });
            }
          });
        } else if (res.authSetting["scope.address"] == false) {
          console.log(88888888)
          Taro.showModal({
            title: '温馨提示',
            content: '您需要授权后，才能使用我的地址功能，是否重新授权',
            confirmColor: '#ff2d4a',
            success(res) {
              if (res.confirm) {
                // 如果用户点了确定，就打开 设置 界面
                Taro.openSetting({
                  success(res) {
                    // 不管是否开启授权，都执行success
                    // 应该根据 res['scope.address'] 是 true 或 false 来确定用户是否同意授权
                    console.log('设置success：', res.authSetting)
                    if (res.authSetting['scope.address'] === true) {
                      // 直接打开收获地址选择界面，让用户选择收获地址
                      Taro.chooseAddress({
                        success(res) {
                          console.log('success', res)
                        },
                        fail(err) {
                          console.log('fail:', err)
                        }
                      })
                    }
                  },
                  fail(err) {
                    console.log('设置fail:', err)
                  }
                })
                console.log('用户点击确定')
              } else if (res.cancel) {
                // 用户点击取消，不需要做任何处理
                // console.log('用户点击取消')
              }
            }
          })
        }
      }
    });
  }
  // async function wxaddlist(params) {
  //   const res = await addAddress(params);
  // }
  // 设置默认
  async function DefaultAddress(id: string) {
    console.log(id);
    const res = await updateDefaultAddress({ id });
    if (res.data.code == 20000) {
      const res1 = await listAddress();
      const address = res1.data.data;
      address.map(item => {
        if (item.isDefault) {
          Taro.setStorageSync("address", item);
        }
      });

      setList(res1.data.data);
    }
  }
  // 去编辑
  function editAdress(id) {
    Taro.navigateTo({ url: "../edit/index?id=" + id });
  }
  return (
    <View className="address-lists">
      {list.map(item => {
        return (
          <View className="address-list" key={item.id}>
            <View
              className="address-list__info"
              onClick={() => {
                selectAddress(item);
              }}
            >
              <View className="address-list__other">
                <Text className="address-list__name">{item.receiver}</Text>
                <Text className="address-list__mobile">{item.mobile}</Text>
              </View>
              <View className="address-list__title">
                {item.province}
                {item.city}
                {item.area}
                {item.address}
                {item.isDefault && (
                  <Text className="address-list__tags--default">默认</Text>
                )}
              </View>
            </View>
            <View
              className="address-list__icon"
              onClick={() => {
                Taro.navigateTo({
                  url: `/pagesCommon/address/edit/index?id=${item.id}`
                });
              }}
            ></View>
            <View className="ed-one">
              <View className="the_list_label">
                <View className="label-a">
                  {item.isDefault ? (
                    <Icon type="success" size="18"></Icon>
                  ) : (
                      <Icon
                        type="circle"
                        size="18"
                        onClick={() => {
                          DefaultAddress(item.id);
                        }}
                      ></Icon>
                    )}

                  <View className="radio-list__radio">默认地址</View>
                </View>
                <View className="ed-two">
                  <View
                    className="qcfont qc-icon-bianji"
                    onClick={() => {
                      editAdress(item.id);
                    }}
                  >
                    <Text className="edit">编辑</Text>
                  </View>
                  <View className="qcfont qc-icon-bianji">
                    <Text
                      className="edit"
                      onClick={() => {
                        apiDeleteAddress(item.id as string);
                      }}
                    >
                      删除
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        );
      })}
      <View className="btn">
        <View
          className="address-lists__fixed--button but-one"
          onClick={() => {
            Taro.navigateTo({
              url: "/pagesCommon/address/edit/index"
            });
          }}
        >
          手动添加
        </View>
        <View
          className="address-lists__fixed--button but-two"
          onClick={onWxAddClick}
        >
          微信添加
        </View>
      </View>
    </View>
  );
}
AddressList.config = {
  navigationBarTitleText: "我的地址"
};
export default AddressList;
