<template>
    <section class="base-data-page">
        <header class="base-data-page__header">
            <div>
                <span>BASE DATA</span>
                <h1>设备台账</h1>
                <p>维护用于创建 AI 检测会话的电梯设备基础信息。</p>
            </div>
            <el-button type="primary" @click="openCreateDialog">新增设备</el-button>
        </header>

        <el-card class="base-data-card" shadow="never">
            <el-form class="device-filters" :inline="true" :model="filters">
                <el-form-item label="关键词">
                    <el-input
                        v-model="filters.keyword"
                        clearable
                        placeholder="设备名称、编号或安装地点"
                        @keyup.enter="handleSearch"
                    />
                </el-form-item>
                <el-form-item label="设备状态">
                    <el-select v-model="filters.status" clearable placeholder="全部状态">
                        <el-option label="启用" value="active" />
                        <el-option label="停用" value="disabled" />
                    </el-select>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="handleSearch">查询</el-button>
                    <el-button @click="handleReset">重置</el-button>
                </el-form-item>
            </el-form>

            <el-table v-loading="loading" :data="devices" row-key="id">
                <el-table-column label="设备名称" min-width="190" prop="name" />
                <el-table-column label="设备编号" min-width="130" prop="code" />
                <el-table-column label="设备类别" min-width="180" prop="category" />
                <el-table-column label="安装地点" min-width="150" prop="location" />
                <el-table-column label="额定载重" width="110">
                    <template #default="{ row }">{{ row.ratedLoad }} kg</template>
                </el-table-column>
                <el-table-column label="额定速度" width="110">
                    <template #default="{ row }">{{ row.ratedSpeed }} m/s</template>
                </el-table-column>
                <el-table-column label="状态" width="90">
                    <template #default="{ row }">
                        <el-tag :type="row.status === 'active' ? 'success' : 'info'">
                            {{ row.status === 'active' ? '启用' : '停用' }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column fixed="right" label="操作" width="150">
                    <template #default="{ row }">
                        <el-button link type="primary" @click="openEditDialog(row)">编辑</el-button>
                        <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>

            <div class="base-data-pagination">
                <el-pagination
                    v-model:current-page="pagination.page"
                    v-model:page-size="pagination.pageSize"
                    background
                    layout="total, prev, pager, next"
                    :total="total"
                    @current-change="loadDevices"
                />
            </div>
        </el-card>

        <el-dialog
            v-model="dialogVisible"
            destroy-on-close
            :title="editingId ? '编辑设备' : '新增设备'"
            width="760px"
        >
            <el-form :model="deviceForm" label-width="110px">
                <el-row :gutter="16">
                    <el-col :span="12">
                        <el-form-item label="设备名称" required>
                            <el-input v-model="deviceForm.name" />
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="设备编号" required>
                            <el-input v-model="deviceForm.code" />
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="设备类别" required>
                            <el-input v-model="deviceForm.category" />
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="产品型号" required>
                            <el-input v-model="deviceForm.model" />
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="登记证编号" required>
                            <el-input v-model="deviceForm.registrationCode" />
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="安装地点" required>
                            <el-input v-model="deviceForm.location" />
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="使用单位" required>
                            <el-input v-model="deviceForm.userOrganization" />
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="维保单位" required>
                            <el-input v-model="deviceForm.maintenanceOrganization" />
                        </el-form-item>
                    </el-col>
                    <el-col :span="8">
                        <el-form-item label="额定载重">
                            <el-input-number v-model="deviceForm.ratedLoad" :min="1" :step="100" />
                        </el-form-item>
                    </el-col>
                    <el-col :span="8">
                        <el-form-item label="额定速度">
                            <el-input-number
                                v-model="deviceForm.ratedSpeed"
                                :min="0.1"
                                :precision="2"
                                :step="0.25"
                            />
                        </el-form-item>
                    </el-col>
                    <el-col :span="8">
                        <el-form-item label="设备状态">
                            <el-select v-model="deviceForm.status">
                                <el-option label="启用" value="active" />
                                <el-option label="停用" value="disabled" />
                            </el-select>
                        </el-form-item>
                    </el-col>
                    <el-col :span="8">
                        <el-form-item label="层数">
                            <el-input-number v-model="deviceForm.floors" :min="1" />
                        </el-form-item>
                    </el-col>
                    <el-col :span="8">
                        <el-form-item label="站数">
                            <el-input-number v-model="deviceForm.stations" :min="1" />
                        </el-form-item>
                    </el-col>
                    <el-col :span="8">
                        <el-form-item label="门数">
                            <el-input-number v-model="deviceForm.doors" :min="1" />
                        </el-form-item>
                    </el-col>
                </el-row>
            </el-form>

            <template #footer>
                <el-button @click="dialogVisible = false">取消</el-button>
                <el-button :loading="submitting" type="primary" @click="submitDevice">
                    保存
                </el-button>
            </template>
        </el-dialog>
    </section>
</template>

<script setup lang="ts" name="DeviceList">
import { onMounted, reactive, ref } from 'vue'
import {
    createDevice,
    deleteDevice,
    getDeviceList,
    updateDevice,
    type Device,
    type DeviceFormParams,
    type DeviceStatus,
} from '@/api/baseData'

const createEmptyDeviceForm = (): DeviceFormParams => ({
    name: '',
    code: '',
    category: '曳引驱动乘客电梯',
    model: '',
    registrationCode: '',
    location: '',
    userOrganization: '',
    maintenanceOrganization: '',
    ratedLoad: 1000,
    ratedSpeed: 1.75,
    floors: 10,
    stations: 10,
    doors: 10,
    status: 'active',
})

const loading = ref(false)
const submitting = ref(false)
const devices = ref<Device[]>([])
const total = ref(0)
const dialogVisible = ref(false)
const editingId = ref('')
const filters = reactive<{ keyword: string; status: DeviceStatus | '' }>({
    keyword: '',
    status: '',
})
const pagination = reactive({
    page: 1,
    pageSize: 10,
})
const deviceForm = reactive<DeviceFormParams>(createEmptyDeviceForm())

const loadDevices = async (): Promise<void> => {
    loading.value = true

    try {
        const response = await getDeviceList({
            keyword: filters.keyword,
            status: filters.status,
            page: pagination.page,
            pageSize: pagination.pageSize,
        })
        devices.value = response.data.items
        total.value = response.data.total
    } finally {
        loading.value = false
    }
}

const handleSearch = (): void => {
    pagination.page = 1
    void loadDevices()
}

const handleReset = (): void => {
    filters.keyword = ''
    filters.status = ''
    pagination.page = 1
    void loadDevices()
}

const resetDeviceForm = (): void => {
    Object.assign(deviceForm, createEmptyDeviceForm())
}

const openCreateDialog = (): void => {
    editingId.value = ''
    resetDeviceForm()
    dialogVisible.value = true
}

const openEditDialog = (tableRow: unknown): void => {
    // Element Plus 表格插槽只提供通用行类型，此处根据绑定的数据源收窄为设备类型。
    const device = tableRow as Device
    editingId.value = device.id
    Object.assign(deviceForm, {
        name: device.name,
        code: device.code,
        category: device.category,
        model: device.model,
        registrationCode: device.registrationCode,
        location: device.location,
        userOrganization: device.userOrganization,
        maintenanceOrganization: device.maintenanceOrganization,
        ratedLoad: device.ratedLoad,
        ratedSpeed: device.ratedSpeed,
        floors: device.floors,
        stations: device.stations,
        doors: device.doors,
        status: device.status,
    })
    dialogVisible.value = true
}

const validateDeviceForm = (): boolean => {
    const requiredValues = [
        deviceForm.name,
        deviceForm.code,
        deviceForm.category,
        deviceForm.model,
        deviceForm.registrationCode,
        deviceForm.location,
        deviceForm.userOrganization,
        deviceForm.maintenanceOrganization,
    ]

    if (requiredValues.some((value) => !value.trim())) {
        ElMessage.warning('请完整填写设备必填信息')
        return false
    }

    return true
}

const submitDevice = async (): Promise<void> => {
    if (!validateDeviceForm()) {
        return
    }

    submitting.value = true

    try {
        if (editingId.value) {
            await updateDevice({ id: editingId.value, ...deviceForm })
            ElMessage.success('设备编辑成功')
        } else {
            await createDevice({ ...deviceForm })
            ElMessage.success('设备新增成功')
        }

        dialogVisible.value = false
        await loadDevices()
    } finally {
        submitting.value = false
    }
}

const handleDelete = async (tableRow: unknown): Promise<void> => {
    const device = tableRow as Device
    try {
        await ElMessageBox.confirm(`确认删除设备“${device.name}”吗？`, '删除设备', {
            cancelButtonText: '取消',
            confirmButtonText: '删除',
            type: 'warning',
        })
        await deleteDevice(device.id)
        ElMessage.success('设备删除成功')

        if (devices.value.length === 1 && pagination.page > 1) {
            pagination.page -= 1
        }

        await loadDevices()
    } catch {
        // 用户取消删除时不执行后续操作。
    }
}

onMounted(() => {
    void loadDevices()
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

.device-filters :deep(.el-input) {
    width: 260px;
}

.device-filters :deep(.el-select) {
    width: 150px;
}

.base-data-pagination {
    display: flex;
    justify-content: flex-end;
    margin-top: $space-lg;
}
</style>
