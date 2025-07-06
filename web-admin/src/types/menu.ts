// 菜单项接口
export interface MenuItem {
  _id: string;
  name: string;
  path: string;
  component: string;
  icon: string;
  title: string;
  parentId?: string | null;
  order: number;
  isVisible: boolean;
  requireAdmin: boolean;
  meta?: any;
  children?: MenuItem[];
  createdAt?: string;
  updatedAt?: string;
}

// 创建菜单请求参数
export interface CreateMenuRequest {
  name: string;
  path: string;
  component: string;
  icon?: string;
  title: string;
  parentId?: string | null;
  order?: number;
  isVisible?: boolean;
  requireAdmin?: boolean;
  meta?: any;
}

// 更新菜单请求参数
export interface UpdateMenuRequest extends Partial<CreateMenuRequest> {}

// 菜单树响应
export interface MenuTreeResponse {
  code: number;
  message: string;
  data: MenuItem[];
}

// 菜单列表响应
export interface MenuListResponse {
  code: number;
  message: string;
  data: MenuItem[];
}

// 单个菜单响应
export interface MenuResponse {
  code: number;
  message: string;
  data: MenuItem;
} 