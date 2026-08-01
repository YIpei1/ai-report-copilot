<template>
    <main class="not-found">
        <div class="not-found__decoration not-found__decoration--left"></div>
        <div class="not-found__decoration not-found__decoration--right"></div>

        <section class="not-found__content">
            <div class="error-code" aria-label="404">
                <span>4</span>
                <div class="error-code__planet" aria-hidden="true">
                    <div class="error-code__orbit"></div>
                    <div class="error-code__face">
                        <i></i>
                        <i></i>
                    </div>
                </div>
                <span>4</span>
            </div>

            <p class="not-found__eyebrow">PAGE NOT FOUND</p>
            <h1>页面好像走丢了</h1>
            <p class="not-found__description">
                抱歉，你访问的页面不存在、已被移除，或者暂时无法访问。
            </p>

            <div class="not-found__actions">
                <RouterLink to="/home" class="primary-button">返回首页</RouterLink>
                <button type="button" class="secondary-button" @click="goBack">返回上一页</button>
            </div>
        </section>

        <p class="not-found__footer">AI Report Copilot · 智能报告助手</p>
    </main>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const goBack = () => {
    if (window.history.length > 1) {
        router.back()
        return
    }

    router.push('/home')
}
</script>

<style scoped lang="scss">
.not-found {
    position: relative;
    display: grid;
    min-height: 100vh;
    padding: 40px 24px;
    overflow: hidden;
    color: #1c2440;
    background:
        radial-gradient(circle at 50% 42%, rgb(102 115 216 / 10%), transparent 28%),
        linear-gradient(145deg, #f9faff 0%, #f3f5fc 100%);
    place-items: center;

    &__content {
        position: relative;
        z-index: 1;
        width: min(100%, 620px);
        text-align: center;
    }

    &__eyebrow {
        margin-top: 28px;
        color: #6a73d5;
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
        max-width: 440px;
        margin: 16px auto 0;
        color: #7d859a;
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
        color: #a3a9b8;
        font-size: 12px;
    }

    &__decoration {
        position: absolute;
        border: 1px solid rgb(104 116 210 / 10%);
        border-radius: 50%;

        &--left {
            top: -180px;
            left: -160px;
            width: 430px;
            height: 430px;
            box-shadow:
                0 0 0 55px rgb(104 116 210 / 3%),
                0 0 0 110px rgb(104 116 210 / 2%);
        }

        &--right {
            right: -120px;
            bottom: -170px;
            width: 360px;
            height: 360px;
            box-shadow:
                0 0 0 48px rgb(104 116 210 / 3%),
                0 0 0 96px rgb(104 116 210 / 2%);
        }
    }
}

.error-code {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: clamp(8px, 2vw, 18px);
    color: #5669d5;
    font-size: clamp(108px, 18vw, 180px);
    font-weight: 750;
    line-height: 0.8;
    letter-spacing: -0.08em;
    text-shadow: 0 18px 40px rgb(81 99 199 / 16%);

    &__planet {
        position: relative;
        width: clamp(86px, 13vw, 132px);
        height: clamp(86px, 13vw, 132px);
        background: linear-gradient(145deg, #7087eb, #7d61ce);
        border: clamp(7px, 1vw, 11px) solid #e7e9fa;
        border-radius: 50%;
        box-shadow:
            inset -16px -13px 28px rgb(48 45 129 / 20%),
            0 20px 35px rgb(81 99 199 / 18%);
    }

    &__orbit {
        position: absolute;
        top: 50%;
        left: 50%;
        width: 150%;
        height: 39%;
        border: 5px solid #aeb9f0;
        border-right-color: #6978da;
        border-left-color: #6978da;
        border-radius: 50%;
        transform: translate(-50%, -50%) rotate(-13deg);
    }

    &__face {
        position: absolute;
        top: 39%;
        left: 50%;
        display: flex;
        gap: 22%;
        justify-content: center;
        width: 58%;
        transform: translateX(-50%);

        i {
            width: clamp(5px, 0.8vw, 8px);
            height: clamp(9px, 1.2vw, 13px);
            background: rgb(255 255 255 / 82%);
            border-radius: 99px;
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
    background: linear-gradient(90deg, #566ed8, #6d65cf);
    box-shadow: 0 11px 22px rgb(86 105 210 / 24%);
}

.secondary-button {
    color: #59627a;
    background: rgb(255 255 255 / 75%);
    border: 1px solid #dde1ee;

    &:hover {
        border-color: #adb5df;
        box-shadow: 0 8px 18px rgb(40 50 96 / 8%);
    }
}

@media (width <= 560px) {
    .not-found {
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
