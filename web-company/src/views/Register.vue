<template>
    <div class="register-wrapper">
        <div class="register-container">
            <h2>用户注册</h2>
            <el-form 
                ref="registerFormRef"
                :model="registerForm"
                :rules="registerRules"
                class="register-form"
            >
                <el-form-item prop="username">
                    <el-input
                        v-model="registerForm.username"
                        placeholder="用户名"
                        :prefix-icon="User"
                    />
                </el-form-item>
                <el-form-item prop="password">
                    <el-input
                        v-model="registerForm.password"
                        type="password"
                        placeholder="密码"
                        :prefix-icon="Lock"
                        show-password
                    />
                </el-form-item>
                <el-form-item prop="confirmPassword">
                    <el-input
                        v-model="registerForm.confirmPassword"
                        type="password"
                        placeholder="确认密码"
                        :prefix-icon="Lock"
                        show-password
                    />
                </el-form-item>
                <el-form-item prop="email">
                    <el-input
                        v-model="registerForm.email"
                        placeholder="邮箱"
                        :prefix-icon="Message"
                    />
                </el-form-item>
                <el-form-item class="form-buttons">
                    <el-button type="primary" :loading="loading" @click="handleRegister">
                        {{ loading ? '注册中...' : '注册' }}
                    </el-button>
                    <el-button @click="$router.push('/login')">返回登录</el-button>
                </el-form-item>
            </el-form>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock, Message } from '@element-plus/icons-vue'
import axios from 'axios'

const router = useRouter()
const loading = ref(false)
const registerFormRef = ref()

const registerForm = reactive({
    username: '',
    password: '',
    confirmPassword: '',
    email: ''
})

const validatePass = (rule: any, value: string, callback: any) => {
    if (value === '') {
        callback(new Error('请再次输入密码'))
    } else if (value !== registerForm.password) {
        callback(new Error('两次输入密码不一致!'))
    } else {
        callback()
    }
}

const registerRules = {
    username: [
        { required: true, message: '请输入用户名', trigger: 'blur' },
        { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
    ],
    password: [
        { required: true, message: '请输入密码', trigger: 'blur' },
        { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
    ],
    confirmPassword: [
        { required: true, validator: validatePass, trigger: 'blur' }
    ],
    email: [
        { required: true, message: '请输入邮箱地址', trigger: 'blur' },
        { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
    ]
}

const handleRegister = () => {
    registerFormRef.value.validate(async (valid: boolean) => {
        if (valid) {
            loading.value = true
            try {
                const response = await axios.post('/webapi/users/register', {
                    username: registerForm.username,
                    password: registerForm.password,
                    email: registerForm.email
                })

                ElMessage.success(response.data.message || '注册成功')
                router.push('/login')
            } catch (error: any) {
                console.error('注册失败:', error)
                const errorMessage = error.response?.data?.message || '注册失败，请稍后重试'
                ElMessage.error(errorMessage)
            } finally {
                loading.value = false
            }
        }
    })
}
</script>

<style scoped lang="scss">
.register-wrapper {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    padding: 20px;
}

.register-container {
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

.register-form {
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

// 响应式设计
@media screen and (max-width: 480px) {
    .register-container {
        padding: 20px;
        margin: 0 15px;
        
        h2 {
            font-size: 20px;
            margin-bottom: 20px;
        }
    }
    
    .register-form {
        :deep(.el-input__wrapper) {
            height: 40px;
        }
        
        .form-buttons {
            margin-top: 20px;
            
            .el-button {
                height: 36px;
                font-size: 14px;
            }
        }
    }
}
</style>