
import axios from 'axios';
import { emitSubscriptionExpired } from './subscriptionBus';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "https://systembackendsablonetapi.ir/api",
  headers: {
    "Content-Type": "application/json",
    "Cache-Control": "no-cache",
    "Pragma": "no-cache",
  },
});

api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // جلوگیری از کش شدن با یک پارامتر یکتا روی هر درخواست GET
  if (config.method === 'get') {
    config.params = { ...config.params, _t: Date.now() };
  }
  return config;
});

// مسیرهایی که پیام «اشتراک تمام شده» برایشان معنی ندارد
const EXPIRED_IGNORED = ['/subscription', '/auth'];

// اگر سرور بگوید اشتراک تمام شده، به‌جای خطای خام یک پیام دوستانه (SubscriptionExpiredPrompt) نشان می‌دهیم
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const res = error?.response;
    const method = (error?.config?.method || 'get').toLowerCase();
    const url = error?.config?.url || '';
    if (
      res?.status === 403 &&
      res?.data?.code === 'SUBSCRIPTION_EXPIRED' &&
      method !== 'get' &&
      !EXPIRED_IGNORED.some((p) => url.startsWith(p))
    ) {
      error.isSubscriptionExpired = true;
      emitSubscriptionExpired();
    }
    return Promise.reject(error);
  }
);

export default api;
