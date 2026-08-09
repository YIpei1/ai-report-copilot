<!--
/**
 * SearchFilterCard 通用搜索筛选表单。
 *
 * 设计约定：
 * - 只传一个 fields 数组，组件按 el-row / el-col 自然换行。
 * - 默认折叠时只显示第一行，超出第一行的字段通过高度裁剪隐藏。
 * - 点击展开后显示全部字段。
 * - 每个字段可以通过 col 覆盖 el-col 响应式配置。
 *
 * 用法：
 * <SearchFilterCard
 *   v-model:expanded="moreFilters"
 *   v-model:model="searchForm"
 *   :fields="searchFields"
 *   :loading="loading"
 *   @search="handleSearch"
 *   @reset="handleReset"
 * />
 *
 * const searchFields: SearchFilterField[] = [
 *   { prop: 'keyword', label: '关键字', type: 'input', placeholder: '请输入关键字', prefixIcon: Search },
 *   {
 *     prop: 'status',
 *     label: '状态',
 *     type: 'select',
 *     placeholder: '请选择状态',
 *     options: [
 *       { label: '启用', value: 'enable' },
 *       { label: '禁用', value: 'disable' },
 *     ],
 *   },
 * ]
 */
-->

<template>
    <div class="search-filter-card">
        <el-form :model="model" class="search-filter-card__form" :label-width="labelWidth">
            <div
                ref="fieldsWrapRef"
                class="search-filter-card__fields"
                :class="{ 'is-expanded': expandedValue }"
                :style="fieldsWrapStyle"
            >
                <el-row class="search-filter-card__row" :gutter="gutter">
                    <el-col
                        v-for="field in fields"
                        :key="field.prop"
                        v-bind="field.col ?? fieldCol"
                        class="search-filter-card__col"
                    >
                        <slot :name="`field-${field.prop}`" :field="field" :model="model">
                            <el-form-item :label="field.label" :prop="field.prop">
                                <el-input
                                    v-if="!field.type || field.type === 'input'"
                                    :model-value="getInputValue(field)"
                                    :clearable="field.clearable ?? true"
                                    :disabled="field.disabled"
                                    :placeholder="field.placeholder"
                                    @update:model-value="setFieldValue(field, $event)"
                                    @keyup.enter="handleSearch"
                                >
                                    <template v-if="field.prefixIcon" #prefix>
                                        <el-icon>
                                            <component :is="field.prefixIcon" />
                                        </el-icon>
                                    </template>
                                </el-input>

                                <el-select
                                    v-else-if="field.type === 'select'"
                                    :model-value="getFieldValue(field)"
                                    :clearable="field.clearable ?? true"
                                    :disabled="field.disabled"
                                    :placeholder="field.placeholder"
                                    @update:model-value="setFieldValue(field, $event)"
                                >
                                    <el-option
                                        v-for="option in field.options ?? []"
                                        :key="String(option.value)"
                                        :label="option.label"
                                        :value="option.value"
                                        :disabled="option.disabled"
                                    />
                                </el-select>

                                <el-date-picker
                                    v-else-if="field.type === 'date-range'"
                                    :model-value="getDateRangeValue(field)"
                                    type="daterange"
                                    :range-separator="field.rangeSeparator ?? '/'"
                                    :start-placeholder="field.startPlaceholder"
                                    :end-placeholder="field.endPlaceholder"
                                    :value-format="field.valueFormat"
                                    :clearable="field.clearable ?? true"
                                    :disabled="field.disabled"
                                    @update:model-value="setFieldValue(field, $event)"
                                />

                                <el-date-picker
                                    v-else-if="field.type === 'datetime'"
                                    :model-value="getDateTimeValue(field)"
                                    type="datetime"
                                    :placeholder="field.placeholder"
                                    :format="field.format ?? 'YYYY-MM-DD HH:mm:ss'"
                                    :value-format="field.valueFormat"
                                    :clearable="field.clearable ?? true"
                                    :disabled="field.disabled"
                                    @update:model-value="setFieldValue(field, $event)"
                                />

                                <el-date-picker
                                    v-else-if="field.type === 'datetime-range'"
                                    :model-value="getDateTimeRangeValue(field)"
                                    type="datetimerange"
                                    :range-separator="field.rangeSeparator ?? '/'"
                                    :start-placeholder="field.startPlaceholder"
                                    :end-placeholder="field.endPlaceholder"
                                    :format="field.format ?? 'YYYY-MM-DD HH:mm:ss'"
                                    :value-format="field.valueFormat"
                                    :clearable="field.clearable ?? true"
                                    :disabled="field.disabled"
                                    @update:model-value="setDateTimeRangeValue(field, $event)"
                                />
                            </el-form-item>
                        </slot>
                    </el-col>
                </el-row>
            </div>

            <el-form-item class="search-filter-card__actions">
                <slot
                    name="actions"
                    :expanded="expandedValue"
                    :show-more="showMoreButton"
                    :toggle="toggleExpanded"
                >
                    <el-button type="primary" :disabled="loading" @click="handleSearch">
                        <el-icon
                            class="search-filter-card__button-icon"
                            :class="{ 'is-loading': loading }"
                        >
                            <Loading v-if="loading" />
                            <Search v-else />
                        </el-icon>
                        <span>{{ searchText }}</span>
                    </el-button>
                    <el-button @click="handleReset">
                        <el-icon>
                            <Refresh />
                        </el-icon>
                        <span>{{ resetText }}</span>
                    </el-button>
                    <el-button v-if="showMoreButton" link type="primary" @click="toggleExpanded">
                        <el-icon>
                            <ArrowUp v-if="expandedValue" />
                            <ArrowDown v-else />
                        </el-icon>
                        <span>{{ expandedValue ? collapseText : expandText }}</span>
                    </el-button>
                </slot>
            </el-form-item>
        </el-form>
    </div>
