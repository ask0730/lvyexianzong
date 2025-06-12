<template>
  <div class="spider-news-list">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>爬虫文章列表</span>
          <el-button type="primary" @click="startCrawler" :loading="crawlerLoading">开始爬虫</el-button>
        </div>
      </template>
      
      <el-table :data="newsList" style="width: 100%" v-loading="loading">
        <el-table-column prop="title" label="标题" width="400">
          <template #default="{ row }">
            <el-link type="primary" :href="row.url" target="_blank">{{ row.title }}</el-link>
          </template>
        </el-table-column>
        <el-table-column prop="source" label="来源" width="150" />
        <el-table-column prop="publishDate" label="发布时间" width="180" />
        <el-table-column prop="createdAt" label="采集时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120">
          <template #default="{ row }">
            <el-button type="primary" link @click="viewContent(row)">查看内容</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 新闻内容对话框 -->
    <el-dialog
      v-model="dialogVisible"
      title="新闻内容"
      width="60%"
    >
      <div class="news-content">
        <h3>{{ currentNews.title }}</h3>
        <div class="news-meta">
          <span>来源：{{ currentNews.source }}</span>
          <span>发布时间：{{ currentNews.publishDate }}</span>
        </div>
        <div class="news-body" v-html="currentNews.content"></div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import dayjs from 'dayjs'
import request from '@/utils/request'

interface NewsItem {
  _id: string
  title: string
  content: string
  source: string
  publishDate: string
  url: string
  createdAt: string
  updatedAt: string
}

const newsList = ref<NewsItem[]>([])
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const dialogVisible = ref(false)
const currentNews = ref<NewsItem>({
  _id: '',
  title: '',
  content: '',
  source: '',
  publishDate: '',
  url: '',
  createdAt: '',
  updatedAt: ''
})

// 格式化日期
const formatDate = (date: string) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss')
}

// 获取新闻列表
const getNewsList = async () => {
  try {
    loading.value = true
    const response = await request.get(`/spider-news`, {
      params: {
        page: currentPage.value,
        pageSize: pageSize.value
      }
    })
    newsList.value = response.data.list
    total.value = response.data.total
  } catch (error) {
    console.error('获取新闻列表失败:', error)
    ElMessage.error('获取新闻列表失败')
  } finally {
    loading.value = false
  }
}

// 查看新闻内容
const viewContent = (news: NewsItem) => {
  currentNews.value = news
  dialogVisible.value = true
}

// 处理每页显示数量变化
const handleSizeChange = (val: number) => {
  pageSize.value = val
  getNewsList()
}

// 处理页码变化
const handleCurrentChange = (val: number) => {
  currentPage.value = val
  getNewsList()
}

onMounted(() => {
  getNewsList()
})

const crawlerLoading = ref(false)

// 启动爬虫
const startCrawler = async () => {
  try {
    crawlerLoading.value = true
    await request.post('/spider-news/start-crawler')
    ElMessage.success('爬虫任务已启动')
    // 刷新列表
    getNewsList()
  } catch (error) {
    console.error('启动爬虫失败:', error)
    ElMessage.error('启动爬虫失败')
  } finally {
    crawlerLoading.value = false
  }
}
</script>

<style scoped>
.spider-news-list {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.news-content {
  padding: 20px;
}

.news-meta {
  margin: 10px 0;
  color: #666;
}

.news-meta span {
  margin-right: 20px;
}

.news-body {
  margin-top: 20px;
  line-height: 1.6;
}
</style>