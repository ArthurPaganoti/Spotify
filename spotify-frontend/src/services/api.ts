import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
  baseURL: 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor com tratamento robusto de erros
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<any>) => {
    const errorCode = error.response?.data?.errorCode;
    const errorMessage = error.response?.data?.message;
    const statusCode = error.response?.status;

    // Tratamento específico por código de status
    switch (statusCode) {
      case 400:
        // Bad Request
        if (errorCode === 'DUPLICATE_MUSIC') {
          toast.error('Esta música já existe no sistema!');
        } else if (errorCode === 'VALIDATION_ERROR') {
          toast.error('Dados inválidos. Verifique os campos do formulário.');
        } else {
          toast.error(errorMessage || 'Requisição inválida');
        }
        break;

      case 401:
        // Unauthorized
        toast.error('Sessão expirada. Faça login novamente.');
        localStorage.removeItem('token');
        window.location.href = '/login';
        break;

      case 403:
        // Forbidden
        if (errorCode === 'FORBIDDEN') {
          toast.error(errorMessage || 'Você não tem permissão para esta ação.');
        } else {
          toast.error('Acesso negado');
        }
        break;

      case 404:
        // Not Found
        if (errorCode === 'MUSIC_NOT_FOUND') {
          toast.error('Música não encontrada');
        } else if (errorCode === 'USER_NOT_FOUND') {
          toast.error('Usuário não encontrado');
        } else {
          toast.error(errorMessage || 'Recurso não encontrado');
        }
        break;

      case 409:
        // Conflict
        toast.error(errorMessage || 'Conflito de dados');
        break;

      case 429:
        // Too Many Requests
        toast.error('Muitas requisições. Aguarde um momento e tente novamente.', {
          duration: 5000,
          icon: '⏱️',
        });
        break;

      case 500:
        // Internal Server Error
        toast.error('Erro no servidor. Tente novamente mais tarde.');
        console.error('Server error:', error.response?.data);
        break;

      case 503:
        // Service Unavailable
        toast.error('Serviço temporariamente indisponível');
        break;

      default:
        // Network errors or other issues
        if (error.message === 'Network Error') {
          toast.error('Erro de conexão. Verifique sua internet.');
        } else if (error.code === 'ECONNABORTED') {
          toast.error('Tempo de requisição esgotado. Tente novamente.');
        } else {
          toast.error(errorMessage || 'Erro inesperado. Tente novamente.');
        }
    }

    return Promise.reject(error);
  }
);

export default api;