</template>

<script setup lang="ts" name="SearchFilterCard">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useAttrs, watch } from 'vue'
import { ArrowDown, ArrowUp, Loading, Refresh, Search } from '@element-plus/icons-vue'
import type { SearchFilterCol, SearchFilterField, SearchFilterValue } from './types'

// 页面通过 v-model:model 传入搜索条件，组件更新字段时同步生成新的搜索对象。
const model = defineModel<Record<string, SearchFilterValue>>('model', { required: true })

// 搜索区域的字段、布局、加载状态和按钮文案都由页面按需传入。
const props = withDefaults(
    defineProps<{
        fields?: SearchFilterField[]
        fieldCol?: SearchFilterCol
        gutter?: number
        loading?: boolean
        labelWidth?: string | number
        expanded?: boolean
        searchText?: string
        resetText?: string
        expandText?: string
        collapseText?: string
    }>(),
    {
        fields: () => [],
        fieldCol: () => ({ xs: 24, sm: 12, md: 8, lg: 8, xl: 6 }),
        gutter: 18,
        loading: false,
        labelWidth: '78px',
        searchText: '搜索',
        resetText: '清空',
        expandText: '展开',
        collapseText: '收起',
    },
)

// 页面只处理查询和重置业务，展开状态支持通过 v-model:expanded 双向绑定。
const emit = defineEmits<{
    (e: 'update:expanded', value: boolean): void
    (e: 'search'): void
    (e: 'reset'): void
}>()

// 记录字段容器尺寸，用于判断搜索项是否超过第一行。
const fieldsWrapRef = ref<HTMLElement>()
const collapsedHeight = ref(0)
const showMoreButton = ref(false)
const internalExpanded = ref(props.expanded ?? false)
const attrs = useAttrs()
let resizeObserver: ResizeObserver | undefined

// 页面绑定 v-model:expanded 时使用外部状态，否则由组件内部维护展开状态。
const isExpandedControlled = computed(() => Boolean(attrs['onUpdate:expanded']))

const expandedValue = computed({
    get: () => (isExpandedControlled.value ? (props.expanded ?? false) : internalExpanded.value),
    set: (value: boolean) => {
        internalExpanded.value = value
        emit('update:expanded', value)
    },
})

// 折叠状态只显示第一行搜索字段，展开状态不限制容器高度。
const fieldsWrapStyle = computed(() => {
    if (expandedValue.value || !showMoreButton.value || !collapsedHeight.value) {
        return undefined
    }

    return {
        maxHeight: `${collapsedHeight.value}px`,
    }
})

// 根据字段配置中的 prop 读取页面搜索对象里的对应值。
const getFieldValue = (field: SearchFilterField) => {
    return model.value[field.prop]
}

const getInputValue = (field: SearchFilterField): string | number | null | undefined => {
    const value = getFieldValue(field)

    if (
        typeof value === 'string' ||
        typeof value === 'number' ||
        value === null ||
        value === undefined
    ) {
        return value
    }

    return String(value)
}

// 将通用搜索值收窄为日期范围组件支持的字符串数组。
const getDateRangeValue = (field: SearchFilterField): string[] | null | undefined => {
    const value = getFieldValue(field)

    if (Array.isArray(value) && value.every((item) => typeof item === 'string')) {
        return value
    }

    if (value === null || value === undefined) {
        return value
    }

    return undefined
}

// 将通用搜索值收窄为单个日期时间组件支持的值。
const getDateTimeValue = (field: SearchFilterField): string | Date | null | undefined => {
    const value = getFieldValue(field)

    if (
        typeof value === 'string' ||
        value instanceof Date ||
        value === null ||
        value === undefined
    ) {
        return value
    }

    return undefined
}

