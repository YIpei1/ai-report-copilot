<template>
    <section class="chat-page">
        <ConversationSidebar />

        <section class="chat-main">
            <ChatHeader />
            <MessageList />
            <ChatInput />
        </section>
    </section>
</template>

<script setup lang="ts" name="ChatView">
import ChatHeader from './components/ChatHeader/index.vue'
import ChatInput from './components/ChatInput/index.vue'
import ConversationSidebar from './components/ConversationSidebar/index.vue'
import MessageList from './components/MessageList/index.vue'
</script>

<style scoped lang="scss">
.chat-page {
    display: grid;
    grid-template-columns: 240px minmax(0, 1fr);
    height: 100%;
    min-height: 0;
    overflow: hidden;
    background: var(--card-bg);
    border: 1px solid var(--header-border);
    border-radius: $radius-lg;
    box-shadow: 0 12px 32px var(--layout-shadow);
}

.chat-main {
    display: grid;
    grid-template-rows: auto minmax(0, 1fr) auto;
    min-width: 0;
    min-height: 0;
}

@media (width <= $breakpoint-tablet) {
    .chat-page {
        grid-template-columns: 180px minmax(0, 1fr);
    }
}
</style>
