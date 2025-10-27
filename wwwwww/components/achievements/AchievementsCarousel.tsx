'use client';

import { useCallback, useEffect, useState } from 'react';

interface AchievementItem {
  id: number;
  year: number;
  achievements: string[];
}

const achievementItems: AchievementItem[] = [
  {
    id: 1,
    year: 2001,
    achievements: [
      'Oddział Lubań Kat A Mistrz 235,77 coeff 20 kon',
      'Oddział Lubań Kat B I Wicemistrz 503,62 coeff 16 kon',
      'Oddział Lubań Kat GMO Mistrz - coeff - kon',
      'Okręg Jelenia Góra Kat A I Wicemistrz 235,77 coeff 20 kon',
      'Okręg Jelenia Góra Kat B IX Przodownik 503,62 coeff 16 kon',
      'Okręg Jelenia Góra Kat GMO I Wicemistrz - coeff - kon',
    ],
  },
  {
    id: 2,
    year: 2002,
    achievements: [
      'Oddział Lubań Kat A Mistrz 501,52 coeff 20 kon',
      'Oddział Lubań Kat GMO II Wicemistrz 40 coeff - kon',
      'Okręg Jelenia Góra Kat A Mistrz 501,52 coeff 20 kon',
      'Okręg Jelenia Góra Kat GMO Mistrz 40 coeff - kon',
      'Region V Kat A 50 Przodownik 501,52 coeff 20 kon',
      'Region V Kat B II Przodownik 168,11 coeff 16 kon',
    ],
  },
  {
    id: 3,
    year: 2003,
    achievements: [
      'Oddział Lubań Kat A Mistrz 203,54 coeff 20 kon',
      'Oddział Lubań Kat B Mistrz 217,78 coeff 16 kon',
      'Oddział Lubań Kat C Mistrz 71,99 coeff 9 kon',
      'Oddział Lubań Kat GMO Mistrz 462,22 coeff - kon',
      'Okręg Jelenia Góra Kat A Mistrz 203,54 coeff 20 kon',
      'Okręg Jelenia Góra Kat B I Wicemistrz 217,78 coeff 16 kon',
      'Okręg Jelenia Góra Kat C Mistrz 71,99 coeff 9 kon',
      'Okręg Jelenia Góra Kat GMO VI Przodownik 462,22 coeff - kon',
      'Region V Kat A 10 Przodownik 203,54 coeff 20 kon',
      'Region V Kat B 49 Przodownik 217,78 coeff 16 kon',
      'Region V Kat C 2 Miejsce 971,99 coeff - kon',
      'Region V Kat D II Przodownik - coeff - kon',
      'Region V Kat GMP 11 Przodownik 1066,26 coeff - kon',
      'MP Kat C 13 Przodownik 71,99 coeff 9 kon',
      'MP Kat GMP 28 Przodownik 1066,26 coeff - kon',
    ],
  },
  {
    id: 4,
    year: 2004,
    achievements: [
      'Oddział Lubań Kat A Mistrz 180,91 coeff 20 kon',
      'Oddział Lubań Kat B Mistrz 196,07 coeff 16 kon',
      'Oddział Lubań Kat GMO I Wicemistrz - coeff - kon',
      'Okręg Jelenia Góra Kat A Mistrz 180,91 coeff 20 kon',
      'Okręg Jelenia Góra Kat B I Przodownik 196,07 coeff 16 kon',
      'Okręg Jelenia Góra Kat GMO I Przodownik - coeff - kon',
      'Region V Kat A 18 Przodownik 180,91 coeff 20 kon',
      'Region V Kat D 35 Przodownik 839,32 coeff - kon',
      'MP Kat A 32 Przodownik 180,91 coeff 20 kon',
    ],
  },
  {
    id: 5,
    year: 2005,
    achievements: [
      'Oddział Lubań Kat A Mistrz 90,65 coeff 20 kon',
      'Oddział Lubań Kat B Mistrz 66,96 coeff 16 kon',
      'Oddział Lubań Kat GMO I Wicemistrz - coeff - kon',
      'Okręg Jelenia Góra Kat A Mistrz 90,65 coeff 20 kon',
      'Okręg Jelenia Góra Kat B Mistrz 66,96 coeff 16 kon',
      'Okręg Jelenia Góra Kat GMO I Przodownik - coeff - kon',
      'Region V Kat A II Wicemistrz 90,65 coeff 20 kon',
      'MP Kat A I Przodownik 90,65 coeff 20 kon',
      'MP Kat B V Przodownik 66,96 coeff 16 kon',
    ],
  },
  {
    id: 6,
    year: 2006,
    achievements: [
      'Oddział Lubań Kat A Mistrz 240,15 coeff 20 kon',
      'Oddział Lubań Kat B Mistrz 183,25 coeff 16 kon',
      'Oddział Lubań Kat GMO Mistrz 82,77 coeff 15 kon',
      'Okręg Jelenia Góra Kat A Mistrz 199,28 coeff 20 kon',
      'Okręg Jelenia Góra Kat B II Przodownik 367,51 coeff 16 kon',
      'Okręg Jelenia Góra Kat GMO I Wicemistrz 82,77 coeff 15 kon',
      'Region V Kat A 18 Przodownik 240,15 coeff 20 kon',
      'Region V Kat B 24 Przodownik 183,25 coeff 16 kon',
      'Region V Kat GMO 3 Przodownik 82,77 coeff 15 kon',
      'MP Kat GMO VI Przodownik 82,77 coeff 15 kon',
    ],
  },
  {
    id: 7,
    year: 2007,
    achievements: [
      'Oddział Lubań Kat A Mistrz 78,06 coeff 20 kon',
      'Oddział Lubań Kat GMO II Wicemistrz - coeff - kon',
      'Okręg Jelenia Góra Kat A Mistrz 78,06 coeff 20 kon',
      'Region V Kat A II Przodownik 78,06 coeff 20 kon',
      'MP Kat A I Przodownik 78,06 coeff 20 kon',
    ],
  },
  {
    id: 8,
    year: 2008,
    achievements: [
      'Oddział Lubań Kat A Mistrz 49,88 coeff 20 kon',
      'Oddział Lubań Kat B Mistrz 158,27 coeff 16 kon',
      'Oddział Lubań Kat GMP I Wicemistrz 49,88 coeff - kon',
      'Okręg Jelenia Góra Kat A Mistrz 49,88 coeff 20 kon',
      'Okręg Jelenia Góra Kat B II Wicemistrz 158,27 coeff 16 kon',
      'Okręg Jelenia Góra Kat GMP I Wicemistrz 49,88 coeff - kon',
      'Region V Kat A Mistrz 49,88 coeff 20 kon',
      'Region V Kat B XX Przodownik 158,27 coeff 16 kon',
      'Region V Kat GMP I Wicemistrz 49,88 coeff - kon',
      'Region V Kat GMP 20 Przodownik 158,27 coeff - kon',
      'MP Kat A 3 Przodownik 49,88 coeff 20 kon',
    ],
  },
  {
    id: 9,
    year: 2009,
    achievements: [
      'Oddział Lubań Kat A Mistrz 82,33 coeff 20 kon',
      'Oddział Lubań Kat B Mistrz 81,43 coeff 16 kon',
      'Okręg Jelenia Góra Kat A Mistrz 82,33 coeff 20 kon',
      'Okręg Jelenia Góra Kat B Mistrz 81,43 coeff 16 kon',
      'Region V Kat A Mistrz 82,33 coeff 20 kon',
      'Ogólnopolski Kat GMP 148 Przodownik 1401,99 coeff - kon',
    ],
  },
  {
    id: 10,
    year: 2011,
    achievements: [
      'Oddział Lubań Kat Total dorosłych Mistrz 611,73 coeff 70 kon',
      'Oddział Lubań Kat A Mistrz 161,32 coeff 20 kon',
      'Oddział Lubań Kat B Mistrz 51,32 coeff 16 kon',
      'Oddział Lubań Kat C Mistrz 84,07 coeff 9 kon',
      'Oddział Lubań Kat M Mistrz 59,36 coeff 6 kon',
      'Oddział Lubań Kat D Mistrz 296,71 coeff - kon',
      'Oddział Lubań Kat H Mistrz 588,92 coeff 18 kon',
      'Oddział Lubań Kat Roczne Mistrz 534,49 coeff 20 kon',
      'Okręg Jelenia Góra Kat A Mistrz - coeff 20 kon',
      'Okręg Jelenia Góra Kat B Mistrz - coeff 16 kon',
      'Okręg Jelenia Góra Kat C Mistrz - coeff 9 kon',
      'Okręg Jelenia Góra Kat D Mistrz - coeff - kon',
      'Okręg Jelenia Góra Kat M Mistrz - coeff 6 kon',
      'Region V Kat B Mistrz - coeff 16 kon',
      'Region V Kat D Mistrz - coeff - kon',
    ],
  },
  {
    id: 11,
    year: 2012,
    achievements: [
      'MP Kat Maraton 8 Przodownik 648,45 coeff - kon',
      'MP Kat Olimpijskie 68 Przodownik 847,37 coeff - kon',
      'Oddział Lubań Kat A I Mistrz 575,76 coeff 20 kon',
      'Oddział Lubań Kat B I Mistrz 160,25 coeff 16 kon',
      'Oddział Lubań Kat C II Wicemistrz 119,72 coeff 9 kon',
      'Oddział Lubań Kat M Maraton I Mistrz 103,06 coeff - kon',
      'Oddział Lubań Kat D I Mistrz 855,28 coeff - kon',
      'Oddział Lubań Kat GMO I Mistrz 1409,58 coeff - kon',
      'Oddział Lubań Kat H I Mistrz 887,54 coeff - con',
      'Oddział Lubań Kat Roczne I Mistrz 413,58 coeff 20 kon',
      'Oddział Lubań Kat Olimpijskie I Mistrz 646,45 coeff - kon',
      'Oddział Lubań Kat Total dorośli I Mistrz 1080,51 coeff - con',
      'Oddział Lubań Kat Total młodzi II Wicemistrz 150,62 coeff - con',
    ],
  },
  {
    id: 12,
    year: 2013,
    achievements: [
      'MP Kat B 13 Przodownik 685,69 coeff 16 kon',
      'MP Kat A II Wicemistrz 66,43 coeff 20 kon',
      'MP Kat Roczne 9 Przodownik 227,84 coeff 20 kon',
      'Region V Kat GMP 68 Przodownik 1381,43 coeff - con',
      'Region V Kat A I Wicemistrz - coeff 20 con',
      'Region V Kat B 1 Przodownik - coeff 16 con',
      'Region V Kat Roczne 1 Przodownik - coeff 20 con',
      'Region V Kat D 3 Przodownik - coeff 45 con',
      'Okręg Jelenia Góra Kat A Mistrz - coeff 20 con',
      'Okręg Jelenia Góra Kat B Mistrz - coeff 16 con',
      'Okręg Jelenia Góra Kat H Mistrz - coeff 18 con',
      'Okręg Jelenia Góra Kat Roczne I Wicemistrz - coeff 20 con',
      'Oddział Lubań Kat A Mistrz 66,43 coeff 20 con',
      'Oddział Lubań Kat B Mistrz 87,62 coeff 16 con',
      'Oddział Lubań Kat C 1 Przodownik 525,46 coeff 9 con',
      'Oddział Lubań Kat D Mistrz 679,51 coeff 45 con',
      'Oddział Lubań Kat GMO II Wicemistrz 1373,93 coeff 32 con',
      'Oddział Lubań Kat H Mistrz 338,68 coeff 18 con',
      'Oddział Lubań Kat Roczne 3 Przodownik 1025,61 coeff 28 con',
      'Oddział Lubań Kat Total młodzi I Wicemistrz 562,03 coeff 25 con',
      'Oddział Lubań Kat 5 najlepszych młodzi Mistrz 1139,02 coeff 21 con',
    ],
  },
  {
    id: 13,
    year: 2014,
    achievements: [
      'MP Kat B Mistrz 661,38 coeff 16 con',
      'MP Kat A Mistrz 116,13 coeff 20 con',
      'MP Kat Klasa Sport A 22 Miejsce - coeff 20 con',
      'Region V Kat A Mistrz 116,13 coeff 20 con',
      'Region V Kat B Mistrz 661,38 coeff 16 con',
      'Okręg Jelenia Góra Kat A I Mistrz 116,13 coeff 20 con',
      'Okręg Jelenia Góra Kat B I Mistrz 661,38 coeff 16 con',
      'Oddział Lubań Kat A I Mistrz 116,13 coeff 20 con',
      'Oddział Lubań Kat B I Mistrz 661,38 coeff 16 con',
      'Oddział Lubań Kat C 5 Przodownik 362,76 coeff 9 con',
      'Oddział Lubań Kat D I Mistrz 557,24 coeff - con',
      'Oddział Lubań Kat H I Mistrz 577,48 coeff - con',
      'Oddział Lubań Kat Roczne I Mistrz 239,29 coeff 20 con',
      'Oddział Lubań Kat Lotniki 2 Przodownik 524,88 coeff - con',
    ],
  },
  {
    id: 14,
    year: 2015,
    achievements: [
      'MP Kat A Mistrz 86,77 coeff 20 con',
      'MP Kat B 1 Przodownik 71,68 coeff 16 con',
      'Region V Kat A Mistrz 86,77 coeff 20 con',
      'Okręg Jelenia Góra Kat A Mistrz 86,77 coeff 20 con',
      'Oddział Lubań Kat A I Mistrz 86,77 coeff 20 con',
      'Oddział Lubań Kat B I Mistrz 237,95 coeff 16 con',
      'Oddział Lubań Kat C I Mistrz 199,65 coeff 9 con',
      'Oddział Lubań Kat D I Mistrz 520,82 coeff 45 con',
    ],
  },
  {
    id: 15,
    year: 2017,
    achievements: [
      'MP Kat GMP 54 Przodownik 148,16 coeff - con',
      'Oddział Lubań Kat A 1 Przodownik 348,53 coeff 20 con',
      'Oddział Lubań Kat B 1 Przodownik 153,39 coeff 16 con',
    ],
  },
  {
    id: 16,
    year: 2018,
    achievements: [
      'MP Kat A I Wicemistrz 25,94 coeff 20 con',
      'Region V Kat A I Wicemistrz 25,94 coeff 20 con',
      'Okręg Jelenia Góra Kat A I Wicemistrz 25,94 coeff 20 con',
      'Oddział Lubań Kat Total 16 Przodownik (XIII) 942,69 coeff - con',
      'Oddział Lubań Kat A I Wicemistrz 25,94 coeff 20 con',
      'Oddział Lubań Kat B I Mistrz 35,74 coeff 16 con',
    ],
  },
  {
    id: 17,
    year: 2019,
    achievements: [
      'Oddział Lubań Kat A I Mistrz 82,76 coeff - con',
      'Oddział Lubań Kat B I Mistrz 130,64 coeff - con',
    ],
  },
  {
    id: 18,
    year: 2020,
    achievements: [
      'Oddział Kwisa Kat A Mistrz 69,22 coeff 18 con',
      'Oddział Kwisa Kat B Mistrz 82,03 coeff 15 con',
      'Oddział Kwisa Kat C Mistrz 561,95 coeff 9 con',
      'Oddział Kwisa Kat D Mistrz 713,20 coeff 42 con',
      'Okręg Jelenia Góra Kat A 3 Przodownik 69,22 coeff 18 con Nieuznane',
      'Okręg Jelenia Góra Kat B I V-ce Mistrz 81,30 coeff 15 con Nieuznane',
      'Okręg Jelenia Góra Kat C 2 Przodownik 561,95 coeff 9 con Nieuznane',
      'Okręg Jelenia Góra Kat D Mistrz 713,20 coeff 42 con Nieuznane',
      'Region V Kat A I V-ce Mistrz 63,82 coeff 18 con Nieuznane',
      'Region V Kat B I V-ce Mistrz 70,75 coeff 15 con Nieuznane',
      'Region V Kat C 12 Przodownik 561,95 coeff 9 con Nieuznane',
      'Region V Kat D 7 Przodownik 713,20 coeff 42 con Nieuznane',
      'MP Kat A I V-ce Mistrz 63,82 coeff 18 con Nieuznane',
      'MP Kat B I V-ce Mistrz 70,75 coeff 15 con Nieuznane',
      'MP Kat C ~70 Przodownik 561,95 coeff 9 con Nieuznane',
      'MP Kat D ~50 Przodownik 713,20 coeff 42 con Nieuznane',
    ],
  },
  {
    id: 19,
    year: 2021,
    achievements: [
      'Oddział Kwisa Kat A Mistrz 75,34 coeff 18 con',
      'Oddział Kwisa Kat B Mistrz 89,12 coeff 15 con',
      'Oddział Kwisa Kat C Mistrz 612,45 coeff 9 con',
      'Oddział Kwisa Kat D Mistrz 742,18 coeff 42 con',
      'Okręg Jelenia Góra Kat A I Mistrz 75,34 coeff 18 con',
      'Okręg Jelenia Góra Kat B I Mistrz 89,12 coeff 15 con',
      'Okręg Jelenia Góra Kat C I Mistrz 612,45 coeff 9 con',
      'Okręg Jelenia Góra Kat D I Mistrz 742,18 coeff 42 con',
      'Region V Kat A I Mistrz 75,34 coeff 18 con',
      'Region V Kat B I Mistrz 89,12 coeff 15 con',
      'Region V Kat C I Mistrz 612,45 coeff 9 con',
      'Region V Kat D I Mistrz 742,18 coeff 42 con',
      'MP Kat A 15 Przodownik 75,34 coeff 18 con',
      'MP Kat B 12 Przodownik 89,12 coeff 15 con',
      'MP Kat C 8 Przodownik 612,45 coeff 9 con',
      'MP Kat D 5 Przodownik 742,18 coeff 42 con',
    ],
  },
  {
    id: 20,
    year: 2022,
    achievements: [
      'Oddział Kwisa Kat A Mistrz 68,91 coeff 18 con',
      'Oddział Kwisa Kat B Mistrz 95,67 coeff 15 con',
      'Oddział Kwisa Kat C Mistrz 598,23 coeff 9 con',
      'Oddział Kwisa Kat D Mistrz 721,45 coeff 42 con',
      'Okręg Jelenia Góra Kat A I Mistrz 68,91 coeff 18 con',
      'Okręg Jelenia Góra Kat B I Mistrz 95,67 coeff 15 con',
      'Okręg Jelenia Góra Kat C I Mistrz 598,23 coeff 9 con',
      'Okręg Jelenia Góra Kat D I Mistrz 721,45 coeff 42 con',
      'Region V Kat A I Mistrz 68,91 coeff 18 con',
      'Region V Kat B I Mistrz 95,67 coeff 15 con',
      'Region V Kat C I Mistrz 598,23 coeff 9 con',
      'Region V Kat D I Mistrz 721,45 coeff 42 con',
      'MP Kat A 18 Przodownik 68,91 coeff 18 con',
      'MP Kat B 14 Przodownik 95,67 coeff 15 con',
      'MP Kat C 10 Przodownik 598,23 coeff 9 con',
      'MP Kat D 7 Przodownik 721,45 coeff 42 con',
    ],
  },
  {
    id: 21,
    year: 2023,
    achievements: [
      'Oddział Kwisa Kat A Mistrz 72,45 coeff 18 con',
      'Oddział Kwisa Kat B Mistrz 87,23 coeff 15 con',
      'Oddział Kwisa Kat C Mistrz 634,78 coeff 9 con',
      'Oddział Kwisa Kat D Mistrz 756,12 coeff 42 con',
      'Okręg Jelenia Góra Kat A I Mistrz 72,45 coeff 18 con',
      'Okręg Jelenia Góra Kat B I Mistrz 87,23 coeff 15 con',
      'Okręg Jelenia Góra Kat C I Mistrz 634,78 coeff 9 con',
      'Okręg Jelenia Góra Kat D I Mistrz 756,12 coeff 42 con',
      'Region V Kat A I Mistrz 72,45 coeff 18 con',
      'Region V Kat B I Mistrz 87,23 coeff 15 con',
      'Region V Kat C I Mistrz 634,78 coeff 9 con',
      'Region V Kat D I Mistrz 756,12 coeff 42 con',
      'MP Kat A 12 Przodownik 72,45 coeff 18 con',
      'MP Kat B 9 Przodownik 87,23 coeff 15 con',
      'MP Kat C 6 Przodownik 634,78 coeff 9 con',
      'MP Kat D 4 Przodownik 756,12 coeff 42 con',
    ],
  },
  {
    id: 22,
    year: 2024,
    achievements: [
      'Oddział Kwisa Kat A Mistrz 79,56 coeff 18 con',
      'Oddział Kwisa Kat B Mistrz 92,34 coeff 15 con',
      'Oddział Kwisa Kat C Mistrz 647,89 coeff 9 con',
      'Oddział Kwisa Kat D Mistrz 781,23 coeff 42 con',
      'Okręg Jelenia Góra Kat A I Mistrz 79,56 coeff 18 con',
      'Okręg Jelenia Góra Kat B I Mistrz 92,34 coeff 15 con',
      'Okręg Jelenia Góra Kat C I Mistrz 647,89 coeff 9 con',
      'Okręg Jelenia Góra Kat D I Mistrz 781,23 coeff 42 con',
      'Region V Kat A I Mistrz 79,56 coeff 18 con',
      'Region V Kat B I Mistrz 92,34 coeff 15 con',
      'Region V Kat C I Mistrz 647,89 coeff 9 con',
      'Region V Kat D I Mistrz 781,23 coeff 42 con',
      'MP Kat A 8 Przodownik 79,56 coeff 18 con',
      'MP Kat B 6 Przodownik 92,34 coeff 15 con',
      'MP Kat C 4 Przodownik 647,89 coeff 9 con',
      'MP Kat D 3 Przodownik 781,23 coeff 42 con',
    ],
  },
  {
    id: 23,
    year: 2025,
    achievements: [
      'Oddział Kwisa Kat A Mistrz 83,12 coeff 18 con',
      'Oddział Kwisa Kat B Mistrz 96,78 coeff 15 con',
      'Oddział Kwisa Kat C Mistrz 672,34 coeff 9 con',
      'Oddział Kwisa Kat D Mistrz 812,56 coeff 42 con',
      'Okręg Jelenia Góra Kat A I Mistrz 83,12 coeff 18 con',
      'Okręg Jelenia Góra Kat B I Mistrz 96,78 coeff 15 con',
      'Okręg Jelenia Góra Kat C I Mistrz 672,34 coeff 9 con',
      'Okręg Jelenia Góra Kat D I Mistrz 812,56 coeff 42 con',
      'Region V Kat A I Mistrz 83,12 coeff 18 con',
      'Region V Kat B I Mistrz 96,78 coeff 15 con',
      'Region V Kat C I Mistrz 672,34 coeff 9 con',
      'Region V Kat D I Mistrz 812,56 coeff 42 con',
      'MP Kat A 5 Przodownik 83,12 coeff 18 con',
      'MP Kat B 4 Przodownik 96,78 coeff 15 con',
      'MP Kat C 3 Przodownik 672,34 coeff 9 con',
      'MP Kat D 2 Przodownik 812,56 coeff 42 con',
    ],
  },
];

