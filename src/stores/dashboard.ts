import { defineStore } from "pinia";
import { ref, computed, watch } from "vue";
import { saveDashboards, loadDashboards } from "@/utils/storage";
import type { Dashboard, CardConfig, CardType, DashboardType } from "@/types";

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

const ecommerceTemplate: CardConfig[] = [
  {
    id: generateId(),
    type: "metric",
    title: "销售额",
    x: 0,
    y: 0,
    w: 2,
    h: 2,
    dataSource: "sales",
    refreshInterval: 5,
    colors: ["#1890ff"],
    unit: "元",
    locked: false,
    alertThresholds: [],
  },
  {
    id: generateId(),
    type: "metric",
    title: "订单量",
    x: 2,
    y: 0,
    w: 2,
    h: 2,
    dataSource: "orders",
    refreshInterval: 5,
    colors: ["#52c41a"],
    unit: "单",
    locked: false,
    alertThresholds: [],
  },
  {
    id: generateId(),
    type: "metric",
    title: "用户数",
    x: 4,
    y: 0,
    w: 2,
    h: 2,
    dataSource: "users",
    refreshInterval: 5,
    colors: ["#faad14"],
    unit: "人",
    locked: false,
    alertThresholds: [],
  },
  {
    id: generateId(),
    type: "line",
    title: "销售趋势",
    x: 0,
    y: 2,
    w: 6,
    h: 3,
    dataSource: "sales",
    refreshInterval: 5,
    colors: ["#1890ff", "#52c41a"],
    unit: "元",
    locked: false,
    alertThresholds: [],
  },
  {
    id: generateId(),
    type: "bar",
    title: "订单分布",
    x: 0,
    y: 5,
    w: 4,
    h: 3,
    dataSource: "orders",
    refreshInterval: 30,
    colors: ["#1890ff", "#52c41a", "#faad14"],
    unit: "单",
    locked: false,
    alertThresholds: [],
  },
  {
    id: generateId(),
    type: "pie",
    title: "用户来源",
    x: 4,
    y: 5,
    w: 2,
    h: 3,
    dataSource: "traffic",
    refreshInterval: 30,
    colors: ["#1890ff", "#52c41a", "#faad14", "#f5222d"],
    unit: "",
    locked: false,
    alertThresholds: [],
  },
  {
    id: generateId(),
    type: "progress",
    title: "转化率",
    x: 0,
    y: 8,
    w: 2,
    h: 2,
    dataSource: "conversion",
    refreshInterval: 30,
    colors: ["#52c41a"],
    unit: "%",
    locked: false,
    alertThresholds: [],
  },
  {
    id: generateId(),
    type: "ranking",
    title: "热销商品",
    x: 2,
    y: 8,
    w: 2,
    h: 2,
    dataSource: "sales",
    refreshInterval: 30,
    colors: ["#1890ff"],
    unit: "元",
    locked: false,
    alertThresholds: [],
  },
  {
    id: generateId(),
    type: "table",
    title: "订单列表",
    x: 4,
    y: 8,
    w: 2,
    h: 3,
    dataSource: "orders",
    refreshInterval: "manual",
    colors: [],
    unit: "",
    locked: false,
    alertThresholds: [],
  },
];

const logisticsTemplate: CardConfig[] = [
  {
    id: generateId(),
    type: "metric",
    title: "配送单量",
    x: 0,
    y: 0,
    w: 2,
    h: 2,
    dataSource: "delivery",
    refreshInterval: 5,
    colors: ["#1890ff"],
    unit: "单",
    locked: false,
    alertThresholds: [],
  },
  {
    id: generateId(),
    type: "metric",
    title: "库存水平",
    x: 2,
    y: 0,
    w: 2,
    h: 2,
    dataSource: "inventory",
    refreshInterval: 5,
    colors: ["#52c41a"],
    unit: "件",
    locked: false,
    alertThresholds: [],
  },
  {
    id: generateId(),
    type: "heatmap",
    title: "区域热力",
    x: 4,
    y: 0,
    w: 2,
    h: 3,
    dataSource: "delivery",
    refreshInterval: 30,
    colors: ["#1890ff"],
    unit: "",
    locked: false,
    alertThresholds: [],
  },
  {
    id: generateId(),
    type: "line",
    title: "配送时效",
    x: 0,
    y: 2,
    w: 4,
    h: 3,
    dataSource: "delivery",
    refreshInterval: 5,
    colors: ["#1890ff"],
    unit: "小时",
    locked: false,
    alertThresholds: [],
  },
  {
    id: generateId(),
    type: "progress",
    title: "准时率",
    x: 0,
    y: 5,
    w: 2,
    h: 2,
    dataSource: "delivery",
    refreshInterval: 30,
    colors: ["#52c41a"],
    unit: "%",
    locked: false,
    alertThresholds: [],
  },
  {
    id: generateId(),
    type: "table",
    title: "配送列表",
    x: 2,
    y: 5,
    w: 4,
    h: 3,
    dataSource: "delivery",
    refreshInterval: "manual",
    colors: [],
    unit: "",
    locked: false,
    alertThresholds: [],
  },
];

