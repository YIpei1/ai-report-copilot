<template>
    <!-- 当前会话标题。 -->
    <header class="chat-header">
        <div>
            <h2>销售分析</h2>
            <p>当前聊天内容</p>
        </div>
        <span class="chat-header__status">AI 助手在线</span>
    </header>
</template>

<script setup lang="ts" name="ChatHeader"></script>

<style scoped lang="scss">
.chat-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: 68px;
    padding: 0 $space-lg;
    border-bottom: 1px solid var(--header-border);
}

.chat-header h2 {
    margin: $space-xs 0 0;
    font-size: $font-size-lg;
    color: var(--text-primary);
}

.chat-header p {
    margin: $space-xs 0 0;
    font-size: $font-size-xs;
    color: var(--text-secondary);
}

.chat-header__status {
    font-size: $font-size-xs;
    color: var(--status-success);
}
</style>
