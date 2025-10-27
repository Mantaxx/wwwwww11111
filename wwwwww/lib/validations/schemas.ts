import { z } from 'zod';

// User validation schemas (bez hasła - Firebase obsługuje auth)
export const userRegistrationSchema = z.object({
  email: z.string().email('Nieprawidłowy adres email'),
  firstName: z.string().min(2, 'Imię musi mieć co najmniej 2 znaki').optional(),
  lastName: z.string().min(2, 'Nazwisko musi mieć co najmniej 2 znaki').optional(),
  phoneNumber: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Nieprawidłowy numer telefonu')
    .optional(),
});

export const userUpdateSchema = z.object({
  firstName: z.string().min(2, 'Imię musi mieć co najmniej 2 znaki').optional(),
  lastName: z.string().min(2, 'Nazwisko musi mieć co najmniej 2 znaki').optional(),
  phoneNumber: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Nieprawidłowy numer telefonu')
    .optional(),
  address: z.string().min(5, 'Adres musi mieć co najmniej 5 znaków').optional(),
  city: z.string().min(2, 'Miasto musi mieć co najmniej 2 znaki').optional(),
  postalCode: z
    .string()
    .regex(/^\d{2}-\d{3}$/, 'Nieprawidłowy kod pocztowy')
    .optional(),
});

// Auction validation schemas
export const auctionCreateSchema = z
  .object({
    title: z
      .string()
      .min(5, 'Tytuł musi mieć co najmniej 5 znaków')
      .max(200, 'Tytuł może mieć maksymalnie 200 znaków'),
    description: z
      .string()
      .min(20, 'Opis musi mieć co najmniej 20 znaków')
      .max(2000, 'Opis może mieć maksymalnie 2000 znaków'),
    category: z.string().min(1, 'Kategoria jest wymagana'),
    startingPrice: z.number().min(0, 'Cena startowa nie może być ujemna').optional(),
    buyNowPrice: z.number().min(0, 'Cena kup teraz nie może być ujemna').optional(),
    reservePrice: z.number().min(0, 'Cena rezerwowa nie może być ujemna').optional(),
    startTime: z.string().datetime('Nieprawidłowa data rozpoczęcia'),
    images: z.array(z.string().min(1, 'URL obrazu nie może być pusty')).optional(),
    videos: z.array(z.string().min(1, 'URL wideo nie może być pusty')).optional(),
    documents: z.array(z.string().min(1, 'URL dokumentu nie może być pusty')).optional(),
    location: z.string().optional(),
    pigeon: z
      .object({
        ringNumber: z.string().optional(),
        bloodline: z.string().optional(),
        sex: z.enum(['male', 'female']).optional(),
        eyeColor: z.string().optional(),
        featherColor: z.string().optional(),
        purpose: z.array(z.string()).optional(),
      })
      .optional(),
  })
  .refine(
    data => {
      if (data.buyNowPrice && data.startingPrice) {
        return data.buyNowPrice >= data.startingPrice;
      }
      return true;
    },
    {
      message: 'Cena kup teraz musi być większa lub równa cenie startowej',
      path: ['buyNowPrice'],
    }
  );

// Base auction schema without refinements for partial updates
const baseAuctionSchema = z.object({
  title: z
    .string()
    .min(5, 'Tytuł musi mieć co najmniej 5 znaków')
    .max(200, 'Tytuł może mieć maksymalnie 200 znaków'),
  description: z
    .string()
    .min(20, 'Opis musi mieć co najmniej 20 znaków')
    .max(2000, 'Opis może mieć maksymalnie 2000 znaków'),
  category: z.string().min(1, 'Kategoria jest wymagana'),
  startingPrice: z.number().min(0, 'Cena startowa nie może być ujemna').optional(),
  buyNowPrice: z.number().min(0, 'Cena kup teraz nie może być ujemna').optional(),
  reservePrice: z.number().min(0, 'Cena rezerwowa nie może być ujemna').optional(),
  startTime: z.string().datetime('Nieprawidłowa data rozpoczęcia'),
  endTime: z.string().datetime('Nieprawidłowa data zakończenia'),
  images: z.array(z.string().min(1, 'URL obrazu nie może być pusty')).optional(),
  videos: z.array(z.string().min(1, 'URL wideo nie może być pusty')).optional(),
  documents: z.array(z.string().min(1, 'URL dokumentu nie może być pusty')).optional(),
  location: z.string().optional(),
  pigeon: z
    .object({
      ringNumber: z.string().optional(),
      bloodline: z.string().optional(),
      sex: z.enum(['male', 'female']).optional(),
      eyeColor: z.string().optional(),
      featherColor: z.string().optional(),
      purpose: z.array(z.string()).optional(),
    })
    .optional(),
});

