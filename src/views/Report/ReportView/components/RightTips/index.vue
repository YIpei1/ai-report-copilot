<!--
/**
* Author: YiPei
* Date: 2026-05-15 14:37
* Desc: RightTips 报表提交提示
*/
-->
<template>
    <aside class="right-tips-panel">
        <div class="right-tips-panel__tabs">
            <span
                class="right-tips-panel__tab-indicator"
                :style="{ transform: `translateX(${activeTabIndex * 100}%)` }"
            ></span>
            <button
                v-for="tab in tabs"
                :key="tab.value"
                type="button"
                class="right-tips-panel__tab"
                :class="{ 'is-active': activeTab === tab.value }"
                @click="setActiveTab(tab.value)"
            >
                <el-icon>
                    <component :is="tab.icon" />
                </el-icon>
                <span>{{ tab.label }}</span>
            </button>
        </div>

        <Transition name="right-panel" mode="out-in">
            <div v-if="activeTab === 'preview'" key="preview" class="right-tips-panel__body">
                <section class="preview-section">
                    <div class="preview-section__head">
                        <div class="preview-section__title">
                            <el-icon class="preview-section__title-icon">
                                <CircleCheck />
                            </el-icon>
                            <span>智能预审报告</span>
                        </div>
                        <span class="preview-section__badge">2</span>
                    </div>

                    <p class="preview-section__intro">
                        由 LIMS AI 引擎自动生成的预审检查结果。请在人工复核时重点关注标红项。
                    </p>

                    <div class="issue-group">
                        <button
                            type="button"
                            class="issue-group__title"
                            :class="{ 'is-open': openedIssueGroups.blocking }"
                            @click="toggleIssueGroup('blocking')"
                        >
                            <span class="is-danger">阻断性错误 (2)</span>
                            <el-icon class="issue-group__arrow">
                                <ArrowDown v-if="openedIssueGroups.blocking" />
                                <ArrowRight v-else />
                            </el-icon>
                        </button>

                        <Transition name="collapse">
                            <div v-show="openedIssueGroups.blocking" class="issue-group__content">
                                <TransitionGroup name="issue-list" tag="div">
                                    <article
                                        v-for="(item, index) in blockingIssues"
                                        :key="item.title"
                                        class="issue-card issue-card--danger"
                                        :style="{ transitionDelay: `${index * 45}ms` }"
                                    >
                                        <div class="issue-card__icon">
                                            <el-icon>
                                                <CircleCloseFilled />
                                            </el-icon>
                                        </div>
                                        <div class="issue-card__content">
                                            <h4>{{ item.title }}</h4>
                                            <p>{{ item.content }}</p>
                                        </div>
                                    </article>
                                </TransitionGroup>
                            </div>
                        </Transition>
                    </div>

                    <div class="issue-group">
                        <button
                            type="button"
                            class="issue-group__title"
                            :class="{ 'is-open': openedIssueGroups.warning }"
                            @click="toggleIssueGroup('warning')"
                        >
                            <span class="is-warning">预警提示 (1)</span>
                            <el-icon class="issue-group__arrow">
                                <ArrowDown v-if="openedIssueGroups.warning" />
                                <ArrowRight v-else />
                            </el-icon>
                        </button>

                        <Transition name="collapse">
                            <div v-show="openedIssueGroups.warning" class="issue-group__content">
                                <article class="issue-card issue-card--warning">
                                    <div class="issue-card__icon">
                                        <el-icon>
                                            <WarningFilled />
                                        </el-icon>
                                    </div>
                                    <div class="issue-card__content">
                                        <h4>信息遗漏</h4>
                                        <p>结论页未找到检验员的电子签名印章。</p>
                                    </div>
                                </article>
                            </div>
                        </Transition>
                    </div>

                    <button
                        type="button"
                        class="reference-link"
                        :class="{ 'is-open': openedIssueGroups.reference }"
                        @click="toggleIssueGroup('reference')"
                    >
                        <span>参考信息 (1)</span>
                        <el-icon class="issue-group__arrow">
                            <ArrowDown v-if="openedIssueGroups.reference" />
                            <ArrowRight v-else />
                        </el-icon>
                    </button>

                    <Transition name="collapse">
                        <div v-show="openedIssueGroups.reference" class="reference-card">
                            原始记录第 4 页存在同类速度字段，可作为复核依据。
                        </div>
                    </Transition>
                </section>

                <section class="manual-section">
                    <h3>人工批注清单</h3>
                    <article
                        v-for="(comment, index) in comments"
                        :key="comment.name"
                        class="comment-card"
                        :class="comment.statusClass"
                        :style="{ animationDelay: `${index * 70}ms` }"
                    >
                        <div class="comment-card__header">
                            <strong>{{ comment.name }}</strong>
                            <time>{{ comment.time }}</time>
                        </div>
                        <p>{{ comment.content }}</p>
                        <span class="comment-card__status">{{ comment.status }}</span>
                    </article>
                </section>
            </div>

            <div v-else key="audit" class="right-tips-panel__body">
                <section class="business-section">
                    <h3>
                        <el-icon>
                            <Monitor />
                        </el-icon>
                        <span>业务快览</span>
                    </h3>
                    <dl>
                        <div>
                            <dt>设备代码</dt>
                            <dd>31103601052018080001</dd>
                        </div>
                        <div>
                            <dt>主检人员</dt>
                            <dd>张三</dd>
                        </div>
                        <div>
                            <dt>检测时间</dt>
                            <dd>2026-01-16</dd>
                        </div>
                    </dl>
                </section>

                <section class="timeline-section">
                    <h3>
                        <el-icon>
                            <Refresh />
                        </el-icon>
                        <span>审批流转轨迹</span>
                    </h3>

                    <div class="audit-timeline">
                        <article
                            v-for="(item, index) in auditLogs"
                            :key="item.title"
                            class="audit-timeline__item"
                            :class="item.statusClass"
                            :style="{ animationDelay: `${index * 80}ms` }"
                        >
                            <span class="audit-timeline__dot"></span>
                            <div class="audit-timeline__content">
                                <h4>{{ item.title }}</h4>
                                <time>{{ item.time }}</time>
                                <p v-if="item.message" :class="{ 'is-note': item.note }">
                                    {{ item.message }}
                                </p>
                            </div>
                        </article>
                    </div>
                </section>
            </div>
        </Transition>
    </aside>
