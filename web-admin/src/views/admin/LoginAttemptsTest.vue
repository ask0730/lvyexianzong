<template>
    <div class="test-container">
        <h2>登录尝试管理测试页面</h2>

        <div class="test-section">
            <h3>测试API连接</h3>
            <el-button @click="testStats">测试统计接口</el-button>
            <el-button @click="testLockedUsers">测试锁定用户接口</el-button>
            <el-button @click="testLockedIPs">测试锁定IP接口</el-button>
        </div>

        <div class="result-section" v-if="testResult">
            <h3>测试结果</h3>
            <pre>{{ JSON.stringify(testResult, null, 2) }}</pre>
        </div>

        <div class="error-section" v-if="testError">
            <h3>错误信息</h3>
            <pre>{{ testError }}</pre>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import API from '@/api'

const testResult = ref(null)
const testError = ref(null)

const testStats = async () => {
    try {
        testError.value = null
        testResult.value = null
        console.log('测试统计接口...')
        const result = await API.loginAttempts.stats()
        testResult.value = result
        console.log('统计接口结果:', result)
    } catch (error) {
        testError.value = error.message || error
        console.error('统计接口错误:', error)
    }
}

const testLockedUsers = async () => {
    try {
        testError.value = null
        testResult.value = null
        console.log('测试锁定用户接口...')
        const result = await API.loginAttempts.lockedUsers()
        testResult.value = result
        console.log('锁定用户接口结果:', result)
    } catch (error) {
        testError.value = error.message || error
        console.error('锁定用户接口错误:', error)
    }
}

const testLockedIPs = async () => {
    try {
        testError.value = null
        testResult.value = null
        console.log('测试锁定IP接口...')
        const result = await API.loginAttempts.lockedIPs()
        testResult.value = result
        console.log('锁定IP接口结果:', result)
    } catch (error) {
        testError.value = error.message || error
        console.error('锁定IP接口错误:', error)
    }
}
</script>

<style scoped>
.test-container {
    padding: 20px;
}

.test-section {
    margin-bottom: 20px;
}

.test-section h3 {
    margin-bottom: 10px;
}

.test-section .el-button {
    margin-right: 10px;
}

.result-section,
.error-section {
    margin-top: 20px;
    padding: 15px;
    border-radius: 4px;
}

.result-section {
    background-color: #f0f9ff;
    border: 1px solid #b3d8ff;
}

.error-section {
    background-color: #fef0f0;
    border: 1px solid #fbc4c4;
}

pre {
    white-space: pre-wrap;
    word-wrap: break-word;
    margin: 0;
}
</style> 