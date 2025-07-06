<template>
    <div class="virtual-table-container" ref="containerRef">
        <!-- 搜索和工具栏 -->
        <div v-if="showToolbar" class="virtual-table-toolbar">
            <div class="toolbar-left">
                <el-input v-if="showSearch" v-model="searchKeyword" placeholder="搜索..." prefix-icon="Search" clearable @input="handleSearch" style="width: 300px;" />
            </div>
            <div class="toolbar-right">
                <el-button @click="scrollToTop" :icon="ArrowUp" circle />
                <el-button @click="refresh" :icon="Refresh" circle />
            </div>
        </div>

        <!-- 表格头部 -->
        <div class="virtual-table-header">
            <div v-for="column in visibleColumns" :key="column.prop || column.label" class="virtual-table-header-cell" :style="{ width: column.width || 'auto', minWidth: column.minWidth || 'auto' }" @click="handleSort(column)">
                <span>{{ column.label }}</span>
                <el-icon v-if="column.sortable !== false" class="sort-icon">
                    <ArrowUp v-if="sortColumn === column.prop && sortOrder === 'asc'" />
                    <ArrowDown v-else-if="sortColumn === column.prop && sortOrder === 'desc'" />
                    <Sort v-else />
                </el-icon>
            </div>
        </div>

        <!-- 表格主体 -->
        <div class="virtual-table-body" ref="bodyRef" @scroll="handleScroll">
            <!-- 加载状态 -->
            <div v-if="loading" class="loading-overlay">
                <el-loading-spinner />
                <span>加载中...</span>
            </div>

            <!-- 空状态 -->
            <div v-else-if="filteredData.length === 0" class="empty-state">
                <el-empty description="暂无数据" />
            </div>

            <!-- 虚拟滚动内容 -->
            <template v-else>
                <div class="virtual-table-phantom" :style="{ height: totalHeight + 'px' }"></div>

                <div class="virtual-table-content" :style="{ transform: `translateY(${offsetY}px)` }">
                    <div v-for="(item, index) in visibleData" :key="getItemKey(item, startIndex + index)" class="virtual-table-row" :style="{ height: rowHeight + 'px' }" @click="handleRowClick(item, startIndex + index)">
                        <div v-for="column in visibleColumns" :key="column.prop || column.label" class="virtual-table-cell" :style="{ width: column.width || 'auto', minWidth: column.minWidth || 'auto' }">
                            <template v-if="column.slot">
                                <slot :name="column.slot" :row="item" :index="startIndex + index"></slot>
                            </template>
                            <template v-else>
                                <span :title="getCellValue(item, column.prop)">{{ getCellValue(item, column.prop) }}</span>
                            </template>
                        </div>
                    </div>
                </div>
            </template>
        </div>

        <!-- 分页信息 -->
        <div v-if="showPaginationInfo" class="pagination-info">显示 {{ startIndex + 1 }}-{{ Math.min(endIndex, filteredData.length) }} 条，共 {{ filteredData.length }} 条</div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { ArrowUp, ArrowDown, Sort, Search, Refresh } from '@element-plus/icons-vue'

interface Column {
    prop?: string
    label: string
    width?: string
    minWidth?: string
    slot?: string
    sortable?: boolean
    searchable?: boolean
}

interface Props {
    data: any[]
    columns: Column[]
    rowHeight?: number
    bufferSize?: number
    itemKey?: string | ((item: any, index: number) => string | number)
    showToolbar?: boolean
    showSearch?: boolean
    showPaginationInfo?: boolean
    loading?: boolean
    searchable?: boolean
    sortable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
    rowHeight: 50,
    bufferSize: 5,
    itemKey: 'id',
    showToolbar: true,
    showSearch: true,
    showPaginationInfo: true,
    loading: false,
    searchable: true,
    sortable: true,
})

const emit = defineEmits<{
    rowClick: [item: any, index: number]
    sort: [column: string, order: 'asc' | 'desc']
    search: [keyword: string]
}>()

const containerRef = ref<HTMLElement>()
const bodyRef = ref<HTMLElement>()
const scrollTop = ref(0)
const containerHeight = ref(0)
const searchKeyword = ref('')
const sortColumn = ref('')
const sortOrder = ref<'asc' | 'desc'>('asc')

// 过滤后的数据
const filteredData = computed(() => {
    let data = props.data

    // 搜索过滤
    if (searchKeyword.value && props.searchable) {
        const keyword = searchKeyword.value.toLowerCase()
        data = data.filter((item) => {
            return props.columns.some((column) => {
                if (column.searchable === false) return false
                const value = getCellValue(item, column.prop)
                return String(value).toLowerCase().includes(keyword)
            })
        })
    }

    // 排序
    if (sortColumn.value && props.sortable) {
        data = [...data].sort((a, b) => {
            const aValue = getCellValue(a, sortColumn.value)
            const bValue = getCellValue(b, sortColumn.value)

            if (typeof aValue === 'number' && typeof bValue === 'number') {
                return sortOrder.value === 'asc' ? aValue - bValue : bValue - aValue
            }

            const aStr = String(aValue).toLowerCase()
            const bStr = String(bValue).toLowerCase()

            if (sortOrder.value === 'asc') {
                return aStr.localeCompare(bStr)
            } else {
                return bStr.localeCompare(aStr)
            }
        })
    }

    return data
})

// 可见列
const visibleColumns = computed(() => {
    return props.columns.filter((column) => column.prop !== undefined || column.slot)
})

// 计算总高度
const totalHeight = computed(() => filteredData.value.length * props.rowHeight)

