import axios from 'axios';

/**
 * Odoo JSON-RPC API helper.
 *
 * Provides a typed interface to call Odoo's `execute_kw` method
 * via JSON-RPC, matching the structure from readme-api.md.
 */

interface OdooConfig {
  url: string;
  db: string;
  uid: number;
  password: string;
}

function getOdooConfig(): OdooConfig {
  const url = process.env.ODOO_URL;
  const db = process.env.ODOO_DB;
  const uid = process.env.ODOO_UID;
  const password = process.env.ODOO_PASSWORD;

  if (!url || !db || !uid || !password) {
    throw new Error(
      'Missing Odoo environment variables: ODOO_URL, ODOO_DB, ODOO_UID, ODOO_PASSWORD'
    );
  }

  return {
    url: url.replace(/\/$/, ''), // strip trailing slash
    db,
    uid: parseInt(uid, 10),
    password,
  };
}

/**
 * Raw Odoo product as returned by the API.
 * Fields match what we request in search_read.
 */
export interface OdooProduct {
  id: number;
  name: string;
  default_code: string | false;
  categ_id: [number, string] | false;
  brand_id: [number, string] | false;
  image_1920: string | false;
  list_price?: number;
}

/**
 * Calls Odoo's `execute_kw` via JSON-RPC.
 *
 * @param model - Odoo model name (e.g. 'product.template')
 * @param method - Method to call (e.g. 'search_read', 'search_count')
 * @param domain - Search domain filters
 * @param kwargs - Additional keyword args (fields, limit, offset, etc.)
 */
export async function odooExecuteKw<T = unknown>(
  model: string,
  method: string,
  domain: unknown[][],
  kwargs: Record<string, unknown> = {}
): Promise<T> {
  const config = getOdooConfig();

  const payload = {
    jsonrpc: '2.0',
    method: 'call',
    params: {
      service: 'object',
      method: 'execute_kw',
      args: [config.db, config.uid, config.password, model, method, domain, kwargs],
    },
  };

  const response = await axios.post(`${config.url}/jsonrpc`, payload, {
    headers: { 'Content-Type': 'application/json' },
    timeout: 120_000, // 2 minutes — large payloads can be slow
  });

  if (response.data.error) {
    throw new Error(
      `Odoo API error: ${response.data.error.message || JSON.stringify(response.data.error)}`
    );
  }

  return response.data.result as T;
}

/**
 * Fetches a batch of products from Odoo.
 *
 * @param offset - Pagination offset
 * @param limit - Number of products to fetch (default: 50)
 * @returns Array of raw Odoo products
 */
export async function fetchOdooProducts(
  offset: number,
  limit: number = 50
): Promise<OdooProduct[]> {
  const domain = [
    ['sale_ok', '=', true],
    ['active', '=', true],
    ['default_code', '!=', false],
  ];

  const fields = [
    'id',
    'name',
    'default_code',
    'categ_id',
    'brand_id',
    'image_1920',
    'list_price',
  ];

  return odooExecuteKw<OdooProduct[]>('product.template', 'search_read', [domain], {
    fields,
    limit,
    offset,
  });
}

/**
 * Gets the total count of products matching our sync filters.
 */
export async function getOdooProductCount(): Promise<number> {
  const domain = [
    ['sale_ok', '=', true],
    ['active', '=', true],
    ['default_code', '!=', false],
  ];

  return odooExecuteKw<number>('product.template', 'search_count', [domain]);
}
