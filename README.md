# 👁️ YardSight AI: Multi-RTSP Industrial Logistics Intelligence & Gate Automation

[![OpenCV AI Competition 2026](https://img.shields.io/badge/OpenCV%20AI%20Competition-2026%20(AWS)-blue?style=for-the-badge&logo=opencv)](https://opencv.org/)
[![Nebius x NVIDIA AI Hackathon](https://img.shields.io/badge/Nebius%20x%20NVIDIA-Global%20AI%20Hackathon-green?style=for-the-badge&logo=nvidia)](https://nebius.com/)
[![Built for US & India Corridors](https://img.shields.io/badge/Markets-US%20%26%20India%20Logistics-orange?style=for-the-badge)](https://github.com/rusil3473/yardsight-ai)
[![License: MIT](https://img.shields.io/badge/License-MIT-emerald?style=for-the-badge)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.x-purple?style=for-the-badge&logo=vite)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-cyan?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)

> **Industrial multi-camera computer vision and spatial-temporal reasoning VLM platform featuring OpenCV 4.10 perspective homography ANPR for US & Indian license plates, specular concrete hydrocarbon leak detection, safety PPE monitoring, and WhatsApp emergency dispatch.**

---

## 💡 The Industrial Problem
Freight depots, container terminals, and manufacturing distribution centers handle thousands of truck turnarounds daily under high operational stress:
- **Blind Gate Congestion:** Manual inspection of truck license plates and paper shipping manifests creates 45+ minute bottlenecks at inbound logistics gates.
- **Extreme Camera Angles:** High-mounted perimeter CCTV cameras capture license plates at acute 30°–50° angles, rendering traditional OCR pipelines useless without perspective correction.
- **Undetected Chemical & Diesel Spills:** Leaking tractor hydraulics or diesel fuel pooling on polished depot concrete create OSHA slip-and-fall hazards and environmental contamination that go unnoticed until accidents occur.
- **Fragmented Incident Escalation:** Yard supervisors in India rely heavily on WhatsApp groups for yard dispatch, while US logistics hubs use SMS/email alerts.

---

## ⚡ The Solution: YardSight AI Architecture

YardSight AI fuses classical computer vision with cutting-edge Vision-Language Models (VLMs) across 4 high-throughput pipelines:

### 1. OpenCV 4.10 Perspective Homography ANPR
- **Homography Normalization:** Computes the $3 \times 3$ projective transformation matrix $H$ from 4 corner coordinate detections, rectifying severe pitch/yaw angle distortion into a flat, orthogonal character strip.
- **Dual-Market OCR Engine:**
  - **United States:** USDOT commercial carriers and state registration formats (`TX 942-WKY`, `IL K88-2940`, `CA 8ABC123`).
  - **India:** High Security Registration Plates (HSRP) featuring state codes, RTO district codes, and laser-branded hologram identification (`MH 12 RN 4589`, `DL 01 AB 9021`).

### 2. Concrete Specular Puddle & Hydrocarbon Leak Detection
- **Thin-Film Interference Modeling:** Measures specular reflectance peaks and chromatic dispersion gradients.
- **Hydrocarbon vs Water Differentiation:** Distinctively identifies diesel fuel and hydraulic fluid (refractive index $n \approx 1.46 - 1.48$, high iridescent rainbow sheen) versus benign rainwater puddles ($n = 1.333$, uniform diffuse reflectance).
- **Automated Hazmat Sizing:** Calculates pool square footage and prescribes precise granular absorbent boom poundage required under OSHA 1910.120 and India CPCB standards.

### 3. Spatial-Temporal VLM Reasoning Agent (AWS Bedrock / Nebius NVIDIA Cosmos)
- Site managers can converse directly with the camera matrix using natural language:
  - *"Did the Schneider National rig finish unloading at Loading Bay 3 before 10 AM?"*
  - *"Summarize active environmental hazards and absorbent boom status."*
  - *"Check if any unmanifested tankers entered through South Gate."*

### 4. Multi-Channel Emergency Dispatch & Audit Certification
- **WhatsApp Cloud API & SMS:** Automated incident alerts with camera coordinates and snapshot links sent directly to terminal supervisors.
- **jsPDF Compliance Audit Generator:** Single-click generation of cryptographically sealed PDF inspection reports ready for federal and state environmental audits.

---

## 🛠️ Technology Stack

- **Frontend & Visualization:** React 19, TypeScript, Vite, Tailwind CSS v4, Lucide Icons, Canvas Confetti.
- **Computer Vision & Math:** OpenCV Homography matrix transformations, HTML5 Canvas 2D image processing, thin-film chromatic variance calculators.
- **AI & VLM Layer:** AWS Bedrock / Nebius NVIDIA Cosmos Reason VLM agent architecture.
- **Report Engine:** jsPDF vector PDF generation.
- **Escalation Integrations:** WhatsApp Business Cloud API webhook schema, Twilio SMS payloads.
- **Testing & Verification:** Vitest test suite.

---

## 🚀 Quick Start

### 1. Clone & Install
```bash
git clone https://github.com/rusil3473/yardsight-ai.git
cd yardsight-ai
npm install
```

### 2. Launch Local Dev Server
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

### 3. Run Automated Unit Tests
```bash
npm test
```

### 4. Build Production Bundle
```bash
npm run build
```

---

## 👥 Authors & Team
- **Rusil Varu** (`rusilvaru555@gmail.com` / [@rusil3473](https://github.com/rusil3473))

## 📄 License
This project is open-source under the [MIT License](LICENSE).
