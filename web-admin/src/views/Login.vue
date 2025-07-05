<template>
    <div class="login-wrapper">
        <vue-particles id="tsparticles" @particles-loaded="particlesLoaded" :options="options" />
        <div class="formContainer animate__animated animate__fadeIn">
            <h3 class="animate__animated animate__slideInDown">绿野仙踪管理系统</h3>
            <el-form ref="loginFormRef" :model="loginForm" status-icon :rules="loginRules" label-width="80px" class="loginform">
                <el-form-item label="用户名" prop="username" class="animate__animated animate__fadeInLeft animate__delay-1s">
                    <el-input v-model="loginForm.username" autocomplete="off" />
                </el-form-item>
                <el-form-item label="密码" prop="password" class="animate__animated animate__fadeInLeft animate__delay-1s">
                    <el-input v-model="loginForm.password" type="password" autocomplete="off" />
                </el-form-item>
                <el-form-item label="验证码" prop="captcha" class="animate__animated animate__fadeInLeft animate__delay-1s" v-if="showCaptcha">
                    <div class="captcha-container">
                        <el-input v-model="loginForm.captcha" placeholder="请输入验证码" style="width: 60%;" />
                        <div class="captcha-image" @click="refreshCaptcha">
                            <canvas ref="captchaCanvas" width="120" height="40"></canvas>
                        </div>
                    </div>
                </el-form-item>
                <el-form-item class="animate__animated animate__fadeInUp animate__delay-2s">
                    <el-button type="primary" @click="submitForm()" class="login-btn" :loading="loading" :disabled="isLocked">{{ getButtonText() }}</el-button>
                </el-form-item>
                <div v-if="loginAttempts > 0" class="login-attempts">
                    <el-alert :title="`登录失败 ${loginAttempts} 次，${getLockMessage()}`" type="warning" :closable="false" show-icon />
                </div>
            </el-form>
        </div>
    </div>
</template>

<script setup>
import { reactive, ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import API from '@/api'
import { ElMessage } from 'element-plus'
import { useToolStore } from '@/store'

const useTool = useToolStore()
const options = {
    background: {
        color: {
            value: 'transparent',
        },
    },
    fpsLimit: 120,
    interactivity: {
        events: {
            onClick: {
                enable: true,
                mode: 'push',
            },
            onHover: {
                enable: true,
                mode: 'grab',
            },
        },
        modes: {
            bubble: {
                distance: 400,
                duration: 2,
                opacity: 0.8,
                size: 40,
            },
            push: {
                quantity: 4,
            },
            repulse: {
                distance: 200,
                duration: 0.4,
            },
        },
    },
    particles: {
        color: {
            value: '#B0E0E6',
        },
        links: {
            color: '#ffffff',
            distance: 150,
            enable: true,
            opacity: 0.5,
            width: 1,
        },
        move: {
            direction: 'none',
            enable: true,
            outModes: 'bounce',
            random: false,
            speed: 6,
            straight: false,
        },
        number: {
            density: {
                enable: true,
            },
            value: 80,
        },
        opacity: {
            value: 0.5,
        },
        shape: {
            type: 'circle',
        },
        size: {
            value: { min: 1, max: 5 },
        },
    },
    detectRetina: true,
}

// 防爆破相关状态
const loginAttempts = ref(0)
const isLocked = ref(false)
const lockEndTime = ref(0)
const showCaptcha = ref(false)
const captchaText = ref('')
const captchaCanvas = ref(null)

const loginForm = reactive({
    username: 'admin',
    password: '123456',
    captcha: '',
})
const loginFormRef = ref()
const loginRules = reactive({
    username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
    password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
    captcha: [{ required: true, message: '请输入验证码', trigger: 'blur' }],
})
const router = useRouter()

const loading = ref(false)

// 防爆破配置
const MAX_LOGIN_ATTEMPTS = 5
const LOCK_DURATION = 5 * 60 * 1000 // 5分钟
const CAPTCHA_THRESHOLD = 3 // 3次失败后显示验证码

// 检查是否被锁定
const checkLockStatus = () => {
    const now = Date.now()
    if (lockEndTime.value > now) {
        isLocked.value = true
        return true
    } else {
        isLocked.value = false
        return false
    }
}

// 获取按钮文本
const getButtonText = () => {
    if (loading.value) return '登录中...'
    if (isLocked.value) {
        const remainingTime = Math.ceil((lockEndTime.value - Date.now()) / 1000)
        return `账户已锁定 (${remainingTime}s)`
    }
    return '登录'
}

// 获取锁定消息
const getLockMessage = () => {
    if (isLocked.value) {
        const remainingTime = Math.ceil((lockEndTime.value - Date.now()) / 1000)
        return `账户已锁定，请等待 ${remainingTime} 秒后重试`
    }
    return `超过 ${MAX_LOGIN_ATTEMPTS} 次失败将锁定账户 ${LOCK_DURATION / 1000 / 60} 分钟`
}

// 生成验证码
const generateCaptcha = () => {
    const canvas = captchaCanvas.value
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let text = ''

    // 清空画布
    ctx.fillStyle = '#f0f0f0'
    ctx.fillRect(0, 0, 120, 40)

    // 生成随机文字
    for (let i = 0; i < 4; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)]
        text += char

        ctx.font = 'bold 20px Arial'
        ctx.fillStyle = `rgb(${Math.random() * 100}, ${Math.random() * 100}, ${Math.random() * 100})`
        ctx.fillText(char, 20 + i * 20, 25)
    }

    // 添加干扰线
    for (let i = 0; i < 3; i++) {
        ctx.strokeStyle = `rgb(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255})`
        ctx.beginPath()
        ctx.moveTo(Math.random() * 120, Math.random() * 40)
        ctx.lineTo(Math.random() * 120, Math.random() * 40)
        ctx.stroke()
    }

    captchaText.value = text
}

