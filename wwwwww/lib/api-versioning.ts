import { NextRequest, NextResponse } from 'next/server';

// Supported API versions
export const SUPPORTED_VERSIONS = ['v1', 'v2'] as const;
export type ApiVersion = (typeof SUPPORTED_VERSIONS)[number];

// Default version
export const DEFAULT_VERSION: ApiVersion = 'v1';

// Version detection strategies
export enum VersionStrategy {
  HEADER = 'header',
  QUERY = 'query',
  PATH = 'path',
}

// Version configuration
interface VersionConfig {
  strategy: VersionStrategy;
  headerName?: string;
  queryParam?: string;
  defaultVersion: ApiVersion;
}

// Default configuration
const DEFAULT_CONFIG: VersionConfig = {
  strategy: VersionStrategy.HEADER,
  headerName: 'X-API-Version',
  queryParam: 'version',
  defaultVersion: DEFAULT_VERSION,
};

/**
 * Extract API version from request
 */
export function extractApiVersion(
  request: NextRequest,
  config: VersionConfig = DEFAULT_CONFIG
): ApiVersion {
  const { strategy, headerName, queryParam, defaultVersion } = config;

  let version: string | null = null;

  switch (strategy) {
    case VersionStrategy.HEADER:
      version = request.headers.get(headerName || 'X-API-Version');
      break;

    case VersionStrategy.QUERY:
      version = request.nextUrl.searchParams.get(queryParam || 'version');
      break;

    case VersionStrategy.PATH:
      // Extract from path like /api/v1/endpoint
      const pathSegments = request.nextUrl.pathname.split('/');
      const apiIndex = pathSegments.indexOf('api');
      if (apiIndex !== -1 && apiIndex + 1 < pathSegments.length) {
        const potentialVersion = pathSegments[apiIndex + 1];
        if (SUPPORTED_VERSIONS.includes(potentialVersion as ApiVersion)) {
          version = potentialVersion;
        }
      }
      break;
  }

  // Validate version
  if (version && SUPPORTED_VERSIONS.includes(version as ApiVersion)) {
    return version as ApiVersion;
  }

  return defaultVersion;
}

/**
 * Create version-aware API handler
 */
export function createVersionedHandler(
  handlers: Record<ApiVersion, Function>,
  config: VersionConfig = DEFAULT_CONFIG
) {
  return async (request: NextRequest, ...args: unknown[]) => {
    const version = extractApiVersion(request, config);

    const handler = handlers[version];

    if (!handler) {
      return NextResponse.json(
        {
          error: 'API version not supported',
          supportedVersions: SUPPORTED_VERSIONS,
          requestedVersion: version,
        },
        { status: 400 }
      );
    }

    // Add version to request for handler access
    (request as NextRequest & { apiVersion?: ApiVersion }).apiVersion = version;

    return handler(request, ...args);
  };
}

/**
 * Version compatibility checker
 */
export function isVersionCompatible(
  requestedVersion: ApiVersion,
  minimumVersion: ApiVersion = 'v1'
): boolean {
  const versions = ['v1', 'v2']; // Ordered by release
  const requestedIndex = versions.indexOf(requestedVersion);
  const minimumIndex = versions.indexOf(minimumVersion);

  return requestedIndex >= minimumIndex;
}

/**
 * Deprecation warning for old API versions
 */
export function addDeprecationWarning(
  response: NextResponse,
  version: ApiVersion,
  deprecatedVersions: ApiVersion[] = []
): NextResponse {
  if (deprecatedVersions.includes(version)) {
    response.headers.set('X-API-Deprecated', 'true');
    response.headers.set(
      'X-API-Sunset',
      new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
    ); // 1 year from now
    response.headers.set('X-API-Replacement', 'v2');
  }

  return response;
}

/**
 * API versioning middleware
 */
export function withApiVersioning(handler: Function, config: VersionConfig = DEFAULT_CONFIG) {
  return async (request: NextRequest, ...args: unknown[]) => {
    const version = extractApiVersion(request, config);

    // Add version info to request
    (request as NextRequest & { apiVersion?: ApiVersion }).apiVersion = version;

    // Call handler
    const response = await handler(request, ...args);

    // Add version headers
    if (response instanceof NextResponse) {
      response.headers.set('X-API-Version', version);
      response.headers.set('X-API-Supported-Versions', SUPPORTED_VERSIONS.join(', '));

      // Add deprecation warning if needed
      return addDeprecationWarning(response, version, ['v1']); // v1 is deprecated in favor of v2
    }

    return response;
  };
}

/**
 * Version-specific response wrapper
 */
export function createVersionedResponse<T = unknown>(
  data: T,
  version: ApiVersion,
  status: number = 200
): NextResponse {
  const response = NextResponse.json(
    {
      data,
      meta: {
        version,
        timestamp: new Date().toISOString(),
      },
    },
    { status }
  );

  response.headers.set('X-API-Version', version);
  response.headers.set('X-API-Supported-Versions', SUPPORTED_VERSIONS.join(', '));

  return addDeprecationWarning(response, version, ['v1']);
}

/**
 * Version migration helper
 */
export function migrateApiResponse<T = unknown>(
  data: T,
  fromVersion: ApiVersion,
  toVersion: ApiVersion
): T {
  // Handle breaking changes between versions
  if (fromVersion === 'v1' && toVersion === 'v2') {
    // Example migration: rename fields, restructure data
    if (data && typeof data === 'object' && !Array.isArray(data)) {
      const dataObj = data as Record<string, unknown>;

      // Rename 'auctions' to 'items' in v2
      if ('auctions' in dataObj) {
        dataObj.items = dataObj.auctions;
        delete dataObj.auctions;
      }

      // Add version metadata
      const existingMeta =
        dataObj.meta && typeof dataObj.meta === 'object'
          ? (dataObj.meta as Record<string, unknown>)
          : {};
      dataObj.meta = {
        ...existingMeta,
        migrated: true,
        originalVersion: fromVersion,
      };
    }
  }

  return data;
}
