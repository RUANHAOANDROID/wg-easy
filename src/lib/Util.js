'use strict';

// 引入child_process模块，用于执行外部命令行指令
const childProcess = require('child_process');

// 定义工具类，包含一些常用的方法
module.exports = class Util {
  //验证一个字符串是否是有效的IPV4地址
  static isValidIPv4(str) {
    const blocks = str.split('.');
    if (blocks.length !== 4) return false;

    for (let value of blocks) {
      value = parseInt(value, 10);
      if (Number.isNaN(value)) return false;
      if (value < 0 || value > 255) return false;
    }

    return true;
  }
  // 静态方法：将一个函数包装为一个返回Promise的方法
  static promisify(fn) {
    // eslint-disable-next-line func-names
    return function(req, res) {
      // 使用Promise封装异步函数，处理请求(req)和响应(res)
      Promise.resolve().then(async () => fn(req, res))
        .then((result) => {
          if (res.headersSent) return;// 如果响应头已发送，则直接返回

          if (typeof result === 'undefined') {
            return res
              .status(204)// 如果结果未定义，则返回204状态码表示无内容
              .end();
          }
          // 合法返回200状态码并发送结果为JSON格式
          return res
            .status(200)
            .json(result);
        })
        .catch((error) => {
          if (typeof error === 'string') {// 如果错误为字符串，则转换为Error对象
            error = new Error(error);
          }

          // eslint-disable-next-line no-console
          console.error(error);//// 在控制台打印错误信息

          return res
            .status(error.statusCode || 500)// 返回错误状态码，默认为500
            .json({
              error: error.message || error.toString(),
              stack: error.stack,// 返回错误堆栈信息
            });
        });
    };
  }
// 执行一个外部命令行指令
  static async exec(cmd, {
    log = true,// 默认打印命令行信息
  } = {}) {
    if (typeof log === 'string') {
      // eslint-disable-next-line no-console
      console.log(`$ ${log}`);// 如果log为字符串，则打印该字符串
    } else if (log === true) {
      // eslint-disable-next-line no-console
      console.log(`$ ${cmd}`);// 否则打印命令行指令
    }

    if (process.platform !== 'linux') {
      return '';
    }
    // 返回一个Promise，执行命令行指令
    return new Promise((resolve, reject) => {
      childProcess.exec(cmd, {
        shell: 'bash',// 使用bash作为shell
      }, (err, stdout) => {
        if (err) return reject(err);// 如果出错，则reject错误
        return resolve(String(stdout).trim());// 否则返回命令行输出，去除多余空格
      });
    });
  }

};
