package config

import (
	"log"
	"os"
	"strconv"

	"github.com/joho/godotenv"
)

type Config struct {
	AppPort       string
	AppEnv        string
	DBHost        string
	DBPort        string
	DBUser        string
	DBPassword    string
	DBName        string
	DBSSLMode     string
	DBLogLevel    string
	AutoMigrate   bool
	RedisHost     string
	RedisPort     string
	RedisPassword string
	RedisDB       int
	SMTPHost      string
	SMTPPort      string
	SMTPUser      string
	SMTPPassword  string
	JWTSecret     string
	JWTExpireHr   int
}

func LoadConfig() *Config {
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using system environment variables")
	}

	jwtExpire, _ := strconv.Atoi(getEnv("JWT_EXPIRE_HOURS", "24"))
	autoMigrate, _ := strconv.ParseBool(getEnv("AUTO_MIGRATE", "true"))
	redisDB, _ := strconv.Atoi(getEnv("REDIS_DB", "0"))

	return &Config{
		AppPort:       getEnv("APP_PORT", "8080"),
		AppEnv:        getEnv("APP_ENV", "development"),
		DBHost:        getEnv("DB_HOST", "127.0.0.1"),
		DBPort:        getEnv("DB_PORT", "5432"),
		DBUser:        getEnv("DB_USER", "postgres"),
		DBPassword:    getEnv("DB_PASSWORD", "postgres"),
		DBName:        getEnv("DB_NAME", "hidocs_db"),
		DBSSLMode:     getEnv("DB_SSLMODE", "disable"),
		DBLogLevel:    getEnv("DB_LOG_LEVEL", "warn"),
		AutoMigrate:   autoMigrate,
		RedisHost:     getEnv("REDIS_HOST", "127.0.0.1"),
		RedisPassword: getEnv("REDIS_PASSWORD", ""),
		RedisDB:       redisDB,
		SMTPHost:      getEnv("SMTP_HOST", "smtp.gmail.com"),
		SMTPPort:      getEnv("SMTP_PORT", "587"),
		SMTPUser:      getEnv("SMTP_USER", ""),
		SMTPPassword:  getEnv("SMTP_PASSWORD", ""),
		JWTSecret:     getEnv("JWT_SECRET", "super-secret-key-hidocs-2026"),
		JWTExpireHr:   jwtExpire,
	}
}

func getEnv(key, fallback string) string {
	if value, ok := os.LookupEnv(key); ok {
		return value
	}
	return fallback
}
