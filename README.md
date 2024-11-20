# k6 Playground
## 環境構築
```
docker compose up -d
```

## 負荷テストを実行
```sh
docker compose run k6 run /scripts/load-test.js
```

## Dev Containerを使う
- 参考: https://zenn.dev/bells17/articles/devcontainer-2024