const customerServiceTemplate: CardConfig[] = [
  {
    id: generateId(),
    type: "metric",
    title: "投诉量",
    x: 0,
    y: 0,
    w: 2,
    h: 2,
    dataSource: "complaints",
    refreshInterval: 5,
    colors: ["#f5222d"],
    unit: "件",
    locked: false,
    alertThresholds: [],
  },
  {
    id: generateId(),
    type: "metric",
    title: "满意度",
    x: 2,
    y: 0,
    w: 2,
    h: 2,
    dataSource: "satisfaction",
    refreshInterval: 5,
    colors: ["#52c41a"],
    unit: "分",
    locked: false,
    alertThresholds: [],
  },
  {
    id: generateId(),
    type: "metric",
    title: "响应时间",
    x: 4,
    y: 0,
    w: 2,
    h: 2,
    dataSource: "responseTime",
    refreshInterval: 5,
    colors: ["#1890ff"],
    unit: "秒",
    locked: false,
    alertThresholds: [],
  },
  {
    id: generateId(),
    type: "line",
    title: "满意度趋势",
    x: 0,
    y: 2,
    w: 6,
    h: 3,
    dataSource: "satisfaction",
    refreshInterval: 5,
    colors: ["#52c41a", "#faad14"],
    unit: "分",
    locked: false,
    alertThresholds: [],
  },
  {
    id: generateId(),
    type: "bar",
    title: "投诉分类",
    x: 0,
    y: 5,
    w: 3,
    h: 3,
    dataSource: "complaints",
    refreshInterval: 30,
    colors: ["#f5222d", "#faad14"],
    unit: "件",
    locked: false,
    alertThresholds: [],
  },
  {
    id: generateId(),
    type: "pie",
    title: "评分分布",
    x: 3,
    y: 5,
    w: 3,
    h: 3,
    dataSource: "satisfaction",
    refreshInterval: 30,
    colors: ["#52c41a", "#1890ff", "#faad14", "#f5222d"],
    unit: "",
    locked: false,
    alertThresholds: [],
  },
  {
    id: generateId(),
    type: "table",
    title: "工单列表",
    x: 0,
    y: 8,
    w: 6,
    h: 3,
    dataSource: "complaints",
    refreshInterval: "manual",
    colors: [],
    unit: "",
    locked: false,
    alertThresholds: [],
  },
];

