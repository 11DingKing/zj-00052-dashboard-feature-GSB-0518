<template>
  <div class="data-source-manager">
    <div class="page-header">
      <h1>数据源管理</h1>
      <button class="btn primary" @click="openCreateModal">+ 新建数据源</button>
      <router-link to="/" class="btn secondary">返回列表</router-link>
    </div>

    <div v-if="dataSources.length === 0" class="empty-state">
      <p>暂无数据源，点击"新建数据源"创建第一个数据源</p>
    </div>

    <div v-else class="data-source-list">
      <div v-for="ds in dataSources" :key="ds.id" class="data-source-card">
        <div class="card-header">
          <h3>{{ ds.name }}</h3>
          <div class="card-actions">
            <button class="action-btn" @click="editDataSource(ds)">编辑</button>
            <button class="action-btn danger" @click="deleteDataSource(ds.id)">删除</button>
          </div>
        </div>
        <p v-if="ds.description" class="card-description">{{ ds.description }}</p>
        <div class="card-meta">
          <span>字段数量: {{ ds.fields.length }}</span>
          <span>创建时间: {{ new Date(ds.createdAt).toLocaleString() }}</span>
        </div>
        <div class="fields-preview">
          <span v-for="field in ds.fields" :key="field.name" class="field-tag">
            {{ field.label }} ({{ field.type }})
          </span>
        </div>
      </div>
    </div>

    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>{{ editingDataSource ? '编辑数据源' : '新建数据源' }}</h3>
          <button class="close-btn" @click="closeModal">×</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>数据源名称 *</label>
            <input v-model="formData.name" type="text" class="form-input" placeholder="输入数据源名称" />
          </div>
          <div class="form-group">
            <label>描述</label>
            <textarea v-model="formData.description" class="form-input" rows="2" placeholder="输入数据源描述"></textarea>
          </div>

          <div class="fields-section">
            <div class="section-header">
              <h4>数据字段</h4>
              <button class="btn small" @click="addField">+ 添加字段</button>
            </div>
            <div v-for="(field, index) in formData.fields" :key="index" class="field-row">
              <input v-model="field.name" type="text" class="form-input small" placeholder="字段名" />
              <input v-model="field.label" type="text" class="form-input small" placeholder="显示名称" />
              <select v-model="field.type" class="form-select small">
                <option value="number">数字</option>
                <option value="string">字符串</option>
                <option value="boolean">布尔</option>
              </select>
              <button class="action-btn danger" @click="removeField(index)">删除</button>
            </div>
          </div>

          <div class="rules-section">
            <div class="section-header">
              <h4>数据生成规则</h4>
            </div>
            <div v-for="field in formData.fields" :key="field.name" class="rule-row">
              <label>{{ field.label || field.name }}</label>
              <div v-if="field.type === 'number'" class="rule-inputs">
                <input v-model.number="getRule(field.name).min" type="number" class="form-input tiny" placeholder="最小值" />
                <span>~</span>
                <input v-model.number="getRule(field.name).max" type="number" class="form-input tiny" placeholder="最大值" />
                <input v-model.number="getRule(field.name).decimals" type="number" class="form-input tiny" placeholder="小数位数" />
              </div>
              <span v-else class="no-rule">暂无规则</span>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn secondary" @click="closeModal">取消</button>
          <button class="btn primary" @click="saveDataSource">保存</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useDataSourceStore } from '@/stores/dataSource'
import type { DataSource, DataField, DataGenerationRule } from '@/types'

const dataSourceStore = useDataSourceStore()

const showModal = ref(false)
const editingDataSource = ref<DataSource | null>(null)

const formData = ref<{
  name: string
  description: string
  fields: DataField[]
  generationRules: Record<string, DataGenerationRule>
}>({
  name: '',
  description: '',
  fields: [],
  generationRules: {}
})

const dataSources = dataSourceStore.dataSources

onMounted(() => {
  dataSourceStore.initializeDefaults()
})

function openCreateModal() {
  editingDataSource.value = null
  formData.value = {
    name: '',
    description: '',
    fields: [{ name: 'value', type: 'number', label: '数值' }],
    generationRules: { value: { min: 0, max: 100 } }
  }
  showModal.value = true
}

