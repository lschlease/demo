<template>
  <div ref="chartContainer" class="chart-canvas" :style="{ width: width + 'px', height: height + 'px' }">
    <!-- PIXI.js画布将在这里渲染 -->
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { ChartRenderer } from '../utils/chartRenderer.js'

export default {
  name: 'ChartCanvas',
  props: {
    width: {
      type: Number,
      default: 800
    },
    height: {
      type: Number,
      default: 400
    },
    dataPoints: {
      type: Array,
      default: () => []
    },
    options: {
      type: Object,
      default: () => ({})
    }
  },
  setup(props) {
    const chartContainer = ref(null)
    let chartRenderer = null

    // 初始化图表
    const initChart = () => {
      if (chartContainer.value && !chartRenderer) {
        chartRenderer = new ChartRenderer(chartContainer.value, {
          width: props.width,
          height: props.height,
          ...props.options
        })
      }
    }

    // 添加数据点
    const addDataPoint = (dataPoint) => {
      if (chartRenderer) {
        chartRenderer.addDataPoint(dataPoint)
      }
    }

    // 监听尺寸变化
    watch([() => props.width, () => props.height], ([newWidth, newHeight]) => {
      if (chartRenderer) {
        chartRenderer.resize(newWidth, newHeight)
      }
    })

    onMounted(() => {
      initChart()
    })

    onUnmounted(() => {
      if (chartRenderer) {
        chartRenderer.destroy()
        chartRenderer = null
      }
    })

    return {
      chartContainer,
      addDataPoint
    }
  }
}
</script>

<style scoped>
.chart-canvas {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
}
</style> 