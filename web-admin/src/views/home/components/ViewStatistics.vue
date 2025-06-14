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
        <el-row :gutter="20">
            <el-col :span="24">
                <el-card class="chart-card">
                    <template #header>
                        <div class="card-header">
                            <span>用户农产品点赞折线图</span>
                        </div>
                    </template>
                    <div ref="likeLineChartRef" class="chart"></div>
                </el-card>
            </el-col>
        </el-row>
        <el-row :gutter="20">
            <el-col :span="24">
                <el-card class="chart-card">
                    <template #header>
                        <div class="card-header">
                            <span>天气与农产品点赞关联分析</span>
                        </div>
                    </template>
                    <div ref="weatherSalesChartRef" class="chart"></div>
                </el-card>
            </el-col>
        </el-row>
        <!-- 个性化推荐 -->
        <div class="recommendations-section">
            <h3>为您推荐</h3>
            <div v-if="recommendedProducts.length > 0" class="recommendations-grid">
                <div v-for="item in recommendedProducts" :key="item.id" class="recommendation-item">
                    <!-- ... -->
                </div>
            </div>
            <el-empty v-else description="暂无推荐" />
        </div>

        <!-- 热门推荐 -->
        <div class="recommendations-section">
            <h3>热门推荐</h3>
            <div v-if="hotProducts.length > 0" class="recommendations-grid">
                <div v-for="item in hotProducts" :key="item.id" class="recommendation-item">
                    <!-- ... -->
                </div>
            </div>
            <el-empty v-else description="暂无热门" />
        </div>
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
const likeLineChartRef = ref()
const weatherSalesChartRef = ref()
let viewChart: echarts.ECharts | null = null
let hourlyChart: echarts.ECharts | null = null
let wordCloudChart: echarts.ECharts | null = null
let likeLineChart: echarts.ECharts | null = null
let weatherSalesChart: echarts.ECharts | null = null

const hotProducts = ref<any[]>([])

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

// 初始化点赞折线图
const initLikeLineChart = () => {
    if (likeLineChartRef.value) {
        likeLineChart = echarts.init(likeLineChartRef.value)
    }
}

