import { api } from '@/services/api.ts';
import { API } from '@/utils/constant.ts';
import type { ApiResponse } from '@/types/common.ts';
import type { Profile } from '@/types/profile.ts';

export const profileService = {
  profile: (username: string): Promise<ApiResponse<Profile>> =>
    api.get(`${API.PROFILE.BASE}/${username}`)
};
