<!--
/**
* Author: YiPei
* Date: 2026-05-19 09:00
* Desc: 表格文本输入框
*/
-->
<template>
    <textarea
        ref="textareaRef"
        v-model="model"
        class="table-input"
        rows="1"
        @input="resize"
    ></textarea>
</template>

<script setup lang="ts" name="TextareaTable">
import { computed, nextTick, onMounted, ref, watch } from 'vue'

// 接收父组件通过 v-model 传入的文本内容。
const props = defineProps<{
    modelValue: string
}>()

// 文本变化后通知父组件更新 v-model 绑定值。
const emit = defineEmits<{
    'update:modelValue': [value: string]
}>()

// 文本框元素和首次渲染时所在表格单元格的基础高度。
const textareaRef = ref<HTMLTextAreaElement>()
const minHeight = ref(0)

// 将组件的 modelValue 转换为模板中可直接使用的双向绑定值。
const model = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value),
})

// 读取父元素初始高度，使文本框默认撑满当前表格单元格。
const getParentInitialHeight = () => {
    const parent = textareaRef.value?.parentElement

    return parent?.clientHeight || parent?.offsetHeight || 46
}

// 根据文本实际高度调整文本框高度，并切换单行或多行样式。
const resize = () => {
    const textarea = textareaRef.value
    if (!textarea) return

    const baseHeight = minHeight.value || getParentInitialHeight()

    textarea.style.setProperty('--table-input-min-height', `${baseHeight}px`)
    textarea.classList.remove('is-multiline')
    textarea.style.height = 'auto'

    const shouldUseMultilineStyle = textarea.scrollHeight > baseHeight

    if (shouldUseMultilineStyle) {
        textarea.classList.add('is-multiline')
        textarea.style.height = 'auto'
    }

    textarea.style.height = `${Math.max(textarea.scrollHeight, baseHeight)}px`
}

// 组件挂载后记录基础高度，并完成第一次高度计算。
onMounted(async () => {
    await nextTick()
    minHeight.value = getParentInitialHeight()
    resize()
})

// 外部更新 v-model 内容时，等待 DOM 更新后重新计算文本框高度。
watch(
    () => props.modelValue,
    async () => {
        await nextTick()
        resize()
    },
)
</script>

<style lang="scss" scoped>
.table-input {
    display: block;
    width: 100%;
    min-height: var(--table-input-min-height, 46px);
    box-sizing: border-box;
    padding: 0;
    border: 0;
    outline: none;
    resize: none;
    overflow: hidden;
    background: transparent;
    color: inherit;
    font: inherit;
    font-size: 14px;
    line-height: var(--table-input-min-height, 46px);
    text-align: center;
    word-break: break-all;

    &.is-multiline {
        line-height: 22px;
    }
}
</style>
