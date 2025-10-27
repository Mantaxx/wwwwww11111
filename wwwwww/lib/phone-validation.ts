'use client';

/**
 * Walidacja numerów telefonów dla różnych krajów
 */

export interface PhoneValidationResult {
  isValid: boolean;
  formattedNumber: string;
  countryCode: string;
  nationalNumber: string;
  error?: string;
}

/**
 * Waliduje i formatuje numer telefonu
 * @param phoneNumber - Numer telefonu do walidacji
 * @param countryCode - Kod kraju (domyślnie 'PL')
 * @returns Wynik walidacji z sformatowanym numerem
 */
export function validatePhoneNumber(
  phoneNumber: string,
  countryCode: string = 'PL'
): PhoneValidationResult {
  if (!phoneNumber || typeof phoneNumber !== 'string') {
    return {
      isValid: false,
      formattedNumber: '',
      countryCode: '',
      nationalNumber: '',
      error: 'Numer telefonu jest wymagany',
    };
  }

  // Usuń wszystkie znaki niebędące cyframi i plusami
  const cleanNumber = phoneNumber.replace(/[^\d+]/g, '');

  if (cleanNumber.length === 0) {
    return {
      isValid: false,
      formattedNumber: '',
      countryCode: '',
      nationalNumber: '',
      error: 'Numer telefonu nie może być pusty',
    };
  }

  // Sprawdź różne formaty numerów
  if (countryCode === 'PL') {
    return validatePolishPhoneNumber(cleanNumber);
  }

  // Dla innych krajów - podstawowa walidacja
  return validateInternationalPhoneNumber(cleanNumber, countryCode);
}

/**
 * Waliduje polskie numery telefonów
 */
function validatePolishPhoneNumber(phoneNumber: string): PhoneValidationResult {
  // Usuń wszystkie znaki niebędące cyframi
  const digits = phoneNumber.replace(/\D/g, '');

  // Sprawdź różne formaty polskich numerów
  if (digits.startsWith('48') && digits.length === 11) {
    // Format: 48123456789
    const nationalNumber = digits.substring(2);
    if (isValidPolishNationalNumber(nationalNumber)) {
      return {
        isValid: true,
        formattedNumber: `+48 ${nationalNumber.substring(0, 3)} ${nationalNumber.substring(3, 6)} ${nationalNumber.substring(6)}`,
        countryCode: '48',
        nationalNumber,
      };
    }
  } else if (digits.startsWith('+48') && digits.length === 12) {
    // Format: +48123456789
    const nationalNumber = digits.substring(3);
    if (isValidPolishNationalNumber(nationalNumber)) {
      return {
        isValid: true,
        formattedNumber: `+48 ${nationalNumber.substring(0, 3)} ${nationalNumber.substring(3, 6)} ${nationalNumber.substring(6)}`,
        countryCode: '48',
        nationalNumber,
      };
    }
  } else if (digits.startsWith('0') && digits.length === 9) {
    // Format: 012345678
    if (isValidPolishNationalNumber(digits)) {
      return {
        isValid: true,
        formattedNumber: `+48 ${digits.substring(1, 4)} ${digits.substring(4, 7)} ${digits.substring(7)}`,
        countryCode: '48',
        nationalNumber: digits,
      };
    }
  } else if (digits.length === 9 && !digits.startsWith('0')) {
    // Format: 123456789 (bez zera na początku)
    if (isValidPolishNationalNumber(digits)) {
      return {
        isValid: true,
        formattedNumber: `+48 ${digits.substring(0, 3)} ${digits.substring(3, 6)} ${digits.substring(6)}`,
        countryCode: '48',
        nationalNumber: digits,
      };
    }
  }

  return {
    isValid: false,
    formattedNumber: '',
    countryCode: '',
    nationalNumber: '',
    error:
      'Nieprawidłowy format polskiego numeru telefonu. Użyj formatu: 123456789, 012345678, +48123456789 lub 48123456789',
  };
}

/**
 * Sprawdza czy numer krajowy jest prawidłowy dla Polski
 */
