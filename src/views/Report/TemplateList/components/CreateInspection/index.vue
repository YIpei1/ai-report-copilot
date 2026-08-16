<!--
/**
 * Desc: 选择检测设备和工具箱，并进入报告编辑页面
 */
-->
<template>
    <el-dialog
        v-model="dialogVisible"
        destroy-on-close
        :title="dialogTitle"
        width="520px"
        @closed="resetForm"
        @open="loadOptions"
    >
        <el-form label-width="90px">
            <el-form-item label="检测设备" required>
                <el-select
                    v-model="form.deviceId"
                    filterable
                    :loading="loadingOptions"
                    placeholder="请选择设备台账"
                >
                    <el-option
                        v-for="device in deviceOptions"
                        :key="device.id"
                        :label="`${device.name}（${device.code}）`"
                        :value="device.id"
                    />
                </el-select>
            </el-form-item>

            <el-form-item label="工具箱" required>
                <el-select
                    v-model="form.toolboxId"
                    filterable
                    :loading="loadingOptions"
                    placeholder="请选择当前可用的工具箱"
                >
                    <el-option
                        v-for="toolbox in toolboxOptions"
                        :key="toolbox.id"
                        :label="`${toolbox.name}（${toolbox.code}）`"
                        :value="toolbox.id"
                    />
                </el-select>
            </el-form-item>
        </el-form>

        <template #footer>
            <el-button @click="closeDialog">取消</el-button>
            <el-button type="primary" @click="createInspection">下一步</el-button>
        </template>
    </el-dialog>
</template>

<script setup lang="ts" name="CreateInspectionDialog">
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import {
    getAvailableToolboxOptions,
    getDeviceList,
    type Device,
    type InspectionTemplateItem,
    type Toolbox,
} from '@/api/baseData'

interface CreateInspectionForm {
    deviceId: string
    toolboxId: string
}

const dialogVisible = defineModel<boolean>({ default: false })

const props = defineProps<{
    template?: InspectionTemplateItem
}>()

const router = useRouter()
const loadingOptions = ref(false)
const deviceOptions = ref<Device[]>([])
const toolboxOptions = ref<Toolbox[]>([])
const form = reactive<CreateInspectionForm>({
    deviceId: '',
    toolboxId: '',
})

const dialogTitle = computed(() => {
    return props.template ? `创建检测：${props.template.name}` : '创建检测'
})

// 弹窗打开时只加载启用设备和当前可用工具箱。
const loadOptions = async (): Promise<void> => {
    loadingOptions.value = true

    try {
        const [deviceResponse, toolboxResponse] = await Promise.all([
            getDeviceList({
                keyword: '',
                status: 'active',
                page: 1,
                pageSize: 100,
            }),
            getAvailableToolboxOptions(),
        ])
        deviceOptions.value = deviceResponse.data.items
        toolboxOptions.value = toolboxResponse.data
    } finally {
        loadingOptions.value = false
    }
}

// 校验本次检测依赖数据后，携带三个业务 id 进入报告编辑页面。
const createInspection = (): void => {
    if (!props.template || !form.deviceId || !form.toolboxId) {
        ElMessage.warning('请选择本次检测使用的设备和工具箱')
        return
    }

    closeDialog()
    void router.push({
        name: 'ReportView',
        params: {
            templateId: props.template.id,
            deviceId: form.deviceId,
            toolboxId: form.toolboxId,
        },
    })
}

// 统一关闭弹窗，表单和选项在 closed 事件中清理。
const closeDialog = (): void => {
    dialogVisible.value = false
}

// 清除上一次选择，保证每次创建检测都重新确认设备和工具箱。
const resetForm = (): void => {
    form.deviceId = ''
    form.toolboxId = ''
    deviceOptions.value = []
    toolboxOptions.value = []
}
</script>

<style scoped lang="scss">
:deep(.el-select) {
    width: 100%;
}
</style>
