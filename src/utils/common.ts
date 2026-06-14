// 需確保整個專案不會用到 :params+ 或 :params* 去匹配動態路由
// 這樣就不會產生 string[] 的類型

// 將路徑轉小寫
export function toRoutePath(value: string | string[]): string {
  return (value as string).toLowerCase();
}

// 判斷該路徑是否已經過轉換
export function isRoutedPath(value: string | string[]) {
  return !/[A-Z]/.test(value as string);
}

// 將日期物件轉換為台灣時區且為 YYYY-MM-DD 格式字串
export function TaiwanDateStr(date: Date) {
  return date
    .toLocaleDateString('zh-TW', {
      timeZone: 'Asia/Taipei',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
    .replace(/\//g, '-'); // 轉成 YYYY-MM-DD 格式
}
