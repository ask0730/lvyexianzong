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
            <el-button 
              v-if="currentNews._id" 
              :type="isLiked ? 'danger' : 'default'" 
              size="small" 
              @click="toggleLike"
            >
              <el-icon><Pointer /></el-icon>
              {{ isLiked ? '已点赞' : '点赞' }} ({{ likeCount }})
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
  import { StarFilled, Star, Pointer } from '@element-plus/icons-vue';
  import { formatTime } from '@/utils';
  import API from '@/api';
  import axios from 'axios';
  import { ElMessage } from 'element-plus';

  const route = useRoute();
  const router = useRouter();
  const currentNews = ref({});
  const topNews = ref([]);
  const isCollected = ref(false);
  const isLiked = ref(false);
  const likeCount = ref(0);

  const stop = watchEffect(async () => {
    if (!route.params.id) return;

    const res1 = await API.news.list({
      _id: route.params.id,
    });

    if (res1.code == 0) {
      currentNews.value = res1.data[0];
      checkCollectionStatus();
      checkLikeStatus();
      getLikeCount();
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

  const checkLikeStatus = async () => {
    try {
      const response = await axios.get(`/webapi/like/status/${currentNews.value._id}`, {
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.data && response.data.code === 0) {
        isLiked.value = response.data.data;
      } else {
        const errorMessage = response.data?.message || '获取点赞状态失败，未返回具体错误信息';
        console.error('获取点赞状态失败，错误信息：', errorMessage);
        ElMessage.warning(errorMessage);
      }
    } catch (error) {
      const errorMessage = error.message || '获取点赞状态失败，网络错误';
      console.error('获取点赞状态失败:', errorMessage);
      ElMessage.warning(errorMessage);
    }
  };

  const getLikeCount = async () => {
    try {
      const response = await axios.get(`/webapi/like/count/${currentNews.value._id}`);
      if (response.data && response.data.code === 0 && response.data.data) {
        likeCount.value = response.data.data.count || 0;
      } else {
        const errorMessage = response.data?.message || '获取点赞数失败，未返回具体错误信息';
        console.error('获取点赞数失败，错误信息：', errorMessage);
        ElMessage.warning(errorMessage);
      }
    } catch (error) {
      const errorMessage = error.message || '获取点赞数失败，网络错误';
      console.error('获取点赞数量失败:', errorMessage);
      ElMessage.warning(errorMessage);
    }
  };

  const toggleLike = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const url = isLiked.value ? '/webapi/like/remove' : '/webapi/like/add';
      const response = await axios.post(url, 
        { newsId: currentNews.value._id },
        { 
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );

      // 根据后端返回的 success 字段判断操作是否成功
      if (response.data.success) {
        isLiked.value = !isLiked.value;
        // 点赞成功后，前端直接更新点赞数
        likeCount.value = isLiked.value? likeCount.value + 1 : likeCount.value - 1; 
        await getLikeCount(); // 再次获取后端最新点赞数，校正可能的误差
        ElMessage.success(isLiked.value? '点赞成功' : '取消点赞成功');
      } else {
        const errorMessage = response.data.message || '操作失败，未返回具体错误信息';
        ElMessage.error(errorMessage);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || '操作失败，未返回具体错误信息';
      console.error('点赞操作失败:', errorMessage);
      ElMessage.error(errorMessage);
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
        ElMessage.success(isCollected.value? '收藏成功' : '取消收藏成功');
      } else {
        const errorMessage = response.data.message || '操作失败，未返回具体错误信息';
        ElMessage.error(errorMessage);
      }
    } catch (error) {
      const errorMessage = error.message || '操作失败，网络错误';
      console.error('收藏操作失败:', errorMessage);
      ElMessage.error(errorMessage);
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