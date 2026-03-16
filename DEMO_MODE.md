# Demo Mode - Visual Walkthrough

The dashboard includes a **demo mode** that populates all components with realistic PostgreSQL health monitoring data. This allows you to see the full visual design and functionality without needing a backend database.

## Enabling Demo Mode

### Option 1: URL Parameter
Add `?demo=true` to the URL:
```
http://localhost:5175/?demo=true
```

### Option 2: UI Toggle Button
Click the **"🎨 Demo"** button in the header to toggle between demo mode and real data mode.

## What Demo Data Includes

### 📊 Metrics Overview
- **Active Connections**: 42 active, 18 idle (42% of max)
- **Blocking Queries**: 2 blocking queries with victims
- **Dead Tuple Tables**: Multiple tables with varying levels of dead tuples
- **Avg Cache Hit %**: Realistic distribution across tables

### 🔴 Blocking Queries
Two simulated blocking queries:
1. UPDATE statement blocking 2 processes (12.5s duration) → **amber**
2. DELETE statement blocking 1 process (45.8s duration) → **red**

### 🔄 Connection History
Real-time sparkline showing simulated connection count over last 30 minutes with natural variance.

### 🧹 Vacuum Statistics
7 tables with varying levels of dead tuples:
- **analytics_logs**: 45.6% dead tuples (needs attention) → **red**
- **transactions**: 22.4% dead tuples → **amber**
- **products**: 3.1% dead tuples (healthy) → **green**
- Others varying between 3% - 32%

### 💾 Cache Hit Ratio
8 tables showing realistic cache performance:
- **users**: 94.5% cache hit (excellent) → **green**
- **transactions**: 68.4% cache hit (poor) → **red**
- **analytics_logs**: 45.2% cache hit (critical) → **red**
- **sessions**: 91.8% cache hit (good) → **green**

**CacheMissLeaders widget** shows top 5 worst performers:
- Red badge showing "3 tables" below 90% threshold
- Color-coded progress bars for visual health

### 🔗 Replication Lag
Three replica connections:
1. **192.168.1.51**: Streaming (1.2s lag) → **green**
2. **192.168.1.52**: Streaming (2.8s lag) → **green**
3. **192.168.1.53**: Catchup (12.4s lag) → **amber**

### ⚠️ Alerts
System alerts demonstrating the alert banner:
- Warning: High dead tuple percentage
- Info: Replica catching up

## Live Data Updates

Demo mode updates metrics every 3 seconds to simulate real-time monitoring:
- Connection count varies naturally
- Cache hit ratios fluctuate slightly
- Replication lag increases/decreases
- Blocking queries rotate in/out

## Design Highlights

### ✨ Visual Polish (All Visible in Demo)
- ✅ Smooth sidebar active indicator (spring animation)
- ✅ Icon color coding (green/amber/red based on status)
- ✅ Progress bar animations (smooth transitions)
- ✅ Table row stagger animations
- ✅ Chip entrance animations in ClusterOverview
- ✅ Rich empty states with icons and descriptions
- ✅ Status badge colors reflecting health
- ✅ Glassmorphism design with improved shadows

### 🎨 Color Scheme
- **Primary**: Neon green `#3ECF8E`
- **Secondary**: Teal `#2DD4BF`
- **Background**: Near-black `#09090b`
- **Status**: Green (healthy), Amber (warning), Red (critical)

## Testing Scenarios

### 1. View Portfolio-Quality UI
- Enable demo mode
- Navigate through all sections (Overview → Active Issues → Database Health → Performance)
- Notice smooth animations and polish

### 2. Check Color-Coded Status
- Look at metric icons (all color-coded by health)
- Check cache hit ratio bars (red/amber/green based on percentage)
- View blocking query durations (color indicates severity)

### 3. Monitor Animations
- Watch sidebar active indicator slide smoothly
- See progress bars update smoothly every 3 seconds
- Notice table rows animate in
- Observe chip stagger animations

### 4. Verify All Components
- **ClusterOverview**: Live connection sparkline
- **MetricOverview**: 4 key metrics with color-coded icons
- **BlockingQueries**: 2 blocking queries (or empty state if rotated out)
- **CacheMissLeaders**: Top 5 worst-performing tables
- **VacuumStats**: Dead tuple & cache ratio tabs
- **ConnectionPool**: Connection utilization chart
- **ReplicationLag**: 3 replica connections with state badges

## Production Use

To use with a real PostgreSQL backend:
1. Start the backend server (it should create a WebSocket on `/ws/metrics`)
2. Reload the dashboard without `?demo=true` parameter
3. The dashboard will connect to the real WebSocket and display live data

The demo/real toggle allows seamless switching for testing and presentations.