// 计算可见区域的起始和结束索引
const startIndex = computed(() => {
    const start = Math.floor(scrollTop.value / props.rowHeight)
    return Math.max(0, start - props.bufferSize)
})

const endIndex = computed(() => {
    const end = Math.ceil((scrollTop.value + containerHeight.value) / props.rowHeight)
    return Math.min(filteredData.value.length, end + props.bufferSize)
})

// 计算可见数据
const visibleData = computed(() => {
    return filteredData.value.slice(startIndex.value, endIndex.value)
})

// 计算偏移量
const offsetY = computed(() => startIndex.value * props.rowHeight)

// 获取单元格值
const getCellValue = (item: any, prop?: string) => {
    if (!prop) return ''
    return prop.split('.').reduce((obj, key) => obj?.[key], item) || ''
}

// 获取项目键值
const getItemKey = (item: any, index: number) => {
    if (typeof props.itemKey === 'function') {
        return props.itemKey(item, index)
    }
    return item[props.itemKey] || index
}

// 处理滚动事件
const handleScroll = (e: Event) => {
    const target = e.target as HTMLElement
    scrollTop.value = target.scrollTop
}

// 处理搜索
const handleSearch = () => {
    emit('search', searchKeyword.value)
}

// 处理排序
const handleSort = (column: Column) => {
    if (column.sortable === false || !props.sortable) return

    if (sortColumn.value === column.prop) {
        sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
    } else {
        sortColumn.value = column.prop || ''
        sortOrder.value = 'asc'
    }

    emit('sort', sortColumn.value, sortOrder.value)
}

// 处理行点击
const handleRowClick = (item: any, index: number) => {
    emit('rowClick', item, index)
}

// 更新容器高度
const updateContainerHeight = () => {
    if (containerRef.value) {
        const toolbarHeight = props.showToolbar ? 60 : 0
        const headerHeight = 50
        const paginationHeight = props.showPaginationInfo ? 40 : 0
        containerHeight.value = containerRef.value.clientHeight - toolbarHeight - headerHeight - paginationHeight
    }
}

// 滚动到指定索引
const scrollToIndex = (index: number) => {
    if (bodyRef.value) {
        const scrollTop = index * props.rowHeight
        bodyRef.value.scrollTop = scrollTop
    }
}

// 滚动到顶部
const scrollToTop = () => {
    if (bodyRef.value) {
        bodyRef.value.scrollTop = 0
    }
}

// 刷新
const refresh = () => {
    searchKeyword.value = ''
    sortColumn.value = ''
    sortOrder.value = 'asc'
    scrollToTop()
}

// 暴露方法
defineExpose({
    scrollToIndex,
    scrollToTop,
    refresh,
    searchKeyword,
})

onMounted(() => {
    nextTick(() => {
        updateContainerHeight()
    })
    window.addEventListener('resize', updateContainerHeight)
})

onUnmounted(() => {
    window.removeEventListener('resize', updateContainerHeight)
})

watch(
    () => props.data,
    () => {
        nextTick(() => {
            updateContainerHeight()
        })
    }
)
</script>

<style scoped lang="scss">
.virtual-table-container {
    border: 1px solid #ebeef5;
    border-radius: 8px;
    overflow: hidden;
    background: white;
}

.virtual-table-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    background: #f8f9fa;
    border-bottom: 1px solid #ebeef5;
}

.toolbar-left {
    display: flex;
    align-items: center;
    gap: 12px;
}

.toolbar-right {
    display: flex;
    align-items: center;
    gap: 8px;
}

.virtual-table-header {
    display: flex;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-bottom: 1px solid #ebeef5;
    position: sticky;
    top: 0;
    z-index: 1;
}

.virtual-table-header-cell {
    padding: 16px 12px;
    font-weight: 600;
    color: white;
    font-size: 14px;
    border-right: 1px solid rgba(255, 255, 255, 0.2);
    display: flex;
    align-items: center;
    justify-content: space-between;
    cursor: pointer;
    transition: background-color 0.2s;

    &:hover {
        background-color: rgba(255, 255, 255, 0.1);
    }

    &:last-child {
        border-right: none;
    }
}

.sort-icon {
    margin-left: 4px;
    font-size: 12px;
}

.virtual-table-body {
    position: relative;
    overflow-y: auto;
    height: 400px;
}

.loading-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.9);
    z-index: 10;
    gap: 12px;
    color: #606266;
}

.empty-state {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 5;
}

.virtual-table-phantom {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    z-index: -1;
}

.virtual-table-content {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
}

.virtual-table-row {
    display: flex;
    border-bottom: 1px solid #ebeef5;
    transition: all 0.2s;
    cursor: pointer;

    &:nth-child(even) {
        background-color: #fafafa;
    }

    &:hover {
        background-color: #e6f7ff !important;
        transform: translateX(2px);
    }

    &:last-child {
        border-bottom: none;
    }
}

.virtual-table-cell {
    padding: 16px 12px;
    font-size: 14px;
    color: #606266;
    border-right: 1px solid #ebeef5;
    display: flex;
    align-items: center;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;

    &:last-child {
        border-right: none;
    }
}

.pagination-info {
    padding: 12px 16px;
    background: #f8f9fa;
    border-top: 1px solid #ebeef5;
    text-align: center;
    color: #606266;
    font-size: 12px;
}

// 自定义滚动条样式
.virtual-table-body::-webkit-scrollbar {
    width: 8px;
}

.virtual-table-body::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
}

.virtual-table-body::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 4px;

    &:hover {
        background: #a8a8a8;
    }
}
</style> 