</template>

<script setup lang="ts" name="RightTips">
import { computed, ref } from 'vue'

type TabValue = 'preview' | 'audit'
type IssueGroupKey = 'blocking' | 'warning' | 'reference'

const activeTab = ref<TabValue>('preview')
const openedIssueGroups = ref<Record<IssueGroupKey, boolean>>({
    blocking: true,
    warning: true,
    reference: false,
})

const tabs = [
    { label: '智能预审', value: 'preview', icon: 'CircleCheck' },
    { label: '审批记录', value: 'audit', icon: 'Monitor' },
] as const

const activeTabIndex = computed(() => {
    return tabs.findIndex((tab) => tab.value === activeTab.value)
})

const setActiveTab = (value: TabValue) => {
    activeTab.value = value
}

const toggleIssueGroup = (key: IssueGroupKey) => {
    openedIssueGroups.value[key] = !openedIssueGroups.value[key]
}

const blockingIssues = [
    {
        title: '数据不一致',
        content: '限速器动作速度 (1.2m/s) 与原始记录 (1.1m/s) 不匹配。',
    },
    {
        title: '逻辑存疑',
        content: '额定速度 2.0m/s 的电梯通常应配置聚氨酯以上级别的缓冲器，当前为弹簧。',
    },
]

const comments = [
    {
        name: '张审核',
        time: '10:30',
        content: '这里的数据似乎有误，请核对原始记录',
        status: '待处理',
        statusClass: 'is-pending',
    },
    {
        name: '李批准',
        time: '11:15',
        content: '缺少检验员签字',
        status: '已解决',
        statusClass: 'is-resolved',
    },
]

const auditLogs = [
    {
        title: '智能编排完成',
        time: '2024-09-04 16:58:36',
        message: '系统根据原始记录自动生成报告',
        statusClass: 'is-success',
    },
    {
        title: '审核退回',
        time: '2024-09-04 16:53:14',
        message: '备注：照片不清晰',
        statusClass: 'is-danger',
        note: true,
    },
    {
        title: '任务开启',
        time: '2024-09-04 16:40:16',
        message: '',
        statusClass: 'is-muted',
    },
]
</script>

<style lang="scss" scoped>
.right-tips-panel {
    position: relative;
    height: calc(100vh - $report-panel-header-height);
    background: var(--card-bg);
    border-left: 1px solid var(--header-border);
    box-shadow: -6px 0 16px var(--layout-shadow);
    color: var(--text-primary);
    overflow: hidden;
}

.right-tips-panel__tabs {
    position: relative;
    height: $report-panel-header-height;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px;
    padding: 10px 16px;
    border-bottom: 1px solid var(--header-border);
    background: var(--page-bg);
}

