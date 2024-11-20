import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

const errorRate = new Rate('errors');

export const options = {
    stages: [
        { duration: '20s', target: 10 },   // 通常負荷
        { duration: '10s', target: 50 },   // スパイク
        { duration: '30s', target: 50 },   // スパイク継続
        { duration: '10s', target: 10 },   // 通常負荷に戻る
        { duration: '10s', target: 0 },    // 終了
    ],
    thresholds: {
        http_req_failed: ['rate<0.05'],    // エラー率5%未満
        http_req_duration: ['p(95)<2000'], // 95%のリクエストが2秒未満
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
    });

    errorRate.add(!success);
    sleep(1);
}