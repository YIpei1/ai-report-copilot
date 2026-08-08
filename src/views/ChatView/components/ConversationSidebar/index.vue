<template>
    <!-- 左侧会话列表。 -->
    <aside class="chat-sidebar">
        <div class="chat-sidebar__header">
            <div>
                <span class="chat-sidebar__eyebrow">AI COPILOT</span>
                <h1>会话列表</h1>
            </div>
            <el-icon class="chat-sidebar__header-icon">
                <ChatDotRound />
            </el-icon>
        </div>

        <button class="chat-sidebar__create" type="button">
            <el-icon>
                <Plus />
            </el-icon>
            <span>新建会话</span>
        </button>

        <nav class="chat-session-list" aria-label="历史会话">
            <section class="chat-session-group">
                <h2>今日</h2>
                <button class="chat-session-item chat-session-item--active" type="button">
                    <span>销售分析</span>
                    <small>刚刚</small>
                </button>
                <button class="chat-session-item" type="button">
                    <span>代码解释</span>
                    <small>10:24</small>
                </button>
            </section>

            <section class="chat-session-group">
                <h2>昨天</h2>
                <button class="chat-session-item" type="button">
                    <span>项目规划</span>
                    <small>昨天</small>
                </button>
            </section>
        </nav>
    </aside>
</template>

<script setup lang="ts" name="ConversationSidebar">
import { ChatDotRound, Plus } from '@element-plus/icons-vue'
</script>

<style scoped lang="scss">
.chat-sidebar {
    display: grid;
    grid-template-rows: auto auto minmax(0, 1fr);
    gap: $space-md;
    min-height: 0;
    padding: $space-lg $space-md;
    background: var(--header-item-bg);
    border-right: 1px solid var(--header-border);
}

.chat-sidebar__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.chat-sidebar__eyebrow {
    font-size: $font-size-xs;
    font-weight: $font-weight-bold;
    color: var(--sidebar-active-bg);
    letter-spacing: 0.08em;
}

.chat-sidebar__header h1 {
    margin: $space-xs 0 0;
    font-size: $font-size-lg;
    color: var(--text-primary);
}

.chat-sidebar__header-icon {
    font-size: $font-size-xl;
    color: var(--icon-muted);
}

.chat-sidebar__create {
    display: flex;
    gap: $space-sm;
    align-items: center;
    justify-content: center;
    height: $control-height-md;
    font-size: $font-size-sm;
    color: #fff;
    cursor: pointer;
    background: var(--sidebar-active-bg);
    border: 0;
    border-radius: $radius-md;
}

.chat-session-list {
    min-height: 0;
    overflow-y: auto;
}

.chat-session-group + .chat-session-group {
    margin-top: $space-lg;
}

.chat-session-group h2 {
    margin: 0 0 $space-sm;
    font-size: $font-size-xs;
    font-weight: $font-weight-medium;
    color: var(--text-disabled);
}

.chat-session-item {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: $space-sm;
    align-items: center;
    width: 100%;
    height: $control-height-md;
    padding: 0 $space-sm;
    font-size: $font-size-sm;
    color: var(--text-secondary);
    text-align: left;
    cursor: pointer;
    background: transparent;
    border: 0;
    border-radius: $radius-md;
}

.chat-session-item span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.chat-session-item small {
    font-size: $font-size-xs;
    color: var(--text-disabled);
}

.chat-session-item:hover,
.chat-session-item--active {
    color: var(--text-primary);
    background: var(--surface-hover-bg);
}

.chat-session-item--active {
    font-weight: $font-weight-medium;
    box-shadow: inset 3px 0 0 var(--sidebar-active-bg);
}
</style>
