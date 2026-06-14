import { api } from '@/services/api.ts';
import { API } from '@/utils/constant.ts';

export const cloudService = {
  upload: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.upload(API.CLOUD.UPLOAD, formData);
  }
};
