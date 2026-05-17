# 🎓 Ddumba.AI — Production AI Infrastructure Editorial

<p align="center">
  <img src="https://img.shields.io/badge/Status-Production%20Ready-10B981?style=for-the-badge" alt="Status" />
  <img src="https://img.shields.io/badge/Python-3.13-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python" />
  <img src="https://img.shields.io/badge/FastAPI-0.115-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI" />
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/PostgreSQL-14-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/TailwindCSS-3-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="TailwindCSS" />
  <img src="https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge" alt="License" />
</p>

<p align="center">
  <strong>Senior-engineer essays on vLLM, RAG, Kubernetes, inference cost optimization, and observability for production AI.</strong>
</p>

---

## 📖 About

**Ddumba.AI Editorial** is a full-stack, production-grade editorial platform for deep-dive engineering essays on production AI infrastructure. Built from scratch with a React frontend, FastAPI backend, PostgreSQL database, JWT authentication, newsletter subscription system with automated email broadcasts, and a comprehensive admin dashboard.

### ✨ Features

- 🖋️ **Rich Article Editor** — Notion-style block editor with live preview
- 📧 **Newsletter System** — Email subscription with automated welcome emails and post notifications
- 🔐 **JWT Authentication** — Secure admin login with bcrypt password hashing
- 📊 **Admin Dashboard** — Manage posts, comments, media, categories, branding, and subscribers
- 🎨 **Dark/Light Mode** — Premium dark-mode editorial design with theme toggle
- 💬 **Comments System** — Threaded comments with like functionality
- 🔍 **Search & Filter** — Full-text search across articles with category filtering
- 📱 **Fully Responsive** — Mobile-first design optimized for all devices
- 🚀 **Production Deployments** — Backend on Railway, Frontend on Vercel

---

## 🏗️ Architecture

```
┌──────────────────────────┐     HTTP/JSON      ┌─────────────────────────┐
│   React Frontend         │ ◄────────────────► │   FastAPI Backend        │
│   (TypeScript + Vite)    │                    │   (Python 3.13)          │
│                          │                    │                          │
│   • Editorial UI         │                    │   • /api/auth/*          │
│   • Admin Dashboard      │                    │   • /api/posts/*         │
│   • Article Editor       │                    │   • /api/authors/*       │
│   • Comments System      │                    │   • /api/comments/*      │
│   • Newsletter Signup    │                    │   • /api/media/*         │
│   • Dark/Light Theme     │                    │   • /api/branding/*      │
│                          │                    │   • /api/categories/*    │
│                          │                    │   • /api/subscribe/*     │
└──────────────────────────┘                    └──────────┬──────────────┘
                                                           │
                                                           │ SQLAlchemy ORM
                                                           ▼
                                                ┌─────────────────────┐
                                                │   PostgreSQL        │
                                                │                     │
                                                │   • authors         │
                                                │   • posts           │
                                                │   • comments        │
                                                │   • media_items     │
                                                │   • branding        │
                                                │   • categories      │
                                                │   • subscribers     │
                                                └─────────────────────┘
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, TypeScript, Vite, TailwindCSS, TanStack Router, Framer Motion |
| **Backend** | Python 3.13, FastAPI, Uvicorn, SQLAlchemy, Pydantic |
| **Database** | PostgreSQL 14 |
| **Authentication** | JWT (python-jose), bcrypt |
| **Email** | SMTP (cPanel), BackgroundTasks |
| **UI Components** | Lucide React, Radix UI, shadcn/ui |
| **Deployment** | Railway (Backend), Vercel (Frontend) |

---

## 🚀 Quick Start

### Prerequisites

- Python 3.13+
- Node.js 22+
- PostgreSQL 14+
- Git

### Backend Setup

```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env  # Edit with your credentials
uvicorn app.main:app --reload --port 8000
```

### Frontend Setup

```bash
npm install
npm run dev
```

Visit `http://localhost:8080` for the frontend and `http://localhost:8000/docs` for API documentation.

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/login` | Admin login |
| `GET` | `/api/auth/me` | Get current user |
| `GET` | `/api/posts/` | List all posts |
| `POST` | `/api/posts/` | Create post |
| `PATCH` | `/api/posts/{id}/publish` | Toggle publish |
| `GET` | `/api/authors/` | List authors |
| `GET` | `/api/comments/` | List comments |
| `POST` | `/api/comments/` | Add comment |
| `POST` | `/api/media/upload` | Upload media |
| `GET` | `/api/branding/` | Get branding |
| `GET` | `/api/categories/` | List categories |
| `GET` | `/api/subscribe/` | List subscribers |
| `POST` | `/api/subscribe/` | Subscribe to newsletter |

---

## 👨‍💻 Developer

**Ddumba Abdallah Kato**

<p>
  <a href="https://ddumba.kyakabi.com"><img src="https://img.shields.io/badge/Portfolio-ddumba.kyakabi.com-4F46E5?style=flat-square&logo=safari&logoColor=white" alt="Portfolio" /></a>
  <a href="https://github.com/Hatalabdallah"><img src="https://img.shields.io/badge/GitHub-Hatalabdallah-181717?style=flat-square&logo=github" alt="GitHub" /></a>
  <a href="https://x.com/Hatalabdallah"><img src="https://img.shields.io/badge/Twitter-@Hatalabdallah-1DA1F2?style=flat-square&logo=twitter&logoColor=white" alt="Twitter" /></a>
  <a href="https://www.linkedin.com/in/ddumbaka/"><img src="https://img.shields.io/badge/LinkedIn-ddumbaka-0A66C2?style=flat-square&logo=linkedin&logoColor=white" alt="LinkedIn" /></a>
  <a href="https://wa.me/256701019242"><img src="https://img.shields.io/badge/WhatsApp-+256701019242-25D366?style=flat-square&logo=whatsapp&logoColor=white" alt="WhatsApp" /></a>
</p>

**AI Platform Engineer | Production AI & Infrastructure**

I build the "Engines" that allow AI to survive in production. I sit at the intersection of Platform Reliability and AI System Design, transforming "Experimental AI" into "Enterprise-Grade Infrastructure" that is resilient, observable, and profitable.

**Focus Areas:** AI Infrastructure · Inference Efficiency · High-Fidelity RAG · Automated Governance · Platform Engineering

**Tech Stack:** LangChain · LlamaIndex · PyTorch · Pinecone · vLLM · AWS · Kubernetes · Terraform · Grafana · Kafka

---

## 🏢 Kyakabi Group

[Kyakabi Group](https://kyakabi.com) is a diversified information and technology company providing innovative solutions through its subsidiary brands: Kyakabi AI, Kyakabi Data, Kyakabi Telecom, Kyakabi Consulting, Kyakabi Creative, Kyakabi Games, and Kyakabi Foundation.

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  <sub>© 2026 Ddumba.AI Editorial. Built by <a href="https://github.com/Hatalabdallah">Ddumba Abdallah Kato</a> · <a href="https://kyakabi.com">Kyakabi Group</a></sub>
</p>

<!-- HASHTAGS -->
<p align="center">
  <sub>
    #FastAPI #React #PostgreSQL #TypeScript #Python #TailwindCSS #AI #Editorial #Blog #Newsletter #ProductionAI #PlatformEngineering #Kubernetes #RAG #vLLM #MLOps #FullStack #WebDevelopment #Engineering #Infrastructure
  </sub>
</p>