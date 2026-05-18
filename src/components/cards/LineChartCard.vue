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
import { LineChart as EChartsLineChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, TitleComponent, LegendComponent } from 'echarts/components'
import type { CardConfig } from '@/types'

use([
  CanvasRenderer,
  EChartsLineChart,
  GridComponent,
  TooltipComponent,
  TitleComponent,
  LegendComponent
])

const props = defineProps<{
  config: CardConfig
  data: any[]
  isDark?: boolean
}>()

const chartOption = computed(() => {
  const data = props.data || []
  const bgColor = props.isDark ? 'transparent' : 'transparent'
  return {
    backgroundColor: bgColor,
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
      boundaryGap: false,
      data: data.map(d => new Date(d.timestamp).toLocaleTimeString()),
      axisLabel: { color: 'inherit' }
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: 'inherit' }
    },
    series: [
      {
        name: props.config.title,
        type: 'line',
        smooth: true,
        data: data.map(d => d.value),
        itemStyle: { color: props.config.colors[0] },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: props.config.colors[0] + '80' },
              { offset: 1, color: props.config.colors[0] + '10' }
            ]
          }
        }
      }
    ]
  }
})
</script>