export const auctionUpdateSchema = baseAuctionSchema.partial();

// Bid validation schemas
export const bidCreateSchema = z.object({
  auctionId: z.string().min(1, 'ID aukcji jest wymagane'),
  amount: z.number().min(0, 'Kwota licytacji nie może być ujemna'),
});

// Search validation schemas
export const searchSchema = z
  .object({
    query: z
      .string()
      .min(1, 'Zapytanie wyszukiwania nie może być puste')
      .max(100, 'Zapytanie może mieć maksymalnie 100 znaków'),
    category: z.string().optional(),
    minPrice: z.number().min(0, 'Minimalna cena nie może być ujemna').optional(),
    maxPrice: z.number().min(0, 'Maksymalna cena nie może być ujemna').optional(),
    sortBy: z.enum(['newest', 'oldest', 'price-low', 'price-high', 'ending-soon']).optional(),
    status: z.enum(['ACTIVE', 'ENDED', 'CANCELLED', 'PENDING']).optional(),
  })
  .refine(
    data => {
      if (data.minPrice && data.maxPrice) {
        return data.maxPrice >= data.minPrice;
      }
      return true;
    },
    {
      message: 'Maksymalna cena musi być większa lub równa minimalnej cenie',
      path: ['maxPrice'],
    }
  );

// File upload validation schemas
export const fileUploadSchema = z.object({
  files: z
    .array(z.any()) // Changed from z.instanceof(File) to z.any() for server-side compatibility
    .min(1, 'Przynajmniej jeden plik jest wymagany')
    .max(10, 'Maksymalnie 10 plików'),
  allowedTypes: z.array(z.string()).optional(),
  maxSize: z.number().optional(),
});

// Contact form validation schema
export const contactFormSchema = z.object({
  name: z
    .string()
    .min(2, 'Imię musi mieć co najmniej 2 znaki')
    .max(100, 'Imię może mieć maksymalnie 100 znaków'),
  email: z.string().email('Nieprawidłowy adres email'),
  subject: z
    .string()
    .min(5, 'Temat musi mieć co najmniej 5 znaków')
    .max(200, 'Temat może mieć maksymalnie 200 znaków'),
  message: z
    .string()
    .min(20, 'Wiadomość musi mieć co najmniej 20 znaków')
    .max(1000, 'Wiadomość może mieć maksymalnie 1000 znaków'),
});

// Password validation schema (Firebase obsługuje hasła)
export const passwordSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, 'Nowe hasło musi mieć co najmniej 8 znaków')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Nowe hasło musi zawierać małą literę, wielką literę i cyfrę'
      ),
    confirmPassword: z.string().min(1, 'Potwierdzenie hasła jest wymagane'),
  })
  .refine(data => data.newPassword === data.confirmPassword, {
    message: 'Hasła nie są identyczne',
    path: ['confirmPassword'],
  });

// Export all schemas as a single object for easy importing
export const schemas = {
  user: {
    registration: userRegistrationSchema,
    update: userUpdateSchema,
  },
  auction: {
    create: auctionCreateSchema,
    update: auctionUpdateSchema,
  },
  bid: {
    create: bidCreateSchema,
  },
  search: searchSchema,
  fileUpload: fileUploadSchema,
  contactForm: contactFormSchema,
  password: passwordSchema,
};
