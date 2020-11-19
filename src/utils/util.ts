/* 工具类函数 */
import Taro from '@tarojs/taro';

let Utils = {
  // 相册授权验证
  async checkAuthorizeWritePhotosAlbum() {
    try {
      const res = await Taro.getSetting();
      console.log('getSetting', res);
      if (!res.authSetting['scope.writePhotosAlbum']) {
        const modalRes = await Taro.showModal({
          title: '需要相册授权',
          content: '在设置中打开相册授权，才能保存图片到相册中',
          showCancel: true,
          cancelText: '取消',
          confirmText: '确定',
          confirmColor: '#294A7B'
        });
        if (modalRes.confirm) {
          Taro.openSetting();
        }
      } else {
        Taro.showToast({
          title: '保存失败，请重试',
          icon: 'none'
        });
      }
    } catch (err) {
      console.error('getSetting error', err);
    }
  },
}

export default Utils;