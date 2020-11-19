import Taro from "@tarojs/taro";
import { baseUrl } from "@/config";

function request(params, method: Method = "GET", contentType: string) {
  const { url, data } = params;
  const options = {
    url: baseUrl + url,
    data,
    method,
    header: {
      "content-type": contentType
    },
    success: (res => {
      console.log('api接口====>' + url)
      console.log('请求参数===>', data)
      console.log('响应数据===>', res.data)
    })
  };
  return Taro.request(options);
}

export default {
  get(url: string, data?: any) {
    return request({ url, data }, "GET", "application/json");
  },
  post(url: string, data?: any) {
    return request({ url, data }, "POST", "application/x-www-form-urlencoded");
  },
  json(url: string, data?: any) {
    return request({ url, data }, "POST", "application/json");
  },
  upload(url: string, temFilePath: string, formData: any) {
    return new Promise((resolve, reject) => {
      Taro.uploadFile({
        url: baseUrl + url,
        filePath: temFilePath,
        name: "file",
        formData: formData
      })
        .then((res: any) => {
          if (typeof res.data === "string") res.data = JSON.parse(res.data);
          if (res.data.code === 20000) {
            resolve(res);
          } else {
            Taro.showToast({ title: res.data.message });
            reject(res);
          }
        })
        .catch(err => {
          console.log("uploadFile err ", err.data);
          reject(err);
        });
    });
  }
};
