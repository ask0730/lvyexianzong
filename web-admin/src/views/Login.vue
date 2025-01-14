<template>
    <div class="login-wrapper">
        <vue-particles id="tsparticles" @particles-loaded="particlesLoaded" :options="options" />
        <div class="formContainer">
            <h3>绿野仙踪管理系统</h3>
            <el-form ref="loginFormRef" :model="loginForm" status-icon :rules="loginRules" label-width="80px" class="loginform">
                <el-form-item label="用户名" prop="username">
                    <el-input v-model="loginForm.username" autocomplete="off" />
                </el-form-item>
                <el-form-item label="密码" prop="password">
                    <el-input v-model="loginForm.password" type="password" autocomplete="off" />
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="submitForm()" class="login-btn">登录</el-button>
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

const submitForm = () => {
    loginFormRef.value.validate(async (valid) => {
        if (valid) {
            const res = await API.user.login(loginForm)
            if (res.code === 0) {
                // localStorage.setItem('token', 'token');
                useTool.changeUserInfo(res.data)
                router.push('/index')
            } else {
                ElMessage.error(`${res.msg}`)
            }
        }
    })
}
</script>

<style lang="scss" scoped>
.login-wrapper {
    width: 100%;
    min-height: 100vh;
    background-color: var(--el-color-primary);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    box-sizing: border-box;
}

#tsparticles {
    position: fixed;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
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

    h3 {
        font-size: clamp(24px, 5vw, 30px);
        margin-bottom: 20px;
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
        }
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
</style>
