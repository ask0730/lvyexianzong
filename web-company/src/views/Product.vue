<template>
  <div class="page-container">
    <div class="content">
      <div class="product-section">
        <el-carousel height="600px" direction="vertical" :autoplay="true" :interval="5000" v-if="looplist.length">
          <el-carousel-item v-for="item in looplist" :key="item._id">
            <div class="item" :style="{ backgroundImage: `url(http://localhost:3000${item.cover})` }">
              <div class="overlay"></div>
              <el-card class="box-card">
                <template #header>
                  <div class="card-header">
                    <h2>{{ item.title }}</h2>
                  </div>
                </template>
                <div class="introduction">{{ item.introduction }}</div>
                <div class="detail">{{ item.detail }}</div>
                <div class="more">
                  <span class="more-text">更多信息，请添加：</span>
                  <br />
                  <a href="xxxxxx" target="_blank" class="more-link">xxxxxx</a>
                </div>
              </el-card>
            </div>
          </el-carousel-item>
        </el-carousel>
        <el-empty description="暂无产品" v-else />
      </div>
    </div>
    <Footer />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import API from '@/api';
import Footer from '@/components/Footer.vue'

const looplist: any = ref([]);

onMounted(async () => {
  const res = await API.product.list({});
  if (res.code == 0) {
    looplist.value = res.data;
  }
});
</script>

<style scoped lang="scss">
.product-section {
  margin: 20px 0;
}

.item {
  width: 100%;
  height: 100%;
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: 5%;
}

.overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.3) 100%);
}

.box-card {
  width: 45%;
  max-height: 80%;
  overflow-y: auto;
  background-color: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(15px);
  border: none;
  border-radius: 16px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15);
  position: relative;
  z-index: 1;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    transform: translateX(-15px) scale(1.02);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  }

  .card-header h2 {
    margin: 0;
    color: #2c3e50;
    font-size: 28px;
    font-weight: 700;
    letter-spacing: -0.5px;
    line-height: 1.3;
  }

  .introduction {
    font-size: 17px;
    color: #34495e;
    line-height: 1.7;
    margin: 20px 0;
    font-weight: 500;
  }

  .detail {
    font-size: 15px;
    color: #5d6d7e;
    line-height: 1.8;
    margin: 25px 0;
    letter-spacing: 0.2px;
  }

  .more {
    margin-top: 25px;
    padding-top: 20px;
    border-top: 1px solid rgba(0,0,0,0.08);
  }
}

.overlay {
  background: linear-gradient(90deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.2) 100%);
  transition: opacity 0.3s ease;
}

.page-container {
  display: flex;
  flex-direction: column;
  min-height: 100%;
}

.content {
  flex: 1 0 auto;
}

:deep(.el-carousel__indicators--vertical) {
  right: 2%;
}

:deep(.el-carousel__button) {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.7);
  
  &:hover {
    background-color: #fff;
  }
}
</style>
