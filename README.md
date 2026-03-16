# 🛡️ PostgreSQL Health Monitor Dashboard

**Real-time monitoring dashboard for PostgreSQL databases with adaptive polling, intelligent alerting, and beautiful UI.**

[![React](https://img.shields.io/badge/React-18-blue?logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-5-purple?logo=vite)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3-teal?logo=tailwindcss)](https://tailwindcss.com)

---

## 🎯 Overview

**PG Monitor** is a professional-grade PostgreSQL monitoring dashboard designed for DBAs and DevOps engineers. It provides real-time visibility into database health, performance metrics, and critical issues.

### ✨ Key Features

- ⚡ **Adaptive Polling** — Intelligent refresh intervals (2s critical, 10s normal)
- 💯 **Health Score** — Holistic database health (0-100) with color coding
- 🔴 **Replication Monitoring** — Real-time lag tracking with historical graphs
- 🔍 **Query Explorer** — Full-text search, filtering, sorting of active queries
- 🔔 **Smart Notifications** — Toast alerts for critical events
- 📱 **Full Responsive** — Mobile-first with bottom navigation
- 🛡️ **Error Resilience** — Error Boundaries on every widget
- 🔗 **Deep Linking** — URL routing (#/overview, #/issues, etc.)
- ✨ **Smooth Animations** — Transitions and loading states
- 🎨 **Mission Control Theme** — Dark professional UI with green accents

---

## 🚀 Quick Start

### Demo Mode (No Database)

```bash
cd frontend
npm install
npm run dev
# Open: http://localhost:5174/?demo=true
```

### Real Database

```bash
# Backend
cd backend && pip install -r requirements.txt
python -m uvicorn app.main:app --reload

# Frontend (another terminal)
cd frontend && npm run dev
# Open: http://localhost:5174
```

---

## 📊 Dashboard Sections

| Section | Features |
|---------|----------|
| **Overview** | Cluster status, metrics, health score |
| **Issues** | Blocking queries, lock waits, cache misses |
| **Health** | Vacuum stats, replication lag, cache ratio |
| **Performance** | Query explorer, long queries, index usage |
| **Monitoring** | Real-time widgets collection |

### Dashboard Screenshots

**Overview with Health Score (65/100)**
![Overview Dashboard](docs/screenshots/05-health-score.png)

**Active Issues & Monitoring**
![Active Issues](docs/screenshots/03-health-dashboard.png)

**Database Health & Performance**
![Database Health](docs/screenshots/02-database-health.png)

**Performance Metrics & Query Analysis**
![Performance](docs/screenshots/06-performance.png)

---

## 🎮 Interactive Features

### Query Explorer
- 🔍 Search by PID/text/state
- 📊 Filter by active/idle/waiting
- 📈 Sort by any column
- 📋 Copy queries to clipboard

### Query Cards
- 📖 Expand full query text
- 📋 Copy SQL with feedback
- ⚠️ Kill query with confirmation

### Notifications
- 🔴 Blocking queries detected
- 🔒 Lock waits exceeded
- ⏱️ Replication lag >10s
- 📊 Vacuum needed >30% dead tuples

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite 5 + Tailwind 3 |
| Charts | Recharts 2.10 |
| Icons | Lucide React 0.294 |
| Animation | Framer Motion 11 |
| Backend | FastAPI |
| Database | PostgreSQL |
| State | React Context API |
| Routing | History API |

---

## 📈 Performance

| Metric | Value |
|--------|-------|
| Bundle Size | 206 KB (gzip) |
| Build Time | ~4.6 sec |
| Initial Load | <1 sec |
| Mobile Ready | 100% |
| Error Handling | Comprehensive |

---

## 🏗️ Project Structure

```
frontend/
├── src/components/         # 22 reusable components
├── src/hooks/             # useWebSocket (adaptive polling)
├── src/context/           # NotificationContext
├── src/utils/             # Animations, mock data
├── src/App.jsx            # Main with routing
└── tailwind.config.js      # Design tokens

backend/
├── app/metrics.py         # PostgreSQL queries
├── app/main.py            # FastAPI + WebSocket
├── app/db.py              # Connection pool
└── app/alerts.py          # Alert logic
```

---

## 🎨 Color Scheme

```
Primary Accent:   #00FF94 (Emerald Green)
Warning:          #FFB800 (Amber)
Critical:         #FF3B5C (Red)
Background:       #08090A (Deep Void)
Card:             #141820
```

---

## 📱 Mobile Features

- Bottom navigation bar (< 768px)
- 1-column layout on mobile
- Horizontal scroll for tables
- Reduced typography
- Touch-friendly buttons

---

## 🧪 Demo Data

Includes simulated:
- ✅ Real-time metrics
- ✅ Blocking queries
- ✅ Lock contention
- ✅ Replication lag
- ✅ Vacuum statistics
- ✅ All UI interactions

---

## 🔧 Configuration

### Backend (.env)
```
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=postgres
POSTGRES_USER=postgres
POSTGRES_PASSWORD=yourpassword
METRICS_REFRESH_INTERVAL_S=3
```

### Frontend
- WebSocket: `ws://${window.location.host}/ws/metrics`
- Demo: `?demo=true` URL parameter

---

## 📊 Health Score Algorithm

```
score = 100
  - (blocking_queries.length × 5)
  - (lock_waits.length × 3)
  - ((100 - avg_cache_hit) × 0.3)
  - (tables_with_dead>10% × 2)
  - (connection_pool>80% × 1)
  - (replication_lag>5s × 4)
```

**Color Coding:**
- 🟢 ≥80: Healthy
- 🟡 60-79: Caution
- 🟠 40-59: Warning
- 🔴 <40: Critical

---

## ⚡ Adaptive Polling

- **2s**: Blocking queries OR lock waits detected
- **3s**: Replication lag > 5 seconds
- **10s**: Normal operation (minimize load)

---

## 🐛 Error Handling

Each widget has:
- ✅ ErrorBoundary wrapper
- ✅ Graceful fallback UI
- ✅ Retry button
- ✅ No cascading failures

---

##  Deployment

### Docker Compose
```bash
docker-compose up -d
```

### Production Build
```bash
cd frontend && npm run build
# Outputs to: dist/
```

---

##  Recent Updates

✅ **V1.0 Complete** — All 13 features shipped:
- Replication Lag graph
- Adaptive polling
- Health Score
- Transitions & animations
- Error Boundaries
- Skeleton loading
- Full responsive design
- Query Explorer
- Query card controls
- Toast notifications
- URL routing
- Schema.table display
- Last update indicator

---

## 📄 License

MIT License

---


React • Vite • Tailwind CSS • Framer Motion • Recharts

