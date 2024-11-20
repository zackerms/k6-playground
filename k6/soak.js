import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

const errorRate = new Rate('errors');

export const options = {
    stages: [
        { duration: '30s', target: 30 },   // 徐々に上昇
        { duration: '3m', target: 30 },    // 3分間維持
        { duration: '30s', target: 0 },    // スケールダウン
    ],
    thresholds: {
        http_req_duration: ['p(95)<1000'], // 95%のリクエストが1秒未満
        http_req_failed: ['rate<0.01'],    // エラー率1%未満
        errors: ['rate<0.01'],             // カスタムエラー率1%未満
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

    const res = http.post(url, payload, params);
    
    const success = check(res, {
        'status is 201': (r) => r.status === 201,
        'response has user id': (r) => JSON.parse(r.body).id !== undefined,
        'response time under 1s': (r) => r.timings.duration < 1000
    });

    // 定期的なヘルスチェック
    if (Math.random() < 0.1) { // 10%の確率でヘルスチェック
        const healthRes = http.get('http://app:8080/health');
        check(healthRes, {
            'health check is 200': (r) => r.status === 200
        });
    }

    errorRate.add(!success);
    sleep(1);
}