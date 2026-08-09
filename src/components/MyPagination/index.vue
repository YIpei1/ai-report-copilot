<template>
    <el-pagination
        v-model:current-page="currentPageModel"
        v-model:page-size="pageSizeModel"
        :size="props.size"
        :background="props.background"
        :page-sizes="props.pageSizes"
        :total="props.total"
        :layout="props.layout"
        :pager-count="pagerCount"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
    />
</template>

<script setup lang="ts" name="MyPagination">
import { computed } from 'vue'

const props = withDefaults(
    defineProps<{
        currentPage: number
        pageSize: number
        total: number
        pageSizes?: number[]
        layout?: string
        size?: 'default' | 'small' | 'large'
        background?: boolean
        pagerCount?: number
    }>(),
    {
        pageSizes: () => [10, 20, 50],
        layout: 'total, prev, pager, next, sizes, jumper',
        size: 'small',
        background: true,
        pagerCount: 5,
    },
)

const emit = defineEmits<{
    (e: 'update:currentPage', value: number): void
    (e: 'update:pageSize', value: number): void
    (e: 'size-change', value: number): void
    (e: 'current-change', value: number): void
}>()

// 当前页双向绑定
const currentPageModel = computed({
    get: () => props.currentPage,
    set: (value: number) => {
        emit('update:currentPage', value)
    },
})

// 每页数量双向绑定
const pageSizeModel = computed({
    get: () => props.pageSize,
    set: (value: number) => {
        emit('update:pageSize', value)
    },
})

/**
 * 透传每页条数变更事件
 * @param value 每页条数
 */
const handleSizeChange = (value: number) => {
    emit('size-change', value)
}

/**
 * 透传页码变更事件
 * @param value 当前页码
 */
const handleCurrentChange = (value: number) => {
    emit('current-change', value)
}
</script>
