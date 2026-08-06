# alpJom

> 益智小遊戲網站（作品集）

[前端展示頁](https://0nn7a.github.io/alpjom-web/) · [後端原始碼](https://github.com/0nn7a/alpjom-api)

alpJom 主要使用 Vue 與 Java 製作。

名稱靈感來自 `wordle` 旋轉 180° 後看起來像 `alpJom` 的趣味聯想。目前已完成 Wordle 玩法，並以可擴充的益智遊戲平台為後續發展方向。

畫面佈局以手機操作體驗為優先，平板與桌機同樣可使用，保留接近手機 App 的集中式遊玩版型，方便隨時開啟遊玩。

## 功能

- 每日謎題：每天挑戰固定單字，完成後可回顧結果
- 練習模式：提供 EASY、NORMAL、HARD 三種難度
  - EASY：不限猜測次數
  - NORMAL：6 次猜測機會
  - HARD：3 次猜測機會
- 遊戲續玩：保留尚未完成的遊戲進度
- 公開分享頁：每局完成後可分享遊戲結果
- 互動功能：可對公開戰績按讚與留言
- 文字結果：可複製 Emoji 格式的 Wordle 戰績
- 個人檔案：支援頭像、追蹤／粉絲、近期戰績與遊玩熱力圖
- 使用體驗：淺色／深色主題、Toast 提示、虛擬鍵盤與互動音效

## 技術

| 類別 | 使用技術 |
| --- | --- |
| 前端框架 | Vue 3、TypeScript |
| 建置工具 | Vite |
| 狀態管理 | Pinia |
| 路由 | Vue Router |
| 樣式 | Tailwind CSS |
| 圖示與互動 | Heroicons、Neoconfetti |
| 部署 | GitHub Pages |

## 本機展示與開發

### 環境需求

- Node.js 24
- pnpm 11

### 啟動方式

```bash
pnpm install
pnpm dev
```

於 `.env` 設定可連線的 API 位址：

```env
VITE_API_URL=http://localhost:8080
# 前端展示頁直接指向線上 API：https://alpjom.duckdns.org
```

## 專案結構

```text
src/
├── components/   # 共用元件：鍵盤、熱力圖、對話框、提示等
├── pages/        # 首頁、認證、遊戲、分享與個人頁
├── services/     # 後端 API 存取層
├── stores/       # Pinia 狀態管理
├── router/       # 路由與登入驗證守衛
├── composables/  # 可重用的組合式邏輯
└── utils/        # 工具函式、常數與 JWT 處理
```

## 自動化部署

前端展示頁部署於 [GitHub Pages](https://0nn7a.github.io/alpjom-web/)。

推送至 `gh-pages` 分支後，GitHub Actions 會自動建置並部署網站。

後端 API 部署於 Oracle Cloud，網址由建置時期的環境變數 `VITE_API_URL` 注入（存放於 GitHub Actions 變數）。

## 相關專案

- [alpJom API](https://github.com/0nn7a/alpjom-api)

## 作者

[@0nn7a](https://github.com/0nn7a)
