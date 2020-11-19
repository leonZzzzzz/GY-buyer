import Taro from "@tarojs/taro";

export default function checkAppUpdate(): void {
  const updateManager = Taro.getUpdateManager();

  updateManager.onCheckForUpdate(function (res) {
    // 请求完新版本信息的回调
    // console.log("是否有更新：", res.hasUpdate);
  });

  updateManager.onUpdateReady(function () {
    Taro.showModal({
      title: "更新提示",
      content: "新版本已经准备好，是否重启应用？",
      success(res) {
        if (res.confirm) {
          updateManager.applyUpdate();
        }
      }
    });
  });

  updateManager.onUpdateFailed(function () {
    console.log("程序更新失败，请稍后重试");
  });
}
