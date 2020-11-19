import { IMG_HOST } from '@/config';

export default class drawImageData {
  palette(user: any, bgUrl: string, QRCodeUrl: string, detail: any,) {
    
    return function() {
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
            text: detail.shareText,
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
  
          // 商品图片
          {
            type: 'image',
            url: `${IMG_HOST}${detail.iconUrl}`,
            css: {
              top: '360rpx',
              left: '260rpx',
              width: '230rpx',
              height: '230rpx'
            }
          },
  
          // 商品名称
          {
            type: 'text',
            text: detail.name,
            css: [
              {
                top: `620rpx`,
                left: '120rpx',
                width: '530rpx',
                fontSize: '32rpx',
                fontWeight: 'bold',
                color: '#000',
                textAlign: 'left',
                lineHeight: '45rpx',
                maxLines: 1
              }
            ]
          },
          // 商品金额
          {
            type: 'text',
            text: '￥'+detail.price,
            css: [
              {
                top: `680rpx`,
                left: '120rpx',
                width: '530rpx',
                fontSize: '32rpx',
                color: '#FF840B',
                textAlign: 'left',
                lineHeight: '45rpx',
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
              top: '780rpx',
              left: '120rpx',
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
