<template>
  <div class="progress-card">
    <div class="progress-title">{{ config.title }}</div>
    <div class="progress-ring-container">
      <svg viewBox="0 0 100 100" class="progress-ring">
        <circle class="progress-ring-bg" cx="50" cy="50" r="40" />
        <circle
          class="progress-ring-circle"
          :style="{ stroke: config.colors[0] }"
          cx="50" cy="50" r="40"
          :stroke-dasharray="`${progress * 2.51} 251`"
        />
      </svg>
      <div class="progress-text">{{ progress.toFixed(1) }}%</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { CardConfig } from '@/types'

const props = defineProps<{
  config: CardConfig
  data: any[]
}>()

const progress = computed(() => {
  const value = props.data?.[props.data.length - 1]?.value || 0
  return Math.min(Math.max(value, 0), 100)
})
</script>

<style scoped>
.progress-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.progress-title {
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 20px;
}

.progress-ring-container {
  position: relative;
  width: 120px;
  height: 120px;
}

.progress-ring {
  transform: rotate(-90deg);
}

.progress-ring-bg {
  fill: none;
  stroke: var(--border-color);
  stroke-width: 8;
}

.progress-ring-circle {
  fill: none;
  stroke-width: 8;
  stroke-linecap: round;
  transition: stroke-dasharray 0.5s ease;
}

.progress-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 24px;
  font-weight: bold;
}
</style>
