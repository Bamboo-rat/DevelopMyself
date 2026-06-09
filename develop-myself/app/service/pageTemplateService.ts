import axiosClient from '~/config/axiosClient';

export interface PageTemplateResponse {
  id: string;
  name: string;
  description: string;
  pageType: string;
  defaultContent: any;
  isSystem: boolean;
}

export const pageTemplateService = {
  // Lấy tất cả các mẫu template
  getAvailableTemplates: () => {
    return axiosClient.get('/page-templates');
  },

  // Lấy mẫu template theo loại page
  getTemplatesByType: (pageType: string) => {
    return axiosClient.get(`/page-templates/type/${pageType}`);
  }
};
