import { AUTH_TOKEN } from '@lib/constants';
import axios from 'axios';
import Cookies from 'js-cookie';
import pickBy from 'lodash/pickBy';
import Router from 'next/router';
import { getToken } from './get-token';
import { MOCK_ENABLED, getMockData } from '@framework/mock-data';

const request = axios.create({
  baseURL: process.env.NEXT_PUBLIC_REST_API_ENDPOINT || 'http://localhost:8000/api', // fallback to prevent crash
  timeout: 300000000,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

// Change request data/error here
request.interceptors.request.use(
  (config) => {
    const token = getToken();
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token ? token : ''}`,
    };
    return config;
  },
  (error) => {
    if (
      (error.response && error.response.status === 401) ||
      (error.response && error.response.status === 403) ||
      (error.response &&
        error.response.data.message === 'CHAWKBAZAR_ERROR.NOT_AUTHORIZED')
    ) {
      Cookies.remove(AUTH_TOKEN);
      Router.reload();
    }
    return Promise.reject(error);
  }
);

export class HttpClient {
  static async get<T>(url: string, params?: unknown) {
    if (MOCK_ENABLED) {
      const mockData = getMockData(url, params);
      if (mockData !== null) return mockData as T;
    }
    const response = await request.get<T>(url, { params });
    return response.data;
  }

  static async post<T>(url: string, data: unknown, options?: any) {
    if (MOCK_ENABLED) {
      const mockData = getMockData(url, data);
      if (mockData !== null) return mockData as T;
      // For auth/mutation endpoints, return a safe default
      return {} as T;
    }
    const response = await request.post<T>(url, data, options);
    return response.data;
  }

  static async put<T>(url: string, data: unknown) {
    if (MOCK_ENABLED) return {} as T;
    const response = await request.put<T>(url, data);
    return response.data;
  }

  static async delete<T>(url: string) {
    if (MOCK_ENABLED) return {} as T;
    const response = await request.delete<T>(url);
    return response.data;
  }

  static stringifySearchQuery(values: any) {
    const parsedValues = pickBy(values);
    return Object.keys(parsedValues)
      .map((k) => {
        if (k === 'type') {
          return `${k}.slug:${parsedValues[k]};`;
        }
        if (k === 'category') {
          return `categories.slug:${parsedValues[k]};`;
        }
        if (k === 'tags') {
          return `tags.slug:${parsedValues[k]};`;
        }
        if (k === 'variations') {
          return `variations.value:${parsedValues[k]};`;
        }
        return `${k}:${parsedValues[k]};`;
      })
      .join('')
      .slice(0, -1);
  }
}


export default request;
