<template>
    <main class="login-page">
        <section class="login-panel">
            <header class="page-brand brand" aria-label="AI Report Copilot">
                <div class="brand__mark" aria-hidden="true">
                    <span class="brand__spark brand__spark--one"></span>
                    <span class="brand__spark brand__spark--two"></span>
                    <img :src="loginBrandIcon" alt="" />
                </div>
                <div class="page-brand__copy">
                    <strong class="brand__name">AI Report Copilot</strong>
                    <span>智能报告助手</span>
                </div>
            </header>

            <div class="login-card">
                <div class="login-card__heading">
                    <span class="login-card__tag">WELCOME BACK</span>
                    <h2>欢迎回来</h2>
                    <p>登录你的账户，继续高效创作</p>
                </div>

                <el-form
                    ref="loginFormRef"
                    :model="loginForm"
                    :rules="rules"
                    label-position="top"
                    class="login-form"
                    @submit.prevent="submitLogin"
                >
                    <el-form-item label="用户名" prop="account">
                        <el-input
                            v-model="loginForm.account"
                            :prefix-icon="User"
                            placeholder="请输入用户名"
                            size="large"
                            autocomplete="username"
                        />
                    </el-form-item>

                    <el-form-item label="密码" prop="password">
                        <RegexInput
                            v-model="loginForm.password"
                            format="password"
                            :prefix-icon="Lock"
                            placeholder="请输入登录密码"
                            size="large"
                            autocomplete="current-password"
                            @keyup.enter="submitLogin"
                        />
                    </el-form-item>

                    <div class="form-options">
                        <el-checkbox v-model="loginForm.remember">记住我</el-checkbox>
                        <button type="button" class="text-button" @click="handleForgotPassword">
                            忘记密码？
                        </button>
                    </div>

                    <el-button
                        type="primary"
                        size="large"
                        native-type="submit"
                        :loading="isSubmitting"
                        class="login-button"
                    >
                        登录
                        <span v-if="!isSubmitting" class="login-button__arrow">→</span>
                    </el-button>
                </el-form>

                <div class="security-tip">
                    <img :src="securityShieldIcon" alt="" aria-hidden="true" />
                    <span>企业级数据加密，保障账户与报告安全</span>
                </div>
            </div>

            <footer class="login-footer">
                <span>© {{ currentYear }} AI Report Copilot</span>
                <a href="javascript:void(0)">隐私政策</a>
                <a href="javascript:void(0)">服务条款</a>
            </footer>
        </section>
    </main>
</template>

<script setup lang="ts" name="LoginView">
import { computed, reactive, ref } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { Lock, User } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import { login } from '@/api/login'
import loginBrandIcon from '@/assets/icons/login-brand.svg'
import securityShieldIcon from '@/assets/icons/security-shield.svg'
import { useAuthStore } from '@/stores/modules/auth'

const loginFormRef = ref<FormInstance>()
const isSubmitting = ref(false)
const router = useRouter()

const loginForm = reactive({
    account: 'admin',
    password: 'admin123',
    remember: true,
})

const rules: FormRules = {
    account: [
        { required: true, message: '请输入账号', trigger: 'blur' },
        { min: 2, message: '账号至少需要 2 个字符', trigger: 'blur' },
    ],
    password: [
        { required: true, message: '请输入密码', trigger: 'blur' },
        { min: 6, message: '密码至少需要 6 个字符', trigger: 'blur' },
    ],
}

const currentYear = computed(() => new Date().getFullYear())

const submitLogin = async () => {
    if (!loginFormRef.value) return
    if (isSubmitting.value) return

    const isValid = await loginFormRef.value.validate().catch(() => false)
    if (!isValid) return

    isSubmitting.value = true
    try {
        const response = await login({
            account: loginForm.account,
            password: loginForm.password,
        })
        ElMessage.success(`欢迎回来,${response.data.username}`)

        const { setTokens } = useAuthStore()
        setTokens({
            accessToken: response.data.accessToken,
            refreshToken: response.data.refreshToken,
        })
        await router.push('/home')
    } finally {
        isSubmitting.value = false
    }
}

const handleForgotPassword = () => {
    ElMessage.info('请联系系统管理员重置密码')
}
</script>

