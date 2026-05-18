<template>
  <div class="table-card">
    <div class="table-header">{{ config.title }}</div>
    <div class="table-body">
      <table>
        <thead>
          <tr>
            <th>名称</th>
            <th>状态</th>
            <th>金额</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, idx) in displayData" :key="idx">
            <td>{{ row.name?.substring?.(0, 8) || '-' }}</td>
            <td>
              <span class="status-badge" :class="row.status">
                {{ getStatusText(row.status) }}
              </span>
            </td>
            <td>{{ row.amount?.toFixed?.(2) || '0.00' }}</td>
          </tr>
        </tbody>
      </table>
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

const displayData = computed(() => {
  return props.data?.slice(0, 5) || []
})

function getStatusText(status: string): string {
  const map: Record<string, string> = {
    pending: '待处理',
    processing: '处理中',
    completed: '已完成',
    cancelled: '已取消'
  }
  return map[status] || status
}
</script>

<style scoped>
.table-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.table-header {
  font-size: 14px;
  font-weight: bold;
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-color);
}

.table-body {
  flex: 1;
  overflow: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 10px 16px;
  text-align: left;
  border-bottom: 1px solid var(--border-color);
}

th {
  font-weight: 600;
  font-size: 12px;
  opacity: 0.7;
}

td {
  font-size: 13px;
}

.status-badge {
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 11px;
}

.status-badge.pending {
  background: #fff7e6;
  color: #fa8c16;
}

.status-badge.processing {
  background: #e6f7ff;
  color: #1890ff;
}

.status-badge.completed {
  background: #f6ffed;
  color: #52c41a;
}

.status-badge.cancelled {
  background: #fff1f0;
  color: #f5222d;
}
</style>