// 刷新验证码
const refreshCaptcha = () => {
    generateCaptcha()
    loginForm.captcha = ''
}

// 处理登录失败
const handleLoginFailure = () => {
    loginAttempts.value++

    if (loginAttempts.value >= CAPTCHA_THRESHOLD) {
        showCaptcha.value = true
        generateCaptcha()
    }

    if (loginAttempts.value >= MAX_LOGIN_ATTEMPTS) {
        lockEndTime.value = Date.now() + LOCK_DURATION
        isLocked.value = true
        ElMessage.error(`登录失败次数过多，账户已锁定 ${LOCK_DURATION / 1000 / 60} 分钟`)
    }
}

// 处理登录成功
const handleLoginSuccess = () => {
    loginAttempts.value = 0
    showCaptcha.value = false
    isLocked.value = false
    lockEndTime.value = 0
    loginForm.captcha = ''
}

const submitForm = () => {
    // 检查是否被锁定
    if (checkLockStatus()) {
        ElMessage.error('账户已被锁定，请稍后重试')
        return
    }

    loginFormRef.value.validate(async (valid) => {
        if (valid) {
            // 验证验证码
            if (showCaptcha.value && loginForm.captcha.toUpperCase() !== captchaText.value) {
                ElMessage.error('验证码错误')
                refreshCaptcha()
                return
            }

            loading.value = true
            try {
                const res = await API.user.login(loginForm)
                if (res.code === 0) {
                    handleLoginSuccess()
                    useTool.changeUserInfo(res.data)
                    router.push('/index')
                } else {
                    handleLoginFailure()
                    ElMessage.error(`${res.msg}`)
                }
            } catch (error) {
                handleLoginFailure()
                ElMessage.error('登录失败，请检查网络连接')
            } finally {
                loading.value = false
            }
        }
    })
}

// 定时检查锁定状态
const checkLockTimer = setInterval(() => {
    if (isLocked.value) {
        checkLockStatus()
    }
}, 1000)

// 组件卸载时清理定时器
onMounted(() => {
    // 从localStorage恢复状态
    const savedAttempts = localStorage.getItem('loginAttempts')
    const savedLockTime = localStorage.getItem('lockEndTime')

    if (savedAttempts) {
        loginAttempts.value = parseInt(savedAttempts)
    }

    if (savedLockTime) {
        lockEndTime.value = parseInt(savedLockTime)
        checkLockStatus()
    }

    // 如果失败次数达到阈值，显示验证码
    if (loginAttempts.value >= CAPTCHA_THRESHOLD) {
        showCaptcha.value = true
        generateCaptcha()
    }
})

