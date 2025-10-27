# Docker Setup for Pigeon Auction Platform

This guide provides comprehensive instructions for running the Pigeon Auction Platform using Docker and Docker Compose.

## Prerequisites

- Docker Engine 20.10 or later
- Docker Compose 2.0 or later
- At least 4GB of available RAM
- At least 10GB of available disk space

## Quick Start

1. **Clone the repository and navigate to the project directory**
   ```bash
   cd wwwwww11111
   ```

2. **Copy environment configuration**
   ```bash
   cp .env.example .env
   ```

3. **Edit the environment variables**
   Update `.env` file with your actual configuration values:
   - Database credentials
   - Firebase configuration
   - Stripe API keys
   - Twilio credentials
   - Email settings
   - Other service configurations

4. **Start all services**
   ```bash
   docker-compose up -d
   ```

5. **Run database migrations**
   ```bash
   docker-compose exec app npm run migrate:deploy
   ```

6. **Access the application**
   - Main application: http://localhost:3000
   - Database admin (PgAdmin): http://localhost:5050
   - Redis admin (Redis Commander): http://localhost:8081

## Services Overview

### Core Services

- **app** - Next.js application (Node.js 18 Alpine)
- **postgres** - PostgreSQL 15 database
- **redis** - Redis 7 for caching and sessions

### Optional Services

- **nginx** - Reverse proxy (production profile)
- **pgadmin** - PostgreSQL administration (tools profile)
- **redis-commander** - Redis administration (tools profile)

## Docker Commands

### Development

```bash
# Start services in development mode
docker-compose up

# Start in background
docker-compose up -d

# View logs
docker-compose logs -f app
docker-compose logs -f postgres

# Stop services
docker-compose down

# Rebuild and restart
docker-compose up --build
```

### Production

```bash
# Start with production profile (includes nginx)
docker-compose --profile production up -d

# Start with all tools
docker-compose --profile tools up -d

# Start everything
docker-compose --profile production --profile tools up -d
```

### Database Management

```bash
# Access PostgreSQL container
docker-compose exec postgres psql -U postgres -d pigeon_auction

# Run migrations
docker-compose exec app npm run migrate:deploy

# Reset database (WARNING: destroys all data)
docker-compose exec app npm run db:reset

# Generate Prisma client
docker-compose exec app npx prisma generate
```

### Maintenance

```bash
# View resource usage
docker stats

# Clean up unused resources
docker system prune -a

# Rebuild specific service
docker-compose build app
docker-compose up -d app

# View container health
docker-compose ps
```

## Environment Configuration

Copy `.env.example` to `.env` and configure the following sections:

### Database
```env
DATABASE_URL="postgresql://postgres:password@postgres:5432/pigeon_auction"
POSTGRES_PASSWORD="your-secure-password"
```

### Redis
```env
REDIS_URL="redis://:password@redis:6379"
REDIS_PASSWORD="your-secure-password"
```

### Authentication
```env
NEXTAUTH_SECRET="your-secure-nextauth-secret"
NEXTAUTH_URL="http://localhost:3000"
```

### External Services
Configure Firebase, Stripe, Twilio, and other external service credentials in the `.env` file.

## File Structure

```
.
├── Dockerfile              # Next.js application container
├── docker-compose.yml      # Main compose configuration
├── .dockerignore          # Files to exclude from build context
├── .env.example           # Environment template
├── nginx.conf             # Nginx configuration
├── scripts/
│   └── init.sql          # Database initialization
└── README-Docker.md       # This file
```

## Troubleshooting

### Common Issues

1. **Port conflicts**
   - Change ports in `docker-compose.yml` if 3000, 5432, or 6379 are in use
   - Check: `docker-compose ps` and `netstat -tulpn`

2. **Permission issues**
   ```bash
   # Fix file permissions
   sudo chown -R $USER:$USER .
   ```

3. **Memory issues**
   - Increase Docker memory allocation
   - Check: Docker Desktop > Settings > Resources

4. **Database connection issues**
   ```bash
   # Check database logs
   docker-compose logs postgres

   # Test database connection
   docker-compose exec postgres pg_isready -U postgres
   ```

5. **Build failures**
   ```bash
   # Clear Docker cache
   docker system prune -a --volumes

   # Rebuild without cache
   docker-compose build --no-cache
   ```

### Health Checks

All services include health checks. Monitor with:
```bash
docker-compose ps
```

Or check specific service health:
```bash
# Application health
curl http://localhost:3000/api/health

# Database health
docker-compose exec postgres pg_isready -U postgres

# Redis health
docker-compose exec redis redis-cli ping
```

## Performance Optimization

1. **Use production builds**
   ```bash
   docker-compose --profile production up -d
   ```

2. **Enable gzip compression** (enabled in nginx.conf)

3. **Database optimization**
   - Indexes are created automatically via `init.sql`
   - Consider connection pooling for high traffic

4. **Redis optimization**
   - Password protection enabled
   - Persistence via append-only file

## Security Considerations

1. **Change default passwords** in `.env` file
2. **Use strong passwords** for database and Redis
3. **Enable SSL** in production (configure nginx.conf)
4. **Network security** - services communicate via internal network
5. **Regular updates** - keep Docker images updated

## Backup and Recovery

### Database Backup
```bash
# Create backup
docker-compose exec postgres pg_dump -U postgres pigeon_auction > backup.sql

# Restore backup
docker-compose exec -T postgres psql -U postgres pigeon_auction < backup.sql
```

### Volume Backup
```bash
# Backup named volumes
docker run --rm -v pigeon-auction_postgres_data:/data -v $(pwd):/backup alpine tar czf /backup/postgres_backup.tar.gz -C /data .
```

## Logs and Monitoring

### Application Logs
```bash
# Follow app logs
docker-compose logs -f app

# View last 100 lines
docker-compose logs --tail=100 app
```

### System Monitoring
```bash
# Container resource usage
docker stats

# Container processes
docker-compose top

# Network connections
docker-compose exec app netstat -tulpn
```

## Development Workflow

1. **Start development environment**
   ```bash
   docker-compose up -d postgres redis
   docker-compose up app
   ```

2. **Run migrations during development**
   ```bash
   docker-compose exec app npm run migrate:dev
   ```

3. **Access development tools**
   - PgAdmin: http://localhost:5050
   - Redis Commander: http://localhost:8081

4. **Hot reload** - Changes to source code will trigger rebuilds

## Production Deployment

1. **Use production profile**
   ```bash
   docker-compose --profile production up -d
   ```

2. **Configure SSL certificates**
   - Place certificates in `./ssl/` directory
   - Uncomment HTTPS section in `nginx.conf`

3. **Set environment variables**
   ```bash
   export NODE_ENV=production
   export NEXT_PUBLIC_APP_URL=https://yourdomain.com
   ```

4. **Enable monitoring and logging**
   - Configure log rotation
   - Set up monitoring tools
   - Enable health check alerts

## Support

For issues and questions:
1. Check the troubleshooting section above
2. Review container logs: `docker-compose logs`
3. Verify environment configuration
4. Check Docker system resources

## License

This Docker configuration is part of the Pigeon Auction Platform project.
