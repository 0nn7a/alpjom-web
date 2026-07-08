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
export function toTaiwanDateStr(date: Date | string | null) {
  if (!date || typeof date === 'string') {
    date = !date ? new Date() : new Date(date);
  }

  return date
    .toLocaleDateString('zh-TW', {
      timeZone: 'Asia/Taipei',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
    .replace(/\//g, '-'); // 轉成 YYYY-MM-DD 格式
}

// 將日期物件轉換成台灣時區且分成 year｜month DD｜weekday 段落
export function toTaiwanDateParts(date?: Date | string | null) {
  if (!date || typeof date === 'string') {
    date = !date ? new Date() : new Date(date);
  }

  const parts = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
    timeZone: 'Asia/Taipei'
  }).formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '';

  return {
    year: get('year'),
    day: `${get('month')} ${get('day')}`,
    weekday: get('weekday')
  };
}

// 轉換成留言區時間格式
export function formatCommentTime(createdAt: string): string {
  const time = new Date(createdAt).getTime();
  const now = Date.now();

  const diffSeconds = Math.floor((now - time) / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 1) return '剛剛';
  if (diffHours < 1) return `${diffMinutes}分鐘`;
  if (diffDays < 1) return `${diffHours}小時`;
  if (diffDays < 7) return `${diffDays}天`;
  return toTaiwanDateStr(new Date(time));
}
