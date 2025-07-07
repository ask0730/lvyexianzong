<template>
    <div>
        <el-upload class="avatar-uploader" :show-file-list="false" :auto-upload="false" :on-change="handleChange" :http-request="() => {}">
            <img v-if="props.avatar" :src="uploadAvatar" class="avatar" />
            <el-icon v-else class="avatar-uploader-icon">
                <Plus />
            </el-icon>
        </el-upload>
        <el-progress v-if="uploading" :percentage="progress" style="width: 178px; margin-top: 10px;" />
    </div>
</template>

<script setup>
import { Plus } from '@element-plus/icons-vue'
import { defineEmits, defineProps, computed, ref } from 'vue'
import axios from 'axios'

const props = defineProps({
    avatar: String,
})
const emit = defineEmits(['uploadchange'])
const uploadAvatar = computed(() => {
    if (!props.avatar) return ''
    if (props.avatar.startsWith('blob:')) return props.avatar
    if (props.avatar.startsWith('http')) return props.avatar
    return 'http://localhost:3000' + props.avatar
})

const uploading = ref(false)
const progress = ref(0)

// 计算文件hash（简单实现，可用spark-md5优化）
function getFileHash(file) {
    return new Promise((resolve) => {
        const reader = new FileReader()
        reader.onload = (e) => {
            let hash = 0
            const str = e.target.result
            for (let i = 0; i < str.length; i++) {
                hash = (hash << 5) - hash + str.charCodeAt(i)
                hash |= 0
            }
            resolve(Math.abs(hash).toString())
        }
        reader.readAsBinaryString(file)
    })
}

const CHUNK_SIZE = 2 * 1024 * 1024 // 2MB

const handleChange = async (file) => {
    const raw = file.raw
    emit('uploadchange', raw) // 先本地回显
    uploading.value = true
    progress.value = 0
    const hash = await getFileHash(raw)
    const total = Math.ceil(raw.size / CHUNK_SIZE)
    // 查询已上传分片
    const { uploaded = [] } = await axios.get('http://localhost:3000/webapi/upload/chunk', { params: { hash } })
    // 分片上传
    for (let i = 0; i < total; i++) {
        if (uploaded.includes(i)) {
            progress.value = Math.round(((i + 1) / total) * 100)
            continue
        }
        const chunk = raw.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE)
        const form = new FormData()
        form.append('chunk', chunk)
        await axios.post(`http://localhost:3000/webapi/upload/chunk?hash=${hash}&index=${i}`, form)
        progress.value = Math.round(((i + 1) / total) * 100)
    }
    // 合并分片
    const { url } = await axios.post('http://localhost:3000/webapi/upload/merge', {
        hash,
        filename: raw.name,
        total,
    })
    uploading.value = false
    progress.value = 100
    emit('uploadchange', url) // 回传图片URL
}
</script>

<style lang="scss" scoped>
::v-deep .el-upload {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition: var(--el-transition-duration-fast);
}

::v-deep .el-upload:hover {
    border-color: var(--el-color-primary);
}

::v-deep .el-icon.avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 178px;
    height: 178px;
    text-align: center;
}
.avatar {
    width: 178px;
    height: 178px;
}
</style>
