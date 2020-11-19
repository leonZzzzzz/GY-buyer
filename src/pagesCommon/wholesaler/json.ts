import { IMG_HOST } from '@/config';

export default class DrawImageData {
  palette(user: any, bgUrl: string, QRCodeUrl: string, detail: any, ) {
    return function () {
      const config: any = {
        width: '750rpx',
        height: '1200rpx',
        background: '#ff5433',
        views: [
          // 背景图
          {
            type: 'image',
            url: `${IMG_HOST}${bgUrl}`,
            css: {
              bottom: '0rpx',
              left: '0rpx',
              width: '750rpx',
              height: '1200rpx'
            }
          },
          // 头像
          {
            type: 'image',
            url: user.headImage,
            css: {
              top: '40rpx',
              left: '313rpx',
              width: '120rpx',
              height: '120rpx',
              borderRadius: '60rpx'
            }
          },
          // 用户名
          {
            type: 'text',
            text: `${user.name || user.appellation}`,
            css: [
              {
                top: `190rpx`,
                left: '0rpx',
                width: '750rpx',
                fontSize: '32rpx',
                fontWeight: 'bold',
                color: '#000',
                textAlign: 'center'
              }
            ]
          },
          // 分享语
          {
            type: 'text',
            text: detail.title,
            css: [
              {
                top: `270rpx`,
                left: '120rpx',
                width: '530rpx',
                fontSize: '28rpx',
                color: '#333',
                textAlign: 'center',
                lineHeight: '45rpx',
                maxLines: 2
              }
            ]
          },
          // 店铺名称
          {
            type: 'text',
            text: detail.storeName,
            css: [
              {
                top: `360rpx`,
                left: '100rpx',
                width: '550rpx',
                fontSize: '50rpx',
                fontWeight: 'bold',
                color: '#1bbc3d',
                textAlign: 'center',
                lineHeight: '60rpx',
                maxLines: 2
              }
            ]
          },
          // // 描述
          // {
          //   type: 'text',
          //   text: '● 品质优良，价格美丽，不容错过哦~',
          //   css: [
          //     {
          //       top: `420rpx`,
          //       left: '120rpx',
          //       width: '530rpx',
          //       fontSize: '28rpx',
          //       color: '#666',
          //       textAlign: 'left',
          //       lineHeight: '45rpx',
          //       maxLines: 2
          //     }
          //   ]
          // },
          // {
          //   type: 'text',
          //   text: '● 购买方便，服务到位，省时省力省心购！',
          //   css: [
          //     {
          //       top: `470rpx`,
          //       left: '120rpx',
          //       width: '530rpx',
          //       fontSize: '28rpx',
          //       color: '#666',
          //       textAlign: 'left',
          //       lineHeight: '45rpx',
          //       maxLines: 2
          //     }
          //   ]
          // },
          // 店铺介绍
          {
            type: 'text',
            text: detail.storeInfo,
            css: [
              {
                top: `480rpx`,
                left: '150rpx',
                width: '470rpx',
                fontSize: '28rpx',
                color: '#666',
                textAlign: 'left',
                lineHeight: '45rpx',
                maxLines: 2
              }
            ]
          },
          // {
          //   type: 'rect',
          //   css: {
          //     top: '770rpx',
          //     left: '275rpx',
          //     width: '200rpx',
          //     height: '200rpx',
          //     color: '#fff'
          //   }
          // },
          {
            type: 'image',
            url: `${IMG_HOST}${QRCodeUrl}`,
            css: {
              top: '740rpx',
              left: '260rpx',
              width: '230rpx',
              height: '230rpx'
            }
          },
        ]
      };
      return config;
    }()
  }
}
