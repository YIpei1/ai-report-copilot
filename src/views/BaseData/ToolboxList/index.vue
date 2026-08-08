<template>
    <section class="base-data-page">
        <header class="base-data-page__header">
            <div>
                <span>BASE DATA</span>
                <h1>工具箱</h1>
                <p>组合仪器设备，创建检测任务时可一次选择整套检测工具。</p>
            </div>
            <el-button type="primary" @click="openCreateDialog">新增工具箱</el-button>
        </header>

        <el-card class="base-data-card" shadow="never">
            <el-table v-loading="loading" :data="toolboxes" row-key="id">
                <el-table-column label="工具箱名称" min-width="190" prop="name" />
                <el-table-column label="工具箱编号" width="130" prop="code" />
                <el-table-column label="适用检测类型" min-width="210" prop="applicableType" />
                <el-table-column label="仪器设备" min-width="300">
                    <template #default="{ row }">
                        <el-tag
                            v-for="instrumentName in getInstrumentNames(row.instrumentIds)"
                            :key="instrumentName"
                            class="instrument-tag"
                            effect="plain"
                        >
                            {{ instrumentName }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="状态" width="90">
                    <template #default="{ row }">
                        <el-tag :type="row.status === 'enabled' ? 'success' : 'info'">
                            {{ row.status === 'enabled' ? '启用' : '停用' }}
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
            :title="editingId ? '编辑工具箱' : '新增工具箱'"
            width="660px"
        >
            <el-form :model="toolboxForm" label-width="110px">
                <el-form-item label="工具箱名称" required>
                    <el-input v-model="toolboxForm.name" />
                </el-form-item>
                <el-form-item label="工具箱编号" required>
                    <el-input v-model="toolboxForm.code" />
                </el-form-item>
                <el-form-item label="适用检测类型" required>
                    <el-input v-model="toolboxForm.applicableType" />
                </el-form-item>
                <el-form-item label="包含仪器" required>
                    <el-select
                        v-model="toolboxForm.instrumentIds"
                        collapse-tags
                        collapse-tags-tooltip
                        filterable
                        multiple
                        placeholder="请选择仪器设备"
                    >
                        <el-option
                            v-for="instrument in availableInstruments"
                            :key="instrument.id"
                            :label="`${instrument.name}（${instrument.code}）`"
                            :value="instrument.id"
                        />
                    </el-select>
                </el-form-item>
                <el-form-item label="状态">
                    <el-radio-group v-model="toolboxForm.status">
                        <el-radio value="enabled">启用</el-radio>
                        <el-radio value="disabled">停用</el-radio>
                    </el-radio-group>
                </el-form-item>
                <el-form-item label="备注">
                    <el-input v-model="toolboxForm.remark" :rows="3" type="textarea" />
                </el-form-item>
            </el-form>

            <template #footer>
                <el-button @click="dialogVisible = false">取消</el-button>
                <el-button :loading="submitting" type="primary" @click="submitToolbox">
                    保存
                </el-button>
            </template>
        </el-dialog>
    </section>
</template>

<script setup lang="ts" name="ToolboxList">
import { computed, onMounted, reactive, ref } from 'vue'
import {
    createToolbox,
    deleteToolbox,
    getInstrumentList,
    getToolboxList,
    updateToolbox,
    type Instrument,
    type Toolbox,
    type ToolboxFormParams,
} from '@/api/baseData'

const createEmptyForm = (): ToolboxFormParams => ({
    code: '',
    name: '',
    applicableType: '曳引驱动电梯自行检测',
    instrumentIds: [],
    status: 'enabled',
    remark: '',
})

const loading = ref(false)
const submitting = ref(false)
const dialogVisible = ref(false)
const editingId = ref('')
const instruments = ref<Instrument[]>([])
const toolboxes = ref<Toolbox[]>([])
const toolboxForm = reactive<ToolboxFormParams>(createEmptyForm())

const availableInstruments = computed(() => {
    return instruments.value.filter((instrument) => instrument.status === 'available')
})

const getInstrumentNames = (instrumentIds: string[]): string[] => {
    return instrumentIds.map((id) => instruments.value.find((item) => item.id === id)?.name || id)
}

const loadBaseData = async (): Promise<void> => {
    loading.value = true
    try {
        const [instrumentResponse, toolboxResponse] = await Promise.all([
            getInstrumentList(),
            getToolboxList(),
        ])
        instruments.value = instrumentResponse.data
        toolboxes.value = toolboxResponse.data
    } finally {
        loading.value = false
    }
}

const openCreateDialog = (): void => {
    editingId.value = ''
    Object.assign(toolboxForm, createEmptyForm())
    dialogVisible.value = true
}

const openEditDialog = (tableRow: unknown): void => {
    // Element Plus 表格插槽只提供通用行类型，此处根据绑定的数据源收窄为工具箱类型。
    const toolbox = tableRow as Toolbox
    editingId.value = toolbox.id
    Object.assign(toolboxForm, {
        code: toolbox.code,
        name: toolbox.name,
        applicableType: toolbox.applicableType,
        instrumentIds: [...toolbox.instrumentIds],
        status: toolbox.status,
        remark: toolbox.remark,
    })
    dialogVisible.value = true
}

const submitToolbox = async (): Promise<void> => {
    if (
        !toolboxForm.code.trim() ||
        !toolboxForm.name.trim() ||
        !toolboxForm.applicableType.trim() ||
        toolboxForm.instrumentIds.length === 0
    ) {
        ElMessage.warning('请完整填写工具箱必填信息')
        return
    }

    submitting.value = true
    try {
        if (editingId.value) {
            await updateToolbox({ id: editingId.value, ...toolboxForm })
            ElMessage.success('工具箱编辑成功')
        } else {
            await createToolbox({ ...toolboxForm })
            ElMessage.success('工具箱新增成功')
        }
        dialogVisible.value = false
        await loadBaseData()
    } finally {
        submitting.value = false
    }
}

const handleDelete = async (tableRow: unknown): Promise<void> => {
    const toolbox = tableRow as Toolbox
    try {
        await ElMessageBox.confirm(`确认删除工具箱“${toolbox.name}”吗？`, '删除工具箱', {
            cancelButtonText: '取消',
            confirmButtonText: '删除',
            type: 'warning',
        })
        await deleteToolbox(toolbox.id)
        ElMessage.success('工具箱删除成功')
        await loadBaseData()
    } catch {
        // 用户取消删除时保留当前数据。
    }
}

onMounted(() => {
    void loadBaseData()
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

.instrument-tag {
    margin: $space-xs $space-xs $space-xs 0;
}

:deep(.el-select) {
    width: 100%;
}
</style>
