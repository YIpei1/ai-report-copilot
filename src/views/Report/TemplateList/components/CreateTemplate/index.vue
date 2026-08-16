<!--
/**
 * Desc: 新增检测模板基础信息
 */
-->
<template>
    <el-dialog
        v-model="dialogVisible"
        destroy-on-close
        title="新增检测模板"
        width="680px"
        @closed="resetForm"
    >
        <el-form :model="form" label-width="110px">
            <el-row :gutter="16">
                <el-col :span="12">
                    <el-form-item label="模板名称" required>
                        <el-input v-model="form.name" placeholder="请输入模板名称" />
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item label="模板编号" required>
                        <el-input v-model="form.code" placeholder="请输入唯一模板编号" />
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item label="模板版本" required>
                        <el-input v-model="form.version" placeholder="请输入模板版本" />
                    </el-form-item>
                </el-col>
                <el-col :span="24">
                    <el-form-item label="模板说明">
                        <el-input
                            v-model="form.description"
                            :rows="3"
                            placeholder="请输入模板适用场景说明"
                            type="textarea"
                        />
                    </el-form-item>
                </el-col>
            </el-row>
        </el-form>

        <template #footer>
            <el-button @click="closeDialog">取消</el-button>
            <el-button :loading="submitting" type="primary" @click="submitTemplate">
                创建并配置组件
            </el-button>
        </template>
    </el-dialog>
</template>

<script setup lang="ts" name="CreateTemplateDialog">
import { reactive, ref } from 'vue'
import {
    createInspectionTemplate,
    type InspectionTemplate,
    type InspectionTemplateFormParams,
} from '@/api/baseData'

const dialogVisible = defineModel<boolean>({ default: false })

const emit = defineEmits<{
    (event: 'created', template: InspectionTemplate): void
}>()

const createEmptyForm = (): InspectionTemplateFormParams => ({
    code: '',
    name: '',
    version: '1.0',
    description: '',
})

const submitting = ref(false)
const form = reactive<InspectionTemplateFormParams>(createEmptyForm())

// 校验基础信息并创建模板，组件配置由父页面打开独立弹窗完成。
const submitTemplate = async (): Promise<void> => {
    const requiredValues = [form.name, form.code, form.version]

    if (requiredValues.some((value) => !value.trim())) {
        ElMessage.warning('请完整填写检测模板必填信息')
        return
    }

    submitting.value = true

    try {
        const response = await createInspectionTemplate({ ...form })
        ElMessage.success('检测模板创建成功')
        closeDialog()
        emit('created', response.data)
    } finally {
        submitting.value = false
    }
}

// 统一关闭弹窗，表单数据在 closed 事件中重置。
const closeDialog = (): void => {
    dialogVisible.value = false
}

// 每次打开新增弹窗都使用干净的默认表单。
const resetForm = (): void => {
    Object.assign(form, createEmptyForm())
}
</script>
