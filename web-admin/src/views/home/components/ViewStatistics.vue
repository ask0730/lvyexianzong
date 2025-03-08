<template>
  <div class="view-statistics">
    <el-row :gutter="20">
      <el-col :span="12">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>文章浏览量排行</span>
            </div>
          </template>
          <div ref="viewChartRef" class="chart"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>24小时浏览量分布</span>
            </div>
          </template>
          <div ref="hourlyChartRef" class="chart"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import * as echarts from 'echarts';
import { getViewStatistics, getHourlyViewDistribution } from '@/api/viewRecord';

const viewChartRef = ref();
const hourlyChartRef = ref();
let viewChart: echarts.ECharts | null = null;
let hourlyChart: echarts.ECharts | null = null;

// 初始化浏览量排行图表
const initViewChart = () => {
  if (viewChartRef.value) {
    viewChart = echarts.init(viewChartRef.value);
  }
};

// 初始化24小时分布图表
const initHourlyChart = () => {
  if (hourlyChartRef.value) {
    hourlyChart = echarts.init(hourlyChartRef.value);
  }
};

// 更新浏览量排行图表数据
const updateViewChart = async () => {
  try {
    const res = await getViewStatistics();
    if (res.code === 0 && viewChart) {
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
          type: 'value',
          boundaryGap: [0, 0.01]
        },
        yAxis: {
          type: 'category',
          data: res.data.titles.reverse(),
          axisLabel: {
            interval: 0,
            formatter: (value: string) => {
              return value.length > 10 ? value.substring(0, 10) + '...' : value;
            }
          }
        },
        series: [
          {
            name: '浏览量',
            type: 'bar',
            data: res.data.counts.reverse()
          }
        ]
      };
      viewChart.setOption(option);
    }
  } catch (error) {
    console.error('获取浏览量统计数据失败:', error);
  }
};

// 更新24小时分布图表数据
const updateHourlyChart = async () => {
  try {
    const res = await getHourlyViewDistribution();
    if (res.code === 0 && hourlyChart) {
      const option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'line'
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
          boundaryGap: false,
          data: res.data.hours
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            name: '浏览量',
            type: 'line',
            smooth: true,
            areaStyle: {},
            data: res.data.counts
          }
        ]
      };
      hourlyChart.setOption(option);
    }
  } catch (error) {
    console.error('获取24小时分布数据失败:', error);
  }
};

// 自动刷新数据
let refreshTimer: number;
const startAutoRefresh = () => {
  refreshTimer = window.setInterval(() => {
    updateViewChart();
    updateHourlyChart();
  }, 5 * 60 * 1000); // 每5分钟刷新一次
};

onMounted(() => {
  initViewChart();
  initHourlyChart();
  updateViewChart();
  updateHourlyChart();
  startAutoRefresh();

  window.addEventListener('resize', () => {
    viewChart?.resize();
    hourlyChart?.resize();
  });
});

onUnmounted(() => {
  if (refreshTimer) {
    clearInterval(refreshTimer);
  }
  viewChart?.dispose();
  hourlyChart?.dispose();
});
</script>

<style scoped>
.view-statistics {
  padding: 20px;
}

.chart-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chart {
  height: 400px;
  width: 100%;
}
</style>