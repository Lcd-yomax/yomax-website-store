package main

import (
	"fmt"
	"log"

	"github.com/fixparts/sync/internal/api"
	"github.com/fixparts/sync/internal/config"
	"github.com/fixparts/sync/internal/database"
	"github.com/fixparts/sync/internal/images"
	"github.com/fixparts/sync/internal/odoo"
	syncpkg "github.com/fixparts/sync/internal/sync"
	"github.com/robfig/cron/v3"
)

func main() {
	log.Println("🔧 FixParts Sync Service starting...")

	// Load config
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("❌ Config error: %v", err)
	}
	log.Println("✅ Config loaded")

	// Connect to PostgreSQL
	db, err := database.Connect(cfg.DSN())
	if err != nil {
		log.Fatalf("❌ Database error: %v", err)
	}
	log.Println("✅ PostgreSQL connected")

	// Initialize components
	odooClient := odoo.NewClient(cfg.OdooURL, cfg.OdooDB, cfg.OdooUID, cfg.OdooPassword)
	imgProcessor := images.NewProcessor(cfg.ImageDir, cfg.ImageBaseURL)
	syncEngine := syncpkg.NewEngine(db, odooClient, imgProcessor, cfg.SyncBatchSize)

	// Setup cron scheduler
	c := cron.New()
	cronSpec := fmt.Sprintf("@every %s", cfg.SyncInterval)
	_, err = c.AddFunc(cronSpec, func() {
		log.Printf("⏰ Cron triggered: starting sync (interval: %s)", cfg.SyncInterval)
		syncEngine.Run()
	})
	if err != nil {
		log.Fatalf("❌ Cron setup error: %v", err)
	}
	c.Start()
	log.Printf("⏰ Cron scheduler started (sync every %s)", cfg.SyncInterval)

	// Setup and start HTTP server
	router := api.SetupRouter(db, cfg, syncEngine)
	addr := fmt.Sprintf(":%s", cfg.Port)
	log.Printf("🚀 Server listening on %s", addr)
	if err := router.Run(addr); err != nil {
		log.Fatalf("❌ Server error: %v", err)
	}
}
