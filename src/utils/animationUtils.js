/**
 * 动画工具函数
 */

// 缓动函数
export const Easing = {
  // 线性
  linear: t => t,
  
  // 二次方缓入
  easeInQuad: t => t * t,
  
  // 二次方缓出
  easeOutQuad: t => t * (2 - t),
  
  // 二次方缓入缓出
  easeInOutQuad: t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
  
  // 三次方缓出
  easeOutCubic: t => (--t) * t * t + 1,
  
  // 正弦缓入缓出
  easeInOutSine: t => -(Math.cos(Math.PI * t) - 1) / 2
}

// 动画管理器
export class AnimationManager {
  constructor() {
    this.animations = new Map()
    this.isRunning = false
    this.lastTime = 0
  }

  // 添加动画
  addAnimation(id, config) {
    const animation = {
      id,
      startTime: Date.now(),
      duration: config.duration || 1000,
      from: config.from,
      to: config.to,
      easing: config.easing || Easing.easeOutQuad,
      onUpdate: config.onUpdate,
      onComplete: config.onComplete,
      delay: config.delay || 0
    }
    
    this.animations.set(id, animation)
    
    if (!this.isRunning) {
      this.start()
    }
  }

  // 移除动画
  removeAnimation(id) {
    this.animations.delete(id)
    if (this.animations.size === 0) {
      this.stop()
    }
  }

  // 开始动画循环
  start() {
    if (this.isRunning) return
    
    this.isRunning = true
    this.lastTime = Date.now()
    this.tick()
  }

  // 停止动画循环
  stop() {
    this.isRunning = false
  }

  // 动画帧更新
  tick() {
    if (!this.isRunning) return

    const currentTime = Date.now()
    const completedAnimations = []

    for (const [id, animation] of this.animations) {
      const elapsed = currentTime - animation.startTime - animation.delay
      
      if (elapsed < 0) continue // 延迟还没结束

      const progress = Math.min(elapsed / animation.duration, 1)
      const easedProgress = animation.easing(progress)
      
      // 计算当前值
      const currentValue = this.interpolate(animation.from, animation.to, easedProgress)
      
      // 更新回调
      if (animation.onUpdate) {
        animation.onUpdate(currentValue, progress)
      }

      // 动画完成
      if (progress >= 1) {
        completedAnimations.push(id)
        if (animation.onComplete) {
          animation.onComplete()
        }
      }
    }

    // 移除完成的动画
    completedAnimations.forEach(id => this.removeAnimation(id))

    if (this.isRunning) {
      requestAnimationFrame(() => this.tick())
    }
  }

  // 插值计算
  interpolate(from, to, progress) {
    if (typeof from === 'number') {
      return from + (to - from) * progress
    }
    
    if (Array.isArray(from)) {
      return from.map((val, index) => val + (to[index] - val) * progress)
    }
    
    if (typeof from === 'object') {
      const result = {}
      for (const key in from) {
        result[key] = from[key] + (to[key] - from[key]) * progress
      }
      return result
    }
    
    return from
  }
}

// 脉冲动画生成器
export class PulseAnimation {
  constructor(options = {}) {
    this.period = options.period || 2000 // 脉冲周期(ms)
    this.minOpacity = options.minOpacity || 0.3
    this.maxOpacity = options.maxOpacity || 0.8
    this.minScale = options.minScale || 1.0
    this.maxScale = options.maxScale || 1.5
    this.startTime = Date.now()
  }

  // 获取当前脉冲状态
  getCurrentState() {
    const elapsed = (Date.now() - this.startTime) % this.period
    const progress = elapsed / this.period
    
    // 使用正弦波产生平滑的脉冲效果
    const sineProgress = (Math.sin(progress * Math.PI * 2 - Math.PI / 2) + 1) / 2
    
    return {
      opacity: this.minOpacity + (this.maxOpacity - this.minOpacity) * sineProgress,
      scale: this.minScale + (this.maxScale - this.minScale) * sineProgress,
      progress: sineProgress
    }
  }

  // 重置脉冲动画
  reset() {
    this.startTime = Date.now()
  }
} 