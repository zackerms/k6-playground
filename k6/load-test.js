import http from 'k6/http';
import { check, sleep } from 'k6';

// テストの設定
export const options = {
    vus: 10,        // 仮想ユーザー数
    duration: '5s' // テスト実行時間
};

// テストシナリオ
export default function () {
    const res = http.get('http://app:8080/health');
    
    // レスポンスのチェック
    check(res, {
        'is status 200': (r) => r.status === 200,
    });

    sleep(1);
}