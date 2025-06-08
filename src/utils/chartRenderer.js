/**
 * PIXI.js 图表渲染器
 */

import * as PIXI from 'pixi.js'
import { AnimationManager, PulseAnimation, Easing } from './animationUtils.js'

export class ChartRenderer {
  constructor(container, options = {}) {
    this.container = container
    this.width = options.width || 800
    this.height = options.height || 400
    this.padding = options.padding || { top: 20, right: 20, bottom: 60, left: 60 }
    this.maxDataPoints = options.maxDataPoints || 150
    
    // 图表配置
    this.lineColor = options.lineColor || 0x00D2FF
    this.lineWidth = options.lineWidth || 1
    this.pointColor = options.pointColor || 0xFF6B6B
    this.gridColor = options.gridColor || 0x333333
    this.textColor = options.textColor || 0xFFFFFF
    
    // 数据存储
    this.dataPoints = []
    this.animatedPoints = []
    
    // 坐标系统
    this.chartArea = {
      x: this.padding.left,
      y: this.padding.top,
      width: this.width - this.padding.left - this.padding.right,
      height: this.height - this.padding.top - this.padding.bottom
    }
    
    // 数据范围 - 动态调整
    this.valueRange = { min: 0, max: 100 }
    this.timeRange = { start: Date.now(), duration: 30000 } // 显示30秒的数据，更密集
    
    this.init()
  }

  // 初始化PIXI应用
  init() {
    // 创建PIXI应用
    this.app = new PIXI.Application({
      width: this.width,
      height: this.height,
      backgroundColor: 0x1a1a2e,
      antialias: true,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true
    })

    // 添加到容器
    this.container.appendChild(this.app.view)

    // 创建图层
    this.backgroundLayer = new PIXI.Container()
    this.gridLayer = new PIXI.Container()
    this.chartLayer = new PIXI.Container()
    this.pointLayer = new PIXI.Container()
    this.textLayer = new PIXI.Container()

    this.app.stage.addChild(this.backgroundLayer)
    this.app.stage.addChild(this.gridLayer)
    this.app.stage.addChild(this.chartLayer)
    this.app.stage.addChild(this.pointLayer)
    this.app.stage.addChild(this.textLayer)

    // 创建动画管理器
    this.animationManager = new AnimationManager()
    this.pulseAnimation = new PulseAnimation({
      period: 2500,
      minOpacity: 0.4,
      maxOpacity: 0.8,
      minScale: 0.8,     // 减小最小缩放
      maxScale: 1.3      // 减小最大缩放，让端点更小
    })

    // 初始化图表元素
    this.initChart()
    
    // 启动渲染循环
    this.app.ticker.add(() => this.render())
  }

  // 初始化图表元素
  initChart() {
    this.drawBackground()
    this.drawGrid()
    this.drawAxes()
  }

  // 绘制背景
  drawBackground() {
    const bg = new PIXI.Graphics()
    bg.beginFill(0x0F0F23, 0.8)
    bg.drawRoundedRect(
      this.chartArea.x - 10,
      this.chartArea.y - 10,
      this.chartArea.width + 20,
      this.chartArea.height + 20,
      10
    )
    bg.endFill()
    this.backgroundLayer.addChild(bg)
  }

  // 绘制网格
  drawGrid() {
    this.gridLayer.removeChildren()
    
    const grid = new PIXI.Graphics()
    grid.lineStyle(1, this.gridColor, 0.3)

    // 水平网格线
    for (let i = 0; i <= 10; i++) {
      const y = this.chartArea.y + (this.chartArea.height / 10) * i
      grid.moveTo(this.chartArea.x, y)
      grid.lineTo(this.chartArea.x + this.chartArea.width, y)
    }

    // 垂直网格线
    for (let i = 0; i <= 10; i++) {
      const x = this.chartArea.x + (this.chartArea.width / 10) * i
      grid.moveTo(x, this.chartArea.y)
      grid.lineTo(x, this.chartArea.y + this.chartArea.height)
    }

    this.gridLayer.addChild(grid)
  }

  // 绘制坐标轴
  drawAxes() {
    this.textLayer.removeChildren()

    // Y轴标签 - 根据当前数据范围动态调整
    for (let i = 0; i <= 5; i++) {
      const value = this.valueRange.max - ((this.valueRange.max - this.valueRange.min) / 5) * i
      const y = this.chartArea.y + (this.chartArea.height / 5) * i
      
      const text = new PIXI.Text(value.toFixed(1), {
        fontSize: 12,
        fill: this.textColor,
        fontFamily: 'Arial'
      })
      text.anchor.set(1, 0.5)
      text.x = this.chartArea.x - 10
      text.y = y
      this.textLayer.addChild(text)
    }

    // X轴时间标签
    this.updateTimeLabels()
  }

