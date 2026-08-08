<template>
    <div class="self-inspection-record-model">
        <div class="report-paper">
            <h1 class="report-paper__title">电梯自行检测记录</h1>

            <table class="record-table">
                <colgroup>
                    <col class="record-table__label-column" />
                    <col class="record-table__value-column" />
                    <col class="record-table__label-column" />
                    <col class="record-table__value-column" />
                </colgroup>
                <tbody>
                    <tr>
                        <th>记录编号</th>
                        <td colspan="3"><TextareaTable v-model="modelValue.recordNo" /></td>
                    </tr>
                    <tr>
                        <th>使用单位名称</th>
                        <td colspan="3">
                            <TextareaTable v-model="modelValue.userOrganization" />
                        </td>
                    </tr>
                    <tr>
                        <th>安装地点</th>
                        <td colspan="3"><TextareaTable v-model="modelValue.location" /></td>
                    </tr>
                    <tr>
                        <th>设备编号</th>
                        <td><TextareaTable v-model="modelValue.deviceCode" /></td>
                        <th>注册代码</th>
                        <td><TextareaTable v-model="modelValue.registrationCode" /></td>
                    </tr>
                    <tr>
                        <th>设备类别</th>
                        <td><TextareaTable v-model="modelValue.deviceCategory" /></td>
                        <th>产品型号</th>
                        <td><TextareaTable v-model="modelValue.productModel" /></td>
                    </tr>
                    <tr>
                        <th>制造单位</th>
                        <td colspan="3"><TextareaTable v-model="modelValue.manufacturer" /></td>
                    </tr>
                    <tr>
                        <th>维护保养单位</th>
                        <td colspan="3">
                            <TextareaTable v-model="modelValue.maintenanceOrganization" />
                        </td>
                    </tr>
                    <tr>
                        <th>额定载重量</th>
                        <td><TextareaTable v-model="modelValue.ratedLoad" /></td>
                        <th>额定速度</th>
                        <td><TextareaTable v-model="modelValue.ratedSpeed" /></td>
                    </tr>
                    <tr>
                        <th>层/站/门数量</th>
                        <td><TextareaTable v-model="modelValue.floorStationDoor" /></td>
                        <th>检测日期</th>
                        <td><TextareaTable v-model="modelValue.inspectionDate" /></td>
                    </tr>
                    <tr>
                        <th>检测依据</th>
                        <td colspan="3">
                            <TextareaTable v-model="modelValue.inspectionBasis" />
                        </td>
                    </tr>
                    <tr>
                        <th>检测人员</th>
                        <td colspan="3"><TextareaTable v-model="modelValue.inspectorNames" /></td>
                    </tr>
                    <tr class="record-table__large-row">
                        <th>检测结论</th>
                        <td colspan="3"><TextareaTable v-model="modelValue.conclusion" /></td>
                    </tr>
                    <tr class="record-table__large-row">
                        <th>备注</th>
                        <td colspan="3"><TextareaTable v-model="modelValue.remark" /></td>
                    </tr>
                </tbody>
            </table>

            <div class="report-paper__page-no">1</div>
        </div>
    </div>
</template>

<script setup lang="ts" name="SelfInspectionRecordModel">
// 自行检测记录保留设备识别、技术参数和检测结论等演示所需核心字段。
export interface SelfInspectionRecordModelType {
    recordNo: string
    userOrganization: string
    location: string
    deviceCode: string
    registrationCode: string
    deviceCategory: string
    productModel: string
    manufacturer: string
    maintenanceOrganization: string
    ratedLoad: string
    ratedSpeed: string
    floorStationDoor: string
    inspectionDate: string
    inspectionBasis: string
    inspectorNames: string
    conclusion: string
    remark: string
}

declare module '@/views/Report/ReportView/types' {
    interface TemplateDataMap {
        SelfInspectionRecordModel: SelfInspectionRecordModelType
    }
}

const modelValue = defineModel<SelfInspectionRecordModelType>({ required: true })
</script>

<style lang="scss" scoped>
.self-inspection-record-model {
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
        padding-top: 54px;
        font-size: 24px;
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

.record-table {
    --table-input-min-height: 42px;

    width: $report-paper-content-width;
    margin: 34px auto 0;
    border: 2px solid var(--report-paper-border);
    border-collapse: collapse;
    table-layout: fixed;
    font-size: 14px;
    line-height: 1.35;

    th,
    td {
        height: 42px;
        padding: 0 8px;
        border: 1px solid var(--report-paper-border);
        font-weight: 400;
        vertical-align: middle;
    }

    th {
        text-align: center;
    }

    &__label-column {
        width: 116px;
    }

    &__value-column {
        width: 227px;
    }

    &__large-row {
        --table-input-min-height: 72px;

        th,
        td {
            height: 72px;
        }
    }
}
</style>
