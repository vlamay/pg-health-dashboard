"""Tests for alerts module."""
from unittest import mock
from app import alerts


def test_compute_alerts_structure():
    """Test that compute_alerts returns correct structure."""
    with mock.patch("app.alerts.metrics.active_connections") as mock_conn:
        mock_conn.return_value = {
            "active": 50,
            "max_connections": 100,
            "utilization_pct": 50.0
        }

        result = alerts.compute_alerts()

        assert isinstance(result, list)
        for alert in result:
            assert "id" in alert
            assert "severity" in alert
            assert "category" in alert
            assert "message" in alert
            assert "value" in alert
            assert "threshold" in alert
            assert alert["severity"] in ["critical", "warning", "info"]


def test_connection_critical_alert():
    """Test critical connection pool alert."""
    with mock.patch("app.alerts.metrics.active_connections") as mock_conn:
        mock_conn.return_value = {
            "active": 95,
            "max_connections": 100,
            "utilization_pct": 95.0
        }

        result = alerts.compute_alerts()

        # Should have critical alert
        critical = [a for a in result if a["severity"] == "critical" and "connection" in a["id"]]
        assert len(critical) > 0
        assert critical[0]["category"] == "Connection Pool"


def test_connection_warning_alert():
    """Test warning connection pool alert."""
    with mock.patch("app.alerts.metrics.active_connections") as mock_conn:
        mock_conn.return_value = {
            "active": 80,
            "max_connections": 100,
            "utilization_pct": 80.0
        }

        result = alerts.compute_alerts()

        # Should have warning alert
        warning = [a for a in result if a["severity"] == "warning" and "connection" in a["id"]]
        assert len(warning) > 0


def test_blocking_query_alert():
    """Test blocking query alert."""
    with mock.patch("app.alerts.metrics.active_connections"):
        with mock.patch("app.alerts.metrics.blocking_queries") as mock_block:
            mock_block.return_value = [
                {
                    "blocker_pid": 123,
                    "blocker_query": "SELECT * FROM big_table",
                    "blocker_duration_s": 10.0,
                    "victim_pids": [124, 125]
                }
            ]

            result = alerts.compute_alerts()

            # Should have critical blocking alert
            blocking = [a for a in result if "blocking" in a["id"]]
            assert len(blocking) > 0
            assert blocking[0]["severity"] == "critical"


def test_alert_sorting():
    """Test that alerts are sorted by severity."""
    with mock.patch("app.alerts.metrics.active_connections") as mock_conn:
        with mock.patch("app.alerts.metrics.blocking_queries") as mock_block:
            mock_conn.return_value = {
                "active": 80,
                "max_connections": 100,
                "utilization_pct": 80.0
            }
            mock_block.return_value = [
                {
                    "blocker_pid": 123,
                    "blocker_query": "SELECT * FROM table",
                    "blocker_duration_s": 10.0,
                    "victim_pids": [124]
                }
            ]

            result = alerts.compute_alerts()

            # Critical should come before warning
            severity_indices = {a["severity"]: i for i, a in enumerate(result)}
            if "critical" in severity_indices and "warning" in severity_indices:
                assert severity_indices["critical"] < severity_indices["warning"]
