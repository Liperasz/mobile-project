import axios, { AxiosInstance, AxiosResponse } from 'axios';

// cliente axios — viacep

const apiClient: AxiosInstance = axios.create({
    baseURL: 'https://viacep.com.br/ws',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

apiClient.interceptors.request.use(
    (config) => {
        console.log(`[API] Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
    },
    (error) => {
        console.error('[API] Request Error:', error);
        return Promise.reject(error);
    }
);

apiClient.interceptors.response.use(
    (response) => {
        console.log(`[API] Response: ${response.status} ${response.config.url}`);
        return response;
    },
    (error) => {
        console.error('[API] Response Error:', error.message);
        return Promise.reject(error);
    }
);

// tipos

export type ViaCepResponse = {
    cep: string;
    logradouro: string;
    complemento: string;
    bairro: string;
    localidade: string;
    uf: string;
    erro?: boolean;
};

// serviço

export const apiService = {
    // busca o endereço a partir de um CEP
    // usa a API pública viacep (https://viacep.com.br)
    async getAddressByCep(cep: string): Promise<ViaCepResponse> {
        // remove traços e espaços do CEP
        const cleanCep = cep.replace(/\D/g, '');

        if (cleanCep.length !== 8) {
            throw new Error('CEP deve ter 8 dígitos.');
        }

        const response: AxiosResponse<ViaCepResponse> = await apiClient.get(
            `/${cleanCep}/json/`
        );

        if (response.data.erro) {
            throw new Error('CEP não encontrado. Verifique e tente novamente.');
        }

        return response.data;
    },
};

export default apiClient;
