# Deployment Guide

This guide covers deploying the OpenAI Realtime Agents application to various environments.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Environment Configuration](#environment-configuration)
- [Local Development](#local-development)
- [Production Deployment](#production-deployment)
- [Vercel Deployment](#vercel-deployment)
- [Docker Deployment](#docker-deployment)
- [Security Considerations](#security-considerations)
- [Performance Optimization](#performance-optimization)
- [Monitoring](#monitoring)

## Prerequisites

### Required Software
- Node.js 18.x or higher
- npm 8.x or higher
- Git

### Required Accounts
- OpenAI API account with Realtime API access
- Hosting provider account (Vercel, AWS, etc.)

### API Keys
- OpenAI API key with Realtime API enabled

## Environment Configuration

### Environment Variables

Create a `.env` file in the project root:

```bash
# Required
OPENAI_API_KEY=sk-...

# Optional
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

### Configuration Files

#### next.config.ts
```typescript
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Enable if using custom domain
  images: {
    domains: ['your-domain.com'],
  },
  
  // Security headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
```

## Local Development

### Setup

1. Clone the repository:
```bash
git clone https://github.com/openai/openai-realtime-agents.git
cd openai-realtime-agents
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.sample .env
# Edit .env with your API key
```

4. Run development server:
```bash
npm run dev
```

5. Access at `http://localhost:3000`

### Development Tools

- **Hot Reload**: Automatic on file changes
- **Type Checking**: `npm run typecheck`
- **Linting**: `npm run lint`
- **Formatting**: `npm run biome:fix`

## Production Deployment

### Build Process

1. Install dependencies:
```bash
npm ci --production=false
```

2. Build the application:
```bash
npm run build
```

3. Test the production build:
```bash
npm run start
```

### Production Checklist

- [ ] Environment variables configured
- [ ] API key secured and not in code
- [ ] HTTPS enabled
- [ ] CORS configured if needed
- [ ] Error logging enabled
- [ ] Performance monitoring active
- [ ] Security headers configured

## Vercel Deployment

### One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/openai/openai-realtime-agents)

### Manual Deployment

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel
```

3. Configure environment variables:
```bash
vercel env add OPENAI_API_KEY
```

### Vercel Configuration

Create `vercel.json`:
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["iad1"],
  "functions": {
    "src/app/api/session/route.ts": {
      "maxDuration": 10
    }
  }
}
```

## Docker Deployment

### Dockerfile

Create a production Dockerfile:

```dockerfile
# Build stage
FROM node:18-alpine AS builder
WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production stage
FROM node:18-alpine AS runner
WORKDIR /app

# Install production dependencies only
COPY package*.json ./
RUN npm ci --production

# Copy built application
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.ts ./

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001
USER nextjs

# Expose port
EXPOSE 3000

# Start application
CMD ["npm", "start"]
```

### Docker Compose

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - OPENAI_API_KEY=${OPENAI_API_KEY}
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
```

### Build and Run

```bash
# Build image
docker build -t realtime-agents .

# Run container
docker run -p 3000:3000 --env-file .env realtime-agents
```

## Security Considerations

### API Key Management

1. **Never commit API keys**:
   - Use environment variables
   - Add `.env` to `.gitignore`
   - Use secrets management in production

2. **Ephemeral Key Pattern**:
   - Server generates temporary keys
   - Client never sees main API key
   - Keys expire automatically

### HTTPS Configuration

Always use HTTPS in production:

1. **Vercel**: Automatic HTTPS
2. **Custom Domain**: Use SSL certificates
3. **Reverse Proxy**: Configure nginx/Apache

Example nginx configuration:
```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Content Security Policy

Add CSP headers:
```typescript
// next.config.ts
headers: [
  {
    key: 'Content-Security-Policy',
    value: "default-src 'self'; script-src 'self' 'unsafe-eval'; connect-src 'self' https://api.openai.com wss://*.openai.com; style-src 'self' 'unsafe-inline';"
  }
]
```

## Performance Optimization

### Build Optimization

1. **Enable SWC minification**:
```typescript
// next.config.ts
const nextConfig = {
  swcMinify: true,
};
```

2. **Optimize images**:
```typescript
const nextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
  },
};
```

### Runtime Optimization

1. **Enable caching**:
```typescript
// API routes
export const revalidate = 3600; // Cache for 1 hour
```

2. **Use CDN for static assets**
3. **Enable compression**:
```bash
npm install compression
```

### WebRTC Optimization

1. **TURN server configuration** for better connectivity:
```typescript
const iceServers = [
  { urls: 'stun:stun.l.google.com:19302' },
  {
    urls: 'turn:your-turn-server.com:3478',
    username: 'user',
    credential: 'pass',
  },
];
```

2. **Bandwidth management**:
   - Use appropriate codecs
   - Implement adaptive bitrate
   - Monitor connection quality

## Monitoring

### Health Check Endpoint

Create `/api/health/route.ts`:
```typescript
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Check OpenAI API connectivity
    const response = await fetch('https://api.openai.com/v1/models', {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('OpenAI API unavailable');
    }
    
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      checks: {
        openai: 'connected',
        environment: process.env.NODE_ENV,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        error: error.message,
      },
      { status: 503 }
    );
  }
}
```

### Logging

1. **Application logs**:
```typescript
// utils/logger.ts
export const logger = {
  info: (message: string, data?: any) => {
    console.log(JSON.stringify({
      level: 'info',
      message,
      data,
      timestamp: new Date().toISOString(),
    }));
  },
  error: (message: string, error: any) => {
    console.error(JSON.stringify({
      level: 'error',
      message,
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    }));
  },
};
```

2. **Error tracking**: Integrate Sentry or similar
3. **Performance monitoring**: Use Vercel Analytics or custom solution

### Metrics to Monitor

- API response times
- WebRTC connection success rate
- Agent handoff frequency
- Tool execution times
- Error rates by type
- Audio quality metrics
- User session duration

## Troubleshooting Deployment

### Common Issues

1. **Build Failures**:
   - Check Node.js version
   - Clear cache: `rm -rf .next node_modules`
   - Verify all dependencies

2. **Runtime Errors**:
   - Check environment variables
   - Verify API key permissions
   - Check CORS configuration

3. **WebRTC Issues**:
   - Ensure HTTPS is enabled
   - Check firewall rules
   - Verify TURN server config

4. **Performance Issues**:
   - Enable production mode
   - Check for memory leaks
   - Monitor API rate limits

### Debug Mode

Enable debug logging:
```bash
DEBUG=* npm run start
```

### Production Logs

Access logs based on platform:
- **Vercel**: `vercel logs`
- **Docker**: `docker logs container-name`
- **PM2**: `pm2 logs`

## Scaling Considerations

### Horizontal Scaling

1. **Stateless design**: Sessions managed client-side
2. **Load balancing**: Use round-robin or least-connections
3. **Session affinity**: Not required for WebRTC

### Vertical Scaling

- Increase memory for Node.js: `NODE_OPTIONS="--max-old-space-size=4096"`
- Use worker threads for CPU-intensive tasks
- Optimize build process

### Rate Limiting

Implement rate limiting for API routes:
```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
```

## Post-Deployment

1. **Monitor application health**
2. **Set up alerts for errors**
3. **Regular security updates**
4. **Performance benchmarking**
5. **User feedback collection**
6. **A/B testing for improvements**