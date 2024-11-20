# k6 Playground
## 環境構築
```
docker compose up -d
```

## 負荷テストを実行
```sh
docker compose run k6 run /scripts/load.js
```

### スモークテスト
- 目的：基本的な機能が正常に動作することを確認
- 特徴：
    - 2人の仮想ユーザーで1分間実行
    - エラー率10%未満を要求
    - 95%のリクエストが500ms以内であることを確認
    - カスタムメトリクス（エラー率）を実装
```sh
docker compose run k6 run /scripts/smoke.js
```

### スパイクテスト
- 目的：突発的な大量アクセスへの対応を確認
- 特徴：
    - 通常負荷（10 VU）から急激に100 VUまで上昇
    - 2分間高負荷を維持
    - エラー率5%未満を要求
    - 95%のリクエストが2秒以内であることを確認
```sh
docker compose run k6 run /scripts/spike.js
```

### ストレステスト
- 目的：システムがどれだけの負荷に耐えられるかを確認
- 特徴：
    - 段階的に負荷を150 VUまで上昇
    - 各段階で5分間維持
    - 99%のリクエストが3秒以内であることを確認
```sh
docker compose run k6 run /scripts/stress.js
```

### 耐久テスト（soakテスト）
- 目的：長時間の安定性を確認
- 特徴：
    - 30 VUを4時間維持
    - エラー率1%未満を要求
    - 95%のリクエストが1秒以内であることを確認
```sh
docker compose run k6 run /scripts/soak.js
```

### ブレークポイントテスト
- 目的：システムが破綻するポイントを特定
- 特徴：
    - 段階的に400 VUまで上昇
    - 各段階で5分間維持
    - エラー率10%未満を要求
```sh
docker compose run k6 run /scripts/breakpoint.js
```

## Dev Containerを使う
- 参考: https://zenn.dev/bells17/articles/devcontainer-2024