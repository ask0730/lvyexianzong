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

const mockChartData = () => {
    const chartDom = document.getElementById('chart-container')!
    const myChart = echarts.init(chartDom)
    
    const option = {
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow'
            }
        },
        xAxis: {
            type: 'category',
            data: ['技术文章', '农业知识', '市场分析', '政策解读', '种植技巧'],
            axisLabel: {
                rotate: 45
            }
        },
        yAxis: {
            type: 'value'
        },
        series: [{
            data: [125, 230, 180, 90, 150],
            type: 'bar',
            itemStyle: {
                color: '#409EFF'
            },
            showBackground: true,
            backgroundStyle: {
                color: 'rgba(180, 180, 180, 0.2)'
            }
        }]
    }

    myChart.setOption(option)
}

onMounted(() => {
    getData()
    mockChartData()
})
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
