<template>
  <div class="dashboard-view" :class="{ 'fullscreen-mode': isFullscreen }">
    <div v-if="!isFullscreen" class="dashboard-header">
      <div class="header-left">
        <h1 class="dashboard-title">{{ dashboard?.name || "数据看板" }}</h1>
      </div>
      <div class="header-right">
        <button class="header-btn" @click="toggleTheme">
          {{ isDark ? "☀️" : "🌙" }}
        </button>
        <button class="header-btn" @click="exportScreenshot">📸 截图</button>
        <button class="header-btn" @click="exportConfig">📤 导出</button>
        <button class="header-btn" @click="showImport = true">📥 导入</button>
        <button
          v-if="!isEditMode"
          class="header-btn primary"
          @click="enterEditMode"
        >
          ✏️ 编辑
        </button>
        <button v-else class="header-btn success" @click="exitEditMode">
          ✅ 完成
        </button>
        <button class="header-btn" @click="toggleFullscreen">🔲 全屏</button>
        <router-link to="/" class="header-btn">📋 列表</router-link>
      </div>
    </div>

    <div v-if="isEditMode && !isFullscreen" class="edit-toolbar">
      <span class="toolbar-title">添加卡片：</span>
      <button
        v-for="type in cardTypes"
        :key="type.value"
        class="add-card-btn"
        @click="addCard(type.value)"
      >
        {{ type.icon }} {{ type.label }}
      </button>
      <button class="add-card-btn" @click="startCarousel">🎠 轮播</button>
      <button class="add-card-btn" @click="stopCarousel">⏹️ 停止</button>
    </div>

    <div ref="dashboardRef" class="dashboard-content">
      <grid-layout
        v-model:layout="layout"
        :col-num="6"
        :row-height="100"
        :is-draggable="isEditMode && !isFullscreen"
        :is-resizable="isEditMode && !isFullscreen"
        :is-mirrored="false"
        :vertical-compact="true"
        :margin="[10, 10]"
        :use-css-transforms="useCssTransforms"
      >
        <grid-item
          v-for="item in layout"
          :key="item.i"
          :x="item.x"
          :y="item.y"
          :w="item.w"
          :h="item.h"
          :i="item.i"
          :is-draggable="!getCardById(item.i)?.locked"
          :is-resizable="!getCardById(item.i)?.locked"
        >
          <DashboardCard
            v-if="getCardById(item.i)"
            :config="getCardById(item.i)!"
            :data="getCardData(getCardById(item.i)!)"
            :is-edit-mode="isEditMode && !isFullscreen"
            @configure="openConfig(getCardById(item.i)!)"
            @duplicate="duplicateCard(item.i)"
            @delete="deleteCard(item.i)"
          />
        </grid-item>
      </grid-layout>
    </div>

    <CardConfigPanel
      :visible="showConfig"
      :config="selectedCard!"
      @close="showConfig = false"
      @save="updateCard"
    />

    <div
      v-if="showImport"
      class="config-panel-overlay"
      @click.self="showImport = false"
    >
      <div class="config-panel">
        <div class="panel-header">
          <h3>导入看板配置</h3>
          <button class="close-btn" @click="showImport = false">×</button>
        </div>
        <div class="panel-body">
          <textarea
            v-model="importText"
            class="form-input"
            rows="10"
            placeholder="粘贴 JSON 配置"
          ></textarea>
        </div>
        <div class="panel-footer">
          <button class="btn btn-secondary" @click="showImport = false">
            取消
          </button>
          <button class="btn btn-primary" @click="doImport">导入</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, provide } from "vue";
import { useRoute, useRouter } from "vue-router";
import { GridLayout, GridItem } from "vue-grid-layout";
import html2canvas from "html2canvas";
import DashboardCard from "@/components/DashboardCard.vue";
import CardConfigPanel from "@/components/CardConfigPanel.vue";
import { useDashboardStore } from "@/stores/dashboard";
import { useDataStore } from "@/stores/data";
import { useDataSourceStore } from "@/stores/dataSource";
import { useThemeStore } from "@/stores/theme";
import type { CardConfig, CardType } from "@/types";

