<template>
  <div class="control-panel">
    <div class="controls-grid">
      <!-- 数据生成控制 -->
      <div class="control-group">
        <label>数据生成</label>
        <button 
          @click="toggleDataGeneration" 
          :class="['btn', isGenerating ? 'btn-stop' : 'btn-start']"
        >
          {{ isGenerating ? '暂停' : '开始' }}
        </button>
      </div>

      <!-- 数据模式选择 -->
      <div class="control-group">
        <label>数据模式</label>
        <select @change="changeDataMode" v-model="currentMode" class="select">
          <option value="sineWave">正弦波</option>
          <option value="randomWalk">随机游走</option>
          <option value="trend">趋势线</option>
        </select>
      </div>

      <!-- 更新频率 -->
      <div class="control-group">
        <label>更新频率: {{ updateInterval }}ms</label>
        <input 
          type="range" 
          min="100" 
          max="3000" 
          step="100"
          v-model="updateInterval"
          @input="changeUpdateInterval"
          class="slider"
        />
      </div>

      <!-- 线条颜色 -->
      <div class="control-group">
        <label>线条颜色</label>
        <div class="color-options">
          <button 
            v-for="color in colorOptions" 
            :key="color.value"
            @click="changeLineColor(color.value)"
            :class="['color-btn', { active: currentColor === color.value }]"
            :style="{ backgroundColor: color.hex }"
          ></button>
        </div>
      </div>
    </div>

    <!-- 数据信息 -->
    <div class="data-info">
      <div class="info-item">
        <span class="label">当前值:</span>
        <span class="value">{{ currentValue.toFixed(2) }}</span>
      </div>
      <div class="info-item">
        <span class="label">数据点数:</span>
        <span class="value">{{ dataPointCount }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'

export default {
  name: 'ControlPanel',
  props: {
    isGenerating: Boolean,
    currentValue: Number,
    dataPointCount: Number
  },
  emits: ['toggle-generation', 'change-mode', 'change-interval', 'change-color'],
  setup(props, { emit }) {
    const currentMode = ref('sineWave')
    const updateInterval = ref(1000)
    const currentColor = ref(0x00D2FF)

    const colorOptions = [
      { name: '蓝色', value: 0x00D2FF, hex: '#00D2FF' },
      { name: '绿色', value: 0x00FF88, hex: '#00FF88' },
      { name: '红色', value: 0xFF6B6B, hex: '#FF6B6B' },
      { name: '紫色', value: 0xA855F7, hex: '#A855F7' },
      { name: '橙色', value: 0xFF9500, hex: '#FF9500' }
    ]

    const toggleDataGeneration = () => {
      emit('toggle-generation')
    }

    const changeDataMode = () => {
      emit('change-mode', currentMode.value)
    }

    const changeUpdateInterval = () => {
      emit('change-interval', parseInt(updateInterval.value))
    }

    const changeLineColor = (color) => {
      currentColor.value = color
      emit('change-color', color)
    }

    return {
      currentMode,
      updateInterval,
      currentColor,
      colorOptions,
      toggleDataGeneration,
      changeDataMode,
      changeUpdateInterval,
      changeLineColor
    }
  }
}
</script>

<style scoped>
.control-panel {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 20px;
  color: white;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

.panel-header h3 {
  margin: 0 0 20px 0;
  font-size: 18px;
  font-weight: 600;
  color: #00D2FF;
}

.controls-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.control-group label {
  font-size: 14px;
  font-weight: 500;
  color: #E2E8F0;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-start {
  background: linear-gradient(45deg, #00D2FF, #3F83F8);
  color: white;
}

.btn-stop {
  background: linear-gradient(45deg, #FF6B6B, #F87171);
  color: white;
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.select {
  padding: 10px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 14px;
}

.slider {
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: rgba(255, 255, 255, 0.2);
  outline: none;
  cursor: pointer;
}

.color-options {
  display: flex;
  gap: 10px;
}

.color-btn {
  width: 30px;
  height: 30px;
  border: 2px solid transparent;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s ease;
}

.color-btn.active {
  border-color: white;
  transform: scale(1.1);
}

.data-info {
  display: flex;
  justify-content: space-between;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.info-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.info-item .label {
  font-size: 12px;
  color: #94A3B8;
}

.info-item .value {
  font-size: 16px;
  font-weight: 600;
  color: #00D2FF;
}
</style> 