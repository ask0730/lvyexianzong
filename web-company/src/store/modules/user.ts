import { defineStore } from 'pinia'
import { login, register, getUserInfo, logout } from '@/api/modules/user'
import type { LoginData, RegisterData } from '@/api/modules/user'

interface UserState {
  token: string
  userInfo: any
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    token: localStorage.getItem('token') || '',
    userInfo: null
  }),
  
  actions: {
    async loginAction(loginData: LoginData) {
      try {
        const res = await login(loginData)
        if (res.code === 200 && res.data?.token) {
          this.token = res.data.token
          localStorage.setItem('token', res.data.token)
          await this.getUserInfoAction()
          return true
        }
        return false
      } catch (error) {
        console.error('登录失败:', error)
        return false
      }
    },

    async registerAction(registerData: RegisterData) {
      try {
        console.log('Store - 发送注册请求:', registerData)
        const res = await register(registerData)
        console.log('Store - 注册响应:', res)
        if (res.code === 201) {
          return true
        }
        throw new Error(res.message || '注册失败')
      } catch (error) {
        console.error('Store - 注册失败:', error)
        throw error
      }
    },

    async getUserInfoAction() {
      try {
        const res = await getUserInfo()
        if (res.code === 200) {
          this.userInfo = res.data
          return true
        }
        return false
      } catch (error) {
        console.error('获取用户信息失败:', error)
        return false
      }
    },

    async logoutAction() {
      try {
        const res = await logout()
        if (res.code === 200) {
          this.token = ''
          this.userInfo = null
          localStorage.removeItem('token')
          return true
        }
        return false
      } catch (error) {
        console.error('登出失败:', error)
        return false
      }
    }
  }
})
