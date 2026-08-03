<template>
    <main class="forbidden">
        <div class="forbidden__decoration forbidden__decoration--top"></div>
        <div class="forbidden__decoration forbidden__decoration--bottom"></div>

        <section class="forbidden__content">
            <div class="forbidden__code" aria-label="403">403</div>
            <p class="forbidden__eyebrow">ACCESS DENIED</p>
            <h1>暂无访问权限</h1>
            <p class="forbidden__description">
                当前账号没有访问该页面的权限。如有需要，请联系管理员为你开通相应权限。
            </p>

            <div class="forbidden__actions">
                <RouterLink to="/dashboard" class="primary-button">返回工作台</RouterLink>
                <button type="button" class="secondary-button" @click="goBack">返回上一页</button>
            </div>
        </section>

        <p class="forbidden__footer">AI Report Copilot · 智能报告助手</p>
    </main>
</template>

<script setup lang="ts" name="ForbiddenView">
import { useRouter } from 'vue-router'

const router = useRouter()

const goBack = () => {
    if (window.history.length > 1) {
        router.back()
        return
    }

    router.push('/dashboard')
}
</script>

<style scoped lang="scss">
.forbidden {
    position: relative;
    display: grid;
    min-height: 100vh;
    padding: 40px 24px;
    overflow: hidden;
    color: #27304a;
    background:
        radial-gradient(circle at 50% 38%, rgb(224 151 70 / 13%), transparent 28%),
        linear-gradient(145deg, #fffdf9 0%, #f8f5ef 100%);
    place-items: center;

    &__content {
        position: relative;
        z-index: 1;
        width: min(100%, 620px);
        text-align: center;
    }

    &__code {
        color: #d18a3d;
        font-size: clamp(108px, 18vw, 180px);
        font-weight: 750;
        line-height: 0.85;
        letter-spacing: -0.08em;
        text-shadow: 0 18px 40px rgb(177 111 43 / 18%);
    }

    &__eyebrow {
        margin-top: 28px;
        color: #bd762e;
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 0.22em;
    }

    h1 {
        margin-top: 12px;
        font-size: clamp(30px, 4vw, 42px);
        font-weight: 650;
        letter-spacing: -0.03em;
    }

    &__description {
        max-width: 480px;
        margin: 16px auto 0;
        color: #7d8190;
        font-size: 15px;
        line-height: 1.8;
    }

    &__actions {
        display: flex;
        justify-content: center;
        gap: 14px;
        margin-top: 34px;
    }

    &__footer {
        position: absolute;
        bottom: 28px;
        color: #aaa6a0;
        font-size: 12px;
    }

    &__decoration {
        position: absolute;
        border: 1px solid rgb(209 138 61 / 10%);
        border-radius: 50%;

        &--top {
            top: -190px;
            right: -130px;
            width: 420px;
            height: 420px;
            box-shadow:
                0 0 0 54px rgb(209 138 61 / 3%),
                0 0 0 108px rgb(209 138 61 / 2%);
        }

        &--bottom {
            bottom: -180px;
            left: -150px;
            width: 380px;
            height: 380px;
            box-shadow:
                0 0 0 48px rgb(209 138 61 / 3%),
                0 0 0 96px rgb(209 138 61 / 2%);
        }
    }
}

.primary-button,
.secondary-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 126px;
    height: 44px;
    padding: 0 22px;
    font-size: 14px;
    text-decoration: none;
    border-radius: 10px;
    cursor: pointer;
    transition:
        transform 0.2s ease,
        box-shadow 0.2s ease,
        border-color 0.2s ease;

    &:hover {
        transform: translateY(-2px);
    }
}

.primary-button {
    color: #fff;
    background: linear-gradient(90deg, #cf873a, #bb6d2f);
    box-shadow: 0 11px 22px rgb(187 109 47 / 24%);
}

.secondary-button {
    color: #655d55;
    background: rgb(255 255 255 / 76%);
    border: 1px solid #e4ddd4;

    &:hover {
        border-color: #d4b38e;
        box-shadow: 0 8px 18px rgb(80 58 35 / 8%);
    }
}

@media (width <= 560px) {
    .forbidden {
        padding-right: 20px;
        padding-left: 20px;

        &__actions {
            flex-direction: column;
            width: min(100%, 280px);
            margin-right: auto;
            margin-left: auto;
        }
    }

    .primary-button,
    .secondary-button {
        width: 100%;
    }
}

@media (prefers-reduced-motion: reduce) {
    .primary-button,
    .secondary-button {
        transition: none;
    }
}
</style>
