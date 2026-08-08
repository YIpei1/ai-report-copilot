<template>
    <div class="announcements-model">
        <div class="report-paper">
            <div class="report-paper__record-no">记录编号：</div>
            <div class="report-paper__frame">
                <h1>注意事项</h1>

                <ol class="report-paper__notice-list">
                    <li>
                        本记录依据《电梯自行检测规则》(TSG T7008-2023)
                        编制，适用于曳引驱动乘客与载货电梯、强制驱动载货电梯、曳引驱动消防员电梯、曳引驱动防爆电梯、曳引驱动斜行乘客与载货电梯、强制驱动斜行载货电梯的检测。
                    </li>
                    <li>
                        检测过程中，要如实、规范地记录检测情况，不得漏检、漏记。对于符合要求的检测项目，在“检测结果”栏填写“符合”；对于不符合要求的检测项目，在“检测结果”栏填写“不符合”；并对不符合情况进行说明；对于不适用的项目，在“检测结果”栏填写“无此项”；对于需要填写数据的项目，必须如实填写检测数据或者计算处理后的数据。
                    </li>
                    <li>
                        检测人员应当使用检测信息化管理系统填写电梯检测记录，检测记录修改或更正过程应当有记录可追溯。
                    </li>
                    <li>本记录应有检测人员和校核人员签名。</li>
                    <li>本原始记录是对设备现场情况的如实记录，仅对当时现场设备状况负责。</li>
                </ol>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts" name="AnnouncementsModel">
type AnnouncementsModelType = undefined

declare module '@/views/Report/ReportView/types' {
    interface TemplateDataMap {
        AnnouncementsModel: AnnouncementsModelType
    }
}
</script>

<style lang="scss" scoped>
.announcements-model {
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
}

.report-paper__corner {
    position: absolute;
    width: 24px;
    height: 24px;
    border-color: var(--report-paper-guide);
    border-style: solid;
}

.report-paper__corner--top-left {
    top: 34px;
    left: 56px;
    border-width: 0 0 1px 1px;
}

.report-paper__corner--top-right {
    top: 34px;
    right: 56px;
    border-width: 0 1px 1px 0;
}

.report-paper__corner--bottom-left {
    bottom: 34px;
    left: 56px;
    border-width: 1px 0 0 1px;
}

.report-paper__corner--bottom-right {
    right: 56px;
    bottom: 34px;
    border-width: 1px 1px 0 0;
}

.report-paper__record-no {
    position: absolute;
    top: 40px;
    right: 152px;
    color: var(--report-paper-muted);
    font-family: 'Microsoft YaHei', sans-serif;
    font-size: 16px;
    line-height: 1;
}

.report-paper__frame {
    position: absolute;
    inset: 62px 66px 99px;
    border: 2px solid var(--report-paper-border);
    padding: 12px 34px;

    h1 {
        margin: 0;
        padding: 4px 0 48px;
        text-align: center;
        font-size: 24px;
        font-weight: 700;
        line-height: 1.35;
        letter-spacing: 2px;
    }
}

.report-paper__notice-list {
    margin: 0;
    padding-left: 26px;
    font-size: 16px;
    line-height: 2.6;

    li {
        padding-left: 8px;
        margin-bottom: 8px;
        text-align: justify;
        text-justify: inter-ideograph;
    }

    li::marker {
        font-family: 'Times New Roman', serif;
        font-size: 16px;
    }
}
</style>
