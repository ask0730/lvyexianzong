<template>
    <div>
        <el-card>
            <el-page-header content="文章列表" icon title="文章管理" />

            <el-table :data="tableData" style="width: 100%">
                <el-table-column prop="title" label="标题" width="180" />
                <el-table-column label="分类">
                    <template #default="scope">{{ categoryFormat(scope.row.category) }}</template>
                </el-table-column>

                <el-table-column label="更新时间">
                    <template #default="scope">{{ formatTime(scope.row.editTime) }}</template>
                </el-table-column>
                <el-table-column label="是否发布">
                    <template #default="scope">
                        <el-switch v-model="scope.row.isPublish" :active-value="1" :inactive-value="0" @change="handleSwitchChange(scope.row)" />
                    </template>
                </el-table-column>

                <el-table-column label="操作">
                    <template #default="scope">
                        <el-button circle :icon="Star" type="success" @click="handlePreview(scope.row)"></el-button>
                        <el-button circle :icon="Edit" @click="handleEdit(scope.row)"></el-button>

                        <el-popconfirm title="你确定要删除吗?" confirmButtonText="确定" cancelButtonText="取消" @confirm="handleDelete(scope.row)">
                            <template #reference>
                                <el-button circle :icon="Delete" type="danger"></el-button>
                            </template>
                        </el-popconfirm>
                    </template>
                </el-table-column>
            </el-table>
            <div class="pagination-container">
                <el-pagination
                    v-model:current-page="currentPage"
                    v-model:page-size="pageSize"
                    :page-sizes="[10, 20, 30, 50]"
                    :total="total"
                    layout="total, sizes, prev, pager, next, jumper"
                    @size-change="handleSizeChange"
                    @current-change="handlePageChange"
                />
            </div>
        </el-card>

        <el-dialog v-model="dialogVisible" title="预览文章" width="50%">
            <div>
                <h2>{{ previewData.title }}</h2>
                <div style="font-size: 12px; color: gray">{{ formatTime(previewData.editTime) }}</div>

                <el-divider>
                    <el-icon>
                        <star-filled />
                    </el-icon>
                </el-divider>

                <div v-html="previewData.content" class="htmlcontent"></div>
            </div>
        </el-dialog>
    </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { formatTime } from '@/utils'
import { Star, Edit, Delete, StarFilled } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import API from '@/api'

const router = useRouter()
const tableData = ref([])
const previewData: any = ref({})
const dialogVisible = ref(false)
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)

onMounted(() => {
    getTableData()
})

const getTableData = async () => {
    const res = await API.news.list({
        page: currentPage.value,
        pageSize: pageSize.value
    })
    if (res.code === 0) {
        tableData.value = res.data.list
        total.value = res.data.total
    }
}

const handlePageChange = (page: number) => {
    currentPage.value = page
    getTableData()
}

const handleSizeChange = (size: number) => {
    pageSize.value = size
    currentPage.value = 1
    getTableData()
}

//格式化分类信息
const categoryFormat = (category: number) => {
    const arr = ['最新动态', '典型案例', '通知公告']
    return arr[category - 1]
}

const handleSwitchChange = async (item: any) => {
    const res = await API.news.publish({
        _id: item._id,
        isPublish: item.isPublish,
    })
    if (res.code === 0) {
        getTableData()
    }
}

//預覽回調
const handlePreview = (data: any) => {
    previewData.value = data
    dialogVisible.value = true
}

//删除回调
const handleDelete = async (item: any) => {
    const res = await API.news.delete({
        _id: item._id,
    })
    if (res.code === 0) {
        getTableData()
    }
}

//编辑回调
const handleEdit = (item: any) => {
    router.push(`/news-manage/editnews/${item._id}`)
}
</script>
<style lang="scss" scoped>
.el-table {
    margin-top: 50px;
}

.pagination-container {
    margin-top: 20px;
    display: flex;
    justify-content: center;
}

::v-deep .htmlcontent {
    img {
        max-width: 100%;
    }
}
</style>
