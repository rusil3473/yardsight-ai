# YardSight AI - AWS Cloud Deployment & DoLynk Integration Architecture

## 1. Overview & Dual-Phase Strategy

YardSight AI employs a two-tier strategy designed to decouple local validation from legal enterprise onboarding:

```
┌─────────────────────────────────────────┐       ┌─────────────────────────────────────────┐
│        Phase 1: Local Trial Grid        │       │      Phase 2: AWS Production Cloud      │
│     (Local Hardware & Synthetic 32CH)   │  ──►  │    (AWS ECS/EC2 + DoLynk Enterprise)    │
│  - 32-Channel 4x4 & 8x4 WebRTC Matrix   │       │  - Zero-Credential DMSS Delegation      │
│  - Real-Time ANPR, Spill & Dwell Engine │       │  - AWS Secrets Manager for PaaS Keys    │
│  - Zero Cost, Zero Bureaucracy          │       │  - Multi-Tenant Isolation & DPDP Audits │
└─────────────────────────────────────────┘       └─────────────────────────────────────────┘
```

---

## 2. Local Trial Testing: 32 Parallel Streams

Before applying for enterprise certificates or committing cloud infrastructure expenses:
1. **Parallel Execution**: YardSight's local engine supports ingesting active physical cameras on connected channels (e.g. CH-01 to CH-08) while simultaneously rendering synthetic dynamic streams across all 32 channels.
2. **Stress-Testing Matrix**:
   - **4x4 Grid (16 Channels)** and **8x4 Grid (32 Channels)** can be selected directly from the top bar layout selector.
   - The WebRTC supervisor automatically tests decoding throughput, frame drops, and auto-reconnection recovery without manual clicks.
3. **No Enterprise Gate Needed for Local Testing**: Local streaming relies on the edge gateway (`go2rtc` on `localhost:1984`), completely bypassing Dahua cloud entitlement blocks during trial development.

---

## 3. AWS Cloud Production Architecture

When migrating from local testing to AWS production:

### Components on AWS:
1. **AWS ECS Fargate or EC2 (g4dn / c6i instances)**:
   - **FastAPI Core**: Handles REST API, AI telemetry, and multi-tenant authentication.
   - **Go2RTC Gateway**: Relays WebRTC and LL-HLS to browser clients with low latency (<500ms).
   - **Vite/React Frontend**: Served via CloudFront + S3 or Nginx container.
2. **AWS RDS PostgreSQL**:
   - Stores `CloudProviderGrant` (tenant-isolated tokens) and `CloudProviderAuditLog` (DPDP compliance records).
3. **AWS Secrets Manager**:
   - Stores official Dahua DoLynk Developer PaaS credentials:
     - `DOLYNK_APP_KEY`
     - `DOLYNK_APP_SECRET`
   - Injected securely into ECS task definitions without hardcoding in source code or environment files.
4. **AWS Application Load Balancer (ALB)**:
   - Terminates TLS/HTTPS (Port 443).
   - Routes `/api/*` to FastAPI, `/webrtc/*` to Go2RTC, and `/` to Vite Frontend.

---

## 4. Transition Checklist to Enterprise Production

Once you are satisfied with local 32-stream trial testing:
1. [ ] **Register Company**: Complete incorporation and obtain business documentation (GSTIN / PAN in India).
2. [ ] **Enterprise Certification on DoLynk**:
   - Log into [open.dolynkcloud.com](https://open.dolynkcloud.com/).
   - Submit business verification documents to clear the `[BIZ121]` trial barrier.
   - Request 32-stream concurrent live view quotas for commercial applications.
3. [ ] **Inject Production Credentials**:
   - Set `DOLYNK_APP_KEY` and `DOLYNK_APP_SECRET` in AWS Secrets Manager.
4. [ ] **Launch Cloud Share**:
   - Customers click "Connect Dahua Cloud" in YardSight.
   - Customers scan the pairing QR in DMSS and approve read-only Live View.
   - YardSight streams all authorized channels seamlessly without possessing device passwords.
