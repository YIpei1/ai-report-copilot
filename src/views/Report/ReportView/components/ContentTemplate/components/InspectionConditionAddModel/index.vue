<template>
    <div class="inspection-condition-add-model">
        <div ref="paperRef" class="report-paper">
            <div ref="tableWrapRef" class="report-paper__table-wrap">
                <table ref="instrumentTableRef" class="instrument-table">
                    <colgroup>
                        <col class="instrument-table__col-seq" />
                        <col class="instrument-table__col-name" />
                        <col class="instrument-table__col-code" />
                        <col class="instrument-table__col-status" />
                    </colgroup>
                    <tbody>
                        <tr>
                            <th>序号</th>
                            <th>仪器设备名称</th>
                            <th>仪器设备编号</th>
                            <th>仪器设备状态</th>
                        </tr>
                        <tr v-for="instrument in modelValue.instruments" :key="instrument.rowKey">
                            <td>
                                <TextareaTable v-model="instrument.sequence" />
                            </td>
                            <td>
                                <TextareaTable v-model="instrument.name" />
                            </td>
                            <td>
                                <TextareaTable v-model="instrument.code" />
                            </td>
                            <td>
                                <TextareaTable v-model="instrument.status" />
                            </td>
                        </tr>
                    </tbody>
                </table>

                <button
                    class="report-paper__action report-paper__action--delete"
                    type="button"
                    @click="deletePage"
                >
                    删
                </button>
            </div>

            <div class="report-paper__page-no">3</div>
        </div>
    </div>
</template>

<script setup lang="ts" name="InspectionConditionAddModel">
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'

export type InspectionConditionAddInstrumentRow = {
    rowKey: number
    sequence: string
    name: string
    code: string
    status: string
}

export interface InspectionConditionAddModelType {
    instruments: InspectionConditionAddInstrumentRow[]
}

declare module '@/views/Report/ReportView/types' {
    interface TemplateDataMap {
        InspectionConditionAddModel: InspectionConditionAddModelType
    }
}

const modelValue = defineModel<InspectionConditionAddModelType>({ required: true })

const emit = defineEmits<{
    'move-instruments-to-add-page': [rows: InspectionConditionAddInstrumentRow[]]
    'delete-template-page': []
}>()

const paperRef = ref<HTMLElement>()
const tableWrapRef = ref<HTMLElement>()
const instrumentTableRef = ref<HTMLTableElement>()

const rowMinHeight = 36
let resizeObserver: ResizeObserver | null = null
let isAdjustingRows = false
let nextRowKey = 10000

const isEmptyInstrumentRow = (row: InspectionConditionAddInstrumentRow) => {
    return !row.sequence && !row.name && !row.code && !row.status
}

const getNextRowKey = () => {
    const maxRowKey = modelValue.value.instruments.reduce(
        (max, row) => Math.max(max, row.rowKey),
        0,
    )
    nextRowKey = Math.max(nextRowKey, maxRowKey) + 1

    return nextRowKey
}

const createInstrumentRow = (): InspectionConditionAddInstrumentRow => {
    return {
        rowKey: getNextRowKey(),
        sequence: '',
        name: '',
        code: '',
        status: '',
    }
}

const getTableAvailableHeight = () => {
    const paper = paperRef.value
    if (!paper) return 0

    const style = window.getComputedStyle(paper)
    const paddingTop = Number.parseFloat(style.paddingTop) || 0
    const paddingBottom = Number.parseFloat(style.paddingBottom) || 0
    const pageNoHeight = 36

    return paper.clientHeight - paddingTop - paddingBottom - pageNoHeight
}

const getDataRows = () => {
    const table = instrumentTableRef.value
    if (!table) return []

    return Array.from(table.querySelectorAll<HTMLTableRowElement>('tbody tr')).slice(1)
}

const getHeaderHeight = () => {
    const table = instrumentTableRef.value
    if (!table) return rowMinHeight

    return table.querySelector<HTMLTableRowElement>('tbody tr')?.offsetHeight || rowMinHeight
}

const getDataRowsHeight = () => {
    return getDataRows().reduce((total, row) => total + row.offsetHeight, 0)
}

