import { apiClient, resolveWithMock } from './apiClient';
import { GeocodeResult, GeocodeSearchResponse, ReverseGeocodeResponse } from '../types/geocode';

const mockAddresses: GeocodeResult[] = [
{
  place_id: 'geo-gondokusuman',
  display_name: 'Gondokusuman, Yogyakarta',
  latitude: -7.7828,
  longitude: 110.3741,
  address: {
    neighbourhood: 'Kotabaru',
    suburb: 'Gondokusuman',
    city: 'Yogyakarta',
    province: 'Daerah Istimewa Yogyakarta',
    postcode: '55224',
    country: 'Indonesia',
    country_code: 'id'
  }
},
{
  place_id: 'geo-kotabaru',
  display_name: 'Jalan Suroto, Kotabaru, Yogyakarta',
  latitude: -7.7839,
  longitude: 110.3726,
  address: {
    road: 'Jalan Suroto',
    neighbourhood: 'Kotabaru',
    suburb: 'Gondokusuman',
    city: 'Yogyakarta',
    province: 'Daerah Istimewa Yogyakarta',
    postcode: '55224',
    country: 'Indonesia',
    country_code: 'id'
  }
},
{
  place_id: 'geo-malioboro',
  display_name: 'Kawasan Malioboro, Yogyakarta',
  latitude: -7.7925,
  longitude: 110.3658,
  address: {
    road: 'Jalan Malioboro',
    suburb: 'Gedong Tengen',
    city: 'Yogyakarta',
    province: 'Daerah Istimewa Yogyakarta',
    postcode: '55271',
    country: 'Indonesia',
    country_code: 'id'
  }
}];


function distanceSquared(result: GeocodeResult, latitude: number, longitude: number): number {
  return (result.latitude - latitude) ** 2 + (result.longitude - longitude) ** 2;
}

function mockSearch(query: string): GeocodeSearchResponse {
  const normalizedQuery = query.trim().toLocaleLowerCase('id-ID');
  const data = normalizedQuery ?
  mockAddresses.filter((result) => result.display_name.toLocaleLowerCase('id-ID').includes(normalizedQuery)) :
  [];
  return { data, meta: { query: query.trim(), total: data.length } };
}

function mockReverse(latitude: number, longitude: number): ReverseGeocodeResponse {
  const closest = [...mockAddresses].sort(
    (left, right) => distanceSquared(left, latitude, longitude) - distanceSquared(right, latitude, longitude)
  )[0];

  return {
    data: {
      ...closest,
      latitude,
      longitude
    }
  };
}

export function searchAddress(query: string): Promise<GeocodeSearchResponse> {
  return resolveWithMock(
    () => mockSearch(query),
    () => apiClient.get<GeocodeSearchResponse>('/map/geocode/search', { query: { query } })
  );
}

export function reverseGeocode(latitude: number, longitude: number): Promise<ReverseGeocodeResponse> {
  return resolveWithMock(
    () => mockReverse(latitude, longitude),
    () => apiClient.get<ReverseGeocodeResponse>('/map/geocode/reverse', {
      query: { latitude, longitude }
    })
  );
}

export const geocodeService = { searchAddress, reverseGeocode };