<template>
    <!-- 输入区域暂时只提供基础结构和样式，发送逻辑后续接入。 -->
    <footer class="chat-input">
        <textarea rows="1" placeholder="输入消息……"></textarea>
        <button type="button">
            <span>发送</span>
            <el-icon>
                <Promotion />
            </el-icon>
        </button>
    </footer>
</template>

<script setup lang="ts" name="ChatInput">
import { Promotion } from '@element-plus/icons-vue'
</script>

<style scoped lang="scss">
.chat-input {
    display: flex;
    gap: $space-md;
    align-items: center;
    min-height: 72px;
    padding: $space-md $space-lg;
    background: var(--card-bg);
    border-top: 1px solid var(--header-border);
}

.chat-input textarea {
    flex: 1;
    min-width: 0;
    min-height: $control-height-md;
    padding: $space-sm $space-md;
    font: inherit;
    line-height: 1.5;
    color: var(--text-primary);
    resize: none;
    background: var(--header-item-bg);
    border: 1px solid var(--header-border);
    border-radius: $radius-md;
    outline: none;
}

.chat-input textarea:focus {
    border-color: var(--sidebar-active-bg);
}

.chat-input button {
    display: inline-flex;
    gap: $space-sm;
    align-items: center;
    justify-content: center;
    height: $control-height-md;
    padding: 0 $space-md;
    font-size: $font-size-sm;
    color: #fff;
    cursor: pointer;
    background: var(--sidebar-active-bg);
    border: 0;
    border-radius: $radius-md;
}
</style>