// 同时支持将时间范围保存在一个字段或拆分到开始、结束两个字段中。
const getDateTimeRangeValue = (field: SearchFilterField): string[] | Date[] | null | undefined => {
    if (field.startProp && field.endProp) {
        const startValue = model.value[field.startProp]
        const endValue = model.value[field.endProp]

        if (startValue instanceof Date && endValue instanceof Date) {
            return [startValue, endValue]
        }

        if (typeof startValue === 'string' && typeof endValue === 'string') {
            return [startValue, endValue]
        }

        return undefined
    }

    const value = getFieldValue(field)

    if (Array.isArray(value) && value.every((item) => item instanceof Date)) {
        return value
    }

    if (Array.isArray(value) && value.every((item) => typeof item === 'string')) {
        return value
    }

    if (value === null || value === undefined) {
        return value
    }

    return undefined
}

// 使用新对象更新单个搜索字段，确保 v-model:model 能通知父组件。
const setFieldValue = (field: SearchFilterField, value: SearchFilterValue) => {
    model.value = {
        ...model.value,
        [field.prop]: value,
    }
}

const setDateTimeRangeValue = (field: SearchFilterField, value: SearchFilterValue) => {
    if (!field.startProp || !field.endProp) {
        setFieldValue(field, value)
        return
    }

    if (Array.isArray(value)) {
        model.value = {
            ...model.value,
            [field.startProp]: value[0],
            [field.endProp]: value[1],
        }
        return
    }

    model.value = {
        ...model.value,
        [field.startProp]: undefined,
        [field.endProp]: undefined,
    }
}

// 测量搜索字段实际布局，只在字段换行时展示“展开”按钮。
const measureFields = async () => {
    await nextTick()

    const fieldsWrap = fieldsWrapRef.value
    const fieldColumns = Array.from(
        fieldsWrap?.querySelectorAll<HTMLElement>('.search-filter-card__col') ?? [],
    )

    if (!fieldsWrap || fieldColumns.length === 0) {
        collapsedHeight.value = 0
        showMoreButton.value = false
        return
    }

    const firstColumn = fieldColumns[0]
    if (!firstColumn) {
        collapsedHeight.value = 0
        showMoreButton.value = false
        return
    }

    const firstTop = firstColumn.offsetTop
    let firstRowBottom = 0
    let hasMoreRows = false

    fieldColumns.forEach((column) => {
        if (column.offsetTop > firstTop + 1) {
            hasMoreRows = true
            return
        }

        firstRowBottom = Math.max(firstRowBottom, column.offsetTop + column.offsetHeight)
    })

    collapsedHeight.value = Math.max(0, firstRowBottom - firstTop)
    showMoreButton.value = hasMoreRows
}

// 切换搜索区域的展开和折叠状态。
const toggleExpanded = () => {
    expandedValue.value = !expandedValue.value
}

const handleSearch = () => {
    emit('search')
}

const handleReset = () => {
    emit('reset')
}

// 字段配置或栅格宽度变化后重新计算是否存在多行。
watch(
    () => [props.fields, props.fieldCol, props.gutter],
    () => {
        void measureFields()
    },
    { deep: true },
)

// 页面尺寸变化可能导致字段重新换行，通过 ResizeObserver 自动重新测量。
onMounted(() => {
    void measureFields()

    if (fieldsWrapRef.value) {
        resizeObserver = new ResizeObserver(() => {
            void measureFields()
        })
        resizeObserver.observe(fieldsWrapRef.value)
    }
})

onBeforeUnmount(() => {
    resizeObserver?.disconnect()
})
</script>

<style scoped lang="scss">
.search-filter-card {
    &__form {
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto;
        gap: 12px 18px;
        align-items: start;

        :deep(.el-form-item) {
            margin-bottom: 0;
        }

        :deep(.el-select),
        :deep(.el-date-editor) {
            width: 100%;
        }
    }

    &__fields {
        min-width: 0;
        overflow: hidden;
        transition: max-height 0.2s ease;

        &.is-expanded {
            max-height: none;
        }
    }

    &__row {
        row-gap: 12px;
    }

    &__actions {
        justify-self: end;

        :deep(.el-form-item__content) {
            flex-wrap: nowrap;
            gap: 8px;
        }
    }

    &__button-icon {
        width: 1em;
        height: 1em;
        flex: 0 0 1em;

        &.is-loading {
            animation: search-filter-card-rotate 1s linear infinite;
        }
    }
}

@keyframes search-filter-card-rotate {
    from {
        transform: rotate(0deg);
    }

    to {
        transform: rotate(360deg);
    }
}

@media (width <= 900px) {
    .search-filter-card {
        &__form {
            grid-template-columns: 1fr;
        }

        &__actions {
            justify-self: start;
        }
    }
}
</style>
