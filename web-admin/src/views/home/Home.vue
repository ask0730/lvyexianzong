<template>
    <div>
        <el-page-header content="首页" icon title="绿野仙踪管理系统" />

        <el-card class="box-card">
            <el-row>
                <el-col :span="4">
                    <el-avatar :size="100" :src="avatarUrl" />
                </el-col>
                <el-col :span="20">
                    <h3 style="line-height: 100px">欢迎 {{ useTool.userInfo.username || 'admin' }} 回来, {{ welcomeText }}</h3>
                </el-col>
            </el-row>
        </el-card>

        <el-card class="box-card">
            <template #header>
                <div class="card-header">
                    <span>农产品展示</span>
                </div>
            </template>
            <el-carousel :interval="4000" type="card" height="400px" v-if="loopList.length" :autoplay="true" indicator-position="outside">
                <el-carousel-item v-for="item in loopList" :key="item._id" class="carousel-item">
                    <div class="carousel-content" :style="{
                        backgroundImage: `url(http://localhost:3000${item.cover})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                        height: '100%',
                    }">
                        <div class="title-overlay">
                            <h3>{{ item.title }}</h3>
                        </div>
                    </div>
                </el-carousel-item>
            </el-carousel>
        </el-card>

        <ViewStatistics />

        <el-row :gutter="20">
            <el-col :span="12">
                <el-card class="box-card">
                    <template #header>
                        <div class="card-header">
                            <span>文章收藏统计</span>
                        </div>
                    </template>
                    <div id="chart-container" style="height: 400px;"></div>
                </el-card>
            </el-col>
            <el-col :span="12">
                <el-card class="box-card">
                    <template #header>
                        <div class="card-header">
                            <span>用户性别分布</span>
                        </div>
                    </template>
                    <div id="gender-chart" style="height: 400px;"></div>
                </el-card>
            </el-col>
        </el-row>
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useToolStore } from '@/store'
import API from '@/api'
import * as echarts from 'echarts'
import axios from 'axios'
import ViewStatistics from './components/ViewStatistics.vue'

const loopList: any = ref([])
const useTool = useToolStore()
const avatarUrl = computed(() =>
    useTool.userInfo.avatar
        ? 'http://localhost:3000' + useTool.userInfo.avatar
        : `https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png`
)
const welcomeText = computed(() => (new Date().getHours() < 12 ? '上午好哦.' : '下午好哦.'))

const getData = async () => {
    const res = await API.product.list({})
    if (res.code === 0) {
        loopList.value = res.data
    }
}

const mockChartData = async () => {
    const chartDom = document.getElementById('chart-container')!
    const myChart = echarts.init(chartDom)
    
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
            bottom: '15%',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            data: [],
            axisLabel: {
                rotate: 45,
                interval: 0,
                textStyle: {
                    fontSize: 12
                },
                overflow: 'break',
                width: 120,
                formatter: function (value) {
                    const maxLength = 15;
                    if (value.length > maxLength) {
                        return value.substring(0, maxLength) + '...';
                    }
                    return value;
                }
            }
        },
        yAxis: {
            type: 'value',
            name: '收藏数量',
            nameTextStyle: {
                fontSize: 12
            },
            minInterval: 1
        },
        series: [{
            name: '收藏数量',
            type: 'bar',
            data: [],
            itemStyle: {
                color: 'var(--el-color-primary)',
                emphasis: {
                    color: 'var(--el-color-primary)'
                }
            },
            label: {
                show: true,
                position: 'top',
                formatter: '{c}'
            }
        }]
    };
    
    // 获取收藏统计数据
    try {
        const res = await axios.get('http://localhost:3000/webapi/news/collection-statistics');
        if (res.data.code === 0) {
            const { titles, counts } = res.data.data;
            
            // 将标题和收藏数组合成对象数组，方便排序
            const combinedData = titles.map((title, index) => ({
                title,
                count: counts[index]
            }));
            
            // 按收藏数降序排序并只取前5个
            const top5Data = combinedData
                .sort((a, b) => b.count - a.count)
                .slice(0, 5);
            
            // 分离排序后的标题和收藏数
            option.xAxis.data = top5Data.map(item => item.title);
            option.series[0].data = top5Data.map(item => item.count);
            myChart.setOption(option);
        }
    } catch (error) {
        console.error('获取收藏统计失败:', error);
    }
}

const getGenderStats = async () => {
    const genderChartDom = document.getElementById('gender-chart')!;
    const genderChart = echarts.init(genderChartDom);
    
    try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:3000/adminapi/user/gender-stats', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (res.data.code === 0) {
            const option = {
                tooltip: {
                    trigger: 'item',
                    formatter: '{b}: {c} ({d}%)'
                },
                legend: {
                    orient: 'vertical',
                    left: 'left'
                },
                series: [
                    {
                        name: '性别分布',
                        type: 'pie',
                        radius: '50%',
                        data: res.data.data.map((item: any) => ({
                            value: item.value,
                            name: item.gender
                        })),
                        emphasis: {
                            itemStyle: {
                                shadowBlur: 10,
                                shadowOffsetX: 0,
                                shadowColor: 'rgba(0, 0, 0, 0.5)'
                            }
                        }
                    }
                ]
            };
            genderChart.setOption(option);
        }
    } catch (error) {
        console.error('获取性别统计数据失败:', error);
    }
};
onMounted(() => {
    getData();
    mockChartData();
    getGenderStats();
});
</script>

<style lang="scss" scoped>
.box-card {
    margin-top: 20px;
    transition: all 0.3s ease;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    
    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.15);
    }
    
    .el-row {
        align-items: center;
    }
    
    h3 {
        margin: 0;
        font-size: 1.5rem;
        color: var(--el-text-color-primary);
        transition: color 0.3s ease;
    }
}

.card-header {
    display: flex;
    align-items: center;
    font-size: 1.2rem;
    font-weight: 600;
    color: var(--el-text-color-primary);
    
    &::before {
        content: '';
        display: inline-block;
        width: 4px;
        height: 16px;
        background-color: var(--el-color-primary);
        margin-right: 8px;
        border-radius: 2px;
    }
}

.carousel-item {
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    
    &:hover {
        transform: translateY(-5px) scale(1.02);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
    }
}

.carousel-content {
    position: relative;
    border-radius: 12px;
    height: 100%;
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.title-overlay {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
    padding: 30px 20px;
    backdrop-filter: blur(4px);
    
    h3 {
        color: #ffffff;
        font-size: 20px;
        font-weight: 600;
        margin: 0;
        text-align: center;
        text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.4);
        transform: translateY(0);
        transition: transform 0.3s ease;
    }
}

:deep(.el-carousel__indicators) {
    transform: translateY(20px);
}

:deep(.el-carousel__indicator) {
    .el-carousel__button {
        background-color: var(--el-color-primary);
        border-radius: 6px;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        width: 24px;
        height: 4px;
        
        &:hover {
            transform: scaleX(1.2);
            opacity: 0.8;
        }
    }
    
    &.is-active .el-carousel__button {
        transform: scaleX(1.5);
    }
}

#chart-container,
#gender-chart {
    border-radius: 8px;
    padding: 20px;
    background: linear-gradient(145deg, #ffffff, #f5f7fa);
    box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.05);
}
</style>

