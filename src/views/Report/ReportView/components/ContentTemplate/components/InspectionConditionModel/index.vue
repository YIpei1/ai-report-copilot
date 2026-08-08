<template>
    <div class="inspection-condition-confirm-model">
        <div ref="paperRef" class="report-paper">
            <div class="report-paper__header">
                <h1>检测条件及主要检测仪器设备</h1>
            </div>

            <div ref="tablesRef" class="report-paper__tables">
                <table ref="conditionTableRef" class="condition-table">
                    <colgroup>
                        <col class="condition-table__col-label" />
                        <col class="condition-table__col-value" />
                    </colgroup>
                    <tbody>
                        <tr>
                            <th colspan="2" class="condition-table__title">检测条件</th>
                        </tr>
                        <tr>
                            <th>环境温度</th>
                            <td><TextareaTable v-model="modelValue.temperature" /></td>
                        </tr>
                        <tr>
                            <th>环境湿度</th>
                            <td><TextareaTable v-model="modelValue.humidity" /></td>
                        </tr>
                        <tr>
                            <th>电源电压</th>
                            <td><TextareaTable v-model="modelValue.supplyVoltage" /></td>
                        </tr>
                        <tr>
                            <th>检测地点</th>
                            <td><TextareaTable v-model="modelValue.inspectionLocation" /></td>
                        </tr>
                        <tr>
                            <th colspan="2" class="condition-table__title">主要检测仪器设备</th>
                        </tr>
                    </tbody>
                </table>

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
            </div>

            <div class="report-paper__page-no">2</div>
        </div>
    </div>
</template>

<script setup lang="ts" name="InspectionConditionModel">
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'

export type InspectionInstrumentRow = {
    rowKey: number
    sequence: string
    name: string
    code: string
    status: string
}

export interface InspectionConditionModelType {
    temperature: string
    humidity: string
    supplyVoltage: string
    inspectionLocation: string
    instruments: InspectionInstrumentRow[]
}

declare module '@/views/Report/ReportView/types' {
    interface TemplateDataMap {
        InspectionConditionModel: InspectionConditionModelType
    }
}

const modelValue = defineModel<InspectionConditionModelType>({ required: true })

const emit = defineEmits<{
    'move-instruments-to-add-page': [rows: InspectionInstrumentRow[]]
}>()

const paperRef = ref<HTMLElement>()
const tablesRef = ref<HTMLElement>()
const conditionTableRef = ref<HTMLTableElement>()
const instrumentTableRef = ref<HTMLTableElement>()

const rowMinHeight = 36
let resizeObserver: ResizeObserver | null = null
let isAdjustingRows = false
let nextRowKey = 0

const isEmptyInstrumentRow = (row: InspectionInstrumentRow) => {
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

const createInstrumentRow = (): InspectionInstrumentRow => {
    return {
        rowKey: getNextRowKey(),
        sequence: '',
        name: '',
        code: '',
        status: '',
    }
}

const getTablesAvailableHeight = () => {
    const paper = paperRef.value
    if (!paper) return 0

    const style = window.getComputedStyle(paper)
    const paddingTop = Number.parseFloat(style.paddingTop) || 0
    const paddingBottom = Number.parseFloat(style.paddingBottom) || 0
    const headerHeight = 56
    const pageNoHeight = 36

    return paper.clientHeight - paddingTop - paddingBottom - headerHeight - pageNoHeight
}

const getInstrumentRows = () => {
    const table = instrumentTableRef.value
    if (!table) return []

    return Array.from(table.querySelectorAll<HTMLTableRowElement>('tbody tr')).slice(1)
}

const getInstrumentRowsHeight = () => {
    return getInstrumentRows().reduce((total, row) => total + row.offsetHeight, 0)
}

const syncInstrumentRowsToPage = async () => {
    if (isAdjustingRows) return

    isAdjustingRows = true
    await nextTick()

    const availableHeight = getTablesAvailableHeight()
    const conditionHeight = conditionTableRef.value?.offsetHeight || 0
    const instrumentHeaderHeight =
        instrumentTableRef.value?.querySelector('tbody tr')?.clientHeight || rowMinHeight

    if (!availableHeight || !conditionHeight) {
        isAdjustingRows = false
        return
    }

    const maxInstrumentBodyHeight = availableHeight - conditionHeight - instrumentHeaderHeight

    if (maxInstrumentBodyHeight <= rowMinHeight) {
        isAdjustingRows = false
        return
    }

    let rowsHeight = getInstrumentRowsHeight()

    // 第一步：当前页超高时，先删除末尾自动补出来的空白行。
    // 空白行没有业务数据，删掉它只是释放当前页空间，不会影响用户输入。
    while (rowsHeight > maxInstrumentBodyHeight && modelValue.value.instruments.length > 1) {
        const lastRow = modelValue.value.instruments.at(-1)
        if (!lastRow || !isEmptyInstrumentRow(lastRow)) break

        modelValue.value.instruments.pop()
        await nextTick()
        rowsHeight = getInstrumentRowsHeight()
    }

    const movedRows: InspectionInstrumentRow[] = []

    // 第二步：空白行删完后还放不下，说明有内容的行因为换行变高了。
    // 这时不删除数据，而是从当前页末尾往续页移动，直到当前页能放下。
    while (rowsHeight > maxInstrumentBodyHeight && modelValue.value.instruments.length > 1) {
        const lastRow = modelValue.value.instruments.pop()
        if (!lastRow) break

        nextRowKey = Math.max(nextRowKey, lastRow.rowKey)

        if (!isEmptyInstrumentRow(lastRow)) {
            movedRows.unshift(lastRow)
        }

        await nextTick()
        rowsHeight = getInstrumentRowsHeight()
    }

    if (movedRows.length) {
        emit('move-instruments-to-add-page', movedRows)
    }

    // 第三步：当前页还有剩余空间时，继续补空白行。
    // 补到“再加一行就放不下”为止，这样表格能铺满页面。
    while (rowsHeight + rowMinHeight <= maxInstrumentBodyHeight) {
        modelValue.value.instruments.push(createInstrumentRow())
        await nextTick()
        rowsHeight = getInstrumentRowsHeight()
    }

    isAdjustingRows = false
}

onMounted(async () => {
    await syncInstrumentRowsToPage()

    resizeObserver = new ResizeObserver(() => {
        syncInstrumentRowsToPage()
    })

    if (tablesRef.value) {
        resizeObserver.observe(tablesRef.value)
    }
})

onBeforeUnmount(() => {
    resizeObserver?.disconnect()
})
</script>

<style lang="scss" scoped>
.inspection-condition-confirm-model {
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
    grid-template-rows: 56px auto 1fr 36px;
    justify-items: center;
    width: $report-paper-width;
    padding: 40px 0 31px;
    box-sizing: border-box;
    background: var(--report-paper-bg);
    box-shadow:
        0 0 0 1px var(--report-paper-shadow),
        0 12px 28px var(--report-paper-shadow);
    color: var(--report-paper-text);
    font-family: SimSun, 'Songti SC', serif;
}

.report-paper__header,
.report-paper__tables {
    width: $report-paper-content-width;
}

.report-paper__header {
    h1 {
        margin: 0;
        font-size: 22px;
        line-height: 56px;
        text-align: center;
    }
}

.report-paper__tables {
    display: grid;
    align-content: start;
    gap: 0;
}

.condition-table,
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

.instrument-table {
    border-top: 0;
}

.condition-table__title {
    height: 36px;
    font-size: 15px;
    font-weight: 700;
}

.condition-table__col-label {
    width: 180px;
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

.report-paper__page-no {
    align-self: end;
    color: var(--report-paper-muted);
    font-family: 'Times New Roman', serif;
    font-size: 14px;
    text-align: center;
}
</style>
