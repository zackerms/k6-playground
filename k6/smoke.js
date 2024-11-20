import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

const errorRate = new Rate('errors');

export const options = {
    vus: 2,              // 2人の仮想ユーザー
    duration: '1m',      // 1分間の実行
    thresholds: {
        errors: ['rate<0.1'],  // エラー率10%未満であることを確認
        http_req_duration: ['p(95)<500'],  // 95%のリクエストが500ms未満であることを確認
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
        'response time OK': (r) => r.timings.duration < 500
    });

    errorRate.add(!success);
    sleep(1);
}
