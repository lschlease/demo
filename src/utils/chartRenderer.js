/**
 * PIXI.js 图表渲染器
 */

import * as PIXI from 'pixi.js'
import { AnimationManager, PulseAnimation, BezierCurve, Easing } from './animationUtils.js'

export class ChartRenderer {
  constructor(container, options = {}) {
    this.container = container
    this.width = options.width || 800
    this.height = options.height || 400
    this.padding = options.padding || { top: 20, right: 20, bottom: 60, left: 60 }
    this.maxDataPoints = options.maxDataPoints || 50
    
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
    
    // 数据范围
    this.valueRange = { min: 0, max: 100 }
    this.timeRange = { start: Date.now(), duration: 60000 } // 显示60秒的数据
    
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
      maxOpacity: 0.9,
      minScale: 1.0,
      maxScale: 1.8
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

    // Y轴标签
    for (let i = 0; i <= 5; i++) {
      const value = this.valueRange.min + (this.valueRange.max - this.valueRange.min) * (1 - i / 5)
      const y = this.chartArea.y + (this.chartArea.height / 5) * i
      
      const text = new PIXI.Text(value.toFixed(0), {
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

  // 更新时间标签
  updateTimeLabels() {
    // 移除旧的时间标签
    this.textLayer.children = this.textLayer.children.filter(child => !child.isTimeLabel)

    const now = Date.now()
    for (let i = 0; i <= 5; i++) {
      const timeOffset = (this.timeRange.duration / 5) * (5 - i)
      const time = new Date(now - timeOffset)
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

    // 更新时间范围
    if (this.dataPoints.length > 0) {
      const latestTime = this.dataPoints[this.dataPoints.length - 1].time
      this.timeRange.start = latestTime - this.timeRange.duration
    }

    // 自动调整值范围
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
    const padding = (max - min) * 0.1 || 5

    this.valueRange.min = Math.max(0, min - padding)
    this.valueRange.max = Math.min(100, max + padding)
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
    const x = this.chartArea.x + 
              ((dataPoint.time - this.timeRange.start) / this.timeRange.duration) * 
              this.chartArea.width

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

    // 过滤可见数据点
    const now = Date.now()
    const visiblePoints = this.dataPoints.filter(p => 
      p.time >= now - this.timeRange.duration
    )

    if (visiblePoints.length < 2) return

    // 转换为屏幕坐标
    const screenPoints = visiblePoints.map(p => this.dataToScreen(p))

    // 绘制平滑折线
    this.drawSmoothLine(screenPoints)
    
    // 绘制端点脉冲效果
    if (visiblePoints.length > 0) {
      this.drawEndPointPulse(visiblePoints[visiblePoints.length - 1])
    }
  }

  // 绘制平滑折线
  drawSmoothLine(points) {
    if (points.length < 2) return
    
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

  // 绘制端点脉冲效果
  drawEndPointPulse(endPoint) {
    const screenPos = this.dataToScreen(endPoint)
    const pulseState = this.pulseAnimation.getCurrentState()

    // 外圈脉冲 - 使用线条颜色
    const outerPulse = new PIXI.Graphics()
    outerPulse.beginFill(this.lineColor, pulseState.opacity * 0.3)
    outerPulse.drawCircle(0, 0, 12 * pulseState.scale)
    outerPulse.endFill()
    outerPulse.x = screenPos.x
    outerPulse.y = screenPos.y

    // 内圈核心 - 使用线条颜色
    const innerCore = new PIXI.Graphics()
    innerCore.beginFill(this.lineColor, 0.9)
    innerCore.drawCircle(0, 0, 6)
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