package config

import (
	"fmt"
	"os"
	"strconv"

	"github.com/joho/godotenv"
)

// Config holds all application configuration loaded from environment variables.
type Config struct {
	// PostgreSQL
	DBHost     string
	DBPort     int
	DBUser     string
	DBPassword string
	DBName     string

	// Odoo API
	OdooURL      string
	OdooDB       string
	OdooUID      int
	OdooPassword string

	// Server
	Port         string
	APIKey       string
	ImageDir     string
	ImageBaseURL string

	// Sync
	SyncInterval  string
	SyncBatchSize int
}

// Load reads environment variables and returns a validated Config.
func Load() (*Config, error) {
	// Load .env file (ignore error if it doesn't exist — production uses real env vars)
	_ = godotenv.Load()

	cfg := &Config{
		// PostgreSQL
		DBHost:     getEnv("DB_HOST", "localhost"),
		DBPort:     getEnvInt("DB_PORT", 5432),
		DBUser:     getEnv("DB_USER", "fixparts"),
		DBPassword: getEnv("DB_PASSWORD", ""),
		DBName:     getEnv("DB_NAME", "fixparts"),

		// Odoo
		OdooURL:      getEnv("ODOO_URL", ""),
		OdooDB:       getEnv("ODOO_DB", "yomax"),
		OdooUID:      getEnvInt("ODOO_UID", 2),
		OdooPassword: getEnv("ODOO_PASSWORD", ""),

		// Server
		Port:         getEnv("PORT", "8080"),
		APIKey:       getEnv("API_KEY", "dev-api-key"),
		ImageDir:     getEnv("IMAGE_DIR", "./data/images"),
		ImageBaseURL: getEnv("IMAGE_BASE_URL", "http://localhost:8080/images"),

		// Sync
		SyncInterval:  getEnv("SYNC_INTERVAL", "2h"),
		SyncBatchSize: getEnvInt("SYNC_BATCH_SIZE", 50),
	}

	// Validate required fields
	if cfg.OdooURL == "" {
		return nil, fmt.Errorf("ODOO_URL is required")
	}
	if cfg.OdooPassword == "" {
		return nil, fmt.Errorf("ODOO_PASSWORD is required")
	}
	if cfg.DBPassword == "" {
		return nil, fmt.Errorf("DB_PASSWORD is required")
	}

	return cfg, nil
}

// DSN returns the PostgreSQL connection string for GORM.
func (c *Config) DSN() string {
	return fmt.Sprintf(
		"host=%s port=%d user=%s password=%s dbname=%s sslmode=disable TimeZone=UTC",
		c.DBHost, c.DBPort, c.DBUser, c.DBPassword, c.DBName,
	)
}

func getEnv(key, fallback string) string {
	if val := os.Getenv(key); val != "" {
		return val
	}
	return fallback
}

func getEnvInt(key string, fallback int) int {
	if val := os.Getenv(key); val != "" {
		if n, err := strconv.Atoi(val); err == nil {
			return n
		}
	}
	return fallback
}
