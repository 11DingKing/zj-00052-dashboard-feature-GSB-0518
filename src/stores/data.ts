import { defineStore } from "pinia";
import { ref, onUnmounted } from "vue";
import {
  generateDataPoint,
  generateInitialHistory,
  generateRankingData,
  generateTableData,
  generateDataPointForCustomSource,
} from "@/utils/dataGenerator";
import { useDataSourceStore } from "@/stores/dataSource";
import type { RefreshInterval } from "@/types";

const MAX_HISTORY = 200;

export const useDataStore = defineStore("data", () => {
  const dataSourceStore = useDataSourceStore();
  const dataHistory = ref<Record<string, any[]>>({});
  const rankingData = ref<
    Record<string, Array<{ name: string; value: number }>>
  >({});
  const tableData = ref<Record<string, any[]>>({});
  const timers = ref<Record<string, number>>({});

  function isPredefinedSource(source: string): boolean {
    return [
      "sales",
      "orders",
      "users",
      "traffic",
      "conversion",
      "delivery",
      "inventory",
      "complaints",
      "satisfaction",
      "responseTime",
    ].includes(source);
  }

  function initDataSource(source: string) {
    if (!dataHistory.value[source]) {
      if (isPredefinedSource(source)) {
        dataHistory.value[source] = generateInitialHistory(source, 50);
      } else {
        const ds = dataSourceStore.getDataSourceById(source);
        if (ds) {
          dataHistory.value[source] = [];
          for (let i = 0; i < 50; i++) {
            const point = generateDataPointForCustomSource(ds);
            point.timestamp = Date.now() - (50 - i) * 60000;
            dataHistory.value[source].push(point);
          }
        } else {
          dataHistory.value[source] = [];
        }
      }
    }
    if (!rankingData.value[source]) {
      rankingData.value[source] = generateRankingData();
    }
    if (!tableData.value[source]) {
      tableData.value[source] = generateTableData();
    }
  }

  function updateData(source: string) {
    initDataSource(source);
    let newPoint;
    if (isPredefinedSource(source)) {
      newPoint = generateDataPoint(source);
    } else {
      const ds = dataSourceStore.getDataSourceById(source);
      if (ds) {
        newPoint = generateDataPointForCustomSource(ds);
      } else {
        newPoint = { timestamp: Date.now(), value: 0 };
      }
    }
    dataHistory.value[source].push(newPoint);
    if (dataHistory.value[source].length > MAX_HISTORY) {
      dataHistory.value[source].shift();
    }
    if (Math.random() > 0.7) {
      rankingData.value[source] = generateRankingData();
    }
    if (Math.random() > 0.8) {
      tableData.value[source] = generateTableData();
    }
  }

  function startDataUpdate(
    cardId: string,
    source: string,
    interval: RefreshInterval,
  ) {
    stopDataUpdate(cardId);
    if (interval === "manual") return;
    timers.value[cardId] = window.setInterval(() => {
      updateData(source);
    }, interval * 1000);
  }

  function stopDataUpdate(cardId: string) {
    if (timers.value[cardId]) {
      clearInterval(timers.value[cardId]);
      delete timers.value[cardId];
    }
  }

  function manualUpdate(source: string) {
    updateData(source);
  }

  onUnmounted(() => {
    Object.values(timers.value).forEach((timer) => clearInterval(timer));
  });

  return {
    dataHistory,
    rankingData,
    tableData,
    initDataSource,
    startDataUpdate,
    stopDataUpdate,
    manualUpdate,
  };
});
