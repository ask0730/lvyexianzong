<template>
  <div class="like-button" @click="toggleLike">
    <i :class="['iconfont', hasLiked ? 'icon-like-fill' : 'icon-like']" />
    <span class="like-count">{{ likeCount }}</span>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { addLike, removeLike, getLikeStatus, getLikeCount } from '@/api/like';
import { ElMessage } from 'element-plus';

const props = defineProps<{
  newsId: string
}>();

const hasLiked = ref(false);
const likeCount = ref(0);

// 获取点赞状态和数量
const fetchLikeInfo = async () => {
  try {
    const [statusRes, countRes] = await Promise.all([
      getLikeStatus(props.newsId),
      getLikeCount(props.newsId)
    ]);
    hasLiked.value = statusRes.hasLiked;
    likeCount.value = countRes.count;
  } catch (error) {
    console.error('获取点赞信息失败:', error);
  }
};

// 切换点赞状态
const toggleLike = async () => {
  try {
    if (hasLiked.value) {
      await removeLike(props.newsId);
      hasLiked.value = false;
      likeCount.value--;
      ElMessage.success('取消点赞成功');
    } else {
      const res = await addLike(props.newsId);
      if (res.success) {
        hasLiked.value = true;
        likeCount.value++;
        ElMessage.success('点赞成功');
      } else {
        ElMessage.warning(res.message);
      }
    }
  } catch (error) {
    ElMessage.error('操作失败，请稍后重试');
  }
};

onMounted(() => {
  fetchLikeInfo();
});
</script>

<style lang="scss" scoped>
.like-button {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 8px 16px;
  border-radius: 20px;
  background-color: #f5f5f5;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background-color: #e8e8e8;
  }

  .iconfont {
    font-size: 20px;
    color: #666;

    &.icon-like-fill {
      color: #ff6b6b;
    }
  }

  .like-count {
    font-size: 14px;
    color: #666;
  }
}
</style>
