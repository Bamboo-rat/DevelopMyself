import axiosClient from '~/config/axiosClient';

export interface PageTreeResponse {
  id: string;
  title: string;
  icon?: string;
  pageType: string;
  sortOrder: number;
  depth: number;
  children: PageTreeResponse[];
}

export interface CreatePageRequest {
  title: string;
  parentId?: string | null;
  pageType?: string;
  icon?: string;
}

export const pageService = {
  // Lấy cây thư mục (Page Tree)
  getPageTree: () => {
    return axiosClient.get('/pages/tree');
  },

  // Tạo trang mới
  createPage: (data: CreatePageRequest) => {
    return axiosClient.post('/pages', data);
  },

  // Đổi tên trang
  updateTitle: (id: string, title: string) => {
    return axiosClient.patch(`/pages/${id}/title`, { title });
  },

  // Xoá trang
  deletePage: (id: string) => {
    return axiosClient.delete(`/pages/${id}`);
  },

  // Lấy chi tiết trang
  getPageDetail: (id: string) => {
    return axiosClient.get(`/pages/${id}`);
  },

  // Cập nhật nội dung trang
  updateContent: (id: string, content: any) => {
    return axiosClient.patch(`/pages/${id}/content`, { content });
  },

  // Cập nhật Icon trang
  updateIcon: (id: string, icon: string) => {
    return axiosClient.patch(`/pages/${id}/icon`, { icon });
  },

  // Cập nhật loại trang
  updatePageType: (id: string, pageType: string) => {
    return axiosClient.patch(`/pages/${id}/type`, { pageType });
  }
};
