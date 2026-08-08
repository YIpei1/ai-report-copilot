<template>
    <!-- 消息为空时展示欢迎页，存在消息时渲染消息列表。 -->
    <div class="chat-messages">
        <ChatWelcome v-if="messages.length === 0" />
        <MessageItem
            v-for="message in messages"
            v-else
            :key="message.id"
            :content="message.content"
            :role="message.role"
        />
    </div>
</template>

<script setup lang="ts" name="MessageList">
import ChatWelcome from '../ChatWelcome/index.vue'
import MessageItem from './MessageItem/index.vue'

interface ChatMessage {
    content: string
    id: number
    role: 'assistant' | 'user'
}

// 静态消息仅用于展示基础页面，后续由会话数据替换。
const messages: ChatMessage[] = [
    {
        id: 1,
        role: 'user',
        content: '分析一下本月销售数据。',
    },
    {
        id: 2,
        role: 'assistant',
        content:
            '根据数据来看，本月整体销售额保持增长，核心商品贡献较为稳定，部分品类需要进一步关注。',
    },
    {
        id: 3,
        role: 'user',
        content: '哪些商品下降明显？',
    },
    {
        id: 4,
        role: 'assistant',
        content: '下降明显的商品主要集中在季节性品类，可以结合库存和渠道数据继续分析。',
    },
]
</script>

<style scoped lang="scss">
.chat-messages {
    display: flex;
    flex-direction: column;
    gap: $space-lg;
    min-height: 0;
    padding: $space-lg;
    overflow-y: auto;
    background: var(--page-bg);
}
</style>
