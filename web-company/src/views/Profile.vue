<template>
  <div class="profile-container">
    <div class="profile-header">
      <el-avatar 
        :size="100" 
        :src="userInfo.avatar || defaultAvatar"
        class="profile-avatar"
      />
      <h2>{{ userInfo.username }}</h2>
      <p>{{ userInfo.introduction || '这个人很懒，没有留下任何介绍' }}</p>
    </div>
    
    <el-card class="profile-info">
      <template #header>
        <div class="card-header">
          <span>个人信息</span>
          <div class="header-actions">
            <el-button type="primary" size="small" @click="isEditing = !isEditing">
              {{ isEditing ? '取消' : '编辑' }}
            </el-button>
            <el-button type="danger" size="small" @click="handleLogout">
              退出登录
            </el-button>
          </div>
        </div>
      </template>
      
      <el-form v-if="!isEditing" label-width="100px">
        <el-form-item label="用户名">{{ userInfo.username }}</el-form-item>
        <el-form-item label="性别">
          {{ genderMap[userInfo.gender] }}
        </el-form-item>
        <el-form-item label="角色">
          {{ roleMap[userInfo.role] }}
        </el-form-item>
      </el-form>
      
      <el-form v-else label-width="100px" :model="editForm">
        <el-form-item label="性别">
          <el-select v-model="editForm.gender">
            <el-option 
              v-for="(label, value) in genderMap" 
              :key="value" 
              :label="label" 
              :value="Number(value)"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="简介">
          <el-input 
            v-model="editForm.introduction" 
            type="textarea" 
            :rows="3"
            placeholder="请输入个人简介"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="saveProfile">保存</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import axios from 'axios'
import defaultAvatar from '@/assets/default-avatar.png'

const router = useRouter()

const userInfo = ref({
  username: '',
  gender: 0,
  role: 2,
  introduction: '',
  avatar: ''
})

const genderMap = {
  0: '未知',
  1: '男',
  2: '女'
}

const roleMap = {
  1: '管理员',
  2: '普通用户'
}

const isEditing = ref(false)
const editForm = reactive({
  gender: 0,
  introduction: ''
})

onMounted(() => {
  const storedUserInfo = localStorage.getItem('userInfo')
  if (storedUserInfo) {
    userInfo.value = JSON.parse(storedUserInfo)
    editForm.gender = userInfo.value.gender
    editForm.introduction = userInfo.value.introduction
  }
})

const saveProfile = async () => {
  try {
    const response = await axios.post('/webapi/users/update', {
      gender: editForm.gender,
      introduction: editForm.introduction
    })

    userInfo.value.gender = editForm.gender
    userInfo.value.introduction = editForm.introduction
    
    localStorage.setItem('userInfo', JSON.stringify(userInfo.value))
    
    ElMessage.success('个人信息更新成功')
    isEditing.value = false
  } catch (error: any) {
    console.error('更新个人信息失败:', error)
    ElMessage.error(error.response?.data?.message || '更新失败')
  }
}

const handleLogout = () => {
  ElMessageBox.confirm(
    '确定要退出登录吗？',
    '退出登录',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      // 调用后端退出登录接口（可选）
      await axios.post('/webapi/users/logout')
      
      // 清除本地存储
      localStorage.removeItem('userInfo')
      localStorage.removeItem('token')
      
      // 清除 axios 默认请求头
      delete axios.defaults.headers.common['Authorization']
      
      ElMessage.success('已成功退出')
      router.push('/login')
    } catch (error: any) {
      console.error('退出登录失败:', error)
      ElMessage.error(error.response?.data?.message || '退出登录失败')
    }
  }).catch(() => {
    // 取消操作
  })
}
</script>

<style scoped lang="scss">
.profile-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

.profile-header {
  text-align: center;
  margin-bottom: 30px;

  .profile-avatar {
    margin-bottom: 15px;
  }

  h2 {
    margin: 10px 0 5px;
    color: var(--el-color-primary);
  }

  p {
    color: var(--el-text-color-secondary);
  }
}

.profile-info {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .header-actions {
      display: flex;
      gap: 10px;
    }
  }
}
</style>
