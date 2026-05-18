<template>
  <div class="chart-card">
    <v-chart :option="chartOption" autoresize />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { BarChart as EChartsBarChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, TitleComponent, LegendComponent } from 'echarts/components'
import type { CardConfig } from '@/types'

use([
  CanvasRenderer,
  EChartsBarChart,
  GridComponent,
  TooltipComponent,
  TitleComponent,
  LegendComponent
])

const props = defineProps<{
  config: CardConfig
  data: any[]
}>()

const chartOption = computed(() => {
  const data = props.data || []
  const categories = ['pending', 'completed', 'cancelled']
  return {
    title: {
      text: props.config.title,
      left: 'center',
      textStyle: {
        color: 'inherit',
        fontSize: 14
      }
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      textStyle: { color: '#fff' }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: categories.map(c => c === 'pending' ? '待处理' : c === 'completed' ? '已完成' : '已取消'),
      axisLabel: { color: 'inherit' }
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: 'inherit' }
    },
    series: categories.map((cat, idx) => ({
      name: cat,
      type: 'bar',
      data: data.slice(-10).map(d => d[cat] || 0),
      itemStyle: { color: props.config.colors[idx % props.config.colors.length] }
    }))
  }
})
</script>
