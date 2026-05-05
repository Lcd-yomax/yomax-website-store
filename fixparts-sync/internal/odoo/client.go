package odoo

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"
)

// Client is an Odoo JSON-RPC client.
type Client struct {
	url      string
	db       string
	uid      int
	password string
	http     *http.Client
}

// OdooProduct represents a raw product from the Odoo API response.
type OdooProduct struct {
	ID          int64       `json:"id"`
	Name        string      `json:"name"`
	DefaultCode interface{} `json:"default_code"` // string or false
	CategID     interface{} `json:"categ_id"`     // [id, name] or false
	BrandID     interface{} `json:"brand_id"`     // [id, name] or false
	Image1920   interface{} `json:"image_1920"`   // base64 string or false
	ListPrice   float64     `json:"list_price"`
}

// jsonRPCRequest is the JSON-RPC envelope for Odoo calls.
type jsonRPCRequest struct {
	JSONRPC string      `json:"jsonrpc"`
	Method  string      `json:"method"`
	Params  interface{} `json:"params"`
}

type executeKWParams struct {
	Service string        `json:"service"`
	Method  string        `json:"method"`
	Args    []interface{} `json:"args"`
}

// jsonRPCResponse is the generic JSON-RPC response.
type jsonRPCResponse struct {
	JSONRPC string           `json:"jsonrpc"`
	Result  json.RawMessage  `json:"result"`
	Error   *json.RawMessage `json:"error"`
}

// NewClient creates a new Odoo JSON-RPC client.
func NewClient(url, db string, uid int, password string) *Client {
	return &Client{
		url:      url,
		db:       db,
		uid:      uid,
		password: password,
		http: &http.Client{
			Timeout: 120 * time.Second, // 2 min timeout for large batches
		},
	}
}

// executeKW calls Odoo's execute_kw method via JSON-RPC.
func (c *Client) executeKW(model, method string, domain []interface{}, kwargs map[string]interface{}) (json.RawMessage, error) {
	args := []interface{}{
		c.db,
		c.uid,
		c.password,
		model,
		method,
		domain,
	}
	if kwargs != nil {
		args = append(args, kwargs)
	}

	payload := jsonRPCRequest{
		JSONRPC: "2.0",
		Method:  "call",
		Params: executeKWParams{
			Service: "object",
			Method:  "execute_kw",
			Args:    args,
		},
	}

	body, err := json.Marshal(payload)
	if err != nil {
		return nil, fmt.Errorf("marshal request: %w", err)
	}

	resp, err := c.http.Post(c.url+"/jsonrpc", "application/json", bytes.NewReader(body))
	if err != nil {
		return nil, fmt.Errorf("HTTP request failed: %w", err)
	}
	defer resp.Body.Close()

	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("read response: %w", err)
	}

	var rpcResp jsonRPCResponse
	if err := json.Unmarshal(respBody, &rpcResp); err != nil {
		return nil, fmt.Errorf("unmarshal response: %w", err)
	}

	if rpcResp.Error != nil {
		return nil, fmt.Errorf("Odoo RPC error: %s", string(*rpcResp.Error))
	}

	return rpcResp.Result, nil
}

// SearchCount returns the total number of products matching the sync filters.
func (c *Client) SearchCount() (int, error) {
	domain := []interface{}{
		[]interface{}{
			[]interface{}{"sale_ok", "=", true},
			[]interface{}{"active", "=", true},
			[]interface{}{"default_code", "!=", false},
		},
	}

	result, err := c.executeKW("product.template", "search_count", domain, nil)
	if err != nil {
		return 0, err
	}

	var count int
	if err := json.Unmarshal(result, &count); err != nil {
		return 0, fmt.Errorf("unmarshal count: %w", err)
	}

	return count, nil
}

// SearchRead fetches a batch of products from Odoo.
func (c *Client) SearchRead(offset, limit int) ([]OdooProduct, error) {
	domain := []interface{}{
		[]interface{}{
			[]interface{}{"sale_ok", "=", true},
			[]interface{}{"active", "=", true},
			[]interface{}{"default_code", "!=", false},
		},
	}

	kwargs := map[string]interface{}{
		"fields": []string{
			"id", "name", "default_code",
			"categ_id", "brand_id", "image_1920", "list_price",
		},
		"limit":  limit,
		"offset": offset,
	}

	result, err := c.executeKW("product.template", "search_read", domain, kwargs)
	if err != nil {
		return nil, err
	}

	var products []OdooProduct
	if err := json.Unmarshal(result, &products); err != nil {
		return nil, fmt.Errorf("unmarshal products: %w", err)
	}

	return products, nil
}

// --- Helper methods to extract typed values from Odoo's dynamic fields ---

// GetDefaultCode returns the SKU string, or empty if false.
func (p *OdooProduct) GetDefaultCode() string {
	if s, ok := p.DefaultCode.(string); ok {
		return s
	}
	return ""
}

// GetCategID returns (id, name) from the categ_id field, or (0, "") if false.
func (p *OdooProduct) GetCategID() (int64, string) {
	if arr, ok := p.CategID.([]interface{}); ok && len(arr) == 2 {
		id, _ := arr[0].(float64)
		name, _ := arr[1].(string)
		return int64(id), name
	}
	return 0, ""
}

// GetBrandID returns (id, name) from the brand_id field, or (0, "") if false.
func (p *OdooProduct) GetBrandID() (int64, string) {
	if arr, ok := p.BrandID.([]interface{}); ok && len(arr) == 2 {
		id, _ := arr[0].(float64)
		name, _ := arr[1].(string)
		return int64(id), name
	}
	return 0, ""
}

// GetImage returns the base64 image string, or empty if false/missing.
func (p *OdooProduct) GetImage() string {
	if s, ok := p.Image1920.(string); ok {
		return s
	}
	return ""
}
