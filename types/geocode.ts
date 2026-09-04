export interface GeoCoordinates {
  latitude: number;
  longitude: number;
}

export interface GeocodeAddressComponents {
  road?: string;
  neighbourhood?: string;
  suburb?: string;
  city: string;
  province: string;
  postcode?: string;
  country: string;
  country_code: string;
}

export interface GeocodeResult {
  place_id: string;
  display_name: string;
  latitude: number;
  longitude: number;
  address: GeocodeAddressComponents;
}

export interface GeocodeSearchResponse {
  data: GeocodeResult[];
  meta: {
    query: string;
    total: number;
  };
}

export interface ReverseGeocodeResponse {
  data: GeocodeResult;
}