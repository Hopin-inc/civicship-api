export interface BaseSepoliaNftItem {
  id: string;
  metadata: {
    name?: string;
    description?: string;
    image?: string;
  };
  token: {
    address?: string;
    address_hash?: string;
    name?: string;
    symbol?: string;
    type: string;
  };
}

export interface BaseSepoliaNftResponse {
  items: BaseSepoliaNftItem[];
  next_page_params: Record<string, unknown> | null;
}

export interface BaseSepoliaTokenResponse {
  address?: string;
  address_hash?: string;
  name?: string;
  symbol?: string;
  type: string;
  decimals?: string;
  holders?: string;
  exchange_rate?: string;
  total_supply?: string;
  circulating_market_cap?: string;
  icon_url?: string;
}