// 初始化天气与农产品销量/点赞关联分析图表
const initWeatherSalesChart = () => {
    if (weatherSalesChartRef.value) {
        weatherSalesChart = echarts.init(weatherSalesChartRef.value)
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

// 更新点赞折线图数据
const updateLikeLineChart = async () => {
    if (likeLineChart) {
        try {
            const response = await fetch('/data/products.csv')
            const csvText = await response.text()
            const { data } = Papa.parse(csvText, { header: true })
            const titles = data.filter((item: any) => item.title && item.likes).map((item: any) => item.title)
            const likes = data.filter((item: any) => item.title && item.likes).map((item: any) => parseInt(item.likes))
            const option = {
                tooltip: {
                    trigger: 'axis',
                },
                xAxis: {
                    type: 'category',
                    data: titles,
                    axisLabel: {
                        interval: 0,
                        rotate: 30,
                        formatter: (value: string) => (value.length > 8 ? value.substring(0, 8) + '...' : value),
                    },
                },
                yAxis: {
                    type: 'value',
                    name: '点赞量',
                },
                series: [
                    {
                        name: '点赞量',
                        type: 'line',
                        data: likes,
                        smooth: true,
                        symbol: 'circle',
                        symbolSize: 8,
                        lineStyle: {
                            width: 3,
                            color: '#409EFF',
                        },
                        itemStyle: {
                            color: '#409EFF',
                        },
                        areaStyle: {
                            color: 'rgba(64,158,255,0.15)',
                        },
                    },
                ],
            }
            likeLineChart.setOption(option)
        } catch (e) {
            console.error('点赞折线图CSV加载失败', e)
        }
    }
}

// 更新天气与农产品销量/点赞关联分析图表数据
const updateWeatherSalesChart = async () => {
    if (!weatherSalesChart && weatherSalesChartRef.value) {
        weatherSalesChart = echarts.init(weatherSalesChartRef.value)
    }
    const response = await fetch('/data/products_weather.csv')
    const csvText = await response.text()
    const { data } = Papa.parse(csvText, { header: true })

    // 获取所有日期、产品
    const dates = [...new Set(data.map((item: any) => item.date))]
    const products = [...new Set(data.map((item: any) => item.product))]

    // 构造每个产品的销量序列（如需点赞量，把 sales 换成 likes）
    const series = products.map((product) => ({
        name: product,
        type: 'line',
        yAxisIndex: 0,
        data: dates.map((date) => {
            const found = data.find((item: any) => item.date === date && item.product === product)
            return found ? Number(found.sales) : 0
        }),
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
    }))

    // 温度序列
    const tempSeries = {
        name: '最高温度',
        type: 'bar',
        yAxisIndex: 1,
        data: dates.map((date) => {
            // 取当天第一个产品的温度即可
            const found = data.find((item: any) => item.date === date)
            return found ? Number(found.temp) : 0
        }),
        barWidth: 20,
        itemStyle: { color: '#F56C6C' },
    }

    const option = {
        tooltip: { trigger: 'axis' },
        legend: { data: [...products, '最高温度'] },
        xAxis: { type: 'category', data: dates },
        yAxis: [
            { type: 'value', name: '销量', minInterval: 1 },
            { type: 'value', name: '温度(℃)', position: 'right' },
        ],
        series: [...series, tempSeries],
    }
    weatherSalesChart.setOption(option)
}

// 自动刷新数据
let refreshTimer: number
const startAutoRefresh = () => {
    refreshTimer = window.setInterval(() => {
        updateViewChart()
        updateHourlyChart()
        updateWordCloudChart()
        updateLikeLineChart()
        updateWeatherSalesChart()
    }, 5 * 60 * 1000) // 每5分钟刷新一次
}

// 获取热门产品（按点赞量排序，取前3个）
const getHotProducts = (count = 3) => {
    return [...looplist.value].sort((a, b) => b.likes - a.likes).slice(0, count)
}

// 融合协同过滤和热门推荐，去重
const getHybridRecommendations = (productId: number, num = 3) => {
    const recommender = new Recommender(looplist.value)
    const cfRecs = recommender.getRecommendations(productId, num)
    const hotRecs = getHotProducts(num)
    // 融合去重（优先协同过滤）
    const all = [...cfRecs, ...hotRecs]
    const unique = []
    const ids = new Set()
    for (const item of all) {
        if (!ids.has(item.id) && item.id !== productId) {
            unique.push(item)
            ids.add(item.id)
        }
        if (unique.length >= num * 2) break
    }
    return unique
}

onMounted(() => {
    initViewChart()
    initHourlyChart()
    initWordCloudChart()
    initLikeLineChart()
    initWeatherSalesChart()
    updateViewChart()
    updateHourlyChart()
    updateWordCloudChart()
    updateLikeLineChart()
    updateWeatherSalesChart()
    startAutoRefresh()

    window.addEventListener('resize', () => {
        viewChart?.resize()
        hourlyChart?.resize()
        wordCloudChart?.resize()
        likeLineChart?.resize()
        weatherSalesChart?.resize()
    })

    hotProducts.value = getHotProducts(3)
})

onUnmounted(() => {
    if (refreshTimer) {
        clearInterval(refreshTimer)
    }
    viewChart?.dispose()
    hourlyChart?.dispose()
    wordCloudChart?.dispose()
    likeLineChart?.dispose()
    weatherSalesChart?.dispose()
})

// 推荐更新时也可融合
const updateRecommendations = (product: any) => {
    recommendedProducts.value = getHybridRecommendations(product.id, 3)
}
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

.recommendations-section {
    margin-top: 20px;
}

.recommendations-grid {
    display: flex;
    flex-wrap: wrap;
}

.recommendation-item {
    width: calc(33.33% - 20px);
    margin: 10px;
}
</style>