const route = useRoute();
const router = useRouter();
const dashboardStore = useDashboardStore();
const dataStore = useDataStore();
const themeStore = useThemeStore();

const dashboardRef = ref<HTMLElement>();
const showConfig = ref(false);
const selectedCard = ref<CardConfig | null>(null);
const showImport = ref(false);
const importText = ref("");
const useCssTransforms = ref(true);

const cardTypes = [
  { label: "折线图", value: "line" as CardType, icon: "📈" },
  { label: "柱状图", value: "bar" as CardType, icon: "📊" },
  { label: "饼图", value: "pie" as CardType, icon: "🥧" },
  { label: "热力图", value: "heatmap" as CardType, icon: "🔥" },
  { label: "指标卡", value: "metric" as CardType, icon: "🎯" },
  { label: "表格", value: "table" as CardType, icon: "📋" },
  { label: "进度环", value: "progress" as CardType, icon: "⭕" },
  { label: "排行榜", value: "ranking" as CardType, icon: "🏆" },
];

const dashboard = computed(() => dashboardStore.currentDashboard);
const isEditMode = computed(() => dashboardStore.isEditMode);
const isFullscreen = computed(() => dashboardStore.isFullscreen);
const isDark = computed(() => themeStore.isDark);

provide("isDark", isDark);

const layout = computed({
  get: () =>
    dashboard.value?.cards.map((c) => ({
      x: c.x,
      y: c.y,
      w: c.w,
      h: c.h,
      i: c.id,
    })) || [],
  set: (newLayout) => {
    if (dashboard.value) {
      const cards = dashboard.value.cards.map((card) => {
        const layoutItem = newLayout.find((l) => l.i === card.id);
        if (layoutItem) {
          return {
            ...card,
            x: layoutItem.x,
            y: layoutItem.y,
            w: layoutItem.w,
            h: layoutItem.h,
          };
        }
        return card;
      });
      dashboardStore.updateCards(cards);
    }
  },
});

onMounted(() => {
  dashboardStore.initializePresets();
  dataSourceStore.initializeDefaults();

  const id = route.params.id as string;
  if (id) {
    dashboardStore.setCurrentDashboard(id);
  }

  document.addEventListener("fullscreenchange", onFullscreenChange);
});

watch(
  () => dashboardStore.dashboards,
  () => {
    if (!dashboard.value && route.params.id) {
      const id = route.params.id as string;
      const exists = dashboardStore.dashboards.find((d) => d.id === id);
      if (!exists) {
        router.push("/");
      }
    }
  },
  { immediate: true },
);

onUnmounted(() => {
  dashboardStore.stopCarousel();
  dashboardStore.setEditMode(false);
  document.removeEventListener("fullscreenchange", onFullscreenChange);
});

function getCardById(id: string): CardConfig | undefined {
  return dashboard.value?.cards.find((c) => c.id === id);
}

function onFullscreenChange() {
  if (!document.fullscreenElement && dashboardStore.isFullscreen) {
    dashboardStore.isFullscreen = false;
    dashboardStore.stopCarousel();
  }
}

function getCardData(card: CardConfig) {
  dataStore.initDataSource(card.dataSource);
  dataStore.startDataUpdate(card.id, card.dataSource, card.refreshInterval);
  return {
    history: dataStore.dataHistory[card.dataSource] || [],
    ranking: dataStore.rankingData[card.dataSource] || [],
    table: dataStore.tableData[card.dataSource] || [],
  };
}

function enterEditMode() {
  dashboardStore.setEditMode(true);
}

function exitEditMode() {
  dashboardStore.setEditMode(false);
}

function addCard(type: CardType) {
  dashboardStore.addCard(type);
}

function deleteCard(id: string) {
  dashboardStore.deleteCard(id);
  dataStore.stopDataUpdate(id);
}

function duplicateCard(id: string) {
  dashboardStore.duplicateCard(id);
}

function openConfig(card: CardConfig) {
  selectedCard.value = card;
  showConfig.value = true;
}

