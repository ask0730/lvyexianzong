<template>
    <div class="login-wrapper">
        <div class="login-container">
            <h2>用户登录</h2>
            <el-form ref="loginFormRef" :model="loginForm" :rules="loginRules" class="login-form">
                <el-form-item prop="username">
                    <el-input v-model="loginForm.username" placeholder="用户名" :prefix-icon="User" />
                </el-form-item>
                <el-form-item prop="password">
                    <el-input v-model="loginForm.password" type="password" placeholder="密码" :prefix-icon="Lock" show-password />
                </el-form-item>
                <el-form-item prop="captcha" class="captcha-item">
                    <div class="captcha-wrapper">
                        <div class="captcha-container" ref="captchaContainer">
                            <div class="captcha-bg">
                                <div class="captcha-text">{{ captchaText }}</div>
                            </div>
                            <div class="captcha-slider" ref="captchaSlider" @mousedown="startDrag" @touchstart="startDrag" :style="{ left: sliderLeft + 'px' }">
                                <div class="slider-text">{{ isVerified ? '✓' : '>>' }}</div>
                            </div>
                            <div class="captcha-track" ref="captchaTrack"></div>
                        </div>
                        <div class="captcha-tip" v-if="!isVerified">{{ tipText }}</div>
                    </div>
                </el-form-item>
                <el-form-item class="form-buttons">
                    <el-button type="primary" :loading="loading" @click="handleLogin" :disabled="!isVerified">{{ loading ? '登录中...' : '登录' }}</el-button>
                    <el-button @click="handleRegister">注册账号</el-button>
                </el-form-item>
            </el-form>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'
import axios from 'axios'

const router = useRouter()
const loading = ref(false)
const loginFormRef = ref()
const captchaContainer = ref<HTMLElement>()
const captchaSlider = ref<HTMLElement>()
const captchaTrack = ref<HTMLElement>()

const sliderLeft = ref(0)
const isVerified = ref(false)
const isDragging = ref(false)
const startX = ref(0)
const captchaText = ref('请向右滑动验证')
const tipText = ref('请将滑块拖到最右边')

const maxLeft = ref(0)

const loginForm = reactive({
    username: '',
    password: '',
})

const loginRules = {
    username: [
        { required: true, message: '请输入用户名', trigger: 'blur' },
        { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' },
    ],
    password: [
        { required: true, message: '请输入密码', trigger: 'blur' },
        { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' },
    ],
}

onMounted(() => {
    maxLeft.value = 300 - 40 // 滑块宽度为40px
    generateCaptcha()
})

onUnmounted(() => {
    removeEventListeners()
})

const generateCaptcha = () => {
    // 生成随机验证文本
    const texts = ['请向右滑动验证', '滑动完成验证', '拖动滑块验证', '向右滑动解锁']
    captchaText.value = texts[Math.floor(Math.random() * texts.length)]
}

const startDrag = (e: MouseEvent | TouchEvent) => {
    if (isVerified.value) return

    e.preventDefault()
    isDragging.value = true

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    startX.value = clientX - sliderLeft.value

    addEventListeners()
}

const onDrag = (e: MouseEvent | TouchEvent) => {
    if (!isDragging.value) return

    e.preventDefault()
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const newLeft = clientX - startX.value

    sliderLeft.value = Math.max(0, Math.min(newLeft, maxLeft.value))
}

const endDrag = () => {
    if (!isDragging.value) return

    isDragging.value = false
    removeEventListeners()

    // 检查是否滑到最右边
    if (sliderLeft.value >= maxLeft.value - 5) {
        isVerified.value = true
        captchaText.value = '验证成功'
        tipText.value = '验证通过'
    } else {
        // 重置滑块位置
        sliderLeft.value = 0
        generateCaptcha()
    }
}

const addEventListeners = () => {
    document.addEventListener('mousemove', onDrag)
    document.addEventListener('mouseup', endDrag)
    document.addEventListener('touchmove', onDrag)
    document.addEventListener('touchend', endDrag)
}

const removeEventListeners = () => {
    document.removeEventListener('mousemove', onDrag)
    document.removeEventListener('mouseup', endDrag)
    document.removeEventListener('touchmove', onDrag)
    document.removeEventListener('touchend', endDrag)
}

const resetCaptcha = () => {
    isVerified.value = false
    sliderLeft.value = 0
    generateCaptcha()
    tipText.value = '请将滑块拖到最右边'
}

const handleLogin = () => {
    if (!isVerified.value) {
        ElMessage.warning('请先完成滑动验证')
        return
    }

    loginFormRef.value.validate(async (valid: boolean) => {
        if (valid) {
            loading.value = true
            try {
                const response = await axios.post('/webapi/users/login', {
                    username: loginForm.username,
                    password: loginForm.password,
                    captchaVerified: true,
                })

                // 存储用户信息和 token
                localStorage.setItem('userInfo', JSON.stringify(response.data.data))
                localStorage.setItem('token', response.data.token)

                // 设置 axios 默认请求头
                axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`

                ElMessage.success(response.data.message || '登录成功')
                router.push('/profile')
            } catch (error: any) {
                console.error('登录失败:', error)
                const errorMessage = error.response?.data?.message || '登录失败，请稍后重试'
                ElMessage.error(errorMessage)

                // 登录失败时重置验证码
                resetCaptcha()
            } finally {
                loading.value = false
            }
        }
    })
}

const handleRegister = () => {
    router.push('/register')
}
</script>

<style scoped lang="scss">
.login-wrapper {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    padding: 20px;
}

.login-container {
    width: 100%;
    max-width: 400px;
    padding: 30px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);

    h2 {
        text-align: center;
        color: var(--el-color-primary);
        margin-bottom: 30px;
        font-size: 24px;
    }
}

.login-form {
    :deep(.el-input__wrapper) {
        padding: 0 15px;
        height: 45px;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

        &:hover,
        &.is-focus {
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
    }

    .captcha-item {
        margin-bottom: 20px;

        .captcha-wrapper {
            width: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;

            .captcha-container {
                position: relative;
                width: 300px;
                height: 40px;
                background: #f5f5f5;
                border: 1px solid #ddd;
                border-radius: 4px;
                overflow: hidden;
                user-select: none;

                .captcha-bg {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(90deg, #e8f5e8 0%, #f0f8f0 100%);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1;

                    .captcha-text {
                        color: #666;
                        font-size: 14px;
                        font-weight: 500;
                    }
                }

                .captcha-slider {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 40px;
                    height: 100%;
                    background: linear-gradient(135deg, #409eff 0%, #337ecc 100%);
                    border-radius: 4px;
                    cursor: pointer;
                    z-index: 3;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: background 0.3s ease;

                    &:hover {
                        background: linear-gradient(135deg, #66b1ff 0%, #409eff 100%);
                    }

                    .slider-text {
                        color: white;
                        font-size: 16px;
                        font-weight: bold;
                    }
                }

                .captcha-track {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 40px;
                    height: 100%;
                    background: rgba(64, 158, 255, 0.2);
                    z-index: 2;
                    transition: width 0.3s ease;
                }
            }

            .captcha-tip {
                margin-top: 8px;
                font-size: 12px;
                color: #999;
                text-align: center;
            }
        }
    }

    .form-buttons {
        margin-top: 30px;
        display: flex;
        gap: 15px;

        .el-button {
            flex: 1;
            height: 40px;
            font-size: 16px;
        }
    }
}
</style>