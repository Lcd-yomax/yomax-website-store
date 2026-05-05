package images

import (
	"encoding/base64"
	"fmt"
	"os"
	"path/filepath"
	"strings"
)

// Processor handles base64 image decoding and saving to disk.
type Processor struct {
	imageDir     string // Local directory to save images
	imageBaseURL string // Public URL prefix for images
}

// NewProcessor creates a new image processor.
func NewProcessor(imageDir, imageBaseURL string) *Processor {
	return &Processor{
		imageDir:     imageDir,
		imageBaseURL: strings.TrimRight(imageBaseURL, "/"),
	}
}

// Process decodes a base64 image and saves it to disk.
// Returns the public URL for the saved image.
func (p *Processor) Process(productID int64, base64Data string) (string, error) {
	if base64Data == "" {
		return "", nil
	}

	// Remove data URI prefix if present (e.g., "data:image/png;base64,...")
	cleanData := base64Data
	if idx := strings.Index(base64Data, ","); idx != -1 {
		cleanData = base64Data[idx+1:]
	}

	// Detect image format from base64 header bytes
	ext := detectFormat(cleanData)

	// Decode base64
	decoded, err := base64.StdEncoding.DecodeString(cleanData)
	if err != nil {
		// Try with padding fix
		decoded, err = base64.RawStdEncoding.DecodeString(cleanData)
		if err != nil {
			return "", fmt.Errorf("base64 decode failed for product %d: %w", productID, err)
		}
	}

	// Ensure directory exists
	productDir := filepath.Join(p.imageDir, "products")
	if err := os.MkdirAll(productDir, 0755); err != nil {
		return "", fmt.Errorf("create image dir: %w", err)
	}

	// Save to disk
	filename := fmt.Sprintf("%d.%s", productID, ext)
	filePath := filepath.Join(productDir, filename)

	if err := os.WriteFile(filePath, decoded, 0644); err != nil {
		return "", fmt.Errorf("write image file: %w", err)
	}

	// Return public URL
	publicURL := fmt.Sprintf("%s/products/%s", p.imageBaseURL, filename)
	return publicURL, nil
}

// detectFormat guesses the image format from the first few base64-decoded bytes.
func detectFormat(base64Data string) string {
	// Check base64 prefix patterns (before decoding, to save memory)
	switch {
	case strings.HasPrefix(base64Data, "UklGR"):
		return "webp" // RIFF header = WebP
	case strings.HasPrefix(base64Data, "/9j/"):
		return "jpeg" // JPEG magic bytes
	case strings.HasPrefix(base64Data, "iVBOR"):
		return "png" // PNG magic bytes
	case strings.HasPrefix(base64Data, "R0lGOD"):
		return "gif" // GIF magic bytes
	default:
		return "webp" // Default to webp (most Odoo images are webp)
	}
}
