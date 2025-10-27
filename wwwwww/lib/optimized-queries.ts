import { Prisma } from '@prisma/client';

/**
 * Optymalizowane zapytania dla aukcji
 */
export const auctionQueries = {
  /**
   * Podstawowe zapytanie dla listy aukcji (bez relacji)
   */
  basicList: {
    select: {
      id: true,
      title: true,
      description: true,
      category: true,
      startingPrice: true,
      currentPrice: true,
      buyNowPrice: true,
      startTime: true,
      endTime: true,
      status: true,
      isApproved: true,
      createdAt: true,
      updatedAt: true,
    },
  },

  /**
   * Zapytanie z podstawowymi relacjami
   */
  withBasicRelations: {
    select: {
      id: true,
      title: true,
      description: true,
      category: true,
      startingPrice: true,
      currentPrice: true,
      buyNowPrice: true,
      startTime: true,
      endTime: true,
      status: true,
      isApproved: true,
      createdAt: true,
      updatedAt: true,
      seller: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          image: true,
        },
      },
      pigeon: {
        select: {
          id: true,
          name: true,
          ringNumber: true,
          gender: true,
        },
      },
      _count: {
        select: {
          bids: true,
          watchlist: true,
        },
      },
    },
  },

  /**
   * Pełne zapytanie z wszystkimi relacjami
   */
  withFullRelations: {
    include: {
      seller: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phoneNumber: true,
          image: true,
        },
      },
      pigeon: {
        select: {
          id: true,
          name: true,
          ringNumber: true,
          bloodline: true,
          birthDate: true,
          color: true,
          weight: true,
          breeder: true,
          description: true,
          pedigree: true,
          achievements: true,
          gender: true,
        },
      },
      assets: {
        select: {
          id: true,
          type: true,
          url: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: 'asc',
        },
      },
      bids: {
        select: {
          id: true,
          amount: true,
          createdAt: true,
          bidder: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 10, // Tylko ostatnie 10 licytacji
      },
      _count: {
        select: {
          bids: true,
          watchlist: true,
        },
      },
    },
  },
};

/**
 * Optymalizowane zapytania dla użytkowników
 */
export const userQueries = {
  /**
   * Podstawowe dane użytkownika
   */
  basic: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      image: true,
      role: true,
      isActive: true,
      isPhoneVerified: true,
      isProfileVerified: true,
      createdAt: true,
    },
  },

  /**
   * Pełne dane użytkownika
   */
  full: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      image: true,
      role: true,
      isActive: true,
      isPhoneVerified: true,
      isProfileVerified: true,
      address: true,
      city: true,
      postalCode: true,
      phoneNumber: true,
      createdAt: true,
      updatedAt: true,
    },
  },
};

/**
 * Optymalizowane zapytania dla licytacji
 */
export const bidQueries = {
  /**
   * Podstawowe dane licytacji
   */
  basic: {
    select: {
      id: true,
      amount: true,
      isWinning: true,
      createdAt: true,
    },
  },

  /**
   * Licytacje z danymi licytującego
   */
  withBidder: {
    select: {
      id: true,
      amount: true,
      isWinning: true,
      createdAt: true,
      bidder: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          image: true,
        },
      },
    },
  },
};

/**
 * Helper do tworzenia warunków filtrowania dla aukcji
 */
export function createAuctionFilters(params: {
  category?: string;
  status?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  sellerId?: string;
  isApproved?: boolean;
}): Prisma.AuctionWhereInput {
  const where: Prisma.AuctionWhereInput = {};

  if (params.category) {
    where.category = params.category;
  }

  if (params.status) {
    where.status = params.status as 'ACTIVE' | 'PENDING' | 'ENDED' | 'CANCELLED';
  }

  if (params.search) {
    where.OR = [
      { title: { contains: params.search } },
      { description: { contains: params.search } },
    ];
  }

  if (params.minPrice !== undefined || params.maxPrice !== undefined) {
    where.currentPrice = {};
    if (params.minPrice !== undefined) {
      where.currentPrice.gte = params.minPrice;
    }
    if (params.maxPrice !== undefined) {
      where.currentPrice.lte = params.maxPrice;
    }
  }

  if (params.sellerId) {
    where.sellerId = params.sellerId;
  }

  if (params.isApproved !== undefined) {
    where.isApproved = params.isApproved;
  }

  return where;
}

/**
 * Helper do tworzenia sortowania dla aukcji
 */
export function createAuctionSorting(sortBy: string): Prisma.AuctionOrderByWithRelationInput[] {
  switch (sortBy) {
    case 'newest':
      return [{ createdAt: 'desc' }];
    case 'oldest':
      return [{ createdAt: 'asc' }];
    case 'price-low':
      return [{ currentPrice: 'asc' }];
    case 'price-high':
      return [{ currentPrice: 'desc' }];
    case 'ending-soon':
      return [{ endTime: 'asc' }];
    case 'ending-latest':
      return [{ endTime: 'desc' }];
    case 'title':
      return [{ title: 'asc' }];
    default:
      return [{ createdAt: 'desc' }];
  }
}

/**
 * Helper do paginacji
 */
export function createPagination(page: number, limit: number) {
  const skip = Math.max(0, (page - 1) * limit);
  const take = Math.min(100, Math.max(1, limit)); // Maksymalnie 100 elementów na stronę

  return { skip, take };
}

/**
 * Optymalizowane zapytanie dla dashboard użytkownika
 */
export const dashboardQueries = {
  /**
   * Statystyki użytkownika
   */
  userStats: {
    select: {
      _count: {
        select: {
          auctions: true,
          bids: true,
          watchlist: true,
          messages: true,
          buyerTransactions: true,
          sellerTransactions: true,
        },
      },
    },
  },

  /**
   * Ostatnie aukcje użytkownika
   */
  recentAuctions: {
    select: {
      id: true,
      title: true,
      currentPrice: true,
      status: true,
      endTime: true,
      createdAt: true,
      _count: {
        select: {
          bids: true,
          watchlist: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 5,
  },

  /**
   * Ostatnie licytacje użytkownika
   */
  recentBids: {
    select: {
      id: true,
      amount: true,
      isWinning: true,
      createdAt: true,
      auction: {
        select: {
          id: true,
          title: true,
          currentPrice: true,
          status: true,
          endTime: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 5,
  },
};