.right-tips-panel__tab-indicator {
    position: absolute;
    top: 10px;
    left: 16px;
    width: calc((100% - 40px) / 2);
    height: 32px;
    border: 1px solid var(--header-border);
    border-radius: 4px;
    background: var(--card-bg);
    box-shadow: 0 2px 8px var(--layout-shadow);
    transition: transform 0.24s ease;
}

.right-tips-panel__tab {
    position: relative;
    z-index: 1;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    min-width: 0;
    height: 32px;
    border: 0;
    border-radius: 4px;
    background: transparent;
    color: var(--text-secondary);
    font-size: 13px;
    cursor: pointer;
    transition:
        color 0.2s ease,
        transform 0.2s ease;

    &:hover {
        color: var(--text-primary);
    }

    &:active {
        transform: scale(0.98);
    }

    &.is-active {
        color: var(--text-primary);
    }
}

.right-tips-panel__body {
    height: calc(100% - 52px);
    overflow-y: auto;
    padding: 18px 16px 28px;
}

.right-panel-enter-active,
.right-panel-leave-active {
    transition:
        opacity 0.2s ease,
        transform 0.2s ease;
}

.right-panel-enter-from {
    opacity: 0;
    transform: translateX(14px);
}

.right-panel-leave-to {
    opacity: 0;
    transform: translateX(-14px);
}

.preview-section__head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: 30px;
    padding-bottom: 10px;
    border-bottom: 1px solid var(--header-border);
}

.preview-section__title,
.business-section h3,
.timeline-section h3 {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 0;
    color: var(--text-primary);
    font-size: 15px;
    font-weight: 700;
}

.preview-section__title-icon {
    color: var(--status-success);
}

.preview-section__badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: var(--status-danger-strong);
    color: var(--report-paper-bg);
    font-size: 12px;
    font-weight: 700;
    animation: badge-pulse 1.8s ease-in-out infinite;
}

@keyframes badge-pulse {
    0%,
    100% {
        box-shadow: 0 0 0 0 var(--status-danger-shadow);
    }

    50% {
        box-shadow: 0 0 0 6px transparent;
    }
}

.preview-section__intro {
    margin: 18px 0 22px;
    color: var(--icon-muted);
    font-size: 12px;
    line-height: 1.8;
}

.issue-group {
    margin-bottom: 24px;
}

.issue-group__title,
.reference-link {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border: 0;
    background: transparent;
    padding: 0;
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
}

.issue-group__arrow {
    color: var(--icon-muted);
    transition: transform 0.22s ease;
}

.issue-group__content {
    overflow: hidden;
}

.collapse-enter-active,
.collapse-leave-active {
    overflow: hidden;
    transition:
        opacity 0.2s ease,
        max-height 0.22s ease;
}

.collapse-enter-from,
.collapse-leave-to {
    max-height: 0;
    opacity: 0;
}

.collapse-enter-to,
.collapse-leave-from {
    max-height: 520px;
    opacity: 1;
}

.issue-list-enter-active,
.issue-list-leave-active {
    transition:
        opacity 0.2s ease,
        transform 0.2s ease;
}

.issue-list-enter-from,
.issue-list-leave-to {
    opacity: 0;
    transform: translateY(8px);
}

.is-danger {
    color: var(--status-danger);
}

.is-warning {
    color: var(--status-warning-strong);
}

.issue-card {
    display: grid;
    grid-template-columns: 24px minmax(0, 1fr);
    gap: 12px;
    margin-top: 16px;
    padding: 18px;
    border-radius: 6px;
    transition:
        box-shadow 0.2s ease,
        transform 0.2s ease;

    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 10px 24px var(--layout-shadow);
    }
}

.issue-card--danger {
    border: 1px solid var(--status-danger-border);
    background: var(--status-danger-soft);

    .issue-card__icon {
        color: var(--status-danger-strong);
    }
}

.issue-card--warning {
    border: 1px solid var(--status-warning-border);
    background: var(--status-warning-soft);

    .issue-card__icon {
        color: var(--status-warning-strong);
    }
}

.issue-card__icon {
    padding-top: 2px;
    font-size: 22px;
}

.issue-card__content {
    min-width: 0;

    h4 {
        margin: 0 0 8px;
        font-size: 14px;
        line-height: 1.35;
    }

    p {
        margin: 0;
        color: var(--text-primary);
        font-size: 13px;
        font-weight: 600;
        line-height: 1.65;
    }
}

.reference-link {
    margin: 2px 0 12px;
    color: var(--status-info);
}

.reference-card {
    margin-bottom: 20px;
    padding: 12px 14px;
    border: 1px solid var(--status-info-border);
    border-radius: 6px;
    background: var(--status-info-soft);
    color: var(--text-secondary);
    font-size: 12px;
    line-height: 1.6;
}

