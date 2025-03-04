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
            <el-carousel :interval="4000" type="card" height="400px" v-if="loopList.length">
                <el-carousel-item v-for="item in loopList" :key="item._id">
                    <div :style="{
              backgroundImage: `url(http://localhost:3000${item.cover})`,
              backgroundSize: 'cover',
              backgroundRepeat: 'no-repeat',
              height: '100%',
            }">
                        <h3>{{ item.title }}</h3>
                    </div>
                </el-carousel-item>
            </el-carousel>
        </el-card>

        <el-card class="box-card">
            <template #header>
                <div class="card-header">
                    <span>文章收藏统计</span>
                </div>
            </template>
            <div id="chart-container" style="height: 400px;"></div>
        </el-card>
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useToolStore } from '@/store'
import API from '@/api'
import * as echarts from 'echarts'
import axios from 'axios'

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

onMounted(() => {
    getData();
    mockChartData();
});
</script>

<style lang="scss" scoped>
.box-card {
    margin-top: 50px;
}

.el-carousel__item h3 {
    color: #475669;
    font-size: 14px;
    opacity: 0.75;
    line-height: 200px;
    margin: 0;
    text-align: center;
}

.el-carousel__item:nth-child(2n) {
    background-color: #99a9bf;
}

.el-carousel__item:nth-child(2n + 1) {
    background-color: #d3dce6;
}
</style>
