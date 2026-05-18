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
import { HeatmapChart as EChartsHeatmap } from 'echarts/charts'
import { GridComponent, TooltipComponent, TitleComponent, VisualMapComponent } from 'echarts/components'
import type { CardConfig } from '@/types'
import { generateHeatmapData } from '@/utils/dataGenerator'

use([
  CanvasRenderer,
  EChartsHeatmap,
  GridComponent,
  TooltipComponent,
  TitleComponent,
  VisualMapComponent
])

const props = defineProps<{
  config: CardConfig
}>()

const chartOption = computed(() => {
  const rawData = generateHeatmapData()
  const data: [number, number, number][] = []
  for (let i = 0; i < rawData.length; i++) {
    for (let j = 0; j < rawData[i].length; j++) {
      data.push([i, j, rawData[i][j]])
    }
  }
  const regions = ['华东', '华南', '华北', '西南', '西北', '东北', '华中', '港澳台', '海外', '其他']
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
      position: 'top',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      textStyle: { color: '#fff' }
    },
    grid: {
      left: '15%',
      right: '10%',
      bottom: '10%',
      top: '20%'
    },
    xAxis: {
      type: 'category',
      data: regions,
      splitArea: { show: true },
      axisLabel: { color: 'inherit', rotate: 45 }
    },
    yAxis: {
      type: 'category',
      data: regions,
      splitArea: { show: true },
      axisLabel: { color: 'inherit' }
    },
    visualMap: {
      min: 0,
      max: 100,
      calculable: true,
      orient: 'horizontal',
      left: 'center',
      bottom: '0%',
      inRange: {
        color: ['#e0ffff', '#1890ff']
      },
      textStyle: { color: 'inherit' }
    },
    series: [
      {
        name: props.config.title,
        type: 'heatmap',
        data,
        label: { show: false },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  }
})
</script>
