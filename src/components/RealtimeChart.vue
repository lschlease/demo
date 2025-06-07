<template>
  <div class="realtime-chart">
    <ChartCanvas
      ref="chartCanvas"
      :width="chartWidth"
      :height="chartHeight"
      :options="chartOptions"
    />
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue'
import ChartCanvas from './ChartCanvas.vue'
import { DataGenerator } from '../utils/dataGenerator.js'

export default {
  name: 'RealtimeChart',
  components: {
    ChartCanvas
  },
  setup() {
    const chartCanvas = ref(null)
    const dataGenerator = ref(null)
    const dataPoints = ref([])
    const isGenerating = ref(false)
    const currentValue = ref(0)
    const updateInterval = ref(1000)
    let generationTimer = null

    // 图表配置
    const chartWidth = ref(1200)
    const chartHeight = ref(600)
    const chartOptions = ref({
      lineColor: 0x00D2FF,
      lineWidth: 1,
      pointColor: 0xFF6B6B,
      maxDataPoints: 60
    })

    // 初始化数据生成器
    const initDataGenerator = () => {
      dataGenerator.value = new DataGenerator({
        mode: 'sineWave',
        baseValue: 50,
        amplitude: 25,
        frequency: 0.02,
        noiseLevel: 3
      })

      // 监听数据更新
      dataGenerator.value.onDataUpdate((dataPoint) => {
        dataPoints.value.push(dataPoint)
        currentValue.value = dataPoint.value
        
        // 添加到图表
        if (chartCanvas.value) {
          chartCanvas.value.addDataPoint(dataPoint)
        }
        
        // 限制数据点数量
        if (dataPoints.value.length > chartOptions.value.maxDataPoints) {
          dataPoints.value.shift()
        }
      })
    }

    // 开始生成数据
    const startGeneration = () => {
      if (generationTimer) return
      
      isGenerating.value = true
      generationTimer = setInterval(() => {
        if (dataGenerator.value) {
          dataGenerator.value.generateNext()
        }
      }, updateInterval.value)
    }

    // 停止生成数据
    const stopGeneration = () => {
      if (generationTimer) {
        clearInterval(generationTimer)
        generationTimer = null
      }
      isGenerating.value = false
    }

    // 响应式调整图表大小
    const updateChartSize = () => {
      const container = document.querySelector('.realtime-chart')
      if (container) {
        const containerWidth = container.clientWidth
        chartWidth.value = Math.min(containerWidth - 40, 1400)
        chartHeight.value = Math.min(chartWidth.value * 0.45, 600)
      }
    }

    onMounted(() => {
      initDataGenerator()
      updateChartSize()
      
      // 监听窗口大小变化
      window.addEventListener('resize', updateChartSize)
      
      // 自动开始生成数据
      setTimeout(() => {
        startGeneration()
      }, 500)
    })

    onUnmounted(() => {
      stopGeneration()
      window.removeEventListener('resize', updateChartSize)
    })

    return {
      chartCanvas,
      chartWidth,
      chartHeight,
      chartOptions
    }
  }
}
</script>

<style scoped>
.realtime-chart {
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  max-width: 1400px;
  margin: 0 auto;
}

@media (max-width: 768px) {
  .realtime-chart {
    padding: 10px;
  }
}
</style> 