.manual-section {
    padding-top: 16px;
    border-top: 1px solid var(--header-border);

    h3 {
        margin: 0 0 12px;
        color: var(--text-primary);
        font-size: 15px;
        font-weight: 700;
    }
}

.comment-card {
    position: relative;
    margin-bottom: 10px;
    padding: 14px 14px 34px 16px;
    border: 1px solid var(--header-border);
    border-left: 3px solid var(--status-warning);
    border-radius: 6px;
    background: var(--card-bg);
    animation: card-in 0.28s ease both;
    transition:
        border-color 0.2s ease,
        box-shadow 0.2s ease,
        transform 0.2s ease;

    &:hover {
        border-color: var(--text-disabled);
        box-shadow: 0 8px 22px var(--layout-shadow);
        transform: translateY(-2px);
    }

    &.is-resolved {
        border-left-color: var(--status-success);

        .comment-card__status {
            background: var(--status-success-soft);
            color: var(--status-success);
        }
    }

    &.is-pending .comment-card__status {
        background: var(--status-info-soft);
        color: var(--status-info);
    }
}

@keyframes card-in {
    from {
        opacity: 0;
        transform: translateY(8px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.comment-card__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;

    strong {
        color: var(--text-primary);
        font-size: 13px;
    }

    time {
        color: var(--text-disabled);
        font-size: 11px;
    }
}

.comment-card p {
    margin: 10px 0 0;
    color: var(--text-secondary);
    font-size: 12px;
    line-height: 1.5;
}

.comment-card__status {
    position: absolute;
    right: 12px;
    bottom: 10px;
    padding: 3px 7px;
    border-radius: 4px;
    font-size: 11px;
}

.business-section {
    padding: 28px 8px 24px;
    border-bottom: 1px solid var(--header-border);

    h3 {
        color: var(--text-primary);

        .el-icon {
            color: var(--status-info);
            font-size: 18px;
        }
    }

    dl {
        display: grid;
        gap: 14px;
        margin: 16px 0 0;
    }

    div {
        display: grid;
        grid-template-columns: 72px minmax(0, 1fr);
        gap: 12px;
        align-items: center;
    }

    dt {
        color: var(--icon-muted);
        font-size: 13px;
    }

    dd {
        margin: 0;
        color: var(--text-primary);
        font-size: 13px;
        font-weight: 600;
    }
}

.timeline-section {
    padding: 26px 8px;

    h3 .el-icon {
        color: var(--status-warning-strong);
        font-size: 18px;
    }
}

.audit-timeline {
    position: relative;
    margin-top: 16px;
    padding-left: 16px;

    &::before {
        position: absolute;
        top: 9px;
        bottom: 9px;
        left: 5px;
        width: 1px;
        background: var(--header-border);
        content: '';
    }
}

.audit-timeline__item {
    position: relative;
    min-height: 58px;
    padding: 0 0 16px 18px;
    animation: card-in 0.28s ease both;

    &.is-success .audit-timeline__dot {
        border-color: var(--status-success);
        background: var(--status-success);
        animation: dot-pulse 1.8s ease-in-out infinite;
    }

    &.is-danger .audit-timeline__dot {
        border-color: var(--status-danger-strong);
        background: var(--card-bg);
    }

    &.is-muted .audit-timeline__dot {
        border-color: var(--text-disabled);
        background: var(--card-bg);
    }
}

@keyframes dot-pulse {
    0%,
    100% {
        box-shadow: 0 0 0 0 var(--status-success-shadow);
    }

    50% {
        box-shadow: 0 0 0 6px transparent;
    }
}

.audit-timeline__dot {
    position: absolute;
    top: 5px;
    left: -15px;
    width: 9px;
    height: 9px;
    border: 2px solid var(--text-disabled);
    border-radius: 50%;
    background: var(--card-bg);
}

.audit-timeline__content {
    transition: transform 0.2s ease;

    .audit-timeline__item:hover & {
        transform: translateX(2px);
    }

    h4 {
        margin: 0 0 4px;
        color: var(--text-primary);
        font-size: 14px;
        line-height: 1.35;
    }

    time {
        color: var(--icon-muted);
        font-size: 12px;
    }

    p {
        margin: 10px 0 0;
        padding: 12px 14px;
        border: 1px solid var(--status-success-border);
        border-radius: 6px;
        background: var(--status-success-soft);
        color: var(--text-secondary);
        font-size: 13px;
        line-height: 1.5;

        &.is-note {
            padding: 0;
            border: 0;
            background: transparent;
            color: var(--status-danger-strong);
            font-weight: 700;
        }
    }
}
</style>