// 监听状态变化，保存到localStorage
import { watch } from 'vue'

watch(loginAttempts, (newVal) => {
    localStorage.setItem('loginAttempts', newVal.toString())
})

watch(lockEndTime, (newVal) => {
    localStorage.setItem('lockEndTime', newVal.toString())
})
</script>

<style lang="scss" scoped>
@import 'animate.css';

.login-wrapper {
    width: 100%;
    min-height: 100vh;
    background-color: var(--el-color-primary);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    box-sizing: border-box;
    position: relative;
    overflow: hidden;

    &::before {
        content: '';
        position: absolute;
        width: 200%;
        height: 200%;
        background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 60%);
        animation: rotate 20s linear infinite;
    }
}

@keyframes rotate {
    from {
        transform: rotate(0deg);
    }
    to {
        transform: rotate(360deg);
    }
}

.formContainer {
    width: 90%;
    max-width: 500px;
    min-height: 300px;
    position: relative;
    background: rgba($color: #000000, $alpha: 0.5);
    color: white;
    text-align: center;
    padding: 20px;
    border-radius: 5px;
    box-sizing: border-box;
    transition: transform 0.3s ease, box-shadow 0.3s ease;

    &:hover {
        transform: translateY(-5px);
        box-shadow: 0 15px 30px rgba(0, 0, 0, 0.2);
    }

    h3 {
        font-size: clamp(24px, 5vw, 30px);
        margin-bottom: 20px;
        background: linear-gradient(45deg, #fff, #f0f0f0);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        animation: titleGlow 2s ease-in-out infinite alternate;
    }

    .loginform {
        margin-top: 20px;

        :deep(.el-form-item) {
            margin-bottom: 25px;
        }

        :deep(.el-input) {
            width: 100%;
        }

        .login-btn {
            width: 100%;
            height: 40px;
            font-size: 16px;
            transition: all 0.3s ease;

            &:hover:not(:disabled) {
                transform: scale(1.05);
                box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
            }

            &:active:not(:disabled) {
                transform: scale(0.95);
            }

            &:disabled {
                opacity: 0.6;
                cursor: not-allowed;
            }
        }

        .captcha-container {
            display: flex;
            align-items: center;
            gap: 10px;

            .captcha-image {
                cursor: pointer;
                border: 1px solid #ddd;
                border-radius: 4px;
                overflow: hidden;

                &:hover {
                    border-color: var(--el-color-primary);
                }
            }
        }

        .login-attempts {
            margin-top: 15px;

            :deep(.el-alert) {
                background-color: rgba(255, 193, 7, 0.1);
                border: 1px solid rgba(255, 193, 7, 0.3);

                .el-alert__title {
                    color: #ffc107;
                }
            }
        }
    }
}

@keyframes titleGlow {
    from {
        text-shadow: 0 0 5px rgba(255, 255, 255, 0.5);
    }
    to {
        text-shadow: 0 0 15px rgba(255, 255, 255, 0.8);
    }
}

::v-deep .el-form-item__label {
    color: white;
}

// 移动端适配
@media screen and (max-width: 768px) {
    .formContainer {
        padding: 15px;

        .loginform {
            :deep(.el-form-item__label) {
                float: none;
                display: block;
                text-align: left;
                padding: 0 0 10px;
                line-height: 1;
            }

            :deep(.el-form-item__content) {
                margin-left: 0 !important;
            }

            .captcha-container {
                flex-direction: column;
                align-items: stretch;

                .captcha-image {
                    align-self: center;
                }
            }
        }
    }
}

// 超小屏幕适配
@media screen and (max-width: 320px) {
    .formContainer {
        padding: 10px;

        h3 {
            margin-bottom: 15px;
        }

        .loginform {
            margin-top: 15px;
        }
    }
}

// 添加输入框动画
:deep(.el-input__inner) {
    transition: all 0.3s ease;

    &:focus {
        transform: translateX(5px);
        box-shadow: -5px 0 10px rgba(0, 0, 0, 0.1);
    }
}
</style>
