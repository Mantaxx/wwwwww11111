'use client';

import { useCallback, useState } from 'react';

interface AddressSuggestion {
  value: string;
  label: string;
  city: string;
  street: string;
  postalCode: string;
  fullAddress?: string;
}

interface UsePolishAddressAutocompleteReturn {
  suggestions: AddressSuggestion[];
  loading: boolean;
  searchAddresses: (query: string, type: 'city' | 'street') => Promise<void>;
  clearSuggestions: () => void;
}

export function usePolishAddressAutocomplete(): UsePolishAddressAutocompleteReturn {
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [loading, setLoading] = useState(false);

  const searchAddresses = useCallback(async (query: string, type: 'city' | 'street') => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    setLoading(true);

    try {
      // Używamy Nominatim API (OpenStreetMap) do wyszukiwania adresów w Polsce
      const searchType = type === 'city' ? 'city' : 'highway';
      const url =
        `https://nominatim.openstreetmap.org/search?` +
        `country=Poland&` +
        `${searchType}=${encodeURIComponent(query)}&` +
        `format=json&` +
        `addressdetails=1&` +
        `limit=10&` +
        `accept-language=pl`;

      const response = await fetch(url, {
        headers: {
          'User-Agent': 'PalkaMTM-App/1.0',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch addresses');
      }

      const data = await response.json();

      const addressSuggestions: AddressSuggestion[] = data
        .map((item: any) => {
          const address = item.address || {};
          const city = address.city || address.town || address.village || address.county || '';
          const street = address.road || address.highway || address.street || '';
          const postalCode = address.postcode || '';

          let label = '';
          if (type === 'city') {
            label = city || item.display_name.split(',')[0];
          } else {
            label = street || item.display_name.split(',')[0];
          }

          return {
            value: item.place_id.toString(),
            label: label.trim(),
            city: city.trim(),
            street: street.trim(),
            postalCode: postalCode.trim(),
            fullAddress: item.display_name,
          };
        })
        .filter((item: AddressSuggestion) => item.label.length > 0);

      // Usuwamy duplikaty
      const uniqueSuggestions = addressSuggestions.filter(
        (item, index, self) => index === self.findIndex(t => t.label === item.label)
      );

      setSuggestions(uniqueSuggestions.slice(0, 10));
    } catch (error) {
      console.error('Error fetching addresses:', error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearSuggestions = useCallback(() => {
    setSuggestions([]);
  }, []);

  return {
    suggestions,
    loading,
    searchAddresses,
    clearSuggestions,
  };
}
