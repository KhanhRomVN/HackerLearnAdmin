import axios, { AxiosResponse } from 'axios';

export const VITE_LOAD_BALANCER_API = import.meta.env.VITE_LOAD_BALANCER_API;
export const VITE_API_GOLANG_CHECK_LIST = import.meta.env.VITE_API_GOLANG_CHECK_LIST;

interface RequestOptions {
  bodyData: RequestData;
  includeAccessToken?: boolean;
}

interface RequestData {
  endpoint: string;
  method: string;
  reqBody?: Record<string, any>;
  accessToken?: string;
}

interface ApiResponse<T = any> {
  data: T | null;
  error?: string;
  status: number;
}

export class LoadBalancerService {
  private storage: Storage = localStorage;
  private cachedAccessToken: string | null = null;
  private tokenExpiryTime: Date | null = null;
  private readonly loadBalancerAPI: string = import.meta.env.VITE_LOAD_BALANCER_API;
  
  private async getAccessToken(): Promise<string | null> {
    try {
      if (
        this.cachedAccessToken &&
        this.tokenExpiryTime &&
        new Date() < this.tokenExpiryTime
      ) {
        return this.cachedAccessToken;
      }

      const token = this.storage.getItem('access_token');
      if (token) {
        this.cachedAccessToken = token;
        this.tokenExpiryTime = new Date(new Date().getTime() + 5 * 60000);
        return token;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting access token:', error);
      return null;
    }
  }

  private async request<T>(options: RequestOptions): Promise<ApiResponse<T>> {
    try {
      const { bodyData, includeAccessToken = true } = options;

      if (!bodyData.endpoint) {
        throw new Error('Endpoint is required');
      }

      let accessToken: string | null = null;
      if (includeAccessToken) {
        accessToken = await this.getAccessToken();
        if (!accessToken) {
          throw new Error('Access token required but not available');
        }
        bodyData.accessToken = accessToken;
      }

      const headers = {
        'Content-Type': 'application/json; charset=utf-8',
      };

      console.debug('Request Data:', bodyData);

      const response: AxiosResponse = await axios.post(
        this.loadBalancerAPI,
        bodyData,
        { 
          headers,
          timeout: 30000,
          maxContentLength: Infinity,
          maxBodyLength: Infinity,
          validateStatus: function (status) {
            return status >= 200 && status < 300;
          }
        }
      );

      return {
        data: response.data,
        status: response.status
      };

    } catch (error: any) {
      console.error('Request error:', error);
      return {
        data: null,
        error: error.message || 'Unknown error occurred',
        status: error.response?.status || 500
      };
    }
  }

  // Public API Methods
  async getPublic<T>(params: { endpoint: string; reqBody?: Record<string, any> }): Promise<ApiResponse<T>> {
    console.log('getPublic', params);
    return this.request<T>({
      bodyData: {
        endpoint: params.endpoint,
        method: 'GETPUBLIC',
        reqBody: params.reqBody
      },
      includeAccessToken: false
    });
  }

  async postPublic<T>(params: { endpoint: string; reqBody: Record<string, any> }): Promise<ApiResponse<T>> {
    console.log('reqBody', params.reqBody);
    return this.request<T>({
      bodyData: {
        endpoint: params.endpoint,
        method: 'POSTPUBLIC',
        reqBody: params.reqBody
      },
      includeAccessToken: false
    });
  }

  async putPublic<T>(params: { endpoint: string; reqBody: Record<string, any> }): Promise<ApiResponse<T>> {
    return this.request<T>({
      bodyData: {
        endpoint: params.endpoint,
        method: 'PUTPUBLIC',
        reqBody: params.reqBody
      },
      includeAccessToken: false
    });
  }

  async deletePublic<T>(params: { endpoint: string; reqBody?: Record<string, any> }): Promise<ApiResponse<T>> {
    return this.request<T>({
      bodyData: {
        endpoint: params.endpoint,
        method: 'DELETEPUBLIC',
        reqBody: params.reqBody
      },
      includeAccessToken: false
    });
  }

  // Private API Methods
  async get<T>(params: { endpoint: string; reqBody?: Record<string, any> }): Promise<ApiResponse<T>> {
    return this.request<T>({
      bodyData: {
        endpoint: params.endpoint,
        method: 'GET',
        reqBody: params.reqBody
      },
      includeAccessToken: true
    });
  }

  async post<T>(params: { endpoint: string; reqBody: Record<string, any> }): Promise<ApiResponse<T>> {
    return this.request<T>({
      bodyData: {
        endpoint: params.endpoint,
        method: 'POST',
        reqBody: params.reqBody
      },
      includeAccessToken: true
    });
  }

  async put<T>(params: { endpoint: string; reqBody: Record<string, any> }): Promise<ApiResponse<T>> {
    return this.request<T>({
      bodyData: {
        endpoint: params.endpoint,
        method: 'PUT',
        reqBody: params.reqBody
      },
      includeAccessToken: true
    });
  }

  async delete<T>(params: { endpoint: string; reqBody?: Record<string, any> }): Promise<ApiResponse<T>> {
    return this.request<T>({
      bodyData: {
        endpoint: params.endpoint,
        method: 'DELETE',
        reqBody: params.reqBody
      },
      includeAccessToken: true
    });
  }
}