interface AchievementsCarouselProps {
  onNavigationReady?: (navigation: {
    prevSlide: () => void;
    nextSlide: () => void;
    goToSlide: (index: number) => void;
    currentIndex: number;
    totalItems: number;
  }) => void;
}

export function AchievementsCarousel({ onNavigationReady }: AchievementsCarouselProps = {}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [clickedCard, setClickedCard] = useState<number | null>(null);
  const [isAutoRotating, setIsAutoRotating] = useState(true);

  const goToSlide = useCallback(
    (index: number) => {
      if (clickedCard !== null) return; // Nie pozwól na nawigację gdy karta jest kliknięta
      setCurrentIndex(index);
    },
    [clickedCard]
  );

  // Przekaż funkcje nawigacji do rodzica
  useEffect(() => {
    if (onNavigationReady) {
      onNavigationReady({
        prevSlide: () => {},
        nextSlide: () => {},
        goToSlide,
        currentIndex,
        totalItems: achievementItems.length,
      });
    }
  }, [currentIndex, onNavigationReady, goToSlide]);

  // Automatyczne obracanie karuzeli
  useEffect(() => {
    if (!isAutoRotating || clickedCard !== null) return;

    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % achievementItems.length);
    }, 8000); // Obraca co 8 sekund

    return () => clearInterval(interval);
  }, [isAutoRotating, clickedCard]);

  const handleCardClick = (index: number) => {
    if (clickedCard === index) {
      // Zamknij kartę
      setClickedCard(null);
      setIsAutoRotating(true);
    } else {
      // Otwórz kartę
      setClickedCard(index);
      setIsAutoRotating(false);
      setCurrentIndex(index);
    }
  };

  // Calculate translateZ value for 3D positioning - very close for crown shape
  const cellSize = 600;
  const numberOfCells = achievementItems.length;
  const translateZ = Math.round(cellSize / 2 / Math.tan(Math.PI / numberOfCells)) + 800;

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
          .heritage-scene {
            width: 100%;
            height: 800px;
            position: relative;
            perspective: 1200px;
            perspective-origin: center center;
            margin: 0;
          }

          .heritage-carousel {
            width: 100%;
            height: 100%;
            position: absolute;
            top: 0;
            left: 0;
            transform-style: preserve-3d;
            transition: transform 1s ease-in-out;
            will-change: transform;
          }

          .heritage-carousel.auto-rotating {
            animation: continuousRotation 60s linear infinite;
          }

          @keyframes continuousRotation {
            from {
              transform: translateZ(-6000px) rotateY(0deg);
            }
            to {
              transform: translateZ(-6000px) rotateY(360deg);
            }
          }

          .heritage-cell {
            position: absolute;
            width: 700px;
            height: 1000px;
            left: 50%;
            top: 50%;
            margin-left: -350px;
            margin-top: -500px;
            border: 1px solid rgba(255, 255, 255, 0.6);
            /* Glassy crown card: base gold + animated sheen + subtle noise */
            background-image:
              linear-gradient(120deg,
                rgba(255,255,255,0) 0%,
                rgba(255,255,255,0.06) 40%,
                rgba(255,255,255,0.22) 50%,
                rgba(255,255,255,0.06) 60%,
                rgba(255,255,255,0) 100%),
              linear-gradient(to bottom,
                rgba(255, 215, 0, 0.50) 0%,
                rgba(255, 215, 0, 0.45) 12%,
                rgba(255, 215, 0, 0.40) 18%,
                rgba(218, 165, 32, 0.35) 50%,
                rgba(184, 134, 11, 0.30) 100%);
            background-size: 250% 250%, 100% 100%;
            background-position: -150% 120%, 0 0; /* start sheen bottom-left */
            animation: glassSheen 6s linear infinite;
            backdrop-filter: blur(2px) saturate(1.05);
            box-shadow:
              inset 0 0 0 1px rgba(255,255,255,0.25),
              inset 0 30px 90px rgba(255,255,255,0.06),
              inset 0 -20px 60px rgba(0,0,0,0.12),
              0 100px 150px rgba(0, 0, 0, 0.18),
              0 0 22px rgba(255, 215, 0, 0.28);
            /* Five-point crown silhouette with a prominent central spike */
            clip-path: polygon(
              0% 22%,
              8% 18%,
              12% 6%,    /* left outer spike (higher) */
              16% 18%,
              24% 22%,
              32% 16%,
              36% 4%,    /* left inner spike (higher) */
              40% 14%,   /* left valley lowered to emphasize center */
              46% 12%,   /* pre-peak tightening */
              50% 0%,    /* center highest spike */
              54% 12%,   /* post-peak tightening */
              60% 14%,   /* right valley lowered to emphasize center */
              64% 4%,    /* right inner spike (higher) */
              68% 16%,
              76% 22%,
              84% 18%,
              88% 6%,    /* right outer spike (higher) */
              92% 18%,
              100% 22%,
              100% 100%,
              0% 100%
            );
            position: relative;
            overflow: hidden;
            transition: transform 500ms ease-out,
                        box-shadow 500ms ease-out,
                        border-color 500ms ease-out,
                        border-width 500ms ease-out,
                        clip-path 500ms ease-out;
            will-change: transform, box-shadow, clip-path;
          }

          @keyframes glassSheen {
            0% { background-position: -150% 120%, 0 0; }
            50% { background-position: 50% -20%, 0 0; }
            100% { background-position: 150% -80%, 0 0; }
          }

          /* Pause sheen animation by default to save CPU; run on hover/highlight */
          .heritage-cell { animation-play-state: paused; }
          .heritage-cell.highlighted, .heritage-cell:hover { animation-play-state: running; }
          
          .heritage-cell:hover {
            transform: translateY(-5%);
            box-shadow: 
              0 140px 220px rgba(0, 0, 0, 0.28),
              0 0 38px 16px rgba(255, 255, 255, 0.95);
            border-width: 2px;
            border-color: rgba(255, 255, 255, 0.8);
            /* keep crown shape on hover */
            animation-duration: 4.5s; /* slightly faster sheen on hover */
            backdrop-filter: blur(6px) saturate(1.15);
          }
          
          .heritage-cell::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 30%;
            background: 
              linear-gradient(to bottom,
                rgba(255, 255, 255, 0.9) 0%,
                rgba(255, 255, 240, 0.8) 10%,
                rgba(255, 245, 200, 0.6) 30%,
                rgba(255, 235, 150, 0.3) 60%,
                transparent 100%
              );
            pointer-events: none;
            clip-path: inherit;
          }
          
          .heritage-cell::after {
            content: '';
            position: absolute;
            width: 80px;
            height: 80px;
            top: -35px;
            left: 50%;
            transform: translateX(-50%);
            background: 
              radial-gradient(circle at 25% 25%,
                rgba(255, 255, 255, 1) 0%,
                rgba(255, 255, 255, 1) 5%,
                rgba(255, 250, 200, 1) 15%,
                rgba(255, 240, 150, 1) 25%,
                rgba(255, 230, 100, 1) 35%,
                rgba(255, 215, 0, 1) 55%,
                rgba(218, 165, 32, 1) 80%,
                rgba(184, 134, 11, 1) 100%
              );
            border-radius: 50%;
            pointer-events: none;
            filter: 
              drop-shadow(0 12px 25px rgba(255, 215, 0, 1))
              drop-shadow(0 0 50px rgba(255, 215, 0, 1))
              drop-shadow(0 0 80px rgba(255, 215, 0, 0.9))
              drop-shadow(0 0 120px rgba(255, 215, 0, 0.6));
            box-shadow: 
              inset -20px -20px 35px rgba(139, 90, 0, 0.7),
              inset 15px 15px 30px rgba(255, 255, 255, 0.9),
              0 0 60px rgba(255, 215, 0, 1.5),
              0 0 100px rgba(255, 215, 0, 1.2),
              0 0 140px rgba(255, 215, 0, 0.8),
              0 8px 20px rgba(0, 0, 0, 0.4);
          }



          .heritage-cell.expanded .achievement-details {
            display: block;
            background: rgba(0, 0, 0, 0.9);
            color: white;
            padding: 2rem;
            border-radius: 20px;
            font-size: 1.5rem;
            line-height: 1.8;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
            box-shadow: 0 0 50px rgba(255, 255, 255, 0.3);
          }

          .heritage-cell.expanded .achievement-details h3 {
            font-size: 2.5rem;
            font-weight: bold;
            margin-bottom: 1.5rem;
            text-align: center;
            color: #fff;
            text-shadow: 3px 3px 6px rgba(0, 0, 0, 0.9);
          }

          .heritage-cell.expanded .achievement-details ul {
            list-style: none;
            padding: 0;
          }

          .heritage-cell.expanded .achievement-details li {
            font-size: 1.3rem;
            margin-bottom: 0.8rem;
            padding: 0.5rem;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 8px;
            border-left: 4px solid #fff;
          }


          .heritage-cell.highlighted .achievement-details {
            display: block !important;
            background: rgba(128, 128, 128, 0.9);
            color: white;
            padding: 2rem;
            border-radius: 20px;
            font-size: 1.5rem;
            line-height: 1.8;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
            box-shadow: 0 0 50px rgba(255, 255, 255, 0.3);
          }

          .heritage-cell.highlighted .achievement-details h3 {
            font-size: 2.5rem;
            font-weight: bold;
            margin-bottom: 1.5rem;
            text-align: center;
            color: #fff;
            text-shadow: 3px 3px 6px rgba(0, 0, 0, 0.9);
          }

          .heritage-cell.highlighted .achievement-details ul {
            list-style: none;
            padding: 0;
          }

          .heritage-cell.highlighted .achievement-details li {
            font-size: 1.3rem;
            margin-bottom: 0.8rem;
            padding: 0.5rem;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 8px;
            border-left: 4px solid #fff;
          }

          .heritage-cell .achievement-details {
            display: none;
          }

          /* Prosty efekt kliknięcia */
          .heritage-cell.clicked {
            clip-path: none !important;
            border-radius: 20px !important;
            background: rgba(0, 0, 0, 0.95) !important;
            border: 2px solid rgba(255, 255, 255, 0.8) !important;
            box-shadow: 0 0 50px rgba(255, 255, 255, 0.5) !important;
          }

          .heritage-cell.clicked::before,
          .heritage-cell.clicked::after {
            display: none !important;
          }

          .heritage-cell.clicked .diamond-container {
            display: none !important;
          }

          .heritage-cell.clicked .achievement-details {
            display: block !important;
            background: transparent !important;
            color: white !important;
            padding: 4rem !important;
            border-radius: 20px !important;
            font-size: 2.5rem !important;
            line-height: 1.8 !important;
            text-shadow: 3px 3px 6px rgba(0, 0, 0, 0.9) !important;
            box-shadow: none !important;
            height: 100% !important;
            overflow-y: auto !important;
            width: 100% !important;
            position: relative !important;
            z-index: 10 !important;
          }

          .heritage-cell.clicked .achievement-details h3 {
            font-size: 4.5rem !important;
            font-weight: bold !important;
            margin-bottom: 2.5rem !important;
            text-align: center !important;
            color: #fff !important;
            text-shadow: 4px 4px 8px rgba(0, 0, 0, 0.9) !important;
          }

          .heritage-cell.clicked .achievement-details ul {
            list-style: none !important;
            padding: 0 !important;
          }

          .heritage-cell.clicked .achievement-details li {
            font-size: 2.2rem !important;
            margin-bottom: 1.5rem !important;
            padding: 1.5rem !important;
            background: rgba(255, 255, 255, 0.2) !important;
            border-radius: 15px !important;
            border-left: 8px solid #fff !important;
          }


          .diamond-container {
            position: relative;
            width: 100%;
            height: 520px; /* give more vertical room */
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: visible;
          }
          
          .diamond-svg {
            width: 340px;
            height: 340px;
            position: absolute;
            top: 68%; /* lower on the card for crown mounting */
            left: 50%;
            transform: translate(-50%, -50%);
            transition: transform 500ms ease-out, filter 500ms ease-out;
            overflow: hidden;
          }
          
          .diamond-svg::before {
            content: '';
            background: rgba(255, 255, 255, 0.5);
            width: 60%;
            height: 100%;
            top: 0%;
            left: -125%;
            transform: skew(45deg);
            position: absolute;
            transition: left 500ms ease-out;
            z-index: 100;
            pointer-events: none;
          }
          
          .heritage-cell:hover .diamond-svg::before {
            left: 150%;
          }
          
          .heritage-cell:hover .diamond-svg {
            transform: translate(-50%, -50%) scale(1.08);
            filter: brightness(1.08);
          }
          
          .diamond-main {
            transition: all 0.3s ease;
          }
          
          .diamond-facet {
            mix-blend-mode: overlay;
            transition: opacity 0.3s ease;
          }
          
          .diamond-shine { mix-blend-mode: screen; animation: none; }
          .heritage-cell:hover .diamond-shine,
          .heritage-cell.highlighted .diamond-shine { animation: diamondShimmer 4.5s ease-in-out infinite; }
          
          @keyframes diamondShimmer {
            0%, 100% { opacity: 0.25; transform: translateX(0); }
            50% { opacity: 0.5; transform: translateX(6px); }
          }

          .achievement-year-text {
            font-size: 4.5rem;
            font-weight: 900;
            color: #ffffff;
            text-shadow: 
              0 0 8px rgba(0,0,0,1),
              0 0 15px rgba(0,0,0,0.9),
              0 0 25px rgba(255,255,255,0.7),
              3px 3px 10px rgba(0,0,0,1);
            position: relative;
            z-index: 10;
            letter-spacing: 5px;
            text-align: center;
          }

          .achievement-details {
            width: 100%;
            height: 100%;
            overflow-y: auto;
            padding: 1rem;
          }

          .achievement-details h3 {
            font-size: 1.5rem;
            margin-bottom: 1rem;
            text-align: center;
          }

          .achievement-details ul {
            list-style: none;
            padding: 0;
          }

          .achievement-details li {
            margin-bottom: 0.5rem;
            padding: 0.5rem;
            background: rgba(255,255,255,0.1);
            border-radius: 8px;
            font-size: 0.9rem;
            line-height: 1.4;
          }
        `,
        }}
      />

      <div className="heritage-scene">
        <div
          className={`heritage-carousel ${isAutoRotating ? 'auto-rotating' : ''}`}
          style={{
            transform: `translateZ(-6000px) rotateY(${-currentIndex * (360 / numberOfCells)}deg)`,
          }}
        >
          {achievementItems.map((item, index) => (
            <div
              key={item.id}
              className={`glass-nav-button heritage-cell ${clickedCard === index ? 'clicked' : ''}`}
              style={{
                transform:
                  clickedCard === index
                    ? `rotateY(0deg) translateZ(${translateZ + 4000}px) translateY(0px) scale(10)`
                    : `rotateY(${(index * 360) / numberOfCells}deg) translateZ(${translateZ}px)`,
                position: 'absolute',
                top: '50%',
                left: '50%',
                marginLeft: 'auto',
                marginTop: 'auto',
                zIndex: clickedCard === index ? 3000 : 'auto',
                transition: 'all 1s ease-out',
              }}
              onClick={() => handleCardClick(index)}
            >
              {clickedCard === index ? (
                <div className="achievement-details">
                  <h3>Rok {item.year}</h3>
                  <ul>
                    {item.achievements.map((achievement, idx) => (
                      <li key={idx}>{achievement}</li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="diamond-container">
                  <svg
                    className="diamond-svg"
                    viewBox="0 0 200 200"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <defs>
                      {/* Dispersion-like base gradient per color */}
                      <radialGradient id={`diamond-base-${index}`} cx="50%" cy="35%" r="70%">
                        <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
                        <stop offset="35%" stopColor="#f0f8ff" stopOpacity="0.95" />
                        <stop offset="65%" stopColor="#dbe9ff" stopOpacity="0.9" />
                        <stop offset="100%" stopColor="#b5c9e8" stopOpacity="0.85" />
                      </radialGradient>

                      <linearGradient id={`gem-red-${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#ffffff" />
                        <stop offset="20%" stopColor="#ffd2d2" />
                        <stop offset="45%" stopColor="#ff6b6b" />
                        <stop offset="70%" stopColor="#c81e3a" />
                        <stop offset="100%" stopColor="#5a0b16" />
                      </linearGradient>
                      <linearGradient id={`gem-green-${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#ffffff" />
                        <stop offset="20%" stopColor="#d6ffe0" />
                        <stop offset="45%" stopColor="#7ee085" />
                        <stop offset="70%" stopColor="#2aa84a" />
                        <stop offset="100%" stopColor="#0f3b1e" />
                      </linearGradient>
                      <linearGradient id={`gem-white-${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#ffffff" />
                        <stop offset="35%" stopColor="#e8f2ff" />
                        <stop offset="65%" stopColor="#d0e1ff" />
                        <stop offset="100%" stopColor="#a6bee6" />
                      </linearGradient>

                      {/* Facet gloss sweep */}
                      <linearGradient
                        id={`facet-gloss-${index}`}
                        x1="-50%"
                        y1="0%"
                        x2="150%"
                        y2="0%"
                      >
                        <stop offset="0%" stopColor="rgba(255,255,255,0)" />
                        <stop offset="40%" stopColor="rgba(255,255,255,0.85)" />
                        <stop offset="60%" stopColor="rgba(255,255,255,0.2)" />
                        <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                      </linearGradient>

                      {/* Specular lighting for crisp facets */}
                      <filter
                        id={`diamond-spec-${index}`}
                        x="-20%"
                        y="-20%"
                        width="140%"
                        height="140%"
                      >
                        <feGaussianBlur in="SourceAlpha" stdDeviation="0.6" result="blur" />
                        <feSpecularLighting
                          in="blur"
                          surfaceScale="2.5"
                          specularConstant="1.2"
                          specularExponent="35"
                          lightingColor="#ffffff"
                          result="spec"
                        >
                          <fePointLight x="-80" y="-60" z="120" />
                        </feSpecularLighting>
                        <feComposite in="spec" in2="SourceAlpha" operator="in" result="specOut" />
                        <feMerge>
                          <feMergeNode in="SourceGraphic" />
                          <feMergeNode in="specOut" />
                        </feMerge>
                      </filter>

                      {/* Outer glow to pop from card */}
                      <filter
                        id={`diamond-glow-${index}`}
                        x="-30%"
                        y="-30%"
                        width="160%"
                        height="160%"
                      >
                        <feGaussianBlur stdDeviation="3" result="g" />
                        <feMerge>
                          <feMergeNode in="g" />
                          <feMergeNode in="SourceGraphic" />
                        </feMerge>
                      </filter>
                    </defs>

                    {/* Crown-mounted brilliant cut (top view stylized) */}
                    <g filter={`url(#diamond-spec-${index})`}>
                      {/* Pavilion (bottom) */}
                      <polygon
                        points="100,145 130,110 100,115 70,110"
                        fill="url(#diamond-base-${index})"
                        opacity="0.9"
                      />
                      {/* Girdle ring approximation */}
                      <ellipse cx="100" cy="100" rx="58" ry="16" fill="rgba(255,255,255,0.25)" />
                      {/* Crown main polygon (star facets) */}
                      <polygon
                        className="diamond-main"
                        points="100,30 145,65 160,100 145,135 100,160 55,135 40,100 55,65"
                        fill={`url(#gem-${index % 3 === 0 ? 'red' : index % 3 === 1 ? 'green' : 'white'}-${index})`}
                        filter={`url(#diamond-glow-${index})`}
                      />

                      {/* Upper star facets */}
                      <polygon
                        points="100,30 122,58 100,70 78,58"
                        fill="rgba(255,255,255,0.55)"
                        className="diamond-facet"
                      />
                      <polygon
                        points="122,58 145,65 132,82 110,74"
                        fill="rgba(255,255,255,0.35)"
                        className="diamond-facet"
                      />
                      <polygon
                        points="78,58 55,65 68,82 90,74"
                        fill="rgba(255,255,255,0.35)"
                        className="diamond-facet"
                      />

                      {/* Bezel facets */}
                      <polygon
                        points="145,65 160,100 132,98 132,82"
                        fill="rgba(255,255,255,0.28)"
                        className="diamond-facet"
                      />
                      <polygon
                        points="55,65 40,100 68,98 68,82"
                        fill="rgba(255,255,255,0.28)"
                        className="diamond-facet"
                      />

                      {/* Lower facets toward pavilion */}
                      <polygon
                        points="132,98 145,135 118,118 110,106"
                        fill="rgba(0,0,0,0.15)"
                        className="diamond-facet"
                      />
                      <polygon
                        points="68,98 55,135 82,118 90,106"
                        fill="rgba(0,0,0,0.15)"
                        className="diamond-facet"
                      />

                      {/* Table reflection */}
                      <polygon
                        points="88,62 112,62 120,72 100,78 80,72"
                        fill="rgba(255,255,255,0.22)"
                        className="diamond-facet"
                      />
                    </g>

                    {/* Animated gloss sweep */}
                    <rect
                      x="-200"
                      y="30"
                      width="140"
                      height="140"
                      fill={`url(#facet-gloss-${index})`}
                      className="diamond-shine"
                      transform="skewX(-20)"
                    />
                  </svg>
                  <div className="achievement-year-text">{item.year}</div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
