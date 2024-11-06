/** @type {import('tailwindcss').Config} */

'use strict';

module.exports = {
  // 配置暗模式，使用自定义选择器触发暗模式
  darkMode: 'selector',
  // 指定需要扫描以生成样式的文件路径
  content: ['./www/**/*.{html,js}'],
  theme: {
    // 配置响应式断点
    screens: {
      xxs: '450px', // 自定义的超小屏幕断点
      xs: '576px',  // 超小屏幕断点
      sm: '640px',  // 小屏幕断点
      md: '768px',  // 中等屏幕断点
      lg: '1024px', // 大屏幕断点
      xl: '1280px', // 超大屏幕断点
      '2xl': '1536px', // 特大屏幕断点
    },
  },
  plugins: [
    // 添加自定义插件，用于处理禁用状态的样式
    function addDisabledClass({addUtilities}) {
      const newUtilities = {
        '.is-disabled': {
          opacity: '0.25', // 禁用状态下设置透明度为 0.25
          cursor: 'default', // 禁用状态下使用默认鼠标样式
        },
      };
      addUtilities(newUtilities); // 添加定义的样式
    },
  ],
};
