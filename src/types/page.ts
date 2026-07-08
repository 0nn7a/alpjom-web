export interface PageRequest {
  page: number;
  size: number;
}

export interface PageResponse<T> {
  total: number;
  rows: T[];
}
