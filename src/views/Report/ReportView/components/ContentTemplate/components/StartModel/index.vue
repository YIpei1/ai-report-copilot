<template>
    <div class="start-model">
        <div class="report-paper">
            <div class="report-paper__title-area">
                <h1>
                    <TextareaTable v-model="modelValue.reportName" />
                </h1>
                <p>文件编号：ZAJT/JSJL30.01-2/0</p>
            </div>

            <div class="report-paper__info-table" aria-label="报告首页信息">
                <div class="report-paper__info-row">
                    <div class="report-paper__info-label">使用单位：</div>
                    <div class="report-paper__info-value">
                        <TextareaTable v-model="modelValue.userOrganization" />
                    </div>
                </div>
                <div class="report-paper__info-row">
                    <div class="report-paper__info-label">设备名称：</div>
                    <div class="report-paper__info-value">
                        <TextareaTable v-model="modelValue.deviceName" />
                    </div>
                </div>
                <div class="report-paper__info-row">
                    <div class="report-paper__info-label">检测日期：</div>
                    <div class="report-paper__info-value">
                        <TextareaTable v-model="modelValue.inspectionDate" />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts" name="StartModel">
interface StartModelType {
    reportName: string
    userOrganization: string
    deviceName: string
    inspectionDate: string
}

declare module '@/views/Report/ReportView/types' {
    interface TemplateDataMap {
        StartModel: StartModelType
    }
}

const modelValue = defineModel<StartModelType>({ required: true })
</script>

<style lang="scss" scoped>
.start-model {
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

    &__title-area {
        width: 520px;
        margin: 0 auto;
        padding-top: 186px;
        text-align: center;

        h1 {
            margin: 0;
        }

        :deep(h1 .table-input) {
            font-size: 28px;
            font-weight: 500;
            line-height: 46px;
        }

        p {
            margin: 4px 0 0;
            font-size: 14px;
            line-height: 1.4;
        }
    }

    &__info-table {
        width: 512px;
        margin: 164px auto 0;
        border: 1px solid var(--report-paper-border);
        border-bottom: 0;
    }

    &__info-row {
        display: grid;
        grid-template-columns: 142px 1fr;
        min-height: 46px;
    }

    &__info-label {
        display: flex;
        align-items: center;
        justify-content: center;
        border-right: 1px solid var(--report-paper-border);
        border-bottom: 1px solid var(--report-paper-border);
        color: var(--report-paper-text);
        font-size: 14px;
        white-space: nowrap;
    }

    &__info-value {
        border-bottom: 1px solid var(--report-paper-border);
    }
}
</style>
