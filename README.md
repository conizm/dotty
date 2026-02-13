# dotty - Rabbit Health Tracker PWA

## ローカルプレビュー方法

PWAはService Workerを使用するため、ローカルサーバーが必要です。以下のいずれかの方法で起動してください。

### 方法1: Node.js (http-server) - 推奨

```bash
# 初回のみ
npm install

# サーバー起動
npm start
# または
npm run serve
```

ブラウザで `http://localhost:8080` を開いてください。

### 方法2: Python

```bash
# Python 3の場合
python -m http.server 8080

# Python 2の場合
python -m SimpleHTTPServer 8080
```

ブラウザで `http://localhost:8080` を開いてください。

### 方法3: VS Code Live Server

1. VS Codeの拡張機能「Live Server」をインストール
2. `index.html` を右クリック
3. 「Open with Live Server」を選択

### 方法4: PHP (PHPがインストールされている場合)

```bash
php -S localhost:8080
```

## PWA機能の確認

1. ブラウザの開発者ツール（F12）を開く
2. 「Application」タブ → 「Service Workers」で登録を確認
3. 「Application」タブ → 「Manifest」でマニフェストを確認
4. スマートフォンでアクセスし、「ホーム画面に追加」を試す

## 注意事項

- Service WorkerはHTTPSまたはlocalhostでのみ動作します
- 本番環境ではHTTPSが必要です


