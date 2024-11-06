'use strict';

// Import needed libraries
import bcrypt from 'bcryptjs';// 用于加密和验证密码的bcrypt库
import { Writable } from 'stream';// Node.js流模块中的Writable类，用于自定义输出流
import readline from 'readline';// 用于逐行读取输入的readline模块

// Function to generate hash  生成哈希的函数
const generateHash = async (password) => {
  try {
    const salt = await bcrypt.genSalt(12); // 生成加盐值，强度为12
    const hash = await bcrypt.hash(password, salt); // 使用密码和盐值生成哈希
    // eslint-disable-next-line no-console
    console.log(`PASSWORD_HASH='${hash}'`);
  } catch (error) {
    throw new Error(`Failed to generate hash : ${error}`);
  }
};

// Function to compare password with hash  比较密码与哈希
const comparePassword = async (password, hash) => {
  try {
    const match = await bcrypt.compare(password, hash);
    if (match) {
    // eslint-disable-next-line no-console
      console.log('Password matches the hash !');
    } else {
    // eslint-disable-next-line no-console
      console.log('Password does not match the hash.');
    }
  } catch (error) {
    throw new Error(`Failed to compare password and hash : ${error}`);
  }
};
// 从标准输入读取密码
const readStdinPassword = () => {
  return new Promise((resolve) => {
    process.stdout.write('Enter your password: ');

    const rl = readline.createInterface({
      input: process.stdin,
      output: new Writable({
        write(_chunk, _encoding, callback) {
          callback();
        },
      }),
      terminal: true,
    });

    rl.question('', (answer) => {
      rl.close();
      // Print a new line after password prompt
      process.stdout.write('\n');
      resolve(answer);
    });
  });
};
// 自执行异步函数，处理命令行参数
(async () => {
  try {
    // Retrieve command line arguments
    const args = process.argv.slice(2); // Ignore the first two arguments
    if (args.length > 2) {
      throw new Error('Usage : wgpw [YOUR_PASSWORD] [HASH]');
    }

    const [password, hash] = args;
    if (password && hash) {
      await comparePassword(password, hash);
    } else if (password) {
      await generateHash(password);
    } else {
      const password = await readStdinPassword();
      await generateHash(password);
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
    // eslint-disable-next-line no-process-exit
    process.exit(1);//使用错误代码退出进程
  }
})();
