<template>
  <div class="dashboard-list">
    <div class="list-header">
      <h1 class="page-title">数据看板</h1>
      <div class="header-actions">
        <button class="header-btn" @click="goToDataSources">
          📊 数据源管理
        </button>
        <button class="header-btn" @click="toggleTheme">
          {{ isDark ? "☀️" : "🌙" }}
        </button>
        <button class="header-btn primary" @click="showCreate = true">
          + 新建看板
        </button>
      </div>
    </div>

    <div class="list-content">
      <div class="dashboard-grid">
        <div
          v-for="dashboard in dashboards"
          :key="dashboard.id"
          class="dashboard-card"
        >
          <div class="card-preview">
            <div class="preview-placeholder">
              <span class="type-icon">{{ getTypeIcon(dashboard.type) }}</span>
            </div>
          </div>
          <div class="card-info">
            <h3 class="card-name">{{ dashboard.name }}</h3>
            <p class="card-meta">
              <span>{{ dashboard.cards.length }} 个卡片</span>
              <span
                >更新于
                {{ new Date(dashboard.updatedAt).toLocaleDateString() }}</span
              >
            </p>
          </div>
          <div class="card-actions">
            <button class="action-btn" @click="viewDashboard(dashboard.id)">
              👁️ 查看
            </button>
            <button class="action-btn" @click="openShare(dashboard.id)">
              🔗 分享
            </button>
            <button
              class="action-btn danger"
              @click="deleteDashboard(dashboard.id)"
            >
              🗑️ 删除
            </button>
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="showShare"
      class="config-panel-overlay"
      @click.self="showShare = false"
    >
      <div class="config-panel share-panel">
        <div class="panel-header">
          <h3>分享看板</h3>
          <button class="close-btn" @click="showShare = false">×</button>
        </div>
        <div class="panel-body">
          <div v-if="shareTokens.length > 0" class="share-links-list">
            <h4>已有分享链接</h4>
            <div
              v-for="token in shareTokens"
              :key="token.id"
              class="share-link-item"
            >
              <div class="link-info">
                <input
                  type="text"
                  class="link-input"
                  readonly
                  :value="getShareUrl(token.token)"
                />
                <span class="link-meta">
                  {{ token.viewCount }} 次查看 · 创建于
                  {{ new Date(token.createdAt).toLocaleDateString() }}
                </span>
              </div>
              <button
                class="action-btn copy-btn"
                @click="copyLink(getShareUrl(token.token))"
              >
                复制
              </button>
              <button
                class="action-btn danger"
                @click="deleteShareToken(token.id)"
              >
                删除
              </button>
            </div>
          </div>
          <div class="create-share-section">
            <h4>创建新分享链接</h4>
            <button class="btn primary" @click="createShareToken">
              创建分享链接
            </button>
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="showCreate"
      class="config-panel-overlay"
      @click.self="showCreate = false"
    >
      <div class="config-panel">
        <div class="panel-header">
          <h3>新建看板</h3>
          <button class="close-btn" @click="showCreate = false">×</button>
        </div>
        <div class="panel-body">
          <div class="form-group">
            <label>看板名称</label>
            <input
              v-model="newDashboard.name"
              type="text"
              class="form-input"
              placeholder="请输入看板名称"
            />
          </div>
          <div class="form-group">
            <label>看板类型</label>
            <div class="type-grid">
              <div
                v-for="type in dashboardTypes"
                :key="type.value"
                class="type-option"
                :class="{ active: newDashboard.type === type.value }"
                @click="newDashboard.type = type.value"
              >
                <span class="type-icon">{{ type.icon }}</span>
                <span class="type-label">{{ type.label }}</span>
              </div>
            </div>
          </div>
        </div>
        <div class="panel-footer">
          <button class="btn btn-secondary" @click="showCreate = false">
            取消
          </button>
          <button class="btn btn-primary" @click="createDashboard">创建</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useDashboardStore } from "@/stores/dashboard";
import { useDataSourceStore } from "@/stores/dataSource";
import { useThemeStore } from "@/stores/theme";
import type { DashboardType } from "@/types";

const router = useRouter();
const dashboardStore = useDashboardStore();
const dataSourceStore = useDataSourceStore();
const themeStore = useThemeStore();

const dashboards = computed(() => dashboardStore.dashboards);
const isDark = computed(() => themeStore.isDark);
const showCreate = ref(false);
const showShare = ref(false);
const currentShareDashboardId = ref<string>("");

const shareTokens = computed(() =>
  dataSourceStore.getShareTokensByDashboardId(currentShareDashboardId.value),
);

const newDashboard = ref({
  name: "",
  type: "ecommerce" as DashboardType,
});

const dashboardTypes = [
  { label: "电商运营", value: "ecommerce" as DashboardType, icon: "🛒" },
  { label: "物流监控", value: "logistics" as DashboardType, icon: "🚚" },
  { label: "客服运营", value: "customerService" as DashboardType, icon: "💬" },
];

onMounted(() => {
  dashboardStore.initializePresets();
});

function getTypeIcon(type: DashboardType): string {
  const icons: Record<DashboardType, string> = {
    ecommerce: "🛒",
    logistics: "🚚",
    customerService: "💬",
  };
  return icons[type] || "📊";
}

function toggleTheme() {
  themeStore.toggleTheme();
}

function viewDashboard(id: string) {
  router.push(`/dashboard/${id}`);
}

function goToDataSources() {
  router.push("/data-sources");
}

function openShare(dashboardId: string) {
  currentShareDashboardId.value = dashboardId;
  showShare.value = true;
}

function createShareToken() {
  const token = dataSourceStore.createShareToken(currentShareDashboardId.value);
  copyLink(getShareUrl(token.token));
}

function getShareUrl(token: string): string {
  return `${window.location.origin}/#/share/${token}`;
}

async function copyLink(link: string) {
  try {
    await navigator.clipboard.writeText(link);
    alert("链接已复制到剪贴板");
  } catch (e) {
    const textArea = document.createElement("textarea");
    textArea.value = link;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand("copy");
    document.body.removeChild(textArea);
    alert("链接已复制到剪贴板");
  }
}

function deleteShareToken(tokenId: string) {
  if (confirm("确定要删除这个分享链接吗？")) {
    dataSourceStore.deleteShareToken(tokenId);
  }
}

function deleteDashboard(id: string) {
  if (confirm("确定要删除这个看板吗？")) {
    dashboardStore.deleteDashboard(id);
  }
}

function createDashboard() {
  if (!newDashboard.value.name.trim()) {
    alert("请输入看板名称");
    return;
  }
  const dashboard = dashboardStore.createDashboard(
    newDashboard.value.name,
    newDashboard.value.type,
  );
  showCreate.value = false;
  newDashboard.value = { name: "", type: "ecommerce" };
  router.push(`/dashboard/${dashboard.id}`);
}
</script>

<style scoped>
.dashboard-list {
  min-height: 100vh;
  background: var(--bg-color);
  color: var(--text-color);
}

.list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px;
  background: var(--card-bg);
  border-bottom: 1px solid var(--border-color);
}

.page-title {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.header-btn {
  padding: 10px 20px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: transparent;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;
  color: inherit;
}

.header-btn:hover {
  background: var(--border-color);
}

.header-btn.primary {
  background: #1890ff;
  border-color: #1890ff;
  color: white;
}

.list-content {
  padding: 24px;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.dashboard-card {
  background: var(--card-bg);
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid var(--border-color);
  transition:
    transform 0.2s,
    box-shadow 0.2s;
}

.dashboard-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.card-preview {
  height: 160px;
  background: linear-gradient(135deg, #1890ff 0%, #52c41a 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-placeholder {
  width: 80px;
  height: 80px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.type-icon {
  font-size: 32px;
}

.card-info {
  padding: 16px;
}

.card-name {
  margin: 0 0 8px;
  font-size: 16px;
  font-weight: 600;
}

.card-meta {
  margin: 0;
  font-size: 12px;
  opacity: 0.7;
  display: flex;
  gap: 16px;
}

.card-actions {
  padding: 12px 16px;
  border-top: 1px solid var(--border-color);
  display: flex;
  gap: 8px;
}

.action-btn {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: transparent;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s;
  color: inherit;
}

.action-btn:hover {
  background: #1890ff;
  color: white;
  border-color: #1890ff;
}

.action-btn.danger:hover {
  background: #f5222d;
  border-color: #f5222d;
}

.type-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.type-option {
  padding: 16px;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
}

.type-option:hover {
  border-color: #1890ff;
}

.type-option.active {
  border-color: #1890ff;
  background: rgba(24, 144, 255, 0.1);
}

.type-option .type-icon {
  font-size: 28px;
}

.type-option .type-label {
  font-size: 13px;
  font-weight: 500;
}

.share-panel {
  width: 500px !important;
}

.share-links-list {
  margin-bottom: 24px;
}

.share-links-list h4,
.create-share-section h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
}

.share-link-item {
  display: flex;
  gap: 8px;
  align-items: center;
  padding: 12px;
  background: var(--bg-color);
  border-radius: 8px;
  margin-bottom: 8px;
}

.link-info {
  flex: 1;
  min-width: 0;
}

.link-input {
  width: 100%;
  padding: 6px 10px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: var(--card-bg);
  color: inherit;
  font-size: 12px;
  box-sizing: border-box;
}

.link-meta {
  display: block;
  margin-top: 4px;
  font-size: 11px;
  opacity: 0.6;
}

.copy-btn {
  background: #1890ff !important;
  border-color: #1890ff !important;
  color: white !important;
}
</style>
