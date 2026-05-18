<template>
  <div
    class="dashboard-card"
    :class="{ locked: config.locked, alert: hasAlert }"
  >
    <div v-if="hasAlert" class="alert-indicator">
      <span class="alert-blink">⚠️</span>
    </div>
    <div v-if="isEditMode" class="card-actions">
      <button class="action-btn" @click="$emit('configure')" title="配置">
        ⚙️
      </button>
      <button class="action-btn" @click="$emit('duplicate')" title="复制">
        📋
      </button>
      <button class="action-btn" @click="$emit('delete')" title="删除">
        🗑️
      </button>
    </div>
    <component :is="cardComponent" :config="config" :data="cardData" />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { CardConfig } from "@/types";
import LineChartCard from "./cards/LineChartCard.vue";
import BarChartCard from "./cards/BarChartCard.vue";
import PieChartCard from "./cards/PieChartCard.vue";
import HeatmapCard from "./cards/HeatmapCard.vue";
import MetricCard from "./cards/MetricCard.vue";
import TableCard from "./cards/TableCard.vue";
import ProgressCard from "./cards/ProgressCard.vue";
import RankingCard from "./cards/RankingCard.vue";

const props = defineProps<{
  config: CardConfig;
  data: any;
  isEditMode: boolean;
}>();

defineEmits(["configure", "duplicate", "delete"]);

const cardComponent = computed(() => {
  const components: Record<string, any> = {
    line: LineChartCard,
    bar: BarChartCard,
    pie: PieChartCard,
    heatmap: HeatmapCard,
    metric: MetricCard,
    table: TableCard,
    progress: ProgressCard,
    ranking: RankingCard,
  };
  return components[props.config.type] || MetricCard;
});

const cardData = computed(() => {
  if (props.config.type === "ranking") {
    return props.data?.ranking || [];
  }
  if (props.config.type === "table") {
    return props.data?.table || [];
  }
  return props.data?.history || [];
});

const hasAlert = computed(() => {
  if (!props.config.alertThresholds || !cardData.value.length) {
    return false;
  }

  const latestData = cardData.value[cardData.value.length - 1];
  if (!latestData) return false;

  return props.config.alertThresholds.some((threshold) => {
    if (!threshold.enabled) return false;

    const value = latestData[threshold.field];
    if (typeof value !== "number") return false;

    switch (threshold.operator) {
      case ">":
        return value > threshold.value;
      case ">=":
        return value >= threshold.value;
      case "<":
        return value < threshold.value;
      case "<=":
        return value <= threshold.value;
      case "==":
        return value === threshold.value;
      case "!=":
        return value !== threshold.value;
      default:
        return false;
    }
  });
});
</script>

<style scoped>
.dashboard-card {
  position: relative;
  height: 100%;
  background: var(--card-bg);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition:
    box-shadow 0.3s,
    transform 0.3s,
    border-color 0.3s;
  border: 2px solid transparent;
}

.dashboard-card.alert {
  border-color: #f5222d;
  animation: alert-pulse 2s infinite;
}

@keyframes alert-pulse {
  0%,
  100% {
    box-shadow: 0 2px 8px rgba(245, 34, 45, 0.2);
  }
  50% {
    box-shadow: 0 4px 20px rgba(245, 34, 45, 0.5);
  }
}

.alert-indicator {
  position: absolute;
  top: 8px;
  left: 8px;
  z-index: 9;
}

.alert-blink {
  display: inline-block;
  animation: blink 1s infinite;
}

@keyframes blink {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.dashboard-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.card-actions {
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  gap: 4px;
  z-index: 10;
  opacity: 0;
  transition: opacity 0.3s;
}

.dashboard-card:hover .card-actions {
  opacity: 1;
}

.action-btn {
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 6px;
  background: var(--card-bg);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  transition: background 0.2s;
  border: 1px solid var(--border-color);
}

.action-btn:hover {
  background: var(--border-color);
}

.chart-card {
  height: 100%;
  padding: 8px;
}
</style>
