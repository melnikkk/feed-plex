import { request } from './apiClient';

interface HealthResponse {
  status: string;
}

export const healthKeys = {
  all: ['health'] as const,
};

export const getHealth = () => request<HealthResponse>('/health');
