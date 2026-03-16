"""Generate demo data for PostgreSQL health monitoring."""
import psycopg2
import time
import threading
from app.config import get_settings


def create_bloat_table(conn):
    """Create a table with significant dead tuples."""
    with conn.cursor() as cur:
        # Drop if exists
        cur.execute("DROP TABLE IF EXISTS seed_bloat")

        # Create table
        cur.execute("""
            CREATE TABLE seed_bloat (
                id SERIAL PRIMARY KEY,
                data TEXT
            )
        """)
        conn.commit()

        # Insert 100k rows
        print("Inserting 100k rows...")
        for i in range(0, 100000, 1000):
            values = ",".join([f"('data-{j}')" for j in range(i, min(i+1000, 100000))])
            cur.execute(f"INSERT INTO seed_bloat (data) VALUES {values}")
        conn.commit()

        # Delete 50% to create dead tuples
        print("Deleting 50k rows to create dead tuple bloat...")
        cur.execute("DELETE FROM seed_bloat WHERE id % 2 = 0")
        conn.commit()

        # Don't vacuum - we want the dead tuples to show in pg_stat_user_tables
        print("Created bloat table with ~50% dead tuples")


def blocking_reader_thread(conn, duration_s=90):
    """Hold an exclusive lock for N seconds to block other queries."""
    try:
        with conn.cursor() as cur:
            cur.execute("BEGIN")
            cur.execute("LOCK TABLE seed_bloat IN ACCESS EXCLUSIVE MODE")
            print(f"Lock acquired, holding for {duration_s} seconds...")
            time.sleep(duration_s)
    except Exception as e:
        print(f"Blocker thread error: {e}")
    finally:
        conn.close()


def blocked_reader_thread(conn, delay_s=1):
    """Attempt to read from locked table (will block)."""
    try:
        time.sleep(delay_s)  # Let blocker establish lock first
        with conn.cursor() as cur:
            cur.execute("SELECT COUNT(*) FROM seed_bloat")
            result = cur.fetchone()
            print(f"Query completed: {result}")
    except Exception as e:
        print(f"Blocked reader error: {e}")
    finally:
        conn.close()


def run_seed():
    """Main seed function."""
    settings = get_settings()

    print("=" * 60)
    print("PostgreSQL Health Monitor - Demo Data Generator")
    print("=" * 60)

    # Connect to database
    try:
        conn = psycopg2.connect(settings.DATABASE_URL)
    except Exception as e:
        print(f"Failed to connect to PostgreSQL: {e}")
        print("Make sure PostgreSQL is running and DATABASE_URL is correct")
        return

    # Create bloat
    print("\n[1/3] Creating bloat table...")
    create_bloat_table(conn)
    conn.close()

    print("\n[2/3] Creating blocking scenario...")
    # Get fresh connections for threads
    blocker_conn = psycopg2.connect(settings.DATABASE_URL)
    blocker_thread = threading.Thread(
        target=blocking_reader_thread,
        args=(blocker_conn, 90),
        daemon=True
    )
    blocker_thread.start()

    # Give blocker time to acquire lock
    time.sleep(1)

    # Now launch 3 blocked readers
    print("\n[3/3] Launching blocked queries...")
    for i in range(3):
        blocked_conn = psycopg2.connect(settings.DATABASE_URL)
        blocked_thread = threading.Thread(
            target=blocked_reader_thread,
            args=(blocked_conn, 0.5 + i*0.5),
            daemon=True
        )
        blocked_thread.start()

    print("\n" + "=" * 60)
    print("Demo data created! Dashboard will show:")
    print("  - ~50% dead tuples in seed_bloat table (orange alert)")
    print("  - 1 blocking query (red alert)")
    print("  - 3 blocked queries (red alert with victim PIDs)")
    print("=" * 60)
    print("\nAlerts will clear after ~90 seconds when lock is released")


if __name__ == "__main__":
    run_seed()