function editDataSource(ds: DataSource) {
  editingDataSource.value = ds
  formData.value = {
    name: ds.name,
    description: ds.description || '',
    fields: JSON.parse(JSON.stringify(ds.fields)),
    generationRules: JSON.parse(JSON.stringify(ds.generationRules))
  }
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  editingDataSource.value = null
}

function addField() {
  const name = `field${formData.value.fields.length + 1}`
  formData.value.fields.push({ name, type: 'number', label: name })
  formData.value.generationRules[name] = { min: 0, max: 100 }
}

function removeField(index: number) {
  const field = formData.value.fields[index]
  formData.value.fields.splice(index, 1)
  delete formData.value.generationRules[field.name]
}

function getRule(fieldName: string): DataGenerationRule {
  if (!formData.value.generationRules[fieldName]) {
    formData.value.generationRules[fieldName] = { min: 0, max: 100 }
  }
  return formData.value.generationRules[fieldName]
}

function saveDataSource() {
  if (!formData.value.name.trim()) {
    alert('请输入数据源名称')
    return
  }
  if (formData.value.fields.length === 0) {
    alert('请至少添加一个字段')
    return
  }

  if (editingDataSource.value) {
    dataSourceStore.updateDataSource(editingDataSource.value.id, {
      name: formData.value.name,
      description: formData.value.description,
      fields: formData.value.fields,
      generationRules: formData.value.generationRules
    })
  } else {
    dataSourceStore.createDataSource(
      formData.value.name,
      formData.value.fields,
      formData.value.generationRules,
      formData.value.description
    )
  }
  closeModal()
}

function deleteDataSource(id: string) {
  if (confirm('确定要删除这个数据源吗？')) {
    dataSourceStore.deleteDataSource(id)
  }
}
</script>

<style scoped>
.data-source-manager {
  min-height: 100vh;
  background: var(--bg-color);
  color: var(--text-color);
  padding: 24px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-header h1 {
  margin: 0;
  font-size: 24px;
}

.page-header .btn {
  margin-left: 8px;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  background: var(--card-bg);
  border-radius: 12px;
}

.data-source-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 16px;
}

.data-source-card {
  background: var(--card-bg);
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}

.card-header h3 {
  margin: 0;
  font-size: 16px;
}

.card-actions {
  display: flex;
  gap: 8px;
}

.card-description {
  margin: 0 0 12px 0;
  color: #666;
  font-size: 14px;
}

.card-meta {
  display: flex;
  gap: 16px;
  margin-bottom: 12px;
  font-size: 12px;
  color: #888;
}

.fields-preview {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.field-tag {
  background: var(--border-color);
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.modal-overlay {
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

.modal-content {
  background: var(--card-bg);
  border-radius: 12px;
  width: 600px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
}

.modal-header {
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
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

.modal-body {
  padding: 20px;
  overflow-y: auto;
  flex: 1;
}

.modal-footer {
  padding: 16px 20px;
  border-top: 1px solid var(--border-color);
  display: flex;
  gap: 12px;
  justify-content: flex-end;
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

.form-input, .form-select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--bg-color);
  color: inherit;
  font-size: 14px;
  box-sizing: border-box;
}

.form-input.small {
  width: 120px;
}

.form-select.small {
  width: 100px;
}

.form-input.tiny {
  width: 80px;
}

.btn {
  padding: 8px 16px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
  display: inline-block;
}

.btn.primary {
  background: #1890ff;
  color: white;
}

.btn.secondary {
  background: var(--border-color);
  color: inherit;
}

.btn.small {
  padding: 4px 8px;
  font-size: 12px;
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

.fields-section, .rules-section {
  margin-bottom: 20px;
  padding-top: 12px;
  border-top: 1px solid var(--border-color);
}

.field-row, .rule-row {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 8px;
}

.rule-row label {
  width: 100px;
  font-size: 13px;
}

.rule-inputs {
  display: flex;
  gap: 8px;
  align-items: center;
}

.no-rule {
  font-size: 12px;
  color: #888;
}
</style>
