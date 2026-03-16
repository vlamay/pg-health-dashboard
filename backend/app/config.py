from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """Application configuration from environment variables."""

    DATABASE_URL: str = "postgresql://pghealth:pghealth@postgres:5432/pghealth"

    # Alert thresholds
    ALERT_LOCK_WAIT_THRESHOLD_MS: int = 5000
    ALERT_LONG_QUERY_THRESHOLD_S: int = 30
    ALERT_DEAD_TUPLE_RATIO: float = 0.1

    # Metrics refresh interval
    METRICS_REFRESH_INTERVAL_S: int = 5

    # Uvicorn settings
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    RELOAD: bool = True

    class Config:
        env_file = ".env"
        case_sensitive = True


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()
