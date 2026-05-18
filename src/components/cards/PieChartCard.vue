<template>
  <div class="chart-card">
    <v-chart :option="chartOption" autoresize />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import VChart from "vue-echarts";
import { use } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import { PieChart as EChartsPieChart } from "echarts/charts";
import {
  TooltipComponent,
  TitleComponent,
  LegendComponent,
} from "echarts/components";
import type { CardConfig } from "@/types";

use([
  CanvasRenderer,
  EChartsPieChart,
  TooltipComponent,
  TitleComponent,
  LegendComponent,
]);

const props = defineProps<{
  config: CardConfig;
  data: any[];
  isDark?: boolean;
}>();

const chartOption = computed(() => {
  const latestData = props.data?.[props.data.length - 1] || {};
  const pieData = [
    { name: "直接访问", value: latestData.pv || 1000 },
    { name: "搜索引擎", value: latestData.uv || 500 },
    { name: "社交媒体", value: (latestData.pv || 1000) * 0.3 },
    { name: "其他来源", value: (latestData.pv || 1000) * 0.2 },
  ];
  return {
    backgroundColor: "transparent",
    title: {
      text: props.config.title,
      left: "center",
      textStyle: {
        color: "inherit",
        fontSize: 14,
      },
    },
    tooltip: {
      trigger: "item",
      backgroundColor: "rgba(0, 0, 0, 0.8)",
      textStyle: { color: "#fff" },
    },
    legend: {
      orient: "vertical",
      left: "left",
      textStyle: { color: "inherit" },
    },
    series: [
      {
        name: props.config.title,
        type: "pie",
        radius: ["40%", "70%"],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: props.isDark ? "#16213e" : "#fff",
          borderWidth: 2,
        },
        label: { show: false },
        emphasis: {
          label: { show: true, fontSize: 16, fontWeight: "bold" },
        },
        data: pieData.map((item, idx) => ({
          ...item,
          itemStyle: {
            color: props.config.colors[idx % props.config.colors.length],
          },
        })),
      },
    ],
  };
});
</script>
