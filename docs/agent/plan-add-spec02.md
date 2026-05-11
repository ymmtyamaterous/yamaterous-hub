# 追加仕様02 実装計画

## 対象仕様（`docs/user/add-spec02.md` より）

1. Google Form お問い合わせフォームへのリンクを環境変数で設定できるようにする
2. 作品一覧でタグによる絞り込みを実装する（公開側・管理画面の両方）
3. 作品管理画面で表示順をドラッグ＆ドロップで並び替えできるようにする

---

## 仕様1: お問い合わせフォームリンク（環境変数設定）

### 概要
Google Form などの外部フォームURLを環境変数 `VITE_CONTACT_FORM_URL` で設定し、フッターにリンクを表示する。

### 変更ファイル

| ファイル | 変更内容 |
|--------|--------|
| `packages/env/src/web.ts` | `VITE_CONTACT_FORM_URL: z.url().optional()` を追加 |
| `apps/web/src/components/footer.tsx` | `env.VITE_CONTACT_FORM_URL` が設定されている場合にお問い合わせリンクを表示 |
| `apps/web/.env.example`（存在すれば） | `VITE_CONTACT_FORM_URL=` のサンプルを追記 |

### 実装詳細

```ts
// packages/env/src/web.ts
client: {
  VITE_SERVER_URL: z.url(),
  VITE_CONTACT_FORM_URL: z.url().optional(), // 追加
}
```

フッターでは `env.VITE_CONTACT_FORM_URL` の有無を条件分岐し、設定されている場合のみ「お問い合わせ」リンクを `target="_blank" rel="noopener noreferrer"` 付きで表示する。

---

## 仕様2: 作品一覧タグ絞り込み

### 概要
公開側作品一覧ページ (`/works/`) と管理画面作品一覧ページ (`/admin/works/`) の両方にタグフィルタリング機能を追加する。

### 変更ファイル

| ファイル | 変更内容 |
|--------|--------|
| `packages/api/src/routers/works.ts` | `list` / `adminList` の input に `tagId?: string` を追加し、フィルタリングロジックを追加 |
| `apps/web/src/routes/works/index.tsx` | タグ一覧取得 + タグフィルターUI + クエリパラメータ連動 |
| `apps/web/src/routes/admin/works/index.tsx` | 同上（管理画面側） |

### API変更詳細

**`listWorksWithTags` ヘルパー関数を拡張:**

```ts
async function listWorksWithTags(publishedOnly: boolean, tagId?: string) {
  // tagId が指定されていた場合、work_tag テーブルでの IN サブクエリでフィルタリング
  // drizzle ORM の inArray / subquery を使用
}
```

フィルタロジック: `tagId` が指定された場合、`work_tag` に該当タグIDが紐づく作品のみを返す。

**ルーター入力スキーマ変更:**

```ts
list: publicProcedure
  .input(z.object({ tagId: z.string().optional() }).optional())
  .output(z.array(WorkOutput))
  .handler(async ({ input }) => listWorksWithTags(true, input?.tagId)),

adminList: protectedProcedure
  .input(z.object({ tagId: z.string().optional() }).optional())
  .output(z.array(WorkOutput))
  .handler(async ({ input }) => listWorksWithTags(false, input?.tagId)),
```

### フロントエンド変更詳細

**公開側 (`/works/index.tsx`):**
- `tags.list` で全タグ一覧を取得
- タグボタン群を作品グリッドの上部に表示（「すべて」 + タグ名のボタン）
- 選択中タグをローカル state で管理し、`orpc.works.list.queryOptions({ input: { tagId } })` に渡す
- 選択タグをデザインの既存スタイル（サイバー系テーマ）に合わせてハイライト表示

**管理画面側 (`/admin/works/index.tsx`):**
- 同様にタグフィルターUIをヘッダー部に追加
- `orpc.works.adminList.queryOptions({ input: { tagId } })` に渡す

---

## 仕様3: 作品管理画面 並び替えリスト

### 概要
管理画面の作品一覧をドラッグ＆ドロップで並び替えできるようにし、並び替え後に `sortOrder` をDBに一括保存する。

### 使用ライブラリ
- `@dnd-kit/core` — DnDのコアロジック
- `@dnd-kit/sortable` — ソータブルリストユーティリティ
- `@dnd-kit/utilities` — CSS変換ユーティリティ

### 変更ファイル

| ファイル | 変更内容 |
|--------|--------|
| `apps/web/package.json` | `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities` を追加 |
| `packages/api/src/routers/works.ts` | `works.reorder` エンドポイントを追加 |
| `packages/api/src/index.ts` | `reorder` のルーター登録確認（worksRouter に含まれるため基本不要） |
| `apps/web/src/routes/admin/works/index.tsx` | DnDソート対応リストに変更 |

### API変更詳細

**`works.reorder` エンドポイント追加:**

```ts
reorder: protectedProcedure
  .input(z.object({
    updates: z.array(z.object({
      id: z.string(),
      sortOrder: z.number().int(),
    })).min(1),
  }))
  .output(z.object({ success: z.literal(true) }))
  .handler(async ({ input }) => {
    // バッチ更新: 各 work の sortOrder を一括変更
    await Promise.all(
      input.updates.map(({ id, sortOrder }) =>
        db.update(work).set({ sortOrder, updatedAt: new Date() }).where(eq(work.id, id))
      )
    );
    return { success: true };
  }),
```

### フロントエンド変更詳細

**`/admin/works/index.tsx` の変更:**
- `@dnd-kit/core` の `DndContext`, `closestCenter`, `PointerSensor`, `useSensor`, `useSensors` を使用
- `@dnd-kit/sortable` の `SortableContext`, `verticalListSortingStrategy`, `useSortable`, `arrayMove` を使用
- 各テーブル行を `SortableWorkRow` コンポーネントに切り出し、ドラッグハンドルアイコン（`GripVertical` from lucide-react）を表示
- ドラッグ終了（`onDragEnd`）時に `arrayMove` でローカル順序を更新し、`works.reorder` mutationで保存
- タグフィルタリングが有効な場合はドラッグ無効化（フィルタ中は並び替え不可）
- 保存成功時 `toast.success("表示順を更新しました")` を表示

---

## 実装順序

1. **仕様1**: 環境変数追加 → フッター更新（小規模、独立）
2. **仕様2 (API)**: `listWorksWithTags` のタグフィルタ対応 → `list`/`adminList` の input 追加
3. **仕様2 (フロントエンド)**: 公開側タグフィルター → 管理画面タグフィルター
4. **仕様3 (パッケージ)**: `@dnd-kit` インストール
5. **仕様3 (API)**: `works.reorder` エンドポイント追加
6. **仕様3 (フロントエンド)**: 管理画面ドラッグ＆ドロップ対応

---

## テスト方針

- `packages/api/src/__tests__/routers.test.ts` にタグフィルタリングのユニットテスト追加
- `apps/server/src/__tests__/routers.test.ts` に `works.reorder` のテスト追加
- フロントエンドは動作確認（デザインの統一感確認含む）