export const useDashboardStore = defineStore("dashboard", () => {
  const dashboards = ref<Dashboard[]>(loadDashboards());
  const currentDashboardId = ref<string | null>(null);
  const isEditMode = ref(false);
  const isFullscreen = ref(false);
  const carouselInterval = ref<number | null>(null);

  const currentDashboard = computed(() => {
    return (
      dashboards.value.find((d) => d.id === currentDashboardId.value) || null
    );
  });

  watch(
    dashboards,
    (newValue) => {
      saveDashboards(newValue);
    },
    { deep: true },
  );

  function initializePresets() {
    if (dashboards.value.length === 0) {
      const now = Date.now();
      dashboards.value = [
        {
          id: generateId(),
          name: "电商运营看板",
          type: "ecommerce",
          cards: ecommerceTemplate,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: generateId(),
          name: "物流监控看板",
          type: "logistics",
          cards: logisticsTemplate,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: generateId(),
          name: "客服运营看板",
          type: "customerService",
          cards: customerServiceTemplate,
          createdAt: now,
          updatedAt: now,
        },
      ];
    }
  }

  function createDashboard(name: string, type: DashboardType): Dashboard {
    const templates: Record<DashboardType, CardConfig[]> = {
      ecommerce: ecommerceTemplate,
      logistics: logisticsTemplate,
      customerService: customerServiceTemplate,
    };
    const now = Date.now();
    const newDashboard: Dashboard = {
      id: generateId(),
      name,
      type,
      cards: JSON.parse(JSON.stringify(templates[type])),
      createdAt: now,
      updatedAt: now,
    };
    dashboards.value.push(newDashboard);
    return newDashboard;
  }

  function deleteDashboard(id: string) {
    const index = dashboards.value.findIndex((d) => d.id === id);
    if (index > -1) {
      dashboards.value.splice(index, 1);
      if (currentDashboardId.value === id) {
        currentDashboardId.value = null;
      }
    }
  }

  function setCurrentDashboard(id: string | null) {
    currentDashboardId.value = id;
  }

  function setEditMode(edit: boolean) {
    isEditMode.value = edit;
  }

  function updateCards(cards: CardConfig[]) {
    if (currentDashboard.value) {
      currentDashboard.value.cards = cards;
      currentDashboard.value.updatedAt = Date.now();
    }
  }

  function addCard(type: CardType, dataSourceId?: string) {
    if (currentDashboard.value) {
      const newCard: CardConfig = {
        id: generateId(),
        type,
        title: `新${type}图表`,
        x: 0,
        y: 0,
        w: type === "table" ? 4 : 2,
        h: type === "table" ? 3 : 2,
        dataSource: dataSourceId || "",
        refreshInterval: 5,
        colors: ["#1890ff", "#52c41a", "#faad14"],
        unit: "",
        locked: false,
        alertThresholds: [],
      };
      currentDashboard.value.cards.push(newCard);
      currentDashboard.value.updatedAt = Date.now();
    }
  }

  function deleteCard(cardId: string) {
    if (currentDashboard.value) {
      const index = currentDashboard.value.cards.findIndex(
        (c) => c.id === cardId,
      );
      if (index > -1) {
        currentDashboard.value.cards.splice(index, 1);
        currentDashboard.value.updatedAt = Date.now();
      }
    }
  }

  function duplicateCard(cardId: string) {
    if (currentDashboard.value) {
      const card = currentDashboard.value.cards.find((c) => c.id === cardId);
      if (card) {
        const newCard: CardConfig = {
          ...JSON.parse(JSON.stringify(card)),
          id: generateId(),
          title: `${card.title} (副本)`,
          x: card.x + 1,
          y: card.y,
        };
        currentDashboard.value.cards.push(newCard);
        currentDashboard.value.updatedAt = Date.now();
      }
    }
  }

  function toggleFullscreen() {
    isFullscreen.value = !isFullscreen.value;
    if (isFullscreen.value) {
      document.documentElement.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
      stopCarousel();
    }
  }

  function setFullscreen(value: boolean) {
    isFullscreen.value = value
  }

  function startCarousel(interval: number = 10000) {
    stopCarousel();
    if (dashboards.value.length === 0) return;
    let currentIndex = dashboards.value.findIndex(
      (d) => d.id === currentDashboardId.value,
    );
    if (currentIndex === -1) currentIndex = 0;
    carouselInterval.value = window.setInterval(() => {
      currentIndex = (currentIndex + 1) % dashboards.value.length;
      currentDashboardId.value = dashboards.value[currentIndex].id;
    }, interval);
  }

  function stopCarousel() {
    if (carouselInterval.value) {
      clearInterval(carouselInterval.value);
      carouselInterval.value = null;
    }
  }

  function exportConfig(): string {
    return JSON.stringify(currentDashboard.value, null, 2);
  }

  function importConfig(config: string): boolean {
    try {
      const dashboard = JSON.parse(config) as Dashboard;
      const existingIndex = dashboards.value.findIndex(
        (d) => d.id === dashboard.id,
      );
      if (existingIndex > -1) {
        dashboards.value[existingIndex] = dashboard;
      } else {
        dashboards.value.push(dashboard);
      }
      currentDashboardId.value = dashboard.id;
      return true;
    } catch (e) {
      console.error("Failed to import config:", e);
      return false;
    }
  }

  return {
    dashboards,
    currentDashboard,
    currentDashboardId,
    isEditMode,
    isFullscreen,
    initializePresets,
    createDashboard,
    deleteDashboard,
    setCurrentDashboard,
    setEditMode,
    updateCards,
    addCard,
    deleteCard,
    duplicateCard,
    toggleFullscreen,
    setFullscreen,
    startCarousel,
    stopCarousel,
    exportConfig,
    importConfig,
  };
});
