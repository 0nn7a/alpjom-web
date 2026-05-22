// 統一回應格式
export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

// 使用 class 是為了能夠 err instanceof ApiError
// 實作 ApiResponse 告訴 TS 保證擁有該介面的所有屬性
export class ApiError implements ApiResponse<unknown> {
  code: number;
  message: string;
  data: unknown;

  constructor(response: ApiResponse<unknown>) {
    this.code = response.code;
    this.message = response.message;
    this.data = response.data;
  }
}
