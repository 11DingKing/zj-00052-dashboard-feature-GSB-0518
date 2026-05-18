import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { saveDataSources, loadDataSources, saveShareTokens, loadShareTokens } from '@/utils/storage'
import type { DataSource, ShareToken, DataField, DataGenerationRule } from '@/types'

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

function generateToken(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

const defaultDataSources: Omit<DataSource, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    name: '销售数据',
    description: '包含销售额、订单数等销售相关数据',
    fields: [
      { name: 'value', type: 'number', label: '销售额' },
      { name: 'orders', type: 'number', label: '订单数' },
      { name: 'avgOrderValue', type: 'number', label: '客单价' }
    ],
    generationRules: {
      value: { min: 5000, max: 20000 },
      orders: { min: 50, max: 200 },
      avgOrderValue: { min: 50, max: 500, decimals: 2 }
    }
  },
  {
    name: '订单数据',
    description: '包含订单状态分布等数据',
    fields: [
      { name: 'value', type: 'number', label: '总订单' },
      { name: 'pending', type: 'number', label: '待处理' },
      { name: 'completed', type: 'number', label: '已完成' },
      { name: 'cancelled', type: 'number', label: '已取消' }
    ],
    generationRules: {
      value: { min: 50, max: 200 },
      pending: { min: 5, max: 30 },
      completed: { min: 30, max: 150 },
      cancelled: { min: 1, max: 10 }
    }
  },
  {
    name: '用户数据',
    description: '包含用户数量、新增用户等数据',
    fields: [
      { name: 'value', type: 'number', label: '总用户' },
      { name: 'newUsers', type: 'number', label: '新增用户' },
      { name: 'activeUsers', type: 'number', label: '活跃用户' }
    ],
    generationRules: {
      value: { min: 100, max: 500 },
      newUsers: { min: 10, max: 100 },
      activeUsers: { min: 50, max: 300 }
    }
  }
]

export const useDataSourceStore = defineStore('dataSource', () => {
  const dataSources = ref<DataSource[]>(loadDataSources())
  const shareTokens = ref<ShareToken[]>(loadShareTokens())

  watch(dataSources, (newValue) => {
    saveDataSources(newValue)
  }, { deep: true })

  watch(shareTokens, (newValue) => {
    saveShareTokens(newValue)
  }, { deep: true })

  function initializeDefaults() {
    if (dataSources.value.length === 0) {
      const now = Date.now()
      dataSources.value = defaultDataSources.map(ds => ({
        ...ds,
        id: generateId(),
        createdAt: now,
        updatedAt: now
      }))
    }
  }

  function createDataSource(name: string, fields: DataField[], rules: Record<string, DataGenerationRule>, description?: string): DataSource {
    const now = Date.now()
    const newDataSource: DataSource = {
      id: generateId(),
      name,
      description,
      fields,
      generationRules: rules,
      createdAt: now,
      updatedAt: now
    }
    dataSources.value.push(newDataSource)
    return newDataSource
  }

  function updateDataSource(id: string, updates: Partial<DataSource>) {
    const index = dataSources.value.findIndex(ds => ds.id === id)
    if (index > -1) {
      dataSources.value[index] = {
        ...dataSources.value[index],
        ...updates,
        updatedAt: Date.now()
      }
    }
  }

  function deleteDataSource(id: string) {
    const index = dataSources.value.findIndex(ds => ds.id === id)
    if (index > -1) {
      dataSources.value.splice(index, 1)
    }
  }

  function getDataSourceById(id: string): DataSource | undefined {
    return dataSources.value.find(ds => ds.id === id)
  }

  function createShareToken(dashboardId: string, expiresAt?: number): ShareToken {
    const now = Date.now()
    const token: ShareToken = {
      id: generateId(),
      dashboardId,
      token: generateToken(),
      createdAt: now,
      expiresAt: expiresAt || null,
      viewCount: 0
    }
    shareTokens.value.push(token)
    return token
  }

  function deleteShareToken(id: string) {
    const index = shareTokens.value.findIndex(st => st.id === id)
    if (index > -1) {
      shareTokens.value.splice(index, 1)
    }
  }

  function getShareTokenByToken(token: string): ShareToken | undefined {
    return shareTokens.value.find(st => st.token === token)
  }

  function incrementViewCount(token: string) {
    const shareToken = shareTokens.value.find(st => st.token === token)
    if (shareToken) {
      shareToken.viewCount++
    }
  }

  function getShareTokensByDashboardId(dashboardId: string): ShareToken[] {
    return shareTokens.value.filter(st => st.dashboardId === dashboardId)
  }

  return {
    dataSources,
    shareTokens,
    initializeDefaults,
    createDataSource,
    updateDataSource,
    deleteDataSource,
    getDataSourceById,
    createShareToken,
    deleteShareToken,
    getShareTokenByToken,
    incrementViewCount,
    getShareTokensByDashboardId
  }
})
