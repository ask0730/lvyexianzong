<template>
    <div>
        <el-card>
            <el-page-header content="爬虫新闻列表" icon title="爬虫新闻管理" />

            <el-table :data="tableData" style="width: 100%">
                <el-table-column prop="title" label="标题" width="180" />
                <el-table-column prop="source" label="来源" width="120" />
                <el-table-column prop="date" label="发布日期" width="120" />

                <el-table-column label="爬取时间">
                    <template #default="scope">{{ formatTime(scope.row.crawlTime) }}</template>
                </el-table-column>

                <el-table-column label="操作">
                    <template #default="scope">
                        <el-button circle :icon="Star" type="success" @click="handlePreview(scope.row)"></el-button>
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
                    @current-change="handleCurrentChange"
                />
            </div>
        </el-card>

        <el-dialog v-model="dialogVisible" title="预览文章" width="50%">
            <div>
                <h2>{{ previewData.title }}</h2>
                <div class="article-info">
                    <span>来源：{{ previewData.source }}</span>
                    <span style="margin-left: 20px">发布日期：{{ previewData.date }}</span>
                </div>

                <el-divider>
                    <el-icon><star-filled /></el-icon>
                </el-divider>

                <div class="article-content">{{ previewData.content }}</div>
            </div>
        </el-dialog>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { formatTime } from '@/utils'
import { Star, StarFilled } from '@element-plus/icons-vue'
import API from '@/api'

const tableData = ref([])
const previewData = ref({})
const dialogVisible = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

onMounted(() => {
    getTableData()
})

const getTableData = async () => {
    const res = await API.news.spiderList({
        page: currentPage.value,
        pageSize: pageSize.value
    })
    if (res.code === 0) {
        tableData.value = res.data.list
        total.value = res.data.total
    }
}

const handleSizeChange = (val: number) => {
    pageSize.value = val
    getTableData()
}

const handleCurrentChange = (val: number) => {
    currentPage.value = val
    getTableData()
}

const handlePreview = async (data: any) => {
    const res = await API.news.spiderDetail({
        id: data._id
    })
    if (res.code === 0) {
        previewData.value = res.data
        dialogVisible.value = true
    }
}
</script>

<style lang="scss" scoped>
.el-table {
    margin-top: 20px;
}

.pagination-container {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
}

.article-info {
    font-size: 14px;
    color: #666;
    margin: 10px 0;
}

.article-content {
    line-height: 1.6;
    font-size: 16px;
}
</style>