function isValidPolishNationalNumber(nationalNumber: string): boolean {
  if (nationalNumber.length !== 9) return false;

  // Sprawdź czy numer zaczyna się od prawidłowego prefiksu
  const validPrefixes = [
    '50',
    '51',
    '53',
    '57',
    '60',
    '66',
    '69',
    '72',
    '73',
    '78',
    '79',
    '80',
    '81',
    '82',
    '83',
    '84',
    '85',
    '86',
    '87',
    '88',
    '89',
    '12',
    '13',
    '14',
    '15',
    '16',
    '17',
    '18',
    '19',
    '22',
    '23',
    '24',
    '25',
    '29',
    '32',
    '33',
    '34',
    '35',
    '41',
    '42',
    '43',
    '44',
    '46',
    '48',
    '52',
    '54',
    '55',
    '56',
    '58',
    '59',
    '61',
    '62',
    '63',
    '65',
    '67',
    '68',
    '71',
    '74',
    '75',
    '76',
    '77',
  ];

  // Sprawdź prefiksy 2-cyfrowe
  const twoDigitPrefix = nationalNumber.substring(0, 2);
  if (validPrefixes.includes(twoDigitPrefix)) return true;

  // Sprawdź prefiksy 3-cyfrowe dla numerów komórkowych
  if (
    twoDigitPrefix.startsWith('5') ||
    twoDigitPrefix.startsWith('6') ||
    twoDigitPrefix.startsWith('7') ||
    twoDigitPrefix.startsWith('8')
  ) {
    return true;
  }

  return false;
}

/**
 * Waliduje międzynarodowe numery telefonów
 */
function validateInternationalPhoneNumber(
  phoneNumber: string,
  countryCode: string
): PhoneValidationResult {
  // Usuń wszystkie znaki niebędące cyframi
  const digits = phoneNumber.replace(/\D/g, '');

  // Podstawowa walidacja długości
  if (digits.length < 7 || digits.length > 15) {
    return {
      isValid: false,
      formattedNumber: '',
      countryCode: '',
      nationalNumber: '',
      error: 'Numer telefonu musi mieć od 7 do 15 cyfr',
    };
  }

  // Sprawdź czy numer zaczyna się od kodu kraju
  let formattedNumber = phoneNumber;
  let countryCodeFromNumber = '';
  let nationalNumber = digits;

  if (phoneNumber.startsWith('+')) {
    // Format międzynarodowy z +
    const withoutPlus = phoneNumber.substring(1);
    const match = withoutPlus.match(/^(\d{1,4})(\d+)$/);
    if (match) {
      countryCodeFromNumber = match[1];
      nationalNumber = match[2];
      formattedNumber = `+${countryCodeFromNumber} ${nationalNumber}`;
    }
  } else if (digits.length > 9) {
    // Prawdopodobnie zawiera kod kraju
    const match = digits.match(/^(\d{1,4})(\d+)$/);
    if (match) {
      countryCodeFromNumber = match[1];
      nationalNumber = match[2];
      formattedNumber = `+${countryCodeFromNumber} ${nationalNumber}`;
    }
  }

  return {
    isValid: true,
    formattedNumber,
    countryCode: countryCodeFromNumber || countryCode,
    nationalNumber,
  };
}

/**
 * Formatuje numer telefonu do wyświetlania
 */
export function formatPhoneNumber(phoneNumber: string, countryCode: string = 'PL'): string {
  const validation = validatePhoneNumber(phoneNumber, countryCode);
  return validation.isValid ? validation.formattedNumber : phoneNumber;
}

/**
 * Sprawdza czy numer telefonu jest prawidłowy bez formatowania
 */
export function isValidPhoneNumber(phoneNumber: string, countryCode: string = 'PL'): boolean {
  return validatePhoneNumber(phoneNumber, countryCode).isValid;
}

import { useState } from 'react';

/**
 * Hook React do walidacji numeru telefonu
 */
export function usePhoneValidation(initialValue: string = '', countryCode: string = 'PL') {
  const [phoneNumber, setPhoneNumber] = useState(initialValue);
  const [validation, setValidation] = useState<PhoneValidationResult>(() =>
    validatePhoneNumber(initialValue, countryCode)
  );

  const updatePhoneNumber = (newValue: string) => {
    setPhoneNumber(newValue);
    setValidation(validatePhoneNumber(newValue, countryCode));
  };

  return {
    phoneNumber,
    validation,
    updatePhoneNumber,
    isValid: validation.isValid,
    formattedNumber: validation.formattedNumber,
    error: validation.error,
  };
}