<style scoped lang="scss">
.login-page {
    width: 100%;
    height: 100vh;
    overflow: hidden;
    color: #19213a;
    background:
        radial-gradient(circle at 10% 8%, rgb(82 111 219 / 20%), transparent 28%),
        radial-gradient(circle at 88% 12%, rgb(148 111 225 / 15%), transparent 25%),
        radial-gradient(circle at 50% 110%, rgb(85 164 235 / 14%), transparent 34%),
        linear-gradient(135deg, #edf2ff 0%, #f8f7ff 48%, #eef5ff 100%);
    background-repeat: no-repeat;
    background-position: center;
    background-size: cover;
}

.login-panel {
    position: relative;
    display: grid;
    width: 100%;
    height: 100%;
    padding: 52px;
    place-items: center;
}

.brand {
    display: flex;
    align-items: center;
    gap: 13px;

    &__mark {
        position: relative;
        display: grid;
        width: 46px;
        height: 46px;
        background: linear-gradient(135deg, #4285ff, #8a60ee);
        border: 1px solid rgb(255 255 255 / 36%);
        border-radius: 14px;
        box-shadow: 0 10px 28px rgb(4 12 40 / 25%);
        place-items: center;

        img {
            width: 31px;
            height: 31px;
        }
    }

    &__spark {
        position: absolute;
        width: 4px;
        height: 4px;
        background: #fff;
        border-radius: 50%;
        box-shadow: 0 0 8px #fff;

        &--one {
            top: 6px;
            right: 7px;
        }

        &--two {
            right: 5px;
            bottom: 9px;
            width: 2px;
            height: 2px;
        }
    }

    &__name {
        font-size: 18px;
        font-weight: 650;
        letter-spacing: 0.02em;
    }
}

.page-brand {
    position: absolute;
    top: 40px;
    left: 48px;
    z-index: 2;

    &__copy {
        display: flex;
        flex-direction: column;
        gap: 4px;

        span {
            color: #7c849a;
            font-size: 12px;
            letter-spacing: 0.12em;
        }
    }
}

.login-card {
    width: 100%;
    max-width: 430px;
    min-width: 0;

    &__heading {
        margin-bottom: 36px;

        h2 {
            margin: 9px 0 10px;
            color: #172039;
            font-size: 36px;
            font-weight: 650;
            letter-spacing: -0.03em;
        }

        p {
            color: #81899d;
            font-size: 14px;
        }
    }

    &__tag {
        color: #6d75d8;
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.18em;
    }
}

.login-form {
    /* stylelint-disable selector-class-pattern -- Element Plus exposes BEM class names. */
    :deep(.el-form-item) {
        margin-bottom: 24px;
    }

    :deep(.el-form-item__label) {
        height: auto;
        margin-bottom: 9px;
        color: #384157;
        font-size: 13px;
        font-weight: 600;
        line-height: 1.4;
    }

    :deep(.el-input__wrapper) {
        min-height: 52px;
        padding: 1px 15px;
        background: #fff;
        border: 1px solid #e5e8f0;
        border-radius: 11px;
        box-shadow: 0 4px 12px rgb(20 31 68 / 3%);
        transition:
            border-color 0.2s ease,
            box-shadow 0.2s ease;

        &:hover {
            border-color: #b6bde1;
        }

        &.is-focus {
            border-color: #6874dc;
            box-shadow: 0 0 0 3px rgb(104 116 220 / 10%);
        }
    }

    :deep(.el-input__prefix) {
        margin-right: 6px;
        color: #9ba3b5;
    }

    :deep(.el-input__inner) {
        color: #293148;
        font-size: 14px;

        &::placeholder {
            color: #b1b7c5;
        }
    }

    :deep(.el-form-item.is-error .el-input__wrapper) {
        border-color: #e66b78;
        box-shadow: 0 0 0 3px rgb(230 107 120 / 8%);
    }

    :deep(.el-form-item__error) {
        padding-top: 5px;
    }

    /* stylelint-enable selector-class-pattern */
}

.form-options {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: -4px 0 26px;

    /* stylelint-disable selector-class-pattern -- Element Plus exposes BEM class names. */
    :deep(.el-checkbox__label) {
        color: #667085;
        font-size: 13px;
    }

    :deep(.el-checkbox__input.is-checked .el-checkbox__inner) {
        background-color: #6673d8;
        border-color: #6673d8;
    }

    /* stylelint-enable selector-class-pattern */
}

.text-button {
    padding: 5px 0;
    color: #606ed0;
    font-size: 13px;
    background: transparent;
    cursor: pointer;

    &:hover {
        color: #4352ba;
    }
}

.login-button {
    width: 100%;
    height: 52px;
    font-weight: 600;
    letter-spacing: 0.08em;
    background: linear-gradient(90deg, #526fdb, #6a68d3);
    border: 0;
    border-radius: 11px;
    box-shadow: 0 12px 24px rgb(84 103 211 / 25%);
    transition:
        transform 0.2s ease,
        box-shadow 0.2s ease;

    &:hover,
    &:focus {
        background: linear-gradient(90deg, #4663cf, #5e59c9);
        box-shadow: 0 15px 28px rgb(84 103 211 / 32%);
        transform: translateY(-1px);
    }

    &__arrow {
        margin-left: 9px;
        font-size: 19px;
        font-weight: 400;
        line-height: 1;
        transition: transform 0.2s ease;
    }

    &:hover &__arrow {
        transform: translateX(3px);
    }
}

.security-tip {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    margin-top: 25px;
    color: #9aa2b2;
    font-size: 11px;

    img {
        width: 16px;
        height: 16px;
    }
}

.login-footer {
    position: absolute;
    right: 0;
    bottom: 32px;
    left: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 22px;
    color: #abb1bf;
    font-size: 11px;

    a {
        color: #8f96a8;
        text-decoration: none;

        &:hover {
            color: #5e69c9;
        }
    }
}

@media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
        scroll-behavior: auto !important;
        transition: none !important;
    }
}
</style>
