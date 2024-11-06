'use strict';
// 定义一个自定义错误类ServerError，继承自Error基类
module.exports = class ServerError extends Error {

  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
  }

};
