/**
 * 数据生成器 - 模拟实时数据
 */

export class DataGenerator {
  constructor(options = {}) {
    this.mode = options.mode || 'sineWave' // 'sineWave', 'randomWalk', 'trend'
    this.baseValue = options.baseValue || 50
    this.amplitude = options.amplitude || 30
    this.frequency = options.frequency || 0.03 // 适中的频率
    this.noiseLevel = options.noiseLevel || 5 // 增加噪声，让变化更明显
    this.trend = options.trend || 0.02
    
    this.time = 0
    this.lastValue = this.baseValue
    this.callbacks = []
  }

  // 添加数据更新回调
  onDataUpdate(callback) {
    this.callbacks.push(callback)
  }

  // 移除回调
  removeCallback(callback) {
    const index = this.callbacks.indexOf(callback)
    if (index > -1) {
      this.callbacks.splice(index, 1)
    }
  }

  // 生成下一个数据点
  generateNext() {
    let value

    switch (this.mode) {
      case 'sineWave':
        value = this.baseValue + 
                Math.sin(this.time * this.frequency) * this.amplitude +
                (Math.random() - 0.5) * this.noiseLevel
        break
        
      case 'randomWalk':
        const change = (Math.random() - 0.5) * 6  // 增加随机游走的变化幅度
        this.lastValue += change
        // 防止值过度偏离基准值
        if (this.lastValue > this.baseValue + this.amplitude) {
          this.lastValue -= Math.abs(change)
        } else if (this.lastValue < this.baseValue - this.amplitude) {
          this.lastValue += Math.abs(change)
        }
        value = this.lastValue + (Math.random() - 0.5) * this.noiseLevel
        break
        
      case 'trend':
        value = this.baseValue + 
                this.time * this.trend +
                Math.sin(this.time * this.frequency * 3) * (this.amplitude * 0.5) +
                (Math.random() - 0.5) * this.noiseLevel
        break
        
      default:
        value = this.baseValue + (Math.random() - 0.5) * this.amplitude
    }

    const dataPoint = {
      time: Date.now(),
      value: value, // 不再限制范围，让数据自由波动
      timestamp: this.time
    }

    this.time++
    
    // 通知所有回调
    this.callbacks.forEach(callback => callback(dataPoint))
    
    return dataPoint
  }

  // 设置生成模式
  setMode(mode) {
    this.mode = mode
  }

  // 重置生成器
  reset() {
    this.time = 0
    this.lastValue = this.baseValue
  }
} 