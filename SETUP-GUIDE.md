# Docker Setup Guide

## Prerequisites

1. **Docker** (v20.10 or higher)
2. **Docker Compose** (v1.29 or higher)
3. **Supabase Account** with project credentials

## Quick Start

1. **Clone the repository** (if not already done)
2. **Configure environment variables** in `.env.docker`
3. **Build and run the application**:
   ```bash
   docker-compose --env-file .env.docker up --build
   ```

## Detailed Setup Instructions

### 1. Environment Configuration

Before running the application, you need to configure the environment variables in `.env.docker`:

#### Supabase Configuration
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key

To find these values:
1. Go to [https://app.supabase.com/](https://app.supabase.com/)
2. Select your project
3. Go to Settings > API
4. Copy the Project URL, anon key, and service role key

#### Next.js Configuration
- `NEXTAUTH_SECRET`: A secure secret key (already generated for you in the file)

If you need to generate a new secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'));"
```

### 2. Running the Application

#### First Time Setup
```bash
# Build and start with env file
docker-compose --env-file .env.docker up --build
```

#### Subsequent Runs
```bash
# Start services
docker-compose --env-file .env.docker up

# Or in detached mode
docker-compose --env-file .env.docker up -d
```

#### Development Mode
For development with hot reloading:
```bash
# Start in development mode
docker-compose --env-file .env.docker -f docker-compose.yml -f docker-compose.dev.yml up
```

### 3. Available Scripts

The following scripts are available in `package.json`:

- `docker:build`: Build the Docker image
- `docker:up`: Start containers
- `docker:up:build`: Build and start containers
- `docker:down`: Stop containers
- `docker:logs`: View application logs
- `docker:shell`: Access container shell
- `docker:clean`: Stop containers and remove the app image

### 4. Accessing the Application

Once running, access the application at:
- **Application**: http://localhost:3000
- **Supabase Studio**: http://localhost:54324 (when using local Supabase)

## Docker Architecture

### Services

1. **app**: Next.js application
   - Built with multi-stage Dockerfile
   - Runs on port 3000
   - Includes health checks
   - Uses non-root user for security

2. **supabase**: Local Supabase instance
   - PostgreSQL database on port 5432
   - Supabase services on port 54321
   - Persistent data volume

### Networks

- **jays-shop-network**: Bridge network for service communication

### Volumes

- **supabase-data**: Persistent storage for database

## Development Workflow

### Hot Reloading
The Docker setup includes volume mounts for development:
- Source code is mounted to `/app`
- `node_modules` is mounted separately
- `.next` directory is mounted for build artifacts

### Debugging
Access the container shell:
```bash
docker exec -it jays-shop-app sh
```

View logs:
```bash
docker-compose logs -f app
```

## Production Deployment

### Environment Differences
- Remove development volume mounts
- Use production Supabase instance instead of local
- Set proper domain names and SSL certificates
- Configure proper resource limits

### Security Considerations
- Never commit real credentials to version control
- Use secrets management in production
- Ensure proper network isolation
- Regularly update base images

## Troubleshooting

### Common Issues

1. **Port already in use**
   - Stop conflicting services or change port mapping
   - Use `lsof -i :3000` to find processes

2. **Environment variables missing**
   - Ensure `.env.docker` is properly configured
   - Verify all required variables are set

3. **Database connection issues**
   - Check Supabase credentials
   - Verify network connectivity
   - Ensure Supabase service is running

4. **Permission errors**
   - Check file ownership in containers
   - Verify volume mount permissions

### Debugging Commands

```bash
# View container logs
docker-compose logs -f app

# Access container shell
docker exec -it jays-shop-app sh

# Inspect environment variables
docker exec -it jays-shop-app printenv

# Check running containers
docker-compose ps

# Rebuild without cache
docker-compose --env-file .env.docker up --build --no-cache
```

## Customization

### Adding New Dependencies
1. Update `package.json`
2. Rebuild the Docker image:
   ```bash
   docker-compose --env-file .env.docker up --build
   ```

### Changing Ports
Modify the port mapping in `docker-compose.yml`:
```yaml
ports:
  - "3000:3000"  # Change host port (left) if needed
```

### Adding Services
Add new services to `docker-compose.yml` following the existing pattern.