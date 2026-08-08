<template>
    <section class="chat-welcome">
        <el-icon class="chat-welcome__icon">
            <ChatDotRound />
        </el-icon>
        <h2>开始新的 AI 会话</h2>
        <p>输入你的问题，我会在这里展示分析结果。</p>
    </section>
</template>

<script setup lang="ts" name="ChatWelcome">
import { ChatDotRound } from '@element-plus/icons-vue'
</script>

<style scoped lang="scss">
.chat-welcome {
    display: grid;
    flex: 1;
    align-content: center;
    justify-items: center;
    color: var(--text-secondary);
    text-align: center;
}

.chat-welcome__icon {
    font-size: $font-size-xxl;
    color: var(--sidebar-active-bg);
}

.chat-welcome h2 {
    margin: $space-md 0 $space-sm;
    font-size: $font-size-lg;
    color: var(--text-primary);
}

.chat-welcome p {
    margin: 0;
    font-size: $font-size-sm;
}
</style>
