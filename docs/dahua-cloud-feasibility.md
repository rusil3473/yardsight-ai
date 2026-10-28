# Dahua DoLynk Cloud Share & DMSS Developer Entitlement Feasibility Report

**Project:** YardSight AI  
**Author:** Integrity (Implementation Owner)  
**Date:** October 2026  
**Status:** PHASE 0 COMPLETED — ENTITLEMENT GATE ACTIVE (CLOUD STREAM CODE BLOCKED PENDING DAHUA COMMERCIAL APPROVAL)

---

## 1. Executive Summary & Purpose

YardSight AI requires streaming multi-channel video from customer-owned Dahua NVRs deployed across logistics godowns and freight facilities without direct LAN connectivity. 

### Core Business Rule
> **YardSight must never take ownership of a customer’s Dahua device or ask for the customer’s DMSS username/password.**  
> The customer remains the permanent device owner in DMSS. They delegate a **revocable, read-only Live View authorization** to YardSight through official Dahua/DoLynk Cloud delegation mechanisms.

This feasibility report documents the legal, technical, and architectural requirements for integrating Dahua DoLynk Developer PaaS into YardSight, answers developer registration requirements, defines open technical risks, and enforces the Phase 0 Entitlement Gate.

---

## 2. Developer Registration vs. Seller/Installer Path Clarification

There has been confusion regarding whether a developer must register as a "Dahua Seller/Installer" via the Dahua Partner App/DoLynk Care app before gaining API access. 

### Clarification Matrix

| Portal / Program | Target Audience | Primary Function | Relevant for YardSight? |
| :--- | :--- | :--- | :--- |
| **Dahua Partner App / DoLynk Care** | Hardware Installers, System Integrators, Resellers | Device deployment, warranty tracking, client maintenance | **NO.** Designed for physical device setup, not SaaS API development. |
| **DoLynk Developer Partner Portal** (`open.dolynkcloud.com`) | Independent Software Vendors (ISVs), Software Developers | OpenAPI access, cloud live streaming, WebRTC/RTSP relay, device delegation | **YES.** This is the exclusive official path for YardSight. |
| **Dahua ECO Partner Program** | Enterprise Technology Partners | Commercial partnerships, certified hardware integrations, co-selling | **YES (for Production).** Required for production commercial SLAs and quota elevation. |

