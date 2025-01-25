<template>
    <div class="login-wrapper">
        <div class="login-container">
            <h2>用户登录</h2>
            <el-form 
                ref="loginFormRef"
                :model="loginForm"
                :rules="loginRules"
                class="login-form"
            >
                <el-form-item prop="username">
                    <el-input
                        v-model="loginForm.username"
                        placeholder="用户名"
                        :prefix-icon="User"
                    />
                </el-form-item>
                <el-form-item prop="password">
                    <el-input
                        v-model="loginForm.password"
                        type="password"
                        placeholder="密码"
                        :prefix-icon="Lock"
                        show-password
                    />
                </el-form-item>
                <el-form-item class="form-buttons">
                    <el-button type="primary" :loading="loading" @click="handleLogin">
                        {{ loading ? '登录中...' : '登录' }}
                    </el-button>
                    <el-button @click="handleRegister">注册账号</el-button>
                </el-form-item>
            </el-form>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'
import axios from 'axios'

const router = useRouter()
const loading = ref(false)
const loginFormRef = ref()

const loginForm = reactive({
    username: '',
    password: ''
})

const loginRules = {
    username: [
        { required: true, message: '请输入用户名', trigger: 'blur' },
        { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
    ],
    password: [
        { required: true, message: '请输入密码', trigger: 'blur' },
        { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
    ]
}

const handleLogin = () => {
    loginFormRef.value.validate(async (valid: boolean) => {
        if (valid) {
            loading.value = true
            try {
                const response = await axios.post('/webapi/users/login', {
                    username: loginForm.username,
                    password: loginForm.password
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
        
        &:hover, &.is-focus {
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
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