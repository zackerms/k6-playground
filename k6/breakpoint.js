import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

const errorRate = new Rate('errors');
const responseTimeTrend = new Trend('response_time');

export const options = {
    stages: [
        { duration: '30s', target: 50 },   // 初期負荷
        { duration: '30s', target: 100 },  // 中負荷
        { duration: '30s', target: 200 },  // 高負荷
        { duration: '30s', target: 300 },  // より高負荷
        { duration: '30s', target: 0 },    // クールダウン
    ],
    thresholds: {
        http_req_failed: ['rate<0.1'],     // エラー率10%未満
        errors: ['rate<0.1'],              // カスタムエラー率10%未満
    },
};

export default function () {
    const url = 'http://app:8080/users';
    const payload = JSON.stringify({
        name: `User ${Math.random()}`,
        email: `user${Math.random()}@example.com`
    });

    const params = {
        headers: { 'Content-Type': 'application/json' },
    };

    const startTime = new Date();
    const res = http.post(url, payload, params);
    const endTime = new Date();
    
    const duration = endTime - startTime;
    responseTimeTrend.add(duration);

    const success = check(res, {
        'status is 201': (r) => r.status === 201,
        'response has user id': (r) => JSON.parse(r.body).id !== undefined,
    });

    // システムの状態を監視
    if (Math.random() < 0.1) { // 10%の確率でヘルスチェック
        const healthRes = http.get('http://app:8080/health');
        check(healthRes, {
            'health check is 200': (r) => r.status === 200
        });
    }

    errorRate.add(!success);
    sleep(1);
}