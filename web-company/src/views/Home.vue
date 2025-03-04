<template>
  <div class="page-container">
    <div class="content">
      <div class="container">
        <el-carousel height="600px">
          <el-carousel-item :key="1">
            <div :style="{ backgroundImage: `url(${img1})` }"></div>
          </el-carousel-item>
          <el-carousel-item :key="2">
            <div :style="{ backgroundImage: `url(${img2})` }"></div>
          </el-carousel-item>
          <el-carousel-item :key="3">
            <div :style="{ backgroundImage: `url(${img3})` }"></div>
          </el-carousel-item>
        </el-carousel>
        <div class="center">绿野仙踪</div>
      </div>
      <div class="chart-container">
        <div class="chart-title">文章收藏排行榜</div>
        <div ref="chartRef" class="chart"></div>
      </div>
    </div>
    <Footer />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import img1 from '@/assets/home1.jpg';
import img2 from '@/assets/home2.jpg';
import img3 from '@/assets/home3.jpg';
import Footer from '@/components/Footer.vue';
import * as echarts from 'echarts';
import axios from 'axios';

const chartRef = ref();
let chart: echarts.ECharts | null = null;

const initChart = () => {
  if (chartRef.value) {
    chart = echarts.init(chartRef.value);
  }
};

const fetchCollectionStatistics = async () => {
  try {
    const response = await axios.get('/webapi/news/collection-statistics');
    if (response.data.code === 0 && response.data.data) {
      const { titles, counts } = response.data.data;
      updateChart(titles, counts);
    }
  } catch (error) {
    console.error('获取收藏统计失败:', error);
  }
};

const updateChart = (titles: string[], counts: number[]) => {
  if (!chart) return;

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: titles,
      axisLabel: {
        interval: 0,
        rotate: 45,
        textStyle: {
          fontSize: 12
        }
      }
    },
    yAxis: {
      type: 'value',
      name: '收藏数量'
    },
    series: [{
      name: '收藏数量',
      type: 'bar',
      data: counts,
      itemStyle: {
        color: '#409EFF'
      }
    }]
  };

  chart.setOption(option);
};

onMounted(() => {
  initChart();
  fetchCollectionStatistics();
  window.addEventListener('resize', () => chart?.resize());
});

onUnmounted(() => {
  chart?.dispose();
  window.removeEventListener('resize', () => chart?.resize());
});
</script>

<style scoped lang="scss">
.el-carousel div {
  width: 100%;
  height: 100%;
  background-size: cover;
}

.container {
  position: relative;
}
.center {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  height: 100px;
  line-height: 100px;
  font-size: 60px;
  color: white;
  text-align: center;
}

.page-container {
  display: flex;
  flex-direction: column;
  min-height: 100%;
}

.content {
  flex: 1 0 auto;
}

.chart-container {
  max-width: 1200px;
  margin: 40px auto;
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.chart-title {
  font-size: 24px;
  color: #333;
  text-align: center;
  margin-bottom: 20px;
}

.chart {
  height: 400px;
  width: 100%;
}
</style>
