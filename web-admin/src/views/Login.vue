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
                <el-form-item class="animate__animated animate__fadeInUp animate__delay-2s">
                    <el-button type="primary" @click="submitForm()" class="login-btn" :loading="loading">
                        {{ loading ? '登录中...' : '登录' }}
                    </el-button>
                </el-form-item>
            </el-form>
        </div>
    </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
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
const loginForm = reactive({
    username: 'admin',
    password: '123456',
})
const loginFormRef = ref()
const loginRules = reactive({
    username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
    password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
})
const router = useRouter()

const loading = ref(false)

const submitForm = () => {
    loginFormRef.value.validate(async (valid) => {
        if (valid) {
            loading.value = true
            try {
                const res = await API.user.login(loginForm)
                if (res.code === 0) {
                    useTool.changeUserInfo(res.data)
                    router.push('/index')
                } else {
                    ElMessage.error(`${res.msg}`)
                }
            } finally {
                loading.value = false
            }
        }
    })
}
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
        background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 60%);
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
        box-shadow: 0 15px 30px rgba(0,0,0,0.2);
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
            
            &:hover {
                transform: scale(1.05);
                box-shadow: 0 5px 15px rgba(0,0,0,0.2);
            }
            
            &:active {
                transform: scale(0.95);
            }
        }
    }
}

@keyframes titleGlow {
    from {
        text-shadow: 0 0 5px rgba(255,255,255,0.5);
    }
    to {
        text-shadow: 0 0 15px rgba(255,255,255,0.8);
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
        box-shadow: -5px 0 10px rgba(0,0,0,0.1);
    }
}
</style>