const syncInstrumentRowsToPage = async () => {
    if (isAdjustingRows) return

    isAdjustingRows = true
    await nextTick()

    const maxDataRowsHeight = getTableAvailableHeight() - getHeaderHeight()

    if (maxDataRowsHeight <= rowMinHeight) {
        isAdjustingRows = false
        return
    }

    let rowsHeight = getDataRowsHeight()

    // 先删掉末尾空白行，让真实输入的内容优先留在当前页。
    while (rowsHeight > maxDataRowsHeight && modelValue.value.instruments.length > 1) {
        const lastRow = modelValue.value.instruments.at(-1)
        if (!lastRow || !isEmptyInstrumentRow(lastRow)) break

        modelValue.value.instruments.pop()
        await nextTick()
        rowsHeight = getDataRowsHeight()
    }

    const movedRows: InspectionConditionAddInstrumentRow[] = []

    // 空白行删完还放不下，就把末尾真实数据行继续交给下一张续页。
    while (rowsHeight > maxDataRowsHeight && modelValue.value.instruments.length > 1) {
        const lastRow = modelValue.value.instruments.pop()
        if (!lastRow) break

        nextRowKey = Math.max(nextRowKey, lastRow.rowKey)

        if (!isEmptyInstrumentRow(lastRow)) {
            movedRows.unshift(lastRow)
        }

        await nextTick()
        rowsHeight = getDataRowsHeight()
    }

    if (movedRows.length) {
        emit('move-instruments-to-add-page', movedRows)
    }

    // 还有空间时补空白行，让续页表格铺满页面。
    while (rowsHeight + rowMinHeight <= maxDataRowsHeight) {
        modelValue.value.instruments.push(createInstrumentRow())
        await nextTick()
        rowsHeight = getDataRowsHeight()
    }

    isAdjustingRows = false
}

const deletePage = () => {
    emit('delete-template-page')
}

onMounted(async () => {
    await syncInstrumentRowsToPage()

    resizeObserver = new ResizeObserver(() => {
        syncInstrumentRowsToPage()
    })

    if (tableWrapRef.value) {
        resizeObserver.observe(tableWrapRef.value)
    }
})

onBeforeUnmount(() => {
    resizeObserver?.disconnect()
})
</script>

<style lang="scss" scoped>
.inspection-condition-add-model {
    display: flex;
    justify-content: center;
    height: $report-paper-height;
    padding: $report-paper-workspace-padding;
    background: var(--report-workspace-bg);
}

.report-paper {
    position: relative;
    flex: 0 0 auto;
    display: grid;
    grid-template-rows: auto 1fr 36px;
    justify-items: center;
    width: $report-paper-width;
    min-height: $report-paper-height;
    padding: 63px 0 31px;
    box-sizing: border-box;
    background: var(--report-paper-bg);
    box-shadow:
        0 0 0 1px var(--report-paper-shadow),
        0 12px 28px var(--report-paper-shadow);
    color: var(--report-paper-text);
    font-family: SimSun, 'Songti SC', serif;
}

.report-paper__table-wrap {
    position: relative;
    width: $report-paper-content-width;
}

.instrument-table {
    --table-input-min-height: 36px;

    width: $report-paper-content-width;
    border-collapse: collapse;
    table-layout: fixed;
    border: 1px solid var(--report-paper-border);
    font-size: 14px;
    line-height: 1.35;

    th,
    td {
        height: 36px;
        padding: 0 8px;
        border: 1px solid var(--report-paper-border);
        font-weight: 400;
        vertical-align: middle;
    }

    th {
        font-weight: 700;
        text-align: center;
    }
}

.instrument-table__col-seq {
    width: 78px;
}

.instrument-table__col-name,
.instrument-table__col-code {
    width: 221px;
}

.instrument-table__col-status {
    width: 166px;
}

.instrument-table tr:not(:first-child) td {
    height: 36px;
}

.report-paper__action {
    position: absolute;
    right: -26px;
    width: 24px;
    height: 30px;
    padding: 0;
    border: 1px solid var(--report-paper-control-border);
    border-radius: 3px;
    background: var(--report-paper-bg);
    color: var(--report-paper-control-text);
    font-size: 18px;
    line-height: 1;
    cursor: pointer;
}

.report-paper__action--add {
    top: 252px;
}

.report-paper__action--delete {
    top: 288px;
    color: var(--status-danger);
    font-size: 13px;
}

.report-paper__page-no {
    align-self: end;
    color: var(--report-paper-muted);
    font-family: 'Times New Roman', serif;
    font-size: 14px;
    text-align: center;
}
</style>
