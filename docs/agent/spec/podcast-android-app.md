# ポッドキャスト配信 Android アプリ 仕様書

> 対象: Yamaterous Hub ポッドキャスト管理用 Android アプリ  
> バージョン: 1.0  
> 作成日: 2026-05-01

---

## 1. 概要

管理者が Android スマートフォンで音声を録音し、Yamaterous Hub Web API へアップロードするための専用クライアントアプリ。

### 目的

- 外出先や収録現場でスマートフォンのみでポッドキャストエピソードを登録・公開できる
- Web 管理画面と同等のメタデータ(タイトル・説明・カテゴリ)を設定できる
- 録音後すぐにアップロードできるシンプルな UX を提供する

---

## 2. 技術スタック

| 項目 | 採用技術 |
|------|----------|
| 言語 | Dart |
| フレームワーク | Flutter |
| 最小 SDK | Android API 26 (Android 8.0) |
| ターゲット SDK | Android API 35 (Android 15) |
| アーキテクチャ | Riverpod + Repository パターン |
| UI | Flutter Material 3 Widgets |
| 状態管理 | flutter_riverpod |
| 非同期 | Dart async / await + Stream |
| HTTP クライアント | dio |
| 認証状態管理 | flutter_secure_storage |
| 音声録音 | record パッケージ |
| 音声再生 | just_audio パッケージ |
| ファイル管理 | path_provider + file_picker |
| 権限管理 | permission_handler |

---

## 3. 機能一覧

| No | 機能 | 優先度 |
|----|------|--------|
| F-01 | ログイン / ログアウト | 必須 |
| F-02 | 音声録音(開始・一時停止・停止) | 必須 |
| F-03 | 録音ファイルの再生確認 | 必須 |
| F-04 | エピソードメタデータ入力(タイトル・スラッグ・説明) | 必須 |
| F-05 | カテゴリ選択(複数選択) | 必須 |
| F-06 | 音声ファイルアップロード | 必須 |
| F-07 | エピソードの公開/非公開設定 | 必須 |
| F-08 | アップロード進捗表示 | 必須 |
| F-09 | 既存ファイル(mp3/m4a)の選択アップロード | 推奨 |
| F-10 | アップロード履歴一覧 | 推奨 |
| F-11 | オフライン録音キュー(後でアップロード) | 将来 |

---

## 4. 画面構成

```
SplashScreen
  └─ LoginScreen
       └─ HomeScreen (録音メイン)
            ├─ RecordScreen (録音 / 再生確認)
            └─ MetadataScreen (メタデータ入力)
                 └─ CategorySelectScreen (カテゴリ選択)
                      └─ UploadScreen (進捗 / 結果)
                           └─ HomeScreen (完了後に戻る)
```

---

## 5. 画面詳細仕様

### 5.1 SplashScreen

- アプリ起動時に表示
- `flutter_secure_storage` に保存済みセッショントークンが有効な場合は HomeScreen へリダイレクト
- トークンが無い・無効の場合は LoginScreen へ遷移

---

### 5.2 LoginScreen

**UI 要素**

| 要素 | 説明 |
|------|------|
| サーバー URL 入力欄 | アップロード先 API のベース URL (例: `https://hub.example.com`) |
| メールアドレス入力欄 | 管理者のメールアドレス |
| パスワード入力欄 | パスワード (表示/非表示トグルボタン付き) |
| ログインボタン | タップでサインイン処理を実行 |
| エラーメッセージ表示領域 | 認証失敗時の理由を表示 |

**ログイン処理フロー**

1. `POST /api/auth/sign-in/email` へリクエスト
2. レスポンスの Set-Cookie ヘッダーからセッション Cookie を取得し `flutter_secure_storage` に保存
3. 成功 → HomeScreen へ遷移
4. 失敗 → エラーメッセージを画面に表示

**バリデーション**

- サーバー URL: URL 形式
- メールアドレス: RFC 5322 形式
- パスワード: 1 文字以上

---

### 5.3 HomeScreen

**UI 要素**

| 要素 | 説明 |
|------|------|
| 録音開始ボタン (大) | 中央配置、タップで録音を開始し RecordScreen へ遷移 |
| ファイル選択ボタン | ストレージから既存の音声ファイルを選択し MetadataScreen へ遷移 |
| ログアウトボタン (メニュー) | セッションを破棄して LoginScreen へ戻る |

---

### 5.4 RecordScreen

**UI 要素**

| 要素 | 説明 |
|------|------|
| 録音時間タイマー | `HH:MM:SS` 形式でリアルタイム表示 |
| 音声レベルメーター | 入力音量を可視化するバー |
| 一時停止 / 再開ボタン | 録音を一時停止・再開する |
| 停止ボタン | 録音を停止して確認再生モードへ切り替え |
| 再生 / 一時停止ボタン | 録音ファイルを確認再生 (停止後のみ表示) |
| 次へボタン | MetadataScreen へ遷移 (停止後のみ表示) |
| 破棄ボタン | 録音ファイルを削除して HomeScreen へ戻る |

**録音仕様**

| 項目 | 設定値 |
|------|--------|
| 出力フォーマット | MPEG-4 (`.m4a`) |
| 音声コーデック | AAC-LC |
| ビットレート | 128 kbps |
| サンプリングレート | 44,100 Hz |
| チャンネル | モノラル |
| 保存先 | アプリ専用ストレージ (`getApplicationDocumentsDirectory()/recordings/`) |

---

### 5.5 MetadataScreen

**UI 要素**

| 要素 | 説明 |
|------|------|
| タイトル入力欄 | 必須。エピソードのタイトル |
| スラッグ入力欄 | URL に使用する英数字・ハイフンのみの識別子。タイトルから自動生成される (編集可) |
| 説明入力欄 | 任意。複数行テキストフィールド |
| カテゴリ選択ボタン | タップで CategorySelectScreen へ遷移。選択済みカテゴリをチップ表示 |
| 公開する チェックボックス | ON でアップロード後に即公開 |
| アップロードボタン | バリデーション通過後に UploadScreen へ遷移してアップロード開始 |

**バリデーション**

- タイトル: 1 〜 200 文字
- スラッグ: 1 〜 100 文字、正規表現 `^[a-z0-9-]+$`

**スラッグ自動生成ロジック**

```dart
String titleToSlug(String title) {
  return title
      .toLowerCase()
      .replaceAll(RegExp(r'[\s_]+'), '-')
      .replaceAll(RegExp(r'[^a-z0-9-]'), '')
      .replaceAll(RegExp(r'-{2,}'), '-')
      .substring(0, title.length > 100 ? 100 : title.length);
}
```

---

### 5.6 CategorySelectScreen

**UI 要素**

| 要素 | 説明 |
|------|------|
| カテゴリ一覧 (ListView) | API から取得したカテゴリをチェックボックス付きで一覧表示 |
| 検索バー | カテゴリ名でフィルタリング |
| 決定ボタン | 選択内容を MetadataScreen に返して戻る |

**データ取得**

- `POST /rpc/categories/list` でカテゴリ一覧を取得
- 画面表示時に毎回取得 (キャッシュ TTL: 5 分)

---

### 5.7 UploadScreen

**UI 要素**

| 要素 | 説明 |
|------|------|
| 進捗バー | アップロードの進捗率 (0〜100%) |
| ステータスメッセージ | "音声ファイルをアップロード中..." / "エピソードを登録中..." / "完了！" |
| エラーメッセージ | 失敗時の詳細メッセージ |
| 再試行ボタン | 失敗時のみ表示 |
| ホームへ戻るボタン | 成功後に表示 |

**アップロードフロー**

```
1. POST /api/upload/audio
   - Content-Type: multipart/form-data
   - フィールド: file (音声ファイル)
   → レスポンス: { url: "/uploads/audio/xxx.m4a", duration: 1234 }

2. POST /rpc/podcasts/create  (oRPC)
   - title, slug, description, audioUrl, duration, isPublished, categoryIds
   → レスポンス: { id, slug, ... }

3. 成功ダイアログを表示して HomeScreen へ遷移
```

---

## 6. API 仕様

### 6.1 認証

Better Auth のセッション Cookie 方式を使用する。

