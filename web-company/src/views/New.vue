<template>
  <el-row>
    <el-col :span="17" :offset="1">
      <div>
        <h2>{{ currentNews.title }}</h2>

        <div class="time">
          {{ formatTime(currentNews.editTime) }}
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
import { onMounted, ref, watchEffect, onBeforeUnmount } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { StarFilled } from '@element-plus/icons-vue';
import { formatTime } from '@/utils';
import API from '@/api';

const route = useRoute();
const router = useRouter();
const currentNews = ref({});
const topNews = ref([]);
const stop = watchEffect(async () => {
  if (!route.params.id) return;
  const res1 = await API.news.list({
    _id: route.params.id,
  });
  if (res1.code == 0) {
    currentNews.value = res1.data[0];
  }
  const res2 = await API.news.toplist({
    limit: 4,
  });
  if (res1.code == 0) {
    topNews.value = res2.data;
  }
});

onBeforeUnmount(() => {
  stop();
});

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
}
</style>
