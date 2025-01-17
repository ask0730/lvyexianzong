import request from '../index'

export interface LoginData {
  username: string
  password: string
}

export interface RegisterData extends LoginData {
  email: string
}

export const login = (data: LoginData) => {
  return request({
    url: '/user/login',
    method: 'post',
    data
  })
}

export const register = (data: RegisterData) => {
  return request({
    url: '/user/register',
    method: 'post',
    data
  })
}

export const getUserInfo = () => {
  return request({
    url: '/user/info',
    method: 'get'
  })
}

export const logout = () => {
  return request({
    url: '/user/logout',
    method: 'post'
  })
}

// 更新用户资料
export const updateUserProfile = (data: {
  email?: string
  gender?: number
  introduction?: string
}) => {
  return request({
    url: '/user/profile',
    method: 'put',
    data
  })
}

// 修改密码
export const changeUserPassword = (data: {
  currentPassword: string
  newPassword: string
}) => {
  return request({
    url: '/user/password',
    method: 'put',
    data
  })
}
