<template>
  <div class="profile-container">
    <el-card class="profile-card">
      <template #header>
        <div class="card-header">
          <span>个人中心</span>
        </div>
      </template>
      
      <div class="profile-content">
        <div class="avatar-section">
          <el-upload
            class="avatar-uploader"
            action="/api/upload/avatar"
            :show-file-list="false"
            :on-success="handleAvatarSuccess"
            :before-upload="beforeAvatarUpload"
          >
            <img v-if="userStore.userInfo?.avatar" :src="userStore.userInfo.avatar" class="avatar" />
            <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
          </el-upload>
          <p class="username">{{ userStore.userInfo?.username }}</p>
        </div>
        
        <el-form 
          ref="profileFormRef" 
          :model="profileForm" 
          :rules="profileRules" 
          label-width="100px" 
          class="profile-form"
        >
          <el-form-item label="用户名" prop="username">
            <el-input v-model="profileForm.username" disabled />
          </el-form-item>
          
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="profileForm.email" />
          </el-form-item>
          
          <el-form-item label="性别" prop="gender">
            <el-radio-group v-model="profileForm.gender">
              <el-radio :label="0">保密</el-radio>
              <el-radio :label="1">男</el-radio>
              <el-radio :label="2">女</el-radio>
            </el-radio-group>
          </el-form-item>
          
          <el-form-item label="个人简介" prop="introduction">
            <el-input 
              v-model="profileForm.introduction" 
              type="textarea" 
              :rows="4" 
              placeholder="请输入个人简介"
            />
          </el-form-item>
          
          <el-form-item>
            <el-button type="primary" @click="submitForm" :loading="submitLoading">
              保存修改
            </el-button>
            <el-button @click="resetForm">重置</el-button>
          </el-form-item>
        </el-form>
        
        <div class="security-section">
          <h3>账号安全</h3>
          <el-button type="warning" @click="showPasswordDialog = true">
            修改密码
          </el-button>
        </div>
      </div>
    </el-card>
    
    <!-- 修改密码对话框 -->
    <el-dialog 
      v-model="showPasswordDialog" 
      title="修改密码" 
      width="500px"
    >
      <el-form 
        ref="passwordFormRef"
        :model="passwordForm"
        :rules="passwordRules"
        label-width="100px"
      >
        <el-form-item label="当前密码" prop="currentPassword">
          <el-input 
            v-model="passwordForm.currentPassword" 
            type="password" 
            show-password 
          />
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input 
            v-model="passwordForm.newPassword" 
            type="password" 
            show-password 
          />
        </el-form-item>
        <el-form-item label="确认新密码" prop="confirmPassword">
          <el-input 
            v-model="passwordForm.confirmPassword" 
            type="password" 
            show-password 
          />
        </el-form-item>
        <el-form-item>
          <el-button 
            type="primary" 
            @click="changePassword" 
            :loading="changePasswordLoading"
          >
            确认修改
          </el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { useUserStore } from '@/store/modules/user'
import { updateUserProfile, changeUserPassword } from '@/api/modules/user'

const userStore = useUserStore()

// 头像上传
const handleAvatarSuccess = (response: any) => {
  if (response.code === 200) {
    userStore.userInfo!.avatar = response.data.avatarUrl
    ElMessage.success('头像上传成功')
  } else {
    ElMessage.error(response.message || '头像上传失败')
  }
}

const beforeAvatarUpload = (file: File) => {
  const isJPG = file.type === 'image/jpeg'
  const isPNG = file.type === 'image/png'
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!(isJPG || isPNG)) {
    ElMessage.error('上传头像图片只能是 JPG 或 PNG 格式!')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('上传头像图片大小不能超过 2MB!')
    return false
  }
  return true
}

// 个人信息表单
const profileFormRef = ref()
const profileForm = reactive({
  username: '',
  email: '',
  gender: 0,
  introduction: ''
})

const profileRules = {
  email: [
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ]
}

const submitLoading = ref(false)
const submitForm = async () => {
  const formRef = profileFormRef.value
  if (!formRef) return

  await formRef.validate(async (valid: boolean) => {
    if (valid) {
      try {
        submitLoading.value = true
        const res = await updateUserProfile(profileForm)
        if (res.code === 200) {
          ElMessage.success('个人信息更新成功')
          // 更新用户 store
          userStore.userInfo = { 
            ...userStore.userInfo, 
            ...profileForm 
          }
        } else {
          ElMessage.error(res.message || '更新失败')
        }
      } catch (error) {
        ElMessage.error('更新失败，请稍后重试')
      } finally {
        submitLoading.value = false
      }
    }
  })
}

const resetForm = () => {
  if (userStore.userInfo) {
    profileForm.email = userStore.userInfo.email
    profileForm.gender = userStore.userInfo.gender
    profileForm.introduction = userStore.userInfo.introduction
  }
}

// 修改密码
const showPasswordDialog = ref(false)
const passwordFormRef = ref()
const changePasswordLoading = ref(false)
const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const passwordRules = {
  currentPassword: [
    { required: true, message: '请输入当前密码', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    { 
      validator: (rule: any, value: string, callback: Function) => {
        if (value !== passwordForm.newPassword) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      }, 
      trigger: 'blur' 
    }
  ]
}

const changePassword = async () => {
  const formRef = passwordFormRef.value
  if (!formRef) return

  await formRef.validate(async (valid: boolean) => {
    if (valid) {
      try {
        changePasswordLoading.value = true
        const res = await changeUserPassword({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        })

        if (res.code === 200) {
          ElMessage.success('密码修改成功')
          showPasswordDialog.value = false
          // 清空表单
          passwordForm.currentPassword = ''
          passwordForm.newPassword = ''
          passwordForm.confirmPassword = ''
        } else {
          ElMessage.error(res.message || '密码修改失败')
        }
      } catch (error) {
        ElMessage.error('密码修改失败，请稍后重试')
      } finally {
        changePasswordLoading.value = false
      }
    }
  })
}

// 初始化表单数据
onMounted(() => {
  if (userStore.userInfo) {
    profileForm.username = userStore.userInfo.username
    profileForm.email = userStore.userInfo.email
    profileForm.gender = userStore.userInfo.gender || 0
    profileForm.introduction = userStore.userInfo.introduction || ''
  }
})
</script>

<style scoped lang="scss">
.profile-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 60px);
  background-color: #f5f7fa;
  padding: 20px;
}

.profile-card {
  width: 100%;
  max-width: 800px;
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .profile-content {
    display: flex;
    flex-wrap: wrap;
    gap: 30px;

    .avatar-section {
      flex: 0 0 250px;
      display: flex;
      flex-direction: column;
      align-items: center;

      .avatar-uploader {
        .avatar {
          width: 150px;
          height: 150px;
          display: block;
          border-radius: 50%;
          object-fit: cover;
        }

        .avatar-uploader-icon {
          font-size: 28px;
          color: #8c939d;
          width: 150px;
          height: 150px;
          text-align: center;
          line-height: 150px;
          border: 1px dashed #d9d9d9;
          border-radius: 50%;
          cursor: pointer;
          transition: all 0.3s ease;

          &:hover {
            border-color: #409eff;
            color: #409eff;
          }
        }
      }

      .username {
        margin-top: 15px;
        font-size: 18px;
        font-weight: bold;
        color: #333;
      }
    }

    .profile-form {
      flex: 1;
      min-width: 400px;
    }

    .security-section {
      width: 100%;
      margin-top: 20px;
      padding-top: 20px;
      border-top: 1px solid #eaeefb;

      h3 {
        margin-bottom: 15px;
        color: #333;
      }
    }
  }
}
</style>
