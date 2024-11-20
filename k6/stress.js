import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

const errorRate = new Rate('errors');

export const options = {
    stages: [
        { duration: '2m', target: 20 },    // 徐々に上昇
        { duration: '5m', target: 50 },    // さらに上昇
        { duration: '5m', target: 100 },   // ピーク
        { duration: '5m', target: 150 },   // 破壊的負荷
        { duration: '3m', target: 0 },     // スケールダウン
    ],
    thresholds: {
        http_req_failed: ['rate<0.1'],     // エラー率10%未満
        http_req_duration: ['p(99)<3000'], // 99%のリクエストが3秒未満
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
        'response time under 3s': (r) => r.timings.duration < 3000
    });

    errorRate.add(!success);
    sleep(1);
}