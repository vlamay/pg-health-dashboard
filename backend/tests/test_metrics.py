"""Tests for metrics module."""
import os
import pytest
from app.db import init_pool, close_pool
from app import metrics


@pytest.fixture(scope="module")
def setup_db():
    """Initialize database for tests."""
    db_url = os.getenv("DATABASE_URL", "postgresql://pghealth:pghealth@localhost:5432/pghealth")
    init_pool(db_url)
    yield
    close_pool()


def test_active_connections(setup_db):
    """Test active_connections metric."""
    result = metrics.active_connections()
    assert isinstance(result, dict)
    assert "active" in result
    assert "max_connections" in result
    assert "utilization_pct" in result
    assert result["active"] >= 0
    assert result["max_connections"] > 0
    assert 0 <= result["utilization_pct"] <= 100


def test_blocking_queries(setup_db):
    """Test blocking_queries metric."""
    result = metrics.blocking_queries()
    assert isinstance(result, list)
    # Should be empty in normal circumstances
    for blocker in result:
        assert "blocker_pid" in blocker
        assert "blocker_query" in blocker
        assert "blocker_duration_s" in blocker
        assert "victim_pids" in blocker
        assert isinstance(blocker["victim_pids"], list)


def test_lock_waits(setup_db):
    """Test lock_waits metric."""
    result = metrics.lock_waits()
    assert isinstance(result, list)
    for wait in result:
        assert "pid" in wait
        assert "query" in wait
        assert "wait_duration_s" in wait


def test_longest_running_query(setup_db):
    """Test longest_running_query metric."""
    result = metrics.longest_running_query()
    assert isinstance(result, list)
    for query in result:
        assert "pid" in query
        assert "query" in query
        assert "duration_s" in query
        assert "state" in query


def test_replication_lag(setup_db):
    """Test replication_lag metric."""
    result = metrics.replication_lag()
    assert isinstance(result, list)
    # Empty on standalone instance
    for replica in result:
        assert "client_addr" in replica
        assert "state" in replica
        assert "replay_lag_bytes" in replica


def test_vacuum_stats(setup_db):
    """Test vacuum_stats metric."""
    result = metrics.vacuum_stats()
    assert isinstance(result, list)
    for table in result:
        assert "relname" in table
        assert "n_dead_tup" in table
        assert "n_live_tup" in table
        assert "dead_tuple_pct" in table


def test_cache_hit_ratio(setup_db):
    """Test cache_hit_ratio metric."""
    result = metrics.cache_hit_ratio()
    assert isinstance(result, list)
    for table in result:
        assert "relname" in table
        assert "cache_hit_pct" in table
        assert 0 <= table["cache_hit_pct"] <= 100


def test_index_usage(setup_db):
    """Test index_usage metric."""
    result = metrics.index_usage()
    assert isinstance(result, list)
    for idx in result:
        assert "schemaname" in idx
        assert "tablename" in idx
        assert "indexname" in idx
        assert "idx_scan" in idx