  // 更新时间标签 - 当前时间在四分之三处
  updateTimeLabels() {
    // 移除旧的时间标签
    this.textLayer.children = this.textLayer.children.filter(child => !child.isTimeLabel)

    // 使用实际的时间范围
    const startTime = this.timeRange.start
    const endTime = this.timeRange.end || (this.timeRange.start + this.timeRange.duration)
    const timeSpan = endTime - startTime
    
    for (let i = 0; i <= 5; i++) {
      // 计算每个刻度对应的时间
      const timeAtPosition = startTime + (timeSpan / 5) * i
      const time = new Date(timeAtPosition)
      const x = this.chartArea.x + (this.chartArea.width / 5) * i
      
      const text = new PIXI.Text(this.formatTime(time), {
        fontSize: 10,
        fill: this.textColor,
        fontFamily: 'Arial'
      })
      text.anchor.set(0.5, 0)
      text.x = x
      text.y = this.chartArea.y + this.chartArea.height + 10
      text.isTimeLabel = true
      this.textLayer.addChild(text)
    }
  }

  // 格式化时间显示
  formatTime(date) {
    return date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  // 添加数据点
  addDataPoint(dataPoint) {
    this.dataPoints.push(dataPoint)
    
    // 限制数据点数量
    if (this.dataPoints.length > this.maxDataPoints) {
      this.dataPoints.shift()
    }

    // 更新时间范围 - 确保当前时间在四分之三处
    if (this.dataPoints.length > 0) {
      const latestTime = this.dataPoints[this.dataPoints.length - 1].time
      const timeSpan = this.timeRange.duration
      // 调整时间范围，确保最新数据在四分之三处显示
      this.timeRange.start = latestTime - timeSpan * 0.75
      this.timeRange.end = latestTime + timeSpan * 0.25
    }

    // 恢复自动调整值范围
    this.updateValueRange()
    
    // 添加动画
    this.animateNewPoint(dataPoint)
  }

  // 更新值范围
  updateValueRange() {
    if (this.dataPoints.length === 0) return

    const values = this.dataPoints.map(p => p.value)
    const min = Math.min(...values)
    const max = Math.max(...values)
    const padding = (max - min) * 0.1 || 10 // 增加一些边距

    this.valueRange.min = min - padding
    this.valueRange.max = max + padding
  }

  // 动画添加新点
  animateNewPoint(dataPoint) {
    const screenPos = this.dataToScreen(dataPoint)
    
    // 创建临时动画点
    const animatedPoint = {
      ...dataPoint,
      screenX: screenPos.x,
      screenY: this.chartArea.y + this.chartArea.height, // 从底部开始
      targetY: screenPos.y,
      opacity: 0
    }

    this.animatedPoints.push(animatedPoint)

    // 添加进入动画
    this.animationManager.addAnimation(`point_${dataPoint.time}`, {
      duration: 500,
      from: { y: animatedPoint.screenY, opacity: 0 },
      to: { y: animatedPoint.targetY, opacity: 1 },
      easing: Easing.easeOutCubic,
      onUpdate: (value) => {
        animatedPoint.screenY = value.y
        animatedPoint.opacity = value.opacity
      }
    })
  }

  // 数据坐标转屏幕坐标
  dataToScreen(dataPoint) {
    // 确保使用正确的时间范围
    const timeRange = this.timeRange.end ? 
      (this.timeRange.end - this.timeRange.start) : 
      this.timeRange.duration

    const x = this.chartArea.x + 
              ((dataPoint.time - this.timeRange.start) / timeRange) * 
              this.chartArea.width

    // 使用动态范围映射
    const y = this.chartArea.y + this.chartArea.height - 
              ((dataPoint.value - this.valueRange.min) / 
               (this.valueRange.max - this.valueRange.min)) * this.chartArea.height

    return { x, y }
  }

  // 渲染帧
  render() {
    // 清除图表层
    this.chartLayer.removeChildren()
    this.pointLayer.removeChildren()

    // 更新时间标签
    if (Math.floor(Date.now() / 1000) % 2 === 0) { // 每2秒更新一次
      this.updateTimeLabels()
    }

    // 过滤可见数据点 - 修复时间范围逻辑
    if (this.dataPoints.length === 0) return

    // 确保时间范围正确
    const latestTime = this.dataPoints[this.dataPoints.length - 1].time
    const timeSpan = this.timeRange.duration
    const startTime = latestTime - timeSpan * 0.75
    const endTime = latestTime + timeSpan * 0.25
    
    // 更新时间范围对象
    this.timeRange.start = startTime
    this.timeRange.end = endTime
    
    // 获取所有在时间范围内的数据点
    let visiblePoints = this.dataPoints.filter(p => 
      p.time >= startTime && p.time <= endTime
    )

    // 如果数据点少于2个，使用所有可用数据点
    if (visiblePoints.length < 2) {
      visiblePoints = this.dataPoints.slice(-Math.min(10, this.dataPoints.length))
    }

    if (visiblePoints.length < 2) return

    // 按时间排序确保连续
    visiblePoints.sort((a, b) => a.time - b.time)

    // 转换为屏幕坐标
    const screenPoints = visiblePoints.map(p => this.dataToScreen(p))

    // 绘制折线
    this.drawSmoothLine(screenPoints)
    
    // 绘制端点脉冲效果
    if (visiblePoints.length > 0) {
      this.drawEndPointPulse(visiblePoints[visiblePoints.length - 1])
    }
  }

  // 绘制折线
  drawSmoothLine(points) {
    if (points.length < 2) return
    
    // 先绘制阴影区域
    this.drawShadowArea(points)
    
    // 再绘制折线
    const line = new PIXI.Graphics()
    
    // 设置线条样式 - 棱角分明
    line.lineStyle(this.lineWidth, this.lineColor, 0.9)
    
    // 直接连接数据点，不使用平滑曲线
    line.moveTo(points[0].x, points[0].y)
    for (let i = 1; i < points.length; i++) {
      line.lineTo(points[i].x, points[i].y)
    }

    this.chartLayer.addChild(line)
  }

  // 绘制阴影区域
  drawShadowArea(points) {
    if (points.length < 2) return

    const shadow = new PIXI.Graphics()
    
    // 设置填充颜色，与折线颜色一致，透明度0.2
    shadow.beginFill(this.lineColor, 0.2)
    
    // 从第一个点开始
    shadow.moveTo(points[0].x, points[0].y)
    
    // 连接所有折线点
    for (let i = 1; i < points.length; i++) {
      shadow.lineTo(points[i].x, points[i].y)
    }
    
    // 连接到底部形成封闭区域
    const bottomY = this.chartArea.y + this.chartArea.height
    shadow.lineTo(points[points.length - 1].x, bottomY) // 最后一点到底部
    shadow.lineTo(points[0].x, bottomY) // 底部连线
    shadow.lineTo(points[0].x, points[0].y) // 回到起始点
    
    shadow.endFill()
    
    // 将阴影添加到图表层，在折线之前
    this.chartLayer.addChild(shadow)
  }

  // 绘制端点脉冲效果
  drawEndPointPulse(endPoint) {
    const screenPos = this.dataToScreen(endPoint)
    const pulseState = this.pulseAnimation.getCurrentState()

    // 外圈脉冲 - 使用线条颜色，减小尺寸
    const outerPulse = new PIXI.Graphics()
    outerPulse.beginFill(this.lineColor, pulseState.opacity * 0.3)
    outerPulse.drawCircle(0, 0, 8 * pulseState.scale) // 从12减小到8
    outerPulse.endFill()
    outerPulse.x = screenPos.x
    outerPulse.y = screenPos.y

    // 内圈核心 - 使用线条颜色，减小尺寸
    const innerCore = new PIXI.Graphics()
    innerCore.beginFill(this.lineColor, 0.9)
    innerCore.drawCircle(0, 0, 4) // 从6减小到4
    innerCore.endFill()
    innerCore.x = screenPos.x
    innerCore.y = screenPos.y

    this.pointLayer.addChild(outerPulse)
    this.pointLayer.addChild(innerCore)
  }

  // 调整大小
  resize(width, height) {
    this.width = width
    this.height = height
    this.chartArea.width = width - this.padding.left - this.padding.right
    this.chartArea.height = height - this.padding.top - this.padding.bottom
    
    this.app.renderer.resize(width, height)
    this.initChart()
  }

  // 销毁渲染器
  destroy() {
    this.animationManager.stop()
    this.app.destroy(true)
  }
} 