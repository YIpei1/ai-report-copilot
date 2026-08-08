<template>
    <div class="inspection-items-model">
        <div class="report-paper">
            <h1 class="report-paper__title">检测项目、内容和要求</h1>

            <table class="inspection-table">
                <colgroup>
                    <col class="inspection-table__col-sequence" />
                    <col class="inspection-table__col-code" />
                    <col class="inspection-table__col-title" />
                    <col class="inspection-table__col-requirement" />
                    <col class="inspection-table__col-result" />
                    <col class="inspection-table__col-conclusion" />
                </colgroup>
                <thead>
                    <tr>
                        <th>序号</th>
                        <th>项目编号</th>
                        <th>检测项目</th>
                        <th>内容和要求</th>
                        <th>检测结果</th>
                        <th>单项结论</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="item in modelValue.items" :key="item.code">
                        <td class="inspection-table__center">{{ item.sequence }}</td>
                        <td class="inspection-table__center">{{ item.code }}</td>
                        <td>{{ item.title }}</td>
                        <td>{{ item.requirement }}</td>
                        <td><TextareaTable v-model="item.result" /></td>
                        <td><TextareaTable v-model="item.conclusion" /></td>
                    </tr>
                </tbody>
            </table>

            <div class="report-paper__page-no">3</div>
        </div>
    </div>
</template>

<script setup lang="ts" name="InspectionItemsModel">
export interface InspectionItemData {
    sequence: number
    code: string
    title: string
    requirement: string
    result: string
    conclusion: string
}

export interface InspectionItemsModelType {
    items: InspectionItemData[]
}

declare module '@/views/Report/ReportView/types' {
    interface TemplateDataMap {
        InspectionItemsModel: InspectionItemsModelType
    }
}

const modelValue = defineModel<InspectionItemsModelType>({ required: true })
</script>

<style lang="scss" scoped>
.inspection-items-model {
    display: flex;
    justify-content: center;
    height: $report-paper-height;
    padding: $report-paper-workspace-padding;
    background: var(--report-workspace-bg);
}

.report-paper {
    position: relative;
    flex: 0 0 auto;
    width: $report-paper-width;
    background: var(--report-paper-bg);
    box-shadow:
        0 0 0 1px var(--report-paper-shadow),
        0 12px 28px var(--report-paper-shadow);
    color: var(--report-paper-text);
    font-family: SimSun, 'Songti SC', serif;

    &__title {
        margin: 0;
        padding-top: 64px;
        font-size: 22px;
        line-height: 1.4;
        text-align: center;
    }

    &__page-no {
        position: absolute;
        right: 0;
        bottom: 35px;
        left: 0;
        color: var(--report-paper-muted);
        font-family: 'Times New Roman', serif;
        font-size: 14px;
        text-align: center;
    }
}

.inspection-table {
    --table-input-min-height: 72px;

    width: $report-paper-content-width;
    margin: 44px auto 0;
    border: 2px solid var(--report-paper-border);
    border-collapse: collapse;
    table-layout: fixed;
    font-size: 13px;
    line-height: 1.5;

    th,
    td {
        height: 72px;
        padding: 6px;
        border: 1px solid var(--report-paper-border);
        font-weight: 400;
        vertical-align: middle;
    }

    th {
        height: 44px;
        font-weight: 700;
        text-align: center;
    }

    &__center {
        text-align: center;
    }

    &__col-sequence {
        width: 46px;
    }

    &__col-code {
        width: 68px;
    }

    &__col-title {
        width: 92px;
    }

    &__col-requirement {
        width: 260px;
    }

    &__col-result {
        width: 126px;
    }

    &__col-conclusion {
        width: 94px;
    }
}
</style>
