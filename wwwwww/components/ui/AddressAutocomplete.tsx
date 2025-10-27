'use client';

import { usePolishAddressAutocomplete } from '@/hooks/usePolishAddressAutocomplete';
import { useEffect, useRef, useState } from 'react';

interface AddressSuggestion {
  value: string;
  label: string;
  city?: string;
  postalCode?: string;
}

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type: 'city' | 'street';
  className?: string;
  onPostalCodeChange?: (postalCode: string) => void;
}

export function AddressAutocomplete({
  value,
  onChange,
  placeholder = 'Wpisz adres...',
  type,
  className = '',
  onPostalCodeChange,
}: AddressAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const { suggestions, loading, searchAddresses, clearSuggestions } =
    usePolishAddressAutocomplete();

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(event.target as Node) &&
        listRef.current &&
        !listRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(newValue);

    if (newValue.length >= 2) {
      await searchAddresses(newValue, type);
      setIsOpen(true);
    } else {
      clearSuggestions();
      setIsOpen(false);
    }
  };

  const handleSuggestionClick = (suggestion: AddressSuggestion) => {
    setInputValue(suggestion.label);
    onChange(suggestion.label);
    setIsOpen(false);
    clearSuggestions();

    // Jeśli to komponent miasta, automatycznie wypełnij kod pocztowy
    if (type === 'city' && suggestion.postalCode && onPostalCodeChange) {
      onPostalCodeChange(suggestion.postalCode);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          if (suggestions.length > 0) {
            setIsOpen(true);
          }
        }}
        placeholder={placeholder}
        className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
      />

      {isOpen && (
        <ul
          ref={listRef}
          className="absolute z-50 w-full mt-1 bg-black/90 backdrop-blur-xl rounded-lg border border-white/20 shadow-2xl max-h-60 overflow-y-auto"
        >
          {loading ? (
            <li className="px-4 py-3 text-white/70 text-center">
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Wyszukiwanie...</span>
              </div>
            </li>
          ) : suggestions.length > 0 ? (
            suggestions.map(suggestion => (
              <li
                key={suggestion.value}
                className="px-4 py-3 text-white hover:bg-white/10 cursor-pointer transition-colors duration-200 border-b border-white/10 last:border-b-0"
                onClick={() => handleSuggestionClick(suggestion)}
              >
                <div className="font-medium">{suggestion.label}</div>
                {suggestion.city && suggestion.city !== suggestion.label && (
                  <div className="text-sm text-white/70">{suggestion.city}</div>
                )}
                {suggestion.postalCode && (
                  <div className="text-xs text-white/50">{suggestion.postalCode}</div>
                )}
              </li>
            ))
          ) : inputValue.length >= 2 ? (
            <li className="px-4 py-3 text-white/70 text-center">Nie znaleziono wyników</li>
          ) : null}
        </ul>
      )}
    </div>
  );
}
