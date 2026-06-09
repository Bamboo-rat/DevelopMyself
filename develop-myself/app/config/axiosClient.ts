import axios from 'axios';

const axiosClient = axios.create({
  baseURL: 'http://localhost:8080/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Interceptors cho request
axiosClient.interceptors.request.use(
  (config) => {
    // Nếu có token trong localStorage thì đính kèm vào header
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptors cho response
axiosClient.interceptors.response.use(
  (response) => {
    // Trả về data trực tiếp
    if (response && response.data) {
      return response.data;
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Khi mã lỗi là 401 (Unauthorized) và request chưa được thử lại
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      // Tránh vòng lặp vô hạn nếu API refresh hoặc login cũng bị 401
      if (originalRequest.url?.includes('/auth/login') || originalRequest.url?.includes('/auth/refresh')) {
        return Promise.reject(error.response?.data || error);
      }

      // Đang có request khác gọi refresh token
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      // Bắt đầu quá trình refresh
      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        isRefreshing = false;
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(error.response?.data || error);
      }

      try {
        const { data } = await axios.post(`http://localhost:8080/api/v1/auth/refresh?refreshToken=${refreshToken}`);

        // Cập nhật token mới (Backend trả về ApiResponse bọc bên ngoài)
        const newAccessToken = data.data.token;
        const newRefreshToken = data.data.refreshToken;

        localStorage.setItem('token', newAccessToken);
        localStorage.setItem('refreshToken', newRefreshToken);

        axiosClient.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        // Chạy lại các request đang nằm chờ
        processQueue(null, newAccessToken);

        // Gửi lại request ban đầu
        return axiosClient(originalRequest);
      } catch (refreshError) {
        // Refresh thất bại (hết hạn refreshToken, etc.)
        processQueue(refreshError, null);
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Xử lý lỗi tập trung
    if (error.response && error.response.data) {
      return Promise.reject(error.response.data);
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
