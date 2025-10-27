import { prisma } from '@/lib/prisma';

export interface ProfileCompleteness {
  isComplete: boolean;
  missingFields: string[];
  isPhoneVerified: boolean;
}

export async function checkProfileCompleteness(userId: string): Promise<ProfileCompleteness> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        firstName: true,
        lastName: true,
        address: true,
        city: true,
        postalCode: true,
        phoneNumber: true,
        isPhoneVerified: true,
      },
    });

    if (!user) {
      return {
        isComplete: false,
        missingFields: ['user_not_found'],
        isPhoneVerified: false,
      };
    }

    const missingFields: string[] = [];

    if (!user.firstName?.trim()) missingFields.push('firstName');
    if (!user.lastName?.trim()) missingFields.push('lastName');
    if (!user.address?.trim()) missingFields.push('address');
    if (!user.city?.trim()) missingFields.push('city');
    if (!user.postalCode?.trim()) missingFields.push('postalCode');
    if (!user.phoneNumber?.trim()) missingFields.push('phoneNumber');
    if (!user.isPhoneVerified) missingFields.push('phoneVerification');

    return {
      isComplete: missingFields.length === 0,
      missingFields,
      isPhoneVerified: user.isPhoneVerified,
    };
  } catch (error) {
    console.error('Błąd podczas sprawdzania kompletności profilu:', error);
    return {
      isComplete: false,
      missingFields: ['error'],
      isPhoneVerified: false,
    };
  }
}

export function getProfileCompletenessMessage(completeness: ProfileCompleteness): string {
  if (completeness.isComplete) {
    return 'Profil jest kompletny';
  }

  const fieldNames: Record<string, string> = {
    firstName: 'imię',
    lastName: 'nazwisko',
    address: 'adres',
    city: 'miasto',
    postalCode: 'kod pocztowy',
    phoneNumber: 'numer telefonu',
    phoneVerification: 'weryfikacja telefonu',
  };

  const missingFieldNames = completeness.missingFields
    .filter(field => field !== 'error' && field !== 'user_not_found')
    .map(field => fieldNames[field] || field);

  if (missingFieldNames.length === 0) {
    return 'Wystąpił błąd podczas sprawdzania profilu';
  }

  return `Uzupełnij brakujące dane: ${missingFieldNames.join(', ')}`;
}
