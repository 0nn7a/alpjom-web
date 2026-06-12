import { api } from '@/services/api.ts';
import { API } from '@/utils/constant.ts';

export const commonService = {
  upload: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.upload(API.UPLOAD, formData);
  }
};
