/**
 * 数据生成器 - 模拟实时数据
 */

export class DataGenerator {
  constructor(options = {}) {
    this.baseValue = options.baseValue || 50
    this.amplitude = options.amplitude || 30
    this.frequency = options.frequency || 0.03
    this.noiseLevel = options.noiseLevel || 5
    
    this.time = 0
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
    // 使用正弦波生成数据
    const value = this.baseValue + 
                  Math.sin(this.time * this.frequency) * this.amplitude +
                  (Math.random() - 0.5) * this.noiseLevel

    const dataPoint = {
      time: Date.now(),
      value: value,
      timestamp: this.time
    }

    this.time++
    
    // 通知所有回调
    this.callbacks.forEach(callback => callback(dataPoint))
    
    return dataPoint
  }

  // 重置生成器
  reset() {
    this.time = 0
  }
} 