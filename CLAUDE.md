# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install        # Install all dependencies (first time setup)
npm run dev        # Start dev server → http://localhost:5173
npm run build      # Type-check with tsc, then Vite production build
npm run preview    # Serve the production build locally
```

## Architecture

React 18 + TypeScript + Vite + Tailwind CSS によるぷよぷよゲーム。

### Game Logic — `src/game/`

純粋関数のみ。React への依存なし。

| File | Role |
|------|------|
| `types.ts` | `Board`, `Piece`, `GameState`, `PuyoColor`, `GamePhase` の型定義 |
| `constants.ts` | ボードサイズ・タイミング定数・`SATELLITE_OFFSETS` (回転ごとのサテライト位置オフセット) |
| `logic.ts` | 全ゲーム操作。`tick()` がフェーズ遷移を駆動、`handle*()` がキー入力を処理、`findGroups()` が BFS でぷよグループを検出 |

### ゲームループ — `src/hooks/useGame.ts`

`useGame()` が `setInterval(100ms)` で `tick()` を呼び出す。入力ハンドラはインターバルを介さず直接 `apply(fn)` を呼ぶ。  
ステートは `useRef`（同期的な読み取り用）と `useState`（再レンダリング用）の両方で保持する。

### フェーズ状態機械 (`GameState.phase`)

```
'playing'   → 自動落下。着地したら → 'dropping'
'dropping'  → DROP_TICKS 後にグループ検出。あれば → 'popping'、なければ → 'playing'（次ぷよ）
'popping'   → POP_TICKS 後にポップ適用 + 重力 → 再検出（連鎖）または → 'playing'
'gameover'  → ループ停止。restart() でリセット
```

タイマーはすべてティック数（整数）で管理。1ティック = 100ms。

### Components — `src/components/`

| File | Role |
|------|------|
| `Board.tsx` | 6×13グリッド。現在ピース・ゴーストピース・ポップ中セルをオーバーレイ描画 |
| `PuyoCell.tsx` | 円形ぷよ。`isPopping` で CSS `puyoPop` アニメーション、`isGhost` で半透明輪郭表示 |
| `NextPiece.tsx` | 次のぷよペアのプレビュー（常に rotation=0 表示、サテライト上・ピボット下） |
| `ScorePanel.tsx` | スコア・レベル・連鎖数を左パネルに表示 |

### 座標系・回転

- `board[row][col]`、row 0 = 最上段、row 12 = 最下段
- ピース回転 `0=上, 1=右, 2=下, 3=左`（`SATELLITE_OFFSETS` 参照）
- スポーン位置: pivot=(row=1, col=2), satellite=(row=0, col=2)
- 壁蹴り: 回転後にぶつかる場合、左右 ±1 でリトライ

---

## コアゲーム機能

### 基本メカニクス
- 2色ぷよペアの落下・回転（CW / CCW）・壁蹴り
- 4個以上の同色連結でポップ、連鎖ボーナス
- ゴーストピースによる着地予測表示
- レベルアップごとに落下速度が上昇（`LEVEL_UP_EVERY = 30` ぷよ）

### 操作
| キー | 動作 |
|------|------|
| ← → | 左右移動 |
| Z / X | 反時計回り / 時計回り回転 |
| ↓ | ソフトドロップ |
| Space | ハードドロップ |

### ゲーム状態
`playing → dropping → popping → playing`（連鎖時は popping ループ）  
ゲームオーバー判定: スポーン位置が埋まっている場合。

### 視覚的特徴
- 円形ぷよ（ラジアルグラデーション + 顔 + 光沢ハイライト）
- ポップ時: 拡大→消滅アニメーション（`puyoPop` keyframe）
- 連鎖発生時: ScorePanel 内に連鎖数をパルスアニメーションで表示
- ダーク背景 + グローオーブ + グラスモーフィズムUI

---

## ゲームモード

### Phase 1（実装済み）— シングルプレイヤー
- スコアアタック形式
- レベル進行による難易度上昇
- 最大連鎖数の記録

### Phase 2（予定）— AI対戦
- CPU が別ボードでぷよを落とす 1vs1 対戦
- おじゃまぷよシステム（連鎖数に応じて相手ボードに送る）
- AI 難易度選択（簡単 / 普通 / 難しい）

---

## 技術要件

| 分野 | 要件 |
|------|------|
| パフォーマンス | 入力遅延 ≤ 100ms（setInterval 1ティック以内）、再レンダリング最小化 |
| データ管理 | ハイスコアを `localStorage` に永続化（Phase 2） |
| アクセシビリティ | キーボード完全操作、`user-select: none` で誤選択防止 |

---

## UI/UX要件

- **デザイン**: ダーク（`#060614` ベース）+ ネオングロー + グラスモーフィズムパネル
- **フォント**: Orbitron（数値・ラベル）/ Noto Sans JP（日本語テキスト）
- **レスポンシブ**: Phase 3 でモバイル対応（タッチスワイプ操作）予定

---

## 開発フェーズ

| フェーズ | 内容 | 状態 |
|----------|------|------|
| Phase 1 | コアゲームエンジン、シングルプレイ、モダンUI | ✅ 完了 |
| Phase 2 | AI対戦モード、おじゃまぷよ、ハイスコア保存 | 🔲 未着手 |
| Phase 3 | モバイル対応（タッチ）、BGM/SE、エフェクト強化 | 🔲 未着手 |
