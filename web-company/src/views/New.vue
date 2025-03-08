<template>
  <el-row>
    <el-col :span="17" :offset="1">
      <div>
        <h2>{{ currentNews.title }}</h2>

        <div class="time">
          {{ formatTime(currentNews.editTime) }}
          <el-button 
            v-if="currentNews._id" 
            type="primary" 
            size="small" 
            @click="toggleCollect"
          >
            <el-icon><Star /></el-icon>
            {{ isCollected ? '已收藏' : '收藏' }}
          </el-button>
        </div>

        <el-divider>
          <el-icon>
            <star-filled />
          </el-icon>
        </el-divider>

        <div v-html="currentNews.content"></div>
      </div>
    </el-col>
    <el-col :span="4" :offset="1" :pull="1">
      <el-card class="box-card">
        <template #header>
          <div class="card-header">
            <span style="font-size: 16px; font-weight: bold">最近新闻</span>
          </div>
        </template>
        <div v-for="item in topNews" :key="item._id" class="text item" style="padding: 14px" @click="handleChange(item._id)">
          <span>{{ item.title }}</span>
          <div class="bottom">
            <time class="time">{{ formatTime(item.editTime) }}</time>
          </div>
        </div>
      </el-card>
    </el-col>
  </el-row>
</template>

<script setup>
import { ref, watchEffect, onBeforeUnmount } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { StarFilled, Star } from '@element-plus/icons-vue';
import { formatTime } from '@/utils';
import API from '@/api';
import axios from 'axios';
import { ElMessage } from 'element-plus';

const route = useRoute();
const router = useRouter();
const currentNews = ref({});
const topNews = ref([]);
const isCollected = ref(false);

const stop = watchEffect(async () => {
  if (!route.params.id) return;
  
  const res1 = await API.news.list({
    _id: route.params.id,
  });
  
  if (res1.code == 0) {
    currentNews.value = res1.data[0];
    checkCollectionStatus();
    // 记录文章浏览
    try {
      await axios.post('/webapi/view-record', {
        articleId: currentNews.value._id
      });
    } catch (error) {
      console.error('记录浏览量失败:', error);
    }
  }
  
  const res2 = await API.news.toplist({
    limit: 4,
  });
  
  if (res2.code == 0) {
    topNews.value = res2.data;
  }
});

onBeforeUnmount(() => {
  stop();
});

const checkCollectionStatus = async () => {
  const token = localStorage.getItem('token');
  if (!token) return;

  try {
    const response = await axios.get('/webapi/news/collection-status', {
      params: { articleId: currentNews.value._id },
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.data.code === 0) {
      isCollected.value = response.data.data;
    }
  } catch (error) {
    console.error('获取收藏状态失败:', error);
  }
};

const toggleCollect = async () => {
  const token = localStorage.getItem('token');
  if (!token) {
    router.push('/login');
    return;
  }

  try {
    const url = isCollected.value 
      ? '/webapi/news/uncollect' 
      : '/webapi/news/collect';
    
    const response = await axios.post(url, 
      { articleId: currentNews.value._id },
      { 
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        } 
      }
    );

    if (response.data.code === 0) {
      isCollected.value = !isCollected.value;
      ElMessage.success(isCollected.value ? '收藏成功' : '取消收藏成功');
    } else {
      ElMessage.error(response.data.message || '操作失败');
    }
  } catch (error) {
    console.error('收藏操作失败:', error);
    ElMessage.error('操作失败，请重试');
  }
};

const handleChange = id => {
  router.push(`/news/${id}`);
};
</script>

<style scoped lang="scss">
.el-row {
  margin-top: 30px;
}

.time {
  font-size: 13px;
  color: gray;
  display: flex;
  align-items: center;
}

.el-button {
  margin-left: 10px;
}
</style>
