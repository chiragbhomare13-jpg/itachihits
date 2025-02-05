import axios, {
    AxiosError,
    AxiosInstance,
    AxiosRequestConfig,
    AxiosResponse,
    InternalAxiosRequestConfig
} from 'axios';
import serverConfig from '../config/server-config';
import logger from './winston';


// Types for API response
interface ApiResponse<T = any> {
    data: T;
    status: number;
    message: string;
}

// Error response type
interface ApiError {
    message: string;
    code?: string;
    status?: number;
}

// Configuration interface
interface ApiClientConfig {
    baseURL: string;
    apiKey?: string;
    timeout?: number;
    headers?: Record<string, string>;
}

export class ApiClient {
    private readonly api: AxiosInstance;

    constructor(config: ApiClientConfig) {
        this.api = axios.create({
            baseURL: config.baseURL,
            timeout: config.timeout ?? 30000,
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                ...config.headers,
            },
        });

        this.setupInterceptors();
    }

    private setupInterceptors(): void {
        this.api.interceptors.request.use(
            (config: InternalAxiosRequestConfig) => {
                // Add request logging
                console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`);
                return config;
            },
            (error: AxiosError) => {
                console.error('[API Request Error]', error.message);
                return Promise.reject(error);
            }
        );

        // Response interceptor
        this.api.interceptors.response.use(
            (response: AxiosResponse) => {
                // Add response logging
                console.log(`[API Response] ${response.status} ${response.config.url}`);
                return response;
            },
            (error: AxiosError<ApiError>) => {
                this.handleErrorLogging(error);
                return Promise.reject(error);
            }
        );
    }

    private handleErrorLogging(error: AxiosError<ApiError>): void {
        if (error.response) {
            console.error('[API Error]', {
                status: error.response.status,
                url: error.config?.url,
                message: error.response.data?.message || error.message,
            });
        } else if (error.request) {
            console.error('[API Error] No response received', {
                url: error.config?.url,
                message: error.message,
            });
        } else {
            console.error('[API Error] Request configuration error', error.message);
        }
    }

    public async request<T>(config: AxiosRequestConfig): Promise<T> {
        try {
            const response = await this.api.request<T>(config);
            return response.data;
        } catch (error) {
            logger.error("Error [api error]", { error })
            throw this.handleError(error as AxiosError<ApiError>);
        }
    }

    public async get<T>(url: string, config?: Omit<AxiosRequestConfig, 'url' | 'method'>): Promise<T> {
        const response = await this.request<T>({ ...config, method: 'GET', url });
        return response;
    }

    public async post<T>(
        url: string,
        data?: any,
        config?: Omit<AxiosRequestConfig, 'url' | 'method' | 'data'>
    ): Promise<T> {
        const response = await this.request<T>({ ...config, method: 'POST', url, data });
        return response;
    }

    public async put<T>(
        url: string,
        data?: any,
        config?: Omit<AxiosRequestConfig, 'url' | 'method' | 'data'>
    ): Promise<T> {
        const response = await this.request<T>({ ...config, method: 'PUT', url, data });
        return response;
    }

    public async delete<T>(url: string, config?: Omit<AxiosRequestConfig, 'url' | 'method'>): Promise<T> {
        const response = await this.request<T>({ ...config, method: 'DELETE', url });
        return response;
    }

    private handleError(error: AxiosError<ApiError>): Error {
        if (error.response?.data) {
            return new Error(error.response.data.message || 'An error occurred');
        }
        return new Error(error.message || 'Network error');
    }
}

const musicRadioClientApi = () => {
    return new ApiClient({
        baseURL: serverConfig.MUSIC_BOT_BASE_API,
        timeout: 30000,
        headers: {
            'x-token-key': serverConfig.X_TOKEN_KEY,
        }
    });
};

// Export factory function and types
export { ApiResponse, ApiError, ApiClientConfig };