<template>
  <div v-if="visible" class="config-panel-overlay" @click.self="$emit('close')">
    <div class="config-panel">
      <div class="panel-header">
        <h3>卡片配置</h3>
        <button class="close-btn" @click="$emit('close')">×</button>
      </div>
      <div class="panel-body">
        <div class="form-group">
          <label>卡片标题</label>
          <input v-model="config.title" type="text" class="form-input" />
        </div>
        <div class="form-group">
          <label>数据源</label>
          <select v-model="config.dataSource" class="form-select">
            <option
              v-for="ds in availableDataSources"
              :key="ds.id"
              :value="ds.id"
            >
              {{ ds.name }}
            </option>
          </select>
        </div>
        <div class="form-group">
          <label>刷新频率</label>
          <select v-model="config.refreshInterval" class="form-select">
            <option :value="1">1 秒</option>
            <option :value="5">5 秒</option>
            <option :value="30">30 秒</option>
            <option value="manual">手动刷新</option>
          </select>
        </div>
        <div class="form-group">
          <label>单位</label>
          <input
            v-model="config.unit"
            type="text"
            class="form-input"
            placeholder="如：元、个、%"
          />
        </div>
        <div class="form-group">
          <label>颜色主题</label>
          <div class="color-picker">
            <button
              v-for="color in presetColors"
              :key="color"
              class="color-btn"
              :style="{ background: color }"
              :class="{ active: config.colors[0] === color }"
              @click="config.colors = [color, ...config.colors.slice(1)]"
            />
          </div>
        </div>
        <div class="form-group">
          <label>
            <input type="checkbox" v-model="config.locked" />
            锁定位置
          </label>
        </div>

        <div class="alert-section">
          <div class="section-header">
            <h4>数据告警阈值</h4>
            <button
              class="btn small"
              @click="addAlertThreshold"
              :disabled="!currentDataSource"
            >
              + 添加阈值
            </button>
          </div>
          <div
            v-for="(threshold, index) in config.alertThresholds"
            :key="index"
            class="threshold-row"
          >
            <select v-model="threshold.field" class="form-select small">
              <option
                v-for="field in currentDataSourceFields"
                :key="field.name"
                :value="field.name"
              >
                {{ field.label }}
              </option>
            </select>
            <select v-model="threshold.operator" class="form-select tiny">
              <option value=">">></option>
              <option value=">=">>=</option>
              <option value="<"><</option>
              <option value="<="><=</option>
              <option value="==">==</option>
            </select>
            <input
              v-model.number="threshold.value"
              type="number"
              class="form-input tiny"
              step="0.01"
            />
            <label class="toggle-label">
              <input type="checkbox" v-model="threshold.enabled" />
              启用
            </label>
            <button
              class="action-btn danger"
              @click="removeAlertThreshold(index)"
            >
              删除
            </button>
          </div>
          <p v-if="config.alertThresholds.length === 0" class="empty-hint">
            暂无告警阈值配置
          </p>
        </div>
      </div>
      <div class="panel-footer">
        <button class="btn btn-secondary" @click="$emit('close')">取消</button>
        <button class="btn btn-primary" @click="handleSave">保存</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from "vue";
import { useDataSourceStore } from "@/stores/dataSource";
import type { CardConfig, RefreshInterval, AlertThreshold } from "@/types";

const dataSourceStore = useDataSourceStore();

const props = defineProps<{
  visible: boolean;
  config: CardConfig;
}>();

const emit = defineEmits(["close", "save"]);

const config = ref<CardConfig>({ ...props.config });

watch(
  () => props.config,
  (newConfig) => {
    config.value = {
      ...newConfig,
      alertThresholds: newConfig.alertThresholds || [],
    };
  },
  { deep: true },
);

const presetColors = [
  "#1890ff",
  "#52c41a",
  "#faad14",
  "#f5222d",
  "#722ed1",
  "#eb2f96",
  "#13c2c2",
  "#fa8c16",
];

const availableDataSources = computed(() => dataSourceStore.dataSources);

const currentDataSource = computed(() =>
  dataSourceStore.getDataSourceById(config.value.dataSource),
);

const currentDataSourceFields = computed(
  () =>
    currentDataSource.value?.fields.filter((f) => f.type === "number") || [],
);

function addAlertThreshold() {
  if (currentDataSourceFields.value.length > 0) {
    const newThreshold: AlertThreshold = {
      field: currentDataSourceFields.value[0].name,
      operator: ">",
      value: 0,
      enabled: true,
    };
    config.value.alertThresholds.push(newThreshold);
  }
}

function removeAlertThreshold(index: number) {
  config.value.alertThresholds.splice(index, 1);
}

function handleSave() {
  emit("save", config.value);
  emit("close");
}
</script>

<style scoped>
.config-panel-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.config-panel {
  background: var(--bg-color);
  border-radius: 12px;
  width: 450px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.panel-header {
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.panel-header h3 {
  margin: 0;
  font-size: 16px;
}

.close-btn {
  width: 28px;
  height: 28px;
  border: none;
  background: transparent;
  font-size: 20px;
  cursor: pointer;
  border-radius: 4px;
}

.close-btn:hover {
  background: var(--border-color);
}

.panel-body {
  padding: 20px;
  overflow-y: auto;
  flex: 1;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-size: 13px;
  font-weight: 500;
}

.form-input,
.form-select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--card-bg);
  color: inherit;
  font-size: 14px;
  box-sizing: border-box;
}

.form-input:focus,
.form-select:focus {
  outline: none;
  border-color: #1890ff;
}

.form-input.small {
  width: 120px;
}

.form-select.small {
  width: 100px;
}

.form-select.tiny {
  width: 60px;
}

.form-input.tiny {
  width: 70px;
}

.color-picker {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.color-btn {
  width: 32px;
  height: 32px;
  border: 2px solid transparent;
  border-radius: 6px;
  cursor: pointer;
  transition: transform 0.2s;
}

.color-btn:hover {
  transform: scale(1.1);
}

.color-btn.active {
  border-color: #1890ff;
}

.alert-section {
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid var(--border-color);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.section-header h4 {
  margin: 0;
  font-size: 14px;
}

.threshold-row {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 8px;
  flex-wrap: wrap;
}

.toggle-label {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  cursor: pointer;
}

.empty-hint {
  margin: 0;
  font-size: 12px;
  color: #888;
  text-align: center;
  padding: 12px;
}

.panel-footer {
  padding: 16px 20px;
  border-top: 1px solid var(--border-color);
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.btn {
  padding: 8px 16px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
}

.btn.small {
  padding: 4px 8px;
  font-size: 12px;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: #1890ff;
  color: white;
}

.btn-secondary {
  background: var(--border-color);
  color: inherit;
}

.action-btn {
  padding: 4px 8px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: transparent;
  cursor: pointer;
  font-size: 12px;
  color: inherit;
}

.action-btn.danger {
  color: #f5222d;
  border-color: #f5222d;
}
</style>
