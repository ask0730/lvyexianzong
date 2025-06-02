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
                  <a href="xxxxxx" target="_blank" class="more-link">123456</a>
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
  animation: fadeIn 1s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.5) 50%, rgba(0,0,0,0.3) 100%);
  backdrop-filter: blur(3px);
  transition: all 0.5s ease;
}

.box-card {
  width: 45%;
  max-height: 80%;
  overflow-y: auto;
  background-color: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(15px);
  border: none;
  border-radius: 20px;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
  position: relative;
  z-index: 1;
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  animation: slideIn 0.8s ease-out;

  @media (max-width: 992px) {
    width: 60%;
  }

  @media (max-width: 768px) {
    width: 80%;
    margin: 0 auto;
  }

  @media (max-width: 576px) {
    width: 90%;
    max-height: 70%;
  }

  &:hover {
    transform: translateX(-20px) scale(1.03);
    box-shadow: 0 30px 60px rgba(0, 0, 0, 0.3);

    @media (max-width: 768px) {
      transform: scale(1.03);
    }

    .card-header h2 {
      color: #409EFF;
    }
  }

  .card-header h2 {
    margin: 0;
    color: #2c3e50;
    font-size: 28px;
    font-weight: 700;
    letter-spacing: -0.5px;
    line-height: 1.3;
    transition: color 0.3s ease;

    @media (max-width: 576px) {
      font-size: 24px;
    }
  }

  .introduction {
    font-size: 17px;
    color: #34495e;
    line-height: 1.7;
    margin: 20px 0;
    font-weight: 500;
    animation: slideUp 0.6s ease-out 0.3s both;

    @media (max-width: 576px) {
      font-size: 15px;
      margin: 15px 0;
    }
  }

  .detail {
    font-size: 15px;
    color: #5d6d7e;
    line-height: 1.8;
    margin: 25px 0;
    letter-spacing: 0.2px;
    animation: slideUp 0.6s ease-out 0.6s both;

    @media (max-width: 576px) {
      font-size: 14px;
      margin: 15px 0;
    }
  }

  .more {
    text-align: center;
    margin-top: 30px;
    padding: 20px 0;
    border-top: 1px solid rgba(0,0,0,0.1);
    animation: slideUp 0.6s ease-out 0.9s both;

    .more-text {
      color: #2c3e50;
      font-size: 16px;
      font-weight: 500;
    }

    .more-link {
      display: inline-block;
      margin-top: 10px;
      color: #409EFF;
      font-size: 18px;
      font-weight: 600;
      text-decoration: none;
      transition: all 0.3s ease;

      &:hover {
        color: #66b1ff;
        transform: translateY(-2px);
      }
    }
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(50px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
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
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.7);
  transition: all 0.3s ease;
  
  &:hover {
    background-color: #fff;
    transform: scale(1.2);
  }
}
</style>
