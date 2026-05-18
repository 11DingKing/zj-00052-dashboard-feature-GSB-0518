<template>
  <div class="metric-card" :style="{ '--accent-color': config.colors[0] }">
    <div class="metric-title">{{ config.title }}</div>
    <div class="metric-value">
      {{ formattedValue }}
      <span class="metric-unit">{{ config.unit }}</span>
    </div>
    <div class="metric-trend" :class="{ positive: trend >= 0, negative: trend < 0 }">
      <span>{{ trend >= 0 ? '↑' : '↓' }} {{ Math.abs(trend).toFixed(1) }}%</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { CardConfig } from '@/types'

const props = defineProps<{
  config: CardConfig
  data: any[]
  isDark?: boolean
}>()

const latestValue = computed(() => {
  return props.data?.[props.data.length - 1]?.value || 0
})

const previousValue = computed(() => {
  return props.data?.[props.data.length - 2]?.value || latestValue.value
})

const trend = computed(() => {
  if (previousValue.value === 0) return 0
  return ((latestValue.value - previousValue.value) / previousValue.value) * 100
})

const formattedValue = computed(() => {
  const value = latestValue.value
  if (value >= 1000000) return (value / 1000000).toFixed(2) + 'M'
  if (value >= 1000) return (value / 1000).toFixed(2) + 'K'
  return value.toFixed(2)
})
</script>

<style scoped>
.metric-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 20px;
  background: linear-gradient(135deg, var(--accent-color) 0%, var(--accent-color) 100%);
  border-radius: 12px;
  color: white;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.metric-title {
  font-size: 14px;
  opacity: 0.9;
  margin-bottom: 10px;
}

.metric-value {
  font-size: 36px;
  font-weight: bold;
  margin-bottom: 8px;
}

.metric-unit {
  font-size: 16px;
  margin-left: 4px;
  opacity: 0.9;
}

.metric-trend {
  font-size: 14px;
  padding: 4px 12px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.2);
}

.metric-trend.positive {
  color: #a8f2a8;
}

.metric-trend.negative {
  color: #ffb3b3;
}
</style>
