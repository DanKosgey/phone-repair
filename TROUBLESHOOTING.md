# Docker Troubleshooting Guide

## Common Issues and Solutions

### 1. Environment Variables Issues

#### Problem: Missing or incorrect environment variables
**Symptoms**: 
- Application fails to start
- Authentication errors
- Database connection failures
- "Missing environment variable" errors in logs

**Solutions**:
1. Verify `.env.docker` file exists and is properly formatted
2. Ensure all required variables are set:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXTAUTH_SECRET`
3. Check that values are correct and not placeholder text
4. Restart containers after changes:
   ```bash
   docker-compose --env-file .env.docker down
   docker-compose --env-file .env.docker up
   ```

#### Problem: Environment variables not loaded
**Symptoms**: Variables appear as undefined in application

**Solutions**:
1. Ensure you're using the `--env-file` flag:
   ```bash
   docker-compose --env-file .env.docker up
   ```
2. Check file permissions on `.env.docker`
3. Verify syntax (no spaces around `=`):
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   ```

### 2. Port Conflicts

#### Problem: Port already in use
**Symptoms**: 
- Error: "port is already allocated"
- Container fails to start

**Solutions**:
1. Check what's using the port:
   ```bash
   # Linux/Mac
   lsof -i :3000
   
   # Windows
   netstat -ano | findstr :3000
   ```
2. Stop conflicting processes or change port mapping in `docker-compose.yml`:
   ```yaml
   ports:
     - "3001:3000"  # Map host port 3001 to container port 3000
   ```

### 3. Database Connection Issues

#### Problem: Cannot connect to Supabase
**Symptoms**:
- Authentication failures
- Database query errors
- "Connection refused" errors

**Solutions**:
1. Verify Supabase credentials in `.env.docker`
2. Check that the Supabase service is accessible:
   ```bash
   docker-compose ps
   ```
3. Test connectivity from the app container:
   ```bash
   docker exec -it jays-shop-app sh
   curl -v https://your-project.supabase.co
   ```

### 4. Build Failures

#### Problem: Docker build fails
**Symptoms**: 
- Build errors during `docker-compose up --build`
- Dependency installation failures

**Solutions**:
1. Check internet connectivity
2. Clear Docker cache:
   ```bash
   docker-compose --env-file .env.docker up --build --no-cache
   ```
3. Verify `package.json` syntax
4. Check disk space:
   ```bash
   docker system df
   ```

### 5. Permission Issues

#### Problem: File permission errors
**Symptoms**:
- "Permission denied" errors
- Cannot write to files/directories
- Container crashes on startup

**Solutions**:
1. Check volume mount permissions in `docker-compose.yml`
2. Verify file ownership in the container:
   ```bash
   docker exec -it jays-shop-app ls -la
   ```
3. Adjust user permissions in Dockerfile if needed

### 6. Health Check Failures

#### Problem: Container marked unhealthy
**Symptoms**:
- Container shows as unhealthy in `docker-compose ps`
- Health check logs show failures

**Solutions**:
1. Check application logs:
   ```bash
   docker-compose logs app
   ```
2. Test health endpoint manually:
   ```bash
   docker exec -it jays-shop-app curl -f http://localhost:3000/api/health
   ```
3. Verify the health check endpoint exists and functions

## Debugging Commands

### Container Management
```bash
# View running containers
docker-compose ps

# View container logs
docker-compose logs -f app

# Stop all containers
docker-compose down

# Rebuild containers
docker-compose --env-file .env.docker up --build

# Force rebuild without cache
docker-compose --env-file .env.docker up --build --no-cache
```

### Container Access
```bash
# Access container shell
docker exec -it jays-shop-app sh

# View environment variables
docker exec -it jays-shop-app printenv

# Check running processes
docker exec -it jays-shop-app ps aux

# View disk usage
docker exec -it jays-shop-app df -h
```

### Network Diagnostics
```bash
# Test network connectivity
docker exec -it jays-shop-app ping google.com

# Test Supabase connectivity
docker exec -it jays-shop-app curl -v https://your-project.supabase.co

# View network configuration
docker network ls
docker network inspect jays-shop-network
```

## Vercel vs Docker Differences

### Environment Variables
- **Vercel**: Automatically injects environment variables
- **Docker**: Requires explicit `.env.docker` file

### Build Process
- **Vercel**: Uses its own build system
- **Docker**: Uses multi-stage build defined in Dockerfile

### Runtime
- **Vercel**: Serverless functions
- **Docker**: Persistent container

### Domain Configuration
- **Vercel**: Automatic domain handling
- **Docker**: Requires manual domain/SSL configuration

## Performance Issues

### Slow Startup
**Causes**:
- Large node_modules
- Complex build process
- Insufficient resources

**Solutions**:
1. Optimize Dockerfile layers
2. Use .dockerignore to exclude unnecessary files
3. Allocate more resources to Docker:
   ```bash
   # In Docker Desktop settings
   Resources > Memory/CPU
   ```

### High Memory Usage
**Solutions**:
1. Check for memory leaks in application
2. Set resource limits in docker-compose.yml:
   ```yaml
   deploy:
     resources:
       limits:
         memory: 1G
   ```

## Security Issues

### Exposed Credentials
**Prevention**:
- Never commit real credentials to version control
- Use Docker secrets in production
- Regularly rotate API keys

### Container Security
**Best Practices**:
- Run as non-root user (already implemented)
- Keep base images updated
- Scan images for vulnerabilities:
  ```bash
  docker scan jays-shop-app
  ```

## Advanced Debugging

### Enable Debug Logging
Set environment variables for more verbose logging:
```env
DEBUG=next:*
NODE_OPTIONS=--inspect=0.0.0.0:9229
```

### Profiling
Use Node.js profiling tools:
```bash
docker exec -it jays-shop-app node --prof-process isolate-0xnnnnnnnnnnnn-v8.log
```

### Monitoring
Implement application monitoring with tools like:
- Prometheus
- Grafana
- Application Performance Monitoring (APM) tools

## Recovery Procedures

### Complete Reset
```bash
# Stop and remove containers
docker-compose down

# Remove images
docker rmi jays-shop-app

# Rebuild from scratch
docker-compose --env-file .env.docker up --build
```

### Rollback to Previous Version
```bash
# If using image tags
docker-compose down
# Change image tag in docker-compose.yml
docker-compose up
```

## Support Resources

### Documentation
- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)

### Community Support
- Docker Community Forums
- Stack Overflow (docker, nextjs, supabase tags)
- GitHub Issues for specific projects

### Professional Support
- Docker Pro/Team plans
- Vercel Pro plan for deployment issues
- Supabase Pro plan for database support