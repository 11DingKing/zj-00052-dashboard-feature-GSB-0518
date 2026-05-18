<template>
  <div class="ranking-card">
    <div class="ranking-title">{{ config.title }}</div>
    <div class="ranking-list">
      <div v-for="(item, idx) in displayData" :key="idx" class="ranking-item">
        <div class="rank-badge" :class="{ top: idx < 3 }">{{ idx + 1 }}</div>
        <div class="item-name">{{ item.name }}</div>
        <div class="item-value">{{ item.value.toLocaleString() }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { CardConfig } from '@/types'

const props = defineProps<{
  config: CardConfig
  data: Array<{ name: string; value: number }>
  isDark?: boolean
}>()

const displayData = computed(() => {
  return (props.data || []).slice(0, 5)
})
</script>

<style scoped>
.ranking-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 16px;
}

.ranking-title {
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 16px;
}

.ranking-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.ranking-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.rank-badge {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
  background: #f0f0f0;
}

.rank-badge.top {
  background: linear-gradient(135deg, #1890ff, #52c41a);
  color: white;
}

.item-name {
  flex: 1;
  font-size: 13px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-value {
  font-size: 13px;
  font-weight: 600;
  color: #1890ff;
}
</style>
