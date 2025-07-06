<template>
    <div>
        <el-card>
            <el-page-header content="文章列表" icon title="文章管理" />

            <!-- 虚拟表格 -->
            <VirtualTable
                :data="tableData"
                :columns="columns"
                :row-height="60"
                :buffer-size="10"
                item-key="_id"
                :loading="loading"
                :searchable="true"
                :sortable="true"
                class="virtual-table-wrapper"
                @search="handleSearch"
                @sort="handleSort"
                @row-click="handleRowClick"
            >
                <!-- 分类列 -->
                <template #category="{ row }">{{ categoryFormat(row.category) }}</template>

                <!-- 更新时间列 -->
                <template #editTime="{ row }">{{ formatTime(row.editTime) }}</template>

                <!-- 发布状态列 -->
                <template #isPublish="{ row }">
                    <el-switch v-model="row.isPublish" :active-value="1" :inactive-value="0" @change="handleSwitchChange(row)" />
                </template>

                <!-- 操作列 -->
                <template #actions="{ row }">
                    <el-button circle :icon="Star" type="success" @click="handlePreview(row)"></el-button>
                    <el-button circle :icon="Edit" @click="handleEdit(row)"></el-button>
                    <el-popconfirm title="你确定要删除吗?" confirmButtonText="确定" cancelButtonText="取消" @confirm="handleDelete(row)">
                        <template #reference>
                            <el-button circle :icon="Delete" type="danger"></el-button>
                        </template>
                    </el-popconfirm>
                </template>
            </VirtualTable>

            <!-- 分页器 -->
            <div class="pagination-container">
                <el-pagination
                    :current-page="currentPage"
                    :page-size="pageSize"
                    :page-sizes="[10, 20, 30, 50, 100]"
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
import { ref, onMounted, computed } from 'vue'
import { formatTime } from '@/utils'
import { Star, Edit, Delete, StarFilled } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import API from '@/api'
import VirtualTable from '@/components/VirtualTable.vue'

const router = useRouter()
const tableData = ref([])
const previewData: any = ref({})
const dialogVisible = ref(false)
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const loading = ref(false)

// 虚拟表格列配置
const columns = computed(() => [
    {
        prop: 'title',
        label: '标题',
        width: '300px',
        minWidth: '200px',
    },
    {
        prop: 'category',
        label: '分类',
        width: '120px',
        slot: 'category',
    },
    {
        prop: 'editTime',
        label: '更新时间',
        width: '180px',
        slot: 'editTime',
    },
    {
        prop: 'isPublish',
        label: '是否发布',
        width: '120px',
        slot: 'isPublish',
    },
    {
        prop: 'actions',
        label: '操作',
        width: '200px',
        slot: 'actions',
    },
])

onMounted(() => {
    getTableData()
})

const getTableData = async () => {
    loading.value = true
    try {
        const res = await API.news.list({
            page: currentPage.value,
            pageSize: pageSize.value,
        })
        if (res.code === 0) {
            tableData.value = res.data.list
            total.value = res.data.total
        }
    } catch (error) {
        console.error('获取数据失败:', error)
    } finally {
        loading.value = false
    }
}

// 处理搜索
const handleSearch = (keyword: string) => {
    console.log('搜索关键词:', keyword)
    // 这里可以实现本地搜索或调用API搜索
}

// 处理排序
const handleSort = (column: string, order: 'asc' | 'desc') => {
    console.log('排序:', column, order)
    // 这里可以实现本地排序或调用API排序
}

// 处理行点击
const handleRowClick = (item: any, index: number) => {
    console.log('点击行:', item, index)
    // 可以在这里添加行点击逻辑
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
.virtual-table-wrapper {
    margin-top: 50px;
    margin-bottom: 20px;
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

// 虚拟表格样式优化
:deep(.virtual-table-container) {
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

:deep(.virtual-table-header) {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
}

:deep(.virtual-table-header-cell) {
    color: white;
    font-weight: 600;
    border-right: 1px solid rgba(255, 255, 255, 0.2);
}

:deep(.virtual-table-row) {
    &:nth-child(even) {
        background-color: #fafafa;
    }

    &:hover {
        background-color: #e6f7ff !important;
    }
}

:deep(.virtual-table-cell) {
    padding: 16px 12px;
    font-size: 14px;
}
</style>
