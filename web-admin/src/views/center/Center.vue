<template>
    <div>
        <el-page-header content="个人中心" icon title="绿野仙踪管理系统" />
        <el-row :gutter="20" class="el-row">
            <el-col :span="8">
                <el-card class="box-card">
                    <el-avatar :size="100" :src="avatarUrl" />
                    <h3>{{ useTool.userInfo.username }}</h3>
                    <h5>{{ useTool.userInfo.role === 1 ? '管理员' : '编辑' }}</h5>
                </el-card>

                <!-- 新增主题设置卡片 -->
                <el-card class="box-card theme-card">
                    <template #header>
                        <div class="card-header">
                            <span>主题设置</span>
                        </div>
                    </template>
                    <div class="theme-container">
                        <div v-for="theme in themes" :key="theme.value" class="theme-item" :class="{ active: currentTheme === theme.value }" @click="handleThemeChange(theme.value)">
                            <div class="color-preview" :style="{ backgroundColor: theme.color }"></div>
                            <span class="theme-label">{{ theme.label }}</span>
                        </div>
                    </div>
                </el-card>
            </el-col>

            <el-col :span="16">
                <el-card>
                    <template #header>
                        <div class="card-header">
                            <span>个人信息</span>
                        </div>
                    </template>

                    <el-form ref="userFormRef" :model="userForm" :rules="userFormRules" label-width="120px" class="demo-ruleForm">
                        <el-form-item label="用户名" prop="username">
                            <el-input v-model="userForm.username" />
                        </el-form-item>
                        <el-form-item label="性别" prop="gender">
                            <el-select v-model="userForm.gender" class="m-2" placeholder="Select" style="width: 100%">
                                <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value" />
                            </el-select>
                        </el-form-item>
                        <el-form-item label="个人简介" prop="introduction">
                            <el-input v-model="userForm.introduction" type="textarea" />
                        </el-form-item>

                        <el-form-item label="头像" prop="avatar">
                            <Upload :avatar="userForm.avatar" @uploadchange="handleChange" />
                        </el-form-item>

                        <el-form-item>
                            <el-button type="primary" @click="submitForm()">更新</el-button>
                        </el-form-item>
                    </el-form>
                </el-card>
            </el-col>
        </el-row>
    </div>
</template>

<script setup lang="ts">
import { computed, ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import Upload from '@/components/Upload.vue'
import { useToolStore } from '@/store'
import API from '@/api'
import { useThemeStore } from '@/store/modules/theme'

const useTool = useToolStore()
const avatarUrl = computed(() =>
    useTool.userInfo.avatar
        ? 'http://localhost:3000' + useTool.userInfo.avatar
        : `https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png`
)

// 个人信息表单相关
const { username, gender, introduction, avatar } = useTool.userInfo
const userFormRef = ref()
const userForm = reactive({
    username,
    gender,
    introduction,
    avatar,
    file: null,
})

const userFormRules = reactive({
    username: [{ required: true, message: '请输入名字', trigger: 'blur' }],
    gender: [{ required: true, message: '请选择性别', trigger: 'blur' }],
    introduction: [{ required: true, message: '请输入介绍', trigger: 'blur' }],
    avatar: [{ required: true, message: '请上传头像', trigger: 'blur' }],
})

const options = [
    {
        label: '保密',
        value: 0,
    },
    {
        label: '男',
        value: 1,
    },
    {
        label: '女',
        value: 2,
    },
]

const handleChange = (file: any) => {
    userForm.avatar = URL.createObjectURL(file)
    userForm.file = file
}

const submitForm = () => {
    userFormRef.value.validate(async (valid: any) => {
        if (valid) {
            const res = await API.user.upload(userForm, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            })
            if (res.code === 0) {
                useTool.changeUserInfo(res.data)
                ElMessage.success('更新成功~')
            }
        }
    })
}

// 主题切换相关
const themeStore = useThemeStore()
const currentTheme = ref(themeStore.theme)

const themes = [
  { label: '蓝色主题', value: 'blue', color: '#409eff' },
  { label: '绿色主题', value: 'green', color: '#67c23a' },
  { label: '红色主题', value: 'red', color: '#f56c6c' },
  { label: '紫色主题', value: 'purple', color: '#9c27b0' }
]

const handleThemeChange = (theme: string) => {
  themeStore.setTheme(theme)
  currentTheme.value = theme
}

onMounted(() => {
  currentTheme.value = themeStore.theme
})
</script>

<style scoped lang="scss">
.el-row {
    margin-top: 20px;
    .box-card {
        text-align: center;
        margin-bottom: 20px;
        transition: all 0.3s ease;
        box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);

        &:hover {
            transform: translateY(-5px);
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
        }

        .el-avatar {
            margin: 20px 0;
            border: 4px solid var(--el-color-primary-light-8);
            transition: all 0.3s ease;

            &:hover {
                transform: scale(1.05);
                border-color: var(--el-color-primary);
            }
        }

        h3 {
            margin: 15px 0 10px;
            color: var(--el-text-color-primary);
            font-size: 1.5em;
        }

        h5 {
            margin: 10px 0;
            color: var(--el-text-color-secondary);
            font-size: 1em;
        }
    }
}

// 主题切换样式
.theme-card {
    margin-top: 20px;
    transition: all 0.3s ease;

    &:hover {
        transform: translateY(-5px);
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
    }

    .card-header {
        font-weight: bold;
        color: var(--el-text-color-primary);
    }
}

.theme-container {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    padding: 10px;
}

.theme-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 15px;
    border: 2px solid #e4e7ed;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s;
    flex: 1 1 calc(50% - 6px);

    &:hover {
        border-color: var(--el-color-primary);
        transform: translateY(-2px);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    &.active {
        border-color: var(--el-color-primary);
        background-color: var(--el-color-primary-light-9);
    }

    .color-preview {
        width: 24px;
        height: 24px;
        border-radius: 6px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .theme-label {
        font-size: 14px;
        color: var(--el-text-color-regular);
        font-weight: 500;
    }
}

// 表单样式优化
.demo-ruleForm {
    padding: 20px;

    :deep(.el-form-item) {
        margin-bottom: 25px;

        .el-form-item__label {
            font-weight: 500;
            color: var(--el-text-color-primary);
        }

        .el-input__wrapper,
        .el-textarea__inner {
            transition: all 0.3s ease;

            &:hover {
                box-shadow: 0 0 0 1px var(--el-color-primary-light-5);
            }

            &:focus-within {
                box-shadow: 0 0 0 1px var(--el-color-primary);
            }
        }
    }

    .el-button {
        width: 120px;
        transition: all 0.3s ease;

        &:hover {
            transform: translateY(-2px);
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
    }
}
</style>