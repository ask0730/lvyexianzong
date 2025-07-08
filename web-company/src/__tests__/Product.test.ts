import { mount } from '@vue/test-utils'
import Product from '../views/Product.vue'
import { nextTick } from 'vue'
import { describe, it, expect, vi } from 'vitest'

describe('Product.vue', () => {
  it('能正确渲染产品列表', async () => {
    // mock setup，避免真实的CSV加载
    vi.spyOn(Product, 'setup').mockImplementation(() => {
      const looplist = [
        { id: 1, title: '苹果', introduction: '新鲜苹果', detail: '红富士', origin: '山东', price: 5, likes: 10, isLiked: false, likeLoading: false, cover: 'apple.jpg', publishTime: '2024-01-01' },
        { id: 2, title: '橙子', introduction: '甜橙', detail: '赣南脐橙', origin: '江西', price: 6, likes: 8, isLiked: false, likeLoading: false, cover: 'orange.jpg', publishTime: '2024-01-02' }
      ]
      return {
        looplist,
        filteredProducts: looplist,
        searchQuery: '',
        sortType: 'publish',
        recommendedProducts: [],
        selectedProduct: null
      }
    })

    const wrapper = mount(Product)
    await nextTick()
    expect(wrapper.findAll('.product-item').length).toBe(2)
    expect(wrapper.find('.product-title').text()).toContain('苹果')
  })
}) 