| エンドポイント | メソッド | 説明 |
|---------------|--------|------|
| `/api/auth/sign-in/email` | POST | メール + パスワードでログイン |
| `/api/auth/sign-out` | POST | ログアウト |
| `/api/auth/get-session` | GET | セッション確認 |

**ログインリクエスト**

```json
{
  "email": "admin@example.com",
  "password": "secret"
}
```

**ログインレスポンス (成功)**

```json
{
  "token": "...",
  "user": { "id": "...", "email": "admin@example.com" }
}
```

### 6.2 音声ファイルアップロード

| エンドポイント | メソッド | 認証 |
|---------------|--------|------|
| `/api/upload/audio` | POST | 必須 (Cookie) |

**リクエスト**

```
Content-Type: multipart/form-data

file: <音声ファイルバイナリ>
```

**許可 MIME タイプ**

- `audio/mp4` (`.m4a`)
- `audio/mpeg` (`.mp3`)
- `audio/x-m4a`

**ファイルサイズ上限**: 500 MB

**レスポンス (成功 200)**

```json
{
  "url": "/uploads/audio/1746091234-abc123def456.m4a",
  "duration": 3672
}
```

### 6.3 カテゴリ一覧取得

| エンドポイント | メソッド | 認証 |
|---------------|--------|------|
| `/rpc/categories/list` | POST | 不要 |

**レスポンス**

```json
[
  { "id": "cat-1", "name": "テクノロジー", "slug": "technology", "description": "..." },
  ...
]
```

### 6.4 ポッドキャスト作成

| エンドポイント | メソッド | 認証 |
|---------------|--------|------|
| `/rpc/podcasts/create` | POST | 必須 |

**リクエスト**

```json
{
  "title": "エピソード1: はじめまして",
  "slug": "episode-1",
  "description": "自己紹介回です",
  "audioUrl": "/uploads/audio/xxx.m4a",
  "duration": 3672,
  "isPublished": true,
  "categoryIds": ["cat-1"]
}
```

**レスポンス**

```json
{
  "id": "ep-uuid",
  "title": "エピソード1: はじめまして",
  "slug": "episode-1",
  "audioUrl": "/uploads/audio/xxx.m4a",
  "duration": 3672,
  "isPublished": true,
  "publishedAt": "2026-05-01T00:00:00.000Z",
  "createdAt": "2026-05-01T00:00:00.000Z",
  "updatedAt": "2026-05-01T00:00:00.000Z",
  "categories": [{ "id": "cat-1", "name": "テクノロジー", "slug": "technology" }]
}
```

---

## 7. 権限

| Android パーミッション | 用途 |
|----------------------|------|
| `RECORD_AUDIO` | 音声録音 |
| `READ_MEDIA_AUDIO` (API 33+) / `READ_EXTERNAL_STORAGE` (API 32以下) | 既存音声ファイルの選択 |
| `INTERNET` | API 通信 |
| `FOREGROUND_SERVICE` | バックグラウンドでの録音継続 (オプション) |

---

## 8. セキュリティ要件

- HTTPS 通信のみ許可 (HTTP は開発環境のみ例外)
- セッション Cookie は `flutter_secure_storage` に暗号化保存
- 録音ファイルはアプリ専用ストレージに保存しアップロード完了後に削除
- Certificate Pinning は本番リリース時に検討

---

## 9. エラーハンドリング

| エラー条件 | ユーザー向けメッセージ | 挙動 |
|-----------|-------------------|------|
| ネットワーク未接続 | "インターネット接続を確認してください" | 再試行ボタン表示 |
| 認証エラー (401) | "セッションが切れました。再度ログインしてください" | LoginScreen へ遷移 |
| ファイルサイズ超過 (400) | "ファイルサイズが大きすぎます (上限 500MB)" | MetadataScreen へ戻る |
| サーバーエラー (5xx) | "サーバーエラーが発生しました。後で再試行してください" | 再試行ボタン表示 |
| 録音失敗 | "録音に失敗しました。マイク権限を確認してください" | HomeScreen へ戻る |

---

## 10. 将来の拡張

- エピソード一覧・編集・削除機能
- 音声の波形表示
- オフラインキューイング (録音後 Wi-Fi 接続時に自動アップロード)
- プッシュ通知(アップロード完了通知)
- Apple Podcast / Spotify RSS フィード対応