function updateCard(updated: CardConfig) {
  if (dashboard.value) {
    const cards = dashboard.value.cards.map((c) =>
      c.id === updated.id ? updated : c,
    );
    dashboardStore.updateCards(cards);
    dataStore.stopDataUpdate(updated.id);
    dataStore.startDataUpdate(
      updated.id,
      updated.dataSource,
      updated.refreshInterval,
    );
  }
}

function toggleTheme() {
  themeStore.toggleTheme();
}

function toggleFullscreen() {
  dashboardStore.toggleFullscreen();
}

function startCarousel() {
  dashboardStore.startCarousel(5000);
}

function stopCarousel() {
  dashboardStore.stopCarousel();
}

async function exportScreenshot() {
  if (!dashboardRef.value) return;
  const replacements: { canvas: HTMLCanvasElement; img: HTMLImageElement; parent: Node; next: Node | null }[] = [];
  try {
    useCssTransforms.value = false;
    await new Promise((r) => setTimeout(r, 300));

    const canvases = dashboardRef.value.querySelectorAll("canvas");
    canvases.forEach((c) => {
      const img = document.createElement("img");
      img.src = c.toDataURL("image/png");
      img.style.width = c.offsetWidth + "px";
      img.style.height = c.offsetHeight + "px";
      img.style.display = "block";
      const parent = c.parentNode!;
      const next = c.nextSibling;
      parent.replaceChild(img, c);
      replacements.push({ canvas: c, img, parent, next });
    });

    const canvas = await html2canvas(dashboardRef.value, {
      backgroundColor: isDark.value ? "#1a1a2e" : "#ffffff",
      useCORS: true,
      scale: 2,
    });

    replacements.forEach(({ canvas, img, parent, next }) => {
      parent.insertBefore(canvas, next);
      parent.removeChild(img);
    });
    replacements.length = 0;

    useCssTransforms.value = true;
    const link = document.createElement("a");
    link.download = `${dashboard.value?.name || "dashboard"}.png`;
    link.href = canvas.toDataURL();
    link.click();
  } catch (e) {
    replacements.forEach(({ canvas, img, parent, next }) => {
      if (img.parentNode) {
        parent.insertBefore(canvas, next);
        parent.removeChild(img);
      }
    });
    useCssTransforms.value = true;
    console.error("截图失败:", e);
  }
}

function exportConfig() {
  const json = dashboardStore.exportConfig();
  const blob = new Blob([json], { type: "application/json" });
  const link = document.createElement("a");
  link.download = `${dashboard.value?.name || "dashboard"}.json`;
  link.href = URL.createObjectURL(blob);
  link.click();
}

function doImport() {
  try {
    dashboardStore.importConfig(importText.value);
    showImport.value = false;
    importText.value = "";
  } catch (e) {
    alert("导入失败，请检查 JSON 格式");
  }
}
</script>

<style scoped>
.dashboard-view {
  min-height: 100vh;
  background: var(--bg-color);
  color: var(--text-color);
}

.dashboard-view.fullscreen-mode {
  padding: 0;
}

.dashboard-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  background: var(--card-bg);
  border-bottom: 1px solid var(--border-color);
  position: sticky;
  top: 0;
  z-index: 100;
}

.dashboard-title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}

.header-right {
  display: flex;
  gap: 8px;
}

.header-btn {
  padding: 8px 16px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: transparent;
  cursor: pointer;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: all 0.2s;
  color: inherit;
  text-decoration: none;
}

.header-btn:hover {
  background: var(--border-color);
}

.header-btn.primary {
  background: #1890ff;
  border-color: #1890ff;
  color: white;
}

.header-btn.success {
  background: #52c41a;
  border-color: #52c41a;
  color: white;
}

.edit-toolbar {
  padding: 12px 24px;
  background: var(--card-bg);
  border-bottom: 1px solid var(--border-color);
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
}

.toolbar-title {
  font-size: 13px;
  font-weight: 500;
  margin-right: 8px;
}

.add-card-btn {
  padding: 6px 12px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--bg-color);
  cursor: pointer;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: all 0.2s;
  color: inherit;
}

.add-card-btn:hover {
  background: #1890ff;
  color: white;
  border-color: #1890ff;
}

.dashboard-content {
  padding: 24px;
}

.fullscreen-mode .dashboard-content {
  padding: 16px;
}
</style>
