# 実装計画書: add-spec01 追加仕様・バグ対応

> 対象仕様: `/workspace/docs/user/add-spec01.md`  
> 作成日: 2026-05-06

---

## 概要

追加仕様3件の実装計画を記載する。  
バックエンド API は基本的に整備済みのため、変更はフロントエンド中心となる。

---

## 仕様1: 作品の sortOrder を自動設定する

### 現状

- `packages/api/src/routers/works.ts` の `create` ハンドラーで `sortOrder: input.sortOrder ?? 0` となっており、未指定時は常に `0` がセットされる。
- フロントエンド (`apps/web/src/components/work-form.tsx`) の初期値も `sortOrder: initialValues?.sortOrder ?? 0` となっており、新規作成時にフォームに `0` が表示される。

### 対応方針

バックエンドで「現存する最大 `sort_order` + 1」を自動計算して設定する。  
フロントエンドのフォームはユーザーが手動上書き可能な状態は維持し、新規作成時のプレースホルダーを「自動」表示に変更する。

### 変更箇所

| ファイル | 変更内容 |
|---|---|
| `packages/api/src/routers/works.ts` | `create` ハンドラーで `sortOrder` が `undefined` の場合、`SELECT MAX(sort_order) FROM work` の結果に +1 した値を使用する |
| `apps/web/src/components/work-form.tsx` | `WorkFormValues.sortOrder` を `number \| undefined` に変更（省略可能に）。フォームのデフォルト表示を `0` から空欄にし `placeholder="自動設定"` を追加する |
| `apps/web/src/routes/admin/works/new.tsx` | `handleSubmit` で `sortOrder` が `undefined` の場合はペイロードから省略する |

### 実装ステップ

1. `works.ts` (`create` ハンドラー): `drizzle-orm` の `max` 関数を使い最大 `sortOrder` を取得し、`+1` した値をデフォルトとして設定する
2. `work-form.tsx`: `sortOrder` 型を `number | undefined` に変更し、フォーム input を `placeholder="自動設定"` に変更する
3. `new.tsx`: `sortOrder` が `undefined` の場合は送信ペイロードに含めない

---

## 仕様2: 作品登録時に既存タグから選択できるようにする

### 現状

- `work-form.tsx` で `allTags` (全タグ一覧) と `availableTags` (未選択のタグ) は既にクエリ・算出されているが、UI 上に既存タグの選択ボタンが存在しない。
- 現在の操作フロー: テキスト入力 → Enter キーでタグ作成 or 既存タグ名一致時に追加のみ。

### 対応方針

テキスト入力欄の下に「選択可能な既存タグ」をボタンリストで表示し、クリックで選択できるようにする。  
新規タグ入力は既存のまま維持する。

### 変更箇所

| ファイル | 変更内容 |
|---|---|
| `apps/web/src/components/work-form.tsx` | タグ入力エリアに `availableTags` のバッジリストを追加。バッジクリックで `tagIds` に追加する UI を実装する |

### 実装ステップ

1. `availableTags` (未選択タグ) を小さいバッジボタンとして並べる (例: `+ TypeScript`)
2. バッジクリック時に `setValues((v) => ({ ...v, tagIds: [...v.tagIds, tag.id] }))` を実行する
3. 既存の選択済みタグ表示・削除機能はそのまま維持する

---

## 仕様3: カテゴリの説明を後から編集できるようにする

### 現状

- `packages/api/src/routers/categories.ts` の `update` ハンドラーは実装済み。
- `packages/db/src/schema/content.ts` の `category` テーブルに `description` カラムは存在する。
- フロントエンド (`apps/web/src/routes/admin/categories/index.tsx`) にカテゴリ一覧の「操作」列があるが、**削除ボタンのみ** で編集機能がない。

### 対応方針

カテゴリ一覧の各行にインライン編集機能を追加する。  
「編集」ボタンクリックで行が編集モードに切り替わり、名前・スラッグ・説明を変更できるようにする。

### 変更箇所

| ファイル | 変更内容 |
|---|---|
| `apps/web/src/routes/admin/categories/index.tsx` | 各カテゴリ行に「編集」ボタンを追加。クリックで行内の各フィールドが `<input>` に切り替わるインライン編集を実装する。確定 (保存) / キャンセルボタンを表示し、確定時に `categories.update` mutation を呼ぶ |

### 実装ステップ

1. `editingId: string | null` の state を追加し、どのカテゴリを編集中か管理する
2. `editValues: { name: string; slug: string; description: string }` の state を追加
3. 「編集」ボタンクリック時に `editingId` を設定し、`editValues` を現在の値で初期化する
4. 編集行では `<td>` の中身を `<input>` に切り替えて表示する
5. 「保存」ボタンクリック時に `categories.update` mutation を実行し、成功後 `editingId` をリセットする
6. 「キャンセル」で `editingId` をリセットする
7. `updateMutation` を `orpc.categories.update.mutationOptions(...)` で定義する

---

## テスト方針

各機能実装後にユニットテストを追加・更新する。

| テスト対象 | テスト内容 |
|---|---|
| `packages/api/src/__tests__/routers.test.ts` または `packages/api/src/routers/__tests__/` | `works.create` で `sortOrder` 未指定時に既存最大値 + 1 が設定されることを確認 |

---

## 実装優先順位

1. **仕様2** (既存タグ選択): フロントエンドのみの変更で影響範囲が小さい
2. **仕様1** (sortOrder 自動設定): バックエンド + フロントエンドの両変更
3. **仕様3** (カテゴリ編集): フロントエンドのみ、インライン編集 UI の実装量が最も多い

---

## 影響範囲まとめ

```
変更ファイル一覧
├── packages/api/src/routers/works.ts              # sortOrder 自動計算
├── apps/web/src/components/work-form.tsx           # sortOrder 型変更 + 既存タグ選択 UI
├── apps/web/src/routes/admin/works/new.tsx         # sortOrder 省略対応
└── apps/web/src/routes/admin/categories/index.tsx  # インライン編集 UI
```

DB スキーマの変更・マイグレーションは不要。
