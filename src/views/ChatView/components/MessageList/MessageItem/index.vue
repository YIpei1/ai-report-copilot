<template>
    <article class="chat-message" :class="`chat-message--${role}`">
        <div class="chat-message__avatar">{{ role === 'user' ? '你' : 'AI' }}</div>
        <div class="chat-message__content">
            <strong>{{ role === 'user' ? '用户' : 'AI 助手' }}</strong>
            <p>{{ content }}</p>
        </div>
    </article>
</template>

<script setup lang="ts" name="MessageItem">
defineProps<{
    content: string
    role: 'assistant' | 'user'
}>()
</script>

<style scoped lang="scss">
.chat-message {
    display: flex;
    gap: $space-md;
    align-items: flex-start;
    max-width: 76%;
}

.chat-message--user {
    align-self: flex-end;
    flex-direction: row-reverse;
}

.chat-message__avatar {
    display: grid;
    flex: 0 0 $control-height-sm;
    width: $control-height-sm;
    height: $control-height-sm;
    font-size: $font-size-xs;
    font-weight: $font-weight-bold;
    color: #fff;
    background: var(--sidebar-active-bg);
    border-radius: 50%;
    place-items: center;
}

.chat-message--assistant .chat-message__avatar {
    color: var(--text-primary);
    background: var(--surface-hover-bg);
    border: 1px solid var(--header-border);
}

.chat-message__content {
    padding: $space-sm $space-md;
    color: var(--text-primary);
    background: var(--card-bg);
    border: 1px solid var(--header-border);
    border-radius: $radius-lg;
}

.chat-message--user .chat-message__content {
    background: var(--surface-hover-bg);
}

.chat-message__content strong {
    font-size: $font-size-xs;
}

.chat-message__content p {
    margin: $space-xs 0 0;
    font-size: $font-size-sm;
    line-height: 1.7;
}

@media (width <= $breakpoint-tablet) {
    .chat-message {
        max-width: 90%;
    }
}
</style>
