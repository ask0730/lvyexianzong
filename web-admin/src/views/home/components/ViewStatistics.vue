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
        <el-row :gutter="20">
            <el-col :span="24">
                <el-card class="chart-card">
                    <template #header>
                        <div class="card-header">
                            <span>农产品点赞量词云</span>
                        </div>
                    </template>
                    <div ref="wordCloudChartRef" class="chart"></div>
                </el-card>
            </el-col>
        </el-row>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import 'echarts-wordcloud'
import { getViewStatistics, getHourlyViewDistribution } from '@/api/viewRecord'
import Papa from 'papaparse'

const viewChartRef = ref()
const hourlyChartRef = ref()
const wordCloudChartRef = ref()
let viewChart: echarts.ECharts | null = null
let hourlyChart: echarts.ECharts | null = null
let wordCloudChart: echarts.ECharts | null = null

// 注册词云图组件
echarts.registerTheme('wordcloud', {
    series: {
        wordCloud: {
            type: 'wordCloud',
            shape: 'circle',
            left: 'center',
            top: 'center',
            width: '90%',
            height: '90%',
            right: null,
            bottom: null,
            sizeRange: [14, 60],
            rotationRange: [-45, 45],
            rotationStep: 45,
            gridSize: 8,
            drawOutOfBound: false,
            textStyle: {
                fontFamily: 'sans-serif',
                fontWeight: 'bold',
                color: function () {
                    const colors = [
                        '#409EFF', // Element Plus 主题蓝
                        '#67C23A', // Element Plus 成功绿
                        '#E6A23C', // Element Plus 警告黄
                        '#F56C6C', // Element Plus 危险红
                        '#909399', // Element Plus 信息灰
                    ]
                    return colors[Math.floor(Math.random() * colors.length)]
                },
            },
            emphasis: {
                focus: 'self',
                textStyle: {
                    shadowBlur: 10,
                    shadowColor: '#333',
                },
            },
        },
    },
})

// 初始化浏览量排行图表
const initViewChart = () => {
    if (viewChartRef.value) {
        viewChart = echarts.init(viewChartRef.value)
    }
}

// 初始化24小时分布图表
const initHourlyChart = () => {
    if (hourlyChartRef.value) {
        hourlyChart = echarts.init(hourlyChartRef.value)
    }
}

// 初始化词云图
const initWordCloudChart = () => {
    if (wordCloudChartRef.value) {
        wordCloudChart = echarts.init(wordCloudChartRef.value)
    }
}

// 更新浏览量排行图表数据
const updateViewChart = async () => {
    try {
        const res = await getViewStatistics()
        if (res.code === 0 && viewChart) {
            const option = {
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                        type: 'shadow',
                    },
                },
                grid: {
                    left: '3%',
                    right: '4%',
                    bottom: '3%',
                    containLabel: true,
                },
                xAxis: {
                    type: 'value',
                    boundaryGap: [0, 0.01],
                },
                yAxis: {
                    type: 'category',
                    data: res.data.titles.reverse(),
                    axisLabel: {
                        interval: 0,
                        formatter: (value: string) => {
                            return value.length > 10 ? value.substring(0, 10) + '...' : value
                        },
                    },
                },
                series: [
                    {
                        name: '浏览量',
                        type: 'bar',
                        data: res.data.counts.reverse(),
                    },
                ],
            }
            viewChart.setOption(option)
        }
    } catch (error) {
        console.error('获取浏览量统计数据失败:', error)
    }
}

// 更新24小时分布图表数据
const updateHourlyChart = async () => {
    try {
        const res = await getHourlyViewDistribution()
        if (res.code === 0 && hourlyChart) {
            const option = {
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                        type: 'line',
                    },
                },
                grid: {
                    left: '3%',
                    right: '4%',
                    bottom: '3%',
                    containLabel: true,
                },
                xAxis: {
                    type: 'category',
                    boundaryGap: false,
                    data: res.data.hours,
                },
                yAxis: {
                    type: 'value',
                },
                series: [
                    {
                        name: '浏览量',
                        type: 'line',
                        smooth: true,
                        areaStyle: {},
                        data: res.data.counts,
                    },
                ],
            }
            hourlyChart.setOption(option)
        }
    } catch (error) {
        console.error('获取24小时分布数据失败:', error)
    }
}

// 更新词云图数据
const updateWordCloudChart = async () => {
    if (wordCloudChart) {
        // 动态读取 CSV 数据
        try {
            const response = await fetch('/data/products.csv')
            const csvText = await response.text()
            const { data } = Papa.parse(csvText, { header: true })
            // 过滤有效数据
            const wordCloudData = data
                .filter((item) => item.title && item.likes)
                .map((item) => ({
                    name: item.title,
                    value: parseInt(item.likes),
                }))
                .sort((a, b) => b.value - a.value)
                .slice(0, 30) // 只取前30个，防止词云过多

            const option = {
                tooltip: {
                    show: true,
                    formatter: function (params) {
                        return `${params.name}: ${params.value} 点赞`
                    },
                },
                series: [
                    {
                        type: 'wordCloud',
                        shape: 'circle',
                        left: 'center',
                        top: 'center',
                        width: '90%',
                        height: '90%',
                        sizeRange: [18, 60],
                        rotationRange: [-45, 45],
                        rotationStep: 45,
                        gridSize: 8,
                        drawOutOfBound: false,
                        textStyle: {
                            fontFamily: 'sans-serif',
                            fontWeight: 'bold',
                            color: function () {
                                const colors = ['#409EFF', '#67C23A', '#E6A23C', '#F56C6C', '#909399']
                                return colors[Math.floor(Math.random() * colors.length)]
                            },
                        },
                        emphasis: {
                            focus: 'self',
                            textStyle: {
                                shadowBlur: 10,
                                shadowColor: '#333',
                            },
                        },
                        data: wordCloudData,
                    },
                ],
            }
            wordCloudChart.setOption(option)
        } catch (e) {
            console.error('词云CSV加载失败', e)
        }
    }
}

// 自动刷新数据
let refreshTimer: number
const startAutoRefresh = () => {
    refreshTimer = window.setInterval(() => {
        updateViewChart()
        updateHourlyChart()
        updateWordCloudChart()
    }, 5 * 60 * 1000) // 每5分钟刷新一次
}

onMounted(() => {
    initViewChart()
    initHourlyChart()
    initWordCloudChart()
    updateViewChart()
    updateHourlyChart()
    updateWordCloudChart()
    startAutoRefresh()

    window.addEventListener('resize', () => {
        viewChart?.resize()
        hourlyChart?.resize()
        wordCloudChart?.resize()
    })
})

onUnmounted(() => {
    if (refreshTimer) {
        clearInterval(refreshTimer)
    }
    viewChart?.dispose()
    hourlyChart?.dispose()
    wordCloudChart?.dispose()
})
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