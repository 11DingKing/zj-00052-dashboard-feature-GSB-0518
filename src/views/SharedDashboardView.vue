<template>
  <div class="shared-dashboard">
    <div v-if="loading" class="loading-state">
      <p>加载中...</p>
    </div>
    <div v-else-if="!valid" class="error-state">
      <h2>无效的分享链接</h2>
      <p>该分享链接已过期或不存在</p>
      <router-link to="/" class="btn primary">返回首页</router-link>
    </div>
    <div v-else class="dashboard-content">
      <div class="shared-header">
        <h1>{{ dashboard?.name || '数据看板' }}</h1>
        <div class="header-badge">
          <span class="badge">只读分享</span>
          <span class="view-count">浏览 {{ shareToken?.viewCount || 0 }} 次</span>
        </div>
      </div>
      <div class="cards-grid">
        <div v-for="card in dashboard?.cards || []" :key="card.id" class="card-wrapper" :style="getCardStyle(card)">
          <DashboardCard
            :config="card"
            :data="getCardData(card)"
            :is-edit-mode="false"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useDataSourceStore } from '@/stores/dataSource'
import { useDashboardStore } from '@/stores/dashboard'
import { useDataStore } from '@/stores/data'
import DashboardCard from '@/components/DashboardCard.vue'
import type { CardConfig } from '@/types'

const route = useRoute()
const dataSourceStore = useDataSourceStore()
const dashboardStore = useDashboardStore()
const dataStore = useDataStore()

const loading = ref(true)
const valid = ref(false)

const token = computed(() => route.params.token as string)
const shareToken = computed(() => dataSourceStore.getShareTokenByToken(token.value))
const dashboard = computed(() => {
  if (shareToken.value) {
    return dashboardStore.dashboards.find(d => d.id === shareToken.value?.dashboardId)
  }
  return null
})

onMounted(() => {
  dashboardStore.initializePresets()
  dataSourceStore.initializeDefaults()
  
  const st = shareToken.value
  if (st) {
    if (st.expiresAt && Date.now() > st.expiresAt) {
      valid.value = false
    } else {
      dataSourceStore.incrementViewCount(token.value)
      valid.value = true
    }
  } else {
    valid.value = false
  }
  loading.value = false
})

function getCardStyle(card: CardConfig) {
  return {
    gridColumn: `span ${card.w}`,
    gridRow: `span ${card.h}`
  }
}

function getCardData(card: CardConfig) {
  dataStore.initDataSource(card.dataSource)
  dataStore.startDataUpdate(card.id, card.dataSource, card.refreshInterval)
  return {
    history: dataStore.dataHistory[card.dataSource] || [],
    ranking: [],
    table: []
  }
}
</script>

<style scoped>
.shared-dashboard {
  min-height: 100vh;
  background: var(--bg-color);
  color: var(--text-color);
}

.loading-state, .error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  text-align: center;
}

.error-state h2 {
  margin: 0 0 12px 0;
  color: #f5222d;
}

.error-state p {
  margin: 0 0 24px 0;
  color: #888;
}

.dashboard-content {
  padding: 24px;
}

.shared-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border-color);
}

.shared-header h1 {
  margin: 0;
  font-size: 24px;
}

.header-badge {
  display: flex;
  gap: 12px;
  align-items: center;
}

.badge {
  background: #1890ff;
  color: white;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
}

.view-count {
  font-size: 12px;
  color: #888;
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 16px;
}

.card-wrapper {
  min-height: 200px;
}

.btn {
  padding: 8px 16px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
  display: inline-block;
}

.btn.primary {
  background: #1890ff;
  color: white;
}
</style>
