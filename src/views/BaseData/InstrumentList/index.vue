<template>
    <section class="base-data-page">
        <header class="base-data-page__header">
            <div>
                <span>BASE DATA</span>
                <h1>仪器设备</h1>
                <p>维护检测过程中使用的仪器、用途和检定有效期。</p>
            </div>
            <el-button type="primary" @click="openCreateDialog">新增仪器</el-button>
        </header>

        <el-card class="base-data-card" shadow="never">
            <div class="base-data-toolbar">
                <el-input
                    v-model="keyword"
                    clearable
                    placeholder="搜索仪器名称、编号或型号"
                    prefix-icon="Search"
                />
            </div>

            <el-table v-loading="loading" :data="filteredInstruments" row-key="id">
                <el-table-column label="仪器编号" width="120" prop="code" />
                <el-table-column label="仪器名称" min-width="160" prop="name" />
                <el-table-column label="型号" min-width="150" prop="model" />
                <el-table-column label="出厂编号" min-width="160" prop="serialNumber" />
                <el-table-column label="用途" min-width="200" prop="purpose" />
                <el-table-column label="检定有效期" width="130" prop="verificationExpiresAt" />
                <el-table-column label="状态" width="100">
                    <template #default="{ row }">
                        <el-tag :type="getStatusTagType(row.status)">
                            {{ getStatusText(row.status) }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column fixed="right" label="操作" width="140">
                    <template #default="{ row }">
                        <el-button link type="primary" @click="openEditDialog(row)">编辑</el-button>
                        <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-card>

        <el-dialog
            v-model="dialogVisible"
            destroy-on-close
            :title="editingId ? '编辑仪器' : '新增仪器'"
            width="680px"
        >
            <el-form :model="instrumentForm" label-width="100px">
                <el-row :gutter="16">
                    <el-col :span="12">
                        <el-form-item label="仪器编号" required>
                            <el-input v-model="instrumentForm.code" />
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="仪器名称" required>
                            <el-input v-model="instrumentForm.name" />
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="型号" required>
                            <el-input v-model="instrumentForm.model" />
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="出厂编号" required>
                            <el-input v-model="instrumentForm.serialNumber" />
                        </el-form-item>
                    </el-col>
                    <el-col :span="24">
                        <el-form-item label="检测用途" required>
                            <el-input v-model="instrumentForm.purpose" />
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="检定有效期" required>
                            <el-date-picker
                                v-model="instrumentForm.verificationExpiresAt"
                                type="date"
                                value-format="YYYY-MM-DD"
                            />
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="使用状态">
                            <el-select v-model="instrumentForm.status">
                                <el-option label="可用" value="available" />
                                <el-option label="已过期" value="expired" />
                                <el-option label="停用" value="disabled" />
                            </el-select>
                        </el-form-item>
                    </el-col>
                </el-row>
            </el-form>

            <template #footer>
                <el-button @click="dialogVisible = false">取消</el-button>
                <el-button :loading="submitting" type="primary" @click="submitInstrument">
                    保存
                </el-button>
            </template>
        </el-dialog>
    </section>
</template>

<script setup lang="ts" name="InstrumentList">
import { computed, onMounted, reactive, ref } from 'vue'
import {
    createInstrument,
    deleteInstrument,
    getInstrumentList,
    updateInstrument,
    type Instrument,
    type InstrumentFormParams,
    type InstrumentStatus,
} from '@/api/baseData'

const createEmptyForm = (): InstrumentFormParams => ({
    code: '',
    name: '',
    model: '',
    serialNumber: '',
    purpose: '',
    verificationExpiresAt: '',
    status: 'available',
})

const loading = ref(false)
const submitting = ref(false)
const dialogVisible = ref(false)
const editingId = ref('')
const keyword = ref('')
const instruments = ref<Instrument[]>([])
const instrumentForm = reactive<InstrumentFormParams>(createEmptyForm())

// 搜索只影响当前展示，不修改后端原始数据。
const filteredInstruments = computed(() => {
    const searchValue = keyword.value.trim().toLowerCase()
    if (!searchValue) return instruments.value

    return instruments.value.filter((instrument) => {
        return [instrument.code, instrument.name, instrument.model].some((value) =>
            value.toLowerCase().includes(searchValue),
        )
    })
})

const getStatusText = (status: InstrumentStatus): string => {
    return { available: '可用', expired: '已过期', disabled: '停用' }[status]
}

const getStatusTagType = (status: InstrumentStatus): 'success' | 'warning' | 'info' => {
    return { available: 'success', expired: 'warning', disabled: 'info' }[status] as
        'success' | 'warning' | 'info'
}

const loadInstruments = async (): Promise<void> => {
    loading.value = true
    try {
        const response = await getInstrumentList()
        instruments.value = response.data
    } finally {
        loading.value = false
    }
}

const openCreateDialog = (): void => {
    editingId.value = ''
    Object.assign(instrumentForm, createEmptyForm())
    dialogVisible.value = true
}

const openEditDialog = (tableRow: unknown): void => {
    // Element Plus 表格插槽只提供通用行类型，此处根据绑定的数据源收窄为仪器类型。
    const instrument = tableRow as Instrument
    editingId.value = instrument.id
    Object.assign(instrumentForm, {
        code: instrument.code,
        name: instrument.name,
        model: instrument.model,
        serialNumber: instrument.serialNumber,
        purpose: instrument.purpose,
        verificationExpiresAt: instrument.verificationExpiresAt,
        status: instrument.status,
    })
    dialogVisible.value = true
}

const submitInstrument = async (): Promise<void> => {
    const requiredValues = [
        instrumentForm.code,
        instrumentForm.name,
        instrumentForm.model,
        instrumentForm.serialNumber,
        instrumentForm.purpose,
        instrumentForm.verificationExpiresAt,
    ]
    if (requiredValues.some((value) => !value.trim())) {
        ElMessage.warning('请完整填写仪器必填信息')
        return
    }

    submitting.value = true
    try {
        if (editingId.value) {
            await updateInstrument({ id: editingId.value, ...instrumentForm })
            ElMessage.success('仪器编辑成功')
        } else {
            await createInstrument({ ...instrumentForm })
            ElMessage.success('仪器新增成功')
        }
        dialogVisible.value = false
        await loadInstruments()
    } finally {
        submitting.value = false
    }
}

const handleDelete = async (tableRow: unknown): Promise<void> => {
    const instrument = tableRow as Instrument
    try {
        await ElMessageBox.confirm(`确认删除仪器“${instrument.name}”吗？`, '删除仪器', {
            cancelButtonText: '取消',
            confirmButtonText: '删除',
            type: 'warning',
        })
        await deleteInstrument(instrument.id)
        ElMessage.success('仪器删除成功')
        await loadInstruments()
    } catch {
        // 用户取消删除时保留当前数据。
    }
}

onMounted(() => {
    void loadInstruments()
})
</script>

<style scoped lang="scss">
.base-data-page {
    display: grid;
    gap: $space-lg;
}

.base-data-page__header {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
}

.base-data-page__header span {
    font-size: $font-size-xs;
    font-weight: $font-weight-bold;
    color: var(--sidebar-active-bg);
    letter-spacing: 0.08em;
}

.base-data-page__header h1 {
    margin: $space-xs 0;
    font-size: $font-size-xl;
    color: var(--text-primary);
}

.base-data-page__header p {
    margin: 0;
    font-size: $font-size-sm;
    color: var(--text-secondary);
}

.base-data-card {
    border-color: var(--header-border);
}

.base-data-toolbar {
    display: flex;
    justify-content: flex-end;
    margin-bottom: $space-md;
}

.base-data-toolbar :deep(.el-input) {
    width: 300px;
}

:deep(.el-date-editor),
:deep(.el-select) {
    width: 100%;
}
</style>