### Registration & Documentation Reality
1. **Self-Service Registration:** A developer can register an account at [open.dolynkcloud.com](https://open.dolynkcloud.com/) using a business email.
2. **Sandbox vs. Production Keys:**
   - Registration provides self-service access to sandbox documentation and basic application registration (`AppKey`, `AppSecret`).
   - However, **production API access, device sharing delegation scopes, and live-stream bandwidth quotas require formal Dahua verification**.
3. **Legal Documentation (India Region):**
   - In Dahua's India region, corporate verification requires an organization profile. For commercial software partnerships, Dahua India standard onboarding requires corporate registration details (Certificate of Incorporation, GSTIN/PAN for business verification).
   - Under India's **Digital Personal Data Protection (DPDP) Act, 2023** and **DPDP Rules, 2025**, CCTV video streams containing identifiable individuals constitute digital personal data. YardSight functions as a **Data Processor** on behalf of the customer (the **Data Fiduciary**), requiring statutory notices, purpose limitation, and immediate revocation mechanisms.

---

## 3. Official Capabilities, APIs & Architectural Findings

### 3.1 Device Ownership & Revocable Sharing Flow
- **Dahua DMSS Sharing Architecture:** Dahua DMSS natively supports owner-controlled device sharing. The owner registers the device in DMSS and retains primary administrative ownership.
- **Delegation Mechanism:** The owner shares access to a secondary account or developer application by scanning a dynamic QR code or submitting the developer's registered account handle.
- **Granular Scopes:** DMSS permits owners to select granular permissions:
  - `Live View` (Read-Only) — **Requested by YardSight**
  - `Video Playback / History` — Disabled / Unrequested
  - `Alarm Push Notifications` — Optional
  - `Device Configuration / PTZ` — Denied / Unrequested
- **Instant Revocation:** The customer can revoke YardSight's access at any moment directly within their DMSS mobile application without contacting YardSight. Upon revocation, Dahua cloud invalidates all active stream tokens.

### 3.2 Live View Streaming & Protocol Endpoints
- **DoLynk Open API Live Stream Endpoint:** `POST /open-api/v1.0/devices/{deviceSn}/live/urls` (or equivalent region-specific endpoint `https://open-api-sg.dolynkcloud.com`).
- **Supported Return Protocols:**
  1. **WebRTC:** Sub-200ms latency, native browser `<video>` playback via WHEP/SDP.
  2. **HLS / LL-HLS:** Higher latency (~2–5s), resilient over fluctuating WAN connections.
  3. **RTSP over TLS:** Direct tunnel into media gateway (go2rtc).
- **Lease Expiry & Atomic Renewal:** Cloud stream URLs carry finite token validity (typically 15 minutes to 2 hours). The application must perform proactive atomic refresh prior to token expiration to avoid video interruption.

### 3.3 The 32-Channel Concurrent Stream Constraint
- **Public Cloud Quota:** Standard DoLynk Cloud developer accounts enforce concurrent live-view channel limits (typically 2 to 4 simultaneous streams per NVR on standard tiers due to cloud relay bandwidth costs).
- **Hard Constraint for YardSight:** **YardSight will NOT claim 32-channel cloud streaming support until Dahua grants written commercial entitlement and live load-testing proves it.**
- **Hybrid Solution (Cloud vs. Edge):**
  - **Cloud Share Mode (DoLynk API):** Supports 4 to 8 active focus channels over WAN when no on-prem server exists.
  - **On-Site Edge Connector Mode (LAN go2rtc):** For full 32-channel concurrent continuous streaming at 25 FPS, an on-site YardSight Edge Gateway connects locally to the NVR's RTSP interface, bypassing cloud relay quotas while maintaining DMSS cloud authorization.

---

## 4. Formal Request Letter for Dahua Sales & Technical Support

The following formal inquiry must be submitted to Dahua Developer Support (`developer@dahuatech.com` / Dahua India Partner Support):

```text
Subject: DoLynk Developer API access for a multi-tenant CCTV SaaS

We are building YardSight, a multi-tenant logistics CCTV platform. We need to integrate customer-owned Dahua/DMSS NVRs without transferring ownership or collecting customer DMSS passwords. The device owner must be able to grant and revoke read-only Live View access.

Please confirm:
1. Which DoLynk Developer API/product supports this workflow?
2. Can a DMSS owner delegate a device to our application while retaining ownership?
3. What official authorization flow is supported: QR pairing, sharing, entrustment, OAuth, or another method?
4. Can we obtain separate temporary live-view sources for NVR channels?
5. What is the maximum simultaneous live-view channel limit for one NVR/customer/app?
6. Is 32-channel concurrent live view supported?
7. What credentials, company documents, agreements, or partner approvals are required in India?
8. Is a sandbox/staging environment available?
9. What are the token expiry, renewal, revocation, and webhook mechanisms?
10. What pricing or commercial limits apply to live-view streaming?
```

---

## 5. Phase 0 Entitlement Gate Decision

> **GATE DECISION: ENTITLEMENT PENDING.**  
> In accordance with project instructions:
> 1. Production cloud stream integration code is paused.
> 2. No undocumented or guessed DMSS endpoints will be invoked.
> 3. YardSight UI will display an honest **"Dahua Cloud Entitlement Pending"** status.
> 4. The secure data model, tenant isolation, and customer-facing authorization UI are implemented in Phase 1 ready for activation upon Dahua confirmation.
