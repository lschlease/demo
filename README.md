# Vue3 + PIXI.js 实时折线图项目

🚀 基于 Vue3 和 PIXI.js 的高性能实时数据可视化项目，实现平滑动画效果和端点脉冲的折线图。

## ✨ 特性

- 📊 **实时数据展示** - 动态更新的折线图显示
- 🎨 **平滑动画** - 使用贝塞尔曲线实现平滑折线效果
- 💫 **端点脉冲** - 折线端点具有缓慢脉冲动画
- ⏰ **时间同步** - X轴时间显示与数据更新同步
- 🎮 **交互控制** - 完整的控制面板支持多种配置
- 📱 **响应式设计** - 适配不同屏幕尺寸
- ⚡ **高性能渲染** - 基于 PIXI.js WebGL 加速

## 🛠️ 技术栈

- **Vue 3** - 现代前端框架
- **PIXI.js** - 高性能 2D WebGL 渲染引擎
- **Vite** - 快速构建工具
- **JavaScript ES6+** - 现代 JavaScript 语法

## 📦 安装

```bash
# 克隆项目
git clone <项目地址>
cd vue3-pixi-realtime-chart

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

## 🎯 功能说明

### 数据生成模式
- **正弦波模式** - 平滑的波形数据
- **随机游走** - 随机但连续的数据变化
- **趋势线** - 带趋势的数据变化

### 控制面板功能
- 开始/暂停数据生成
- 切换数据生成模式
- 调整更新频率 (100ms - 3000ms)
- 更改线条颜色
- 实时显示当前数值和数据点数量

### 动画效果
- **平滑折线** - 使用三次贝塞尔曲线插值
- **端点脉冲** - 2.5秒周期的脉冲动画效果
- **数据过渡** - 新数据点的平缓进入动画
- **响应式更新** - 流畅的 60fps 渲染

## 📁 项目结构

```
src/
├── components/
│   ├── RealtimeChart.vue     # 主图表组件
│   ├── ChartCanvas.vue       # PIXI.js 画布组件
│   └── ControlPanel.vue      # 控制面板组件
├── utils/
│   ├── chartRenderer.js      # 图表渲染核心
│   ├── dataGenerator.js      # 数据生成器
│   └── animationUtils.js     # 动画工具函数
├── App.vue                   # 根组件
└── main.js                   # 应用入口
```

## 🎨 自定义配置

### 图表样式配置
```javascript
const chartOptions = {
  lineColor: 0x00D2FF,        // 线条颜色
  lineWidth: 3,               // 线条宽度
  pointColor: 0xFF6B6B,       // 数据点颜色
  maxDataPoints: 60,          // 最大数据点数
  backgroundColor: 0x1a1a2e   // 背景颜色
}
```

### 数据生成器配置
```javascript
const generatorOptions = {
  mode: 'sineWave',           // 生成模式
  baseValue: 50,              // 基准值
  amplitude: 25,              // 振幅
  frequency: 0.02,            // 频率
  noiseLevel: 3               // 噪声级别
}
```

## 🚀 性能优化

- **WebGL 渲染** - 利用 GPU 加速图形渲染
- **对象池** - 复用图形对象减少内存分配
- **批量渲染** - 合并绘制调用优化性能
- **数据限制** - 控制数据点数量避免内存溢出
- **动画优化** - 使用 requestAnimationFrame 优化动画循环

## 📊 浏览器兼容性

- Chrome 51+
- Firefox 45+
- Safari 10+
- Edge 79+

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

## 🎉 演示

启动项目后访问 `http://localhost:3000` 查看实时折线图演示。

---

**享受数据可视化的乐趣！** 🎨📈 