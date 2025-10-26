# 🚀 Hướng Dẫn Triển Khai Landing Page + Server Tracking

## 1️⃣ Cấu trúc dự án
```
landingpage_repo/
├── client/               # Frontend: HTML + CSS + JS (minified)
├── server/               # Backend: Express.js API + Dockerfile
├── .github/workflows/    # GitHub Actions CI/CD pipeline
└── README.md / deploy.md
```

---

## 2️⃣ Yêu cầu chuẩn bị

- Tài khoản **Google Cloud Platform (GCP)** có quyền tạo Cloud Run & Artifact Registry
- **GitHub repo riêng** để push source code
- **Slack Workspace** (để nhận thông báo lead mới)
- Domain hoặc GitHub Pages cho landing page

---

## 3️⃣ Tạo các secrets trong GitHub

Vào repo → Settings → Secrets → Actions → “New repository secret”, thêm các biến sau:

| Tên secret | Giá trị |
|-------------|----------|
| `GCP_PROJECT_ID` | ID dự án GCP |
| `GCP_SA_KEY` | Nội dung file JSON key của service account có quyền Cloud Run Admin |
| `CRM_WEBHOOK_URL` | URL webhook của CRM để nhận leads |
| `CRM_SECRET` | Secret để tạo HMAC xác thực |
| `SHEET_ID` | ID của Google Sheet để ghi dữ liệu (nếu có) |
| `GOOGLE_APPLICATION_CREDENTIALS_JSON` | Nội dung file credentials JSON của tài khoản có quyền ghi Google Sheets |
| `SLACK_WEBHOOK_URL` | URL webhook Slack channel thông báo lead |
| `GITHUB_TOKEN` | Token mặc định (đã có sẵn trong GitHub Actions) |

---

## 4️⃣ Deploy backend (Cloud Run)

Workflow `deploy.yml` sẽ tự động:

1. Build image Docker từ thư mục `/server`
2. Push lên Artifact Registry
3. Deploy service lên Cloud Run với env vars từ Secrets
4. Cho phép public access (`--allow-unauthenticated`)

Cấu hình mặc định:
- CPU: 1
- RAM: 512Mi
- Timeout: 10s
- Region: asia-southeast1

---

## 5️⃣ Deploy frontend (GitHub Pages)

Phần `client/` sẽ được deploy tự động lên nhánh `gh-pages` → public URL:
```
https://<username>.github.io/<repo-name>/
```

Trong `index.html`, cập nhật:
```html
<script src="https://www.google.com/recaptcha/api.js?render=YOUR_RECAPTCHA_SITE_KEY"></script>
```

Và sửa endpoint API ở cuối file JS:
```js
fetch('https://<CLOUD_RUN_URL>/submit-lead', { ... })
```

---

## 6️⃣ Thiết lập Slack Notify

1. Vào Slack → “Create a new app” → Incoming Webhooks
2. Chọn kênh để nhận thông báo → Enable Webhook
3. Copy URL và dán vào secret `SLACK_WEBHOOK_URL`
4. Khi có lead mới → Slack sẽ nhận thông báo như:
   ```
   🔥 New Lead!
   👤 Nguyễn Văn A
   📞 0901234567
   💼 Vay tín chấp
   💰 Thu nhập: 15tr
   ```

---

## 7️⃣ Kiểm tra sau deploy

Chạy test POST:
```bash
curl -X POST https://<CLOUD_RUN_URL>/submit-lead -H "Content-Type: application/json" -d '{"name":"Test User","phone":"0123456789","type":"vay theo lương"}'
```

Nếu nhận `{ ok: true, hmac: "<hash>" }` → thành công 🎉

---

## 8️⃣ Mẹo tối ưu

- Dùng **Google Tag Manager (GTM)** để gắn tracking & conversion scripts.
- Kiểm tra Lighthouse ≥ 90 (Speed, SEO, Accessibility, Best Practices).
- A/B test variants (`variant-a.html`, `variant-b.html`) dùng script tự động phân phối.

---

## ✅ Hoàn tất!
Bạn có thể mở rộng thêm CRM logic, lưu vào BigQuery, hoặc gửi SMS tự động khi có lead mới.
