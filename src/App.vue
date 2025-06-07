<template>
  <div id="app">
    <header class="app-header">
      <div class="header-content">
        <h1 class="app-title">
          <span class="title-icon">📈</span>
          Vue3 + PIXI.js 实时折线图
        </h1>
        <p class="app-subtitle">高性能实时数据可视化演示</p>
      </div>
    </header>
    
    <main class="app-main">
      <RealtimeChart />
    </main>
    
    <footer class="app-footer">
      <p>&copy; 2024 实时数据可视化项目 | 基于 Vue3 & PIXI.js</p>
    </footer>
  </div>
</template>

<script>
import RealtimeChart from './components/RealtimeChart.vue'

export default {
  name: 'App',
  components: {
    RealtimeChart
  }
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  overflow-x: hidden;
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-header {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding: 20px 0;
  text-align: center;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.app-title {
  color: white;
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
}

.title-icon {
  font-size: 2rem;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.app-subtitle {
  color: rgba(255, 255, 255, 0.8);
  font-size: 1.1rem;
  font-weight: 400;
}

.app-main {
  flex: 1;
  position: relative;
  animation: fadeIn 0.8s ease-out;
}

.app-footer {
  background: rgba(0, 0, 0, 0.2);
  text-align: center;
  padding: 15px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .app-title {
    font-size: 2rem;
    flex-direction: column;
    gap: 10px;
  }
  
  .app-subtitle {
    font-size: 1rem;
  }
}
</style> 