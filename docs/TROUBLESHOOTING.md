# Troubleshooting Guide

This guide helps you diagnose and fix common issues with the OpenAI Realtime Agents application.

## Table of Contents
- [Common Issues](#common-issues)
- [Connection Problems](#connection-problems)
- [Audio Issues](#audio-issues)
- [Agent Behavior](#agent-behavior)
- [Performance Problems](#performance-problems)
- [Development Issues](#development-issues)
- [Debugging Tools](#debugging-tools)
- [Error Reference](#error-reference)

## Common Issues

### Application Won't Start

**Symptoms:**
- Blank page or loading spinner
- Console errors
- Build failures

**Solutions:**

1. **Check Node.js version:**
```bash
node --version  # Should be 18.x or higher
```

2. **Clear cache and reinstall:**
```bash
rm -rf node_modules .next package-lock.json
npm install
npm run dev
```

3. **Verify environment variables:**
```bash
# Check if .env exists
ls -la .env

# Verify API key format
grep OPENAI_API_KEY .env
```

4. **Check for port conflicts:**
```bash
# Check if port 3000 is in use
lsof -i :3000

# Use different port
PORT=3001 npm run dev
```

### TypeScript Errors

**Common errors and fixes:**

1. **Module not found:**
```bash
# Clear TypeScript cache
rm -rf .next
npm run typecheck
```

2. **Type errors after updates:**
```bash
# Regenerate types
npm run build
```

## Connection Problems

### Cannot Connect to Realtime API

**Error:** "Failed to connect" or "WebRTC connection failed"

**Diagnostic Steps:**

1. **Check API key permissions:**
   - Ensure key has Realtime API access
   - Verify key isn't expired or revoked
   - Test key with curl:
   ```bash
   curl https://api.openai.com/v1/models \
     -H "Authorization: Bearer $OPENAI_API_KEY"
   ```

2. **Browser compatibility:**
   - Use Chrome, Edge, or Safari
   - Firefox may have WebRTC issues
   - Check browser console for errors

3. **Network issues:**
   - Check firewall settings
   - Verify WebRTC ports aren't blocked
   - Test with mobile hotspot

4. **HTTPS requirement:**
   - WebRTC requires HTTPS in production
   - Use localhost for development
   - Check SSL certificate validity

### Ephemeral Key Errors

**Error:** "No ephemeral key provided"

**Solutions:**

1. **Check API route:**
```typescript
// Verify /api/session/route.ts exists
// Check error handling
export async function GET() {
  try {
    // Your code
  } catch (error) {
    console.error('Session error:', error);
    // Add detailed logging
  }
}
```

2. **Verify API response:**
```bash
# Test endpoint directly
curl http://localhost:3000/api/session
```

### WebRTC Connection Drops

**Symptoms:**
- Connection works initially then fails
- Intermittent disconnections
- "ICE connection failed"

**Solutions:**

1. **Add TURN servers:**
```typescript
// In useRealtimeSession.ts
const iceServers = [
  { urls: 'stun:stun.l.google.com:19302' },
  // Add TURN server for better connectivity
  {
    urls: 'turn:your-turn-server.com:3478',
    username: 'user',
    credential: 'pass'
  }
];
```

2. **Check network stability:**
   - Monitor connection quality
   - Test on different networks
   - Use wired connection if possible

## Audio Issues

### No Audio Output

**Diagnostic steps:**

1. **Check browser permissions:**
   - Allow microphone access
   - Check system audio settings
   - Verify browser isn't muted

2. **Verify audio element:**
```javascript
// In browser console
const audio = document.querySelector('audio');
console.log('Audio element:', audio);
console.log('Muted:', audio?.muted);
console.log('Volume:', audio?.volume);
```

3. **Check audio playback setting:**
   - Ensure "Audio playback" is enabled in UI
   - Check localStorage:
   ```javascript
   localStorage.getItem('audioPlaybackEnabled')
   ```

### Poor Audio Quality

**Common causes and fixes:**

1. **Codec issues:**
   - Try different codec (Opus vs PCMU/PCMA)
   - Check bandwidth limitations
   - Monitor packet loss

2. **Network problems:**
   - Test connection speed
   - Reduce other network usage
   - Use quality headphones/mic

3. **Echo or feedback:**
   - Use headphones
   - Reduce speaker volume
   - Check acoustic environment

### Push-to-Talk Not Working

**Solutions:**

1. **Check PTT state:**
```javascript
// In console
console.log('PTT Active:', localStorage.getItem('pushToTalkUI'));
```

2. **Verify event handlers:**
   - Check mouse/touch events
   - Test with keyboard shortcuts
   - Monitor console for errors

## Agent Behavior

### Agent Not Responding

**Diagnostic steps:**

1. **Check agent configuration:**
   - Verify instructions are clear
   - Ensure tools are properly defined
   - Check for syntax errors

2. **Monitor tool execution:**
```typescript
// Add logging to tools
execute: async (input) => {
  console.log('Tool called:', { name: 'tool_name', input });
  try {
    const result = await operation(input);
    console.log('Tool result:', result);
    return result;
  } catch (error) {
    console.error('Tool error:', error);
    throw error;
  }
}
```

3. **Verify agent handoffs:**
   - Check handoff array configuration
   - Monitor handoff events in logs
   - Test each handoff path

### Incorrect Agent Behavior

**Common issues:**

1. **Instructions too vague:**
```typescript
// ❌ Bad
instructions: "Be helpful"

// ✅ Good
instructions: `
You are a customer service agent. You should:
1. Greet customers warmly
2. Ask clarifying questions
3. Use the lookup_order tool for order inquiries
4. Transfer to technical_support for complex issues
`
```

2. **Tool not being called:**
   - Make description clearer
   - Simplify parameter schema
   - Add examples to instructions

3. **Wrong agent selected:**
   - Check handoffDescription clarity
   - Verify agent names are unique
   - Test handoff conditions

### Guardrail Violations

**Error:** "Guardrail tripped"

**Solutions:**

1. **Review agent instructions:**
   - Add content guidelines
   - Specify tone and language
   - Include examples of good responses

2. **Adjust guardrail sensitivity:**
```typescript
// In guardrails.ts
const guardrail = createModerationGuardrail(companyName, {
  sensitivity: 'medium', // low, medium, high
  categories: ['OFFENSIVE', 'OFF_BRAND']
});
```

## Performance Problems

### Slow Response Times

**Diagnostic steps:**

1. **Measure latency:**
```typescript
// Add timing logs
const start = Date.now();
await operation();
console.log('Operation took:', Date.now() - start, 'ms');
```

2. **Check tool performance:**
   - Profile async operations
   - Reduce external API calls
   - Implement caching

3. **Optimize agent instructions:**
   - Keep instructions concise
   - Remove unnecessary complexity
   - Reduce tool count

### High Memory Usage

**Solutions:**

1. **Monitor memory:**
```bash
# During development
node --max-old-space-size=4096 node_modules/.bin/next dev
```

2. **Clean up resources:**
```typescript
// Remove event listeners
useEffect(() => {
  const handler = () => {};
  session.on('event', handler);
  
  return () => {
    session.off('event', handler);
  };
}, []);
```

3. **Limit transcript history:**
```typescript
// Trim old messages
const MAX_MESSAGES = 100;
if (transcriptItems.length > MAX_MESSAGES) {
  transcriptItems = transcriptItems.slice(-MAX_MESSAGES);
}
```

## Development Issues

### Hot Reload Not Working

**Solutions:**

1. **Check Next.js config:**
```typescript
// next.config.ts
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
};
```

2. **Clear Next.js cache:**
```bash
rm -rf .next
npm run dev
```

### Biome/Linting Errors

**Common fixes:**

1. **Auto-fix issues:**
```bash
npm run biome:fix
```

2. **Check Biome config:**
```json
// biome.json
{
  "files": {
    "ignore": [".next/**", "node_modules/**"]
  }
}
```

### Build Failures

**Diagnostic steps:**

1. **Check error messages:**
```bash
npm run build 2>&1 | tee build.log
```

2. **Verify dependencies:**
```bash
npm ls
npm audit
```

3. **Test production build:**
```bash
npm run build && npm run start
```

## Debugging Tools

### Browser DevTools

**Useful panels:**

1. **Network tab:**
   - Monitor WebRTC connections
   - Check API calls
   - Analyze WebSocket traffic

2. **Console:**
   - Add debug logging
   - Test API calls
   - Inspect state

3. **Application tab:**
   - Check localStorage
   - Verify cookies
   - Inspect WebRTC stats

### Debug Logging

**Enable verbose logging:**

```typescript
// Add to .env
DEBUG=true

// In code
if (process.env.DEBUG) {
  console.log('Detailed info:', data);
}
```

### WebRTC Debugging

**Get connection stats:**

```javascript
// In browser console
const pc = document.querySelector('audio').srcObject?.getTracks()[0]?.rtcPeerConnection;
if (pc) {
  const stats = await pc.getStats();
  stats.forEach(report => console.log(report));
}
```

### Session Recording

**For debugging conversations:**

1. **Enable in UI:** Click "Download Audio"
2. **Save event logs:** Export from Events panel
3. **Capture screenshots:** For UI issues

## Error Reference

### API Errors

| Error | Cause | Solution |
|-------|-------|----------|
| 401 Unauthorized | Invalid API key | Check OPENAI_API_KEY |
| 403 Forbidden | No Realtime access | Enable in OpenAI account |
| 429 Rate Limited | Too many requests | Implement backoff |
| 500 Server Error | OpenAI issue | Wait and retry |

### WebRTC Errors

| Error | Cause | Solution |
|-------|-------|----------|
| ICE Failed | Network blocked | Check firewall/NAT |
| No Remote Stream | Connection issue | Verify signaling |
| Permission Denied | Mic not allowed | Grant permissions |
| Not Supported | Old browser | Update browser |

### Application Errors

| Error | Cause | Solution |
|-------|-------|----------|
| Agent not found | Wrong name | Check agent config |
| Tool execution failed | Bug in tool | Add error handling |
| Handoff failed | Missing agent | Verify handoff array |
| Guardrail tripped | Content issue | Adjust instructions |

## Getting Help

### Resources

1. **Documentation:**
   - [README.md](../README.md)
   - [API Reference](./API_REFERENCE.md)
   - [Architecture Guide](./ARCHITECTURE.md)

2. **Community:**
   - GitHub Issues
   - OpenAI Forums
   - Discord/Slack channels

3. **Support:**
   - Check OpenAI status page
   - Review API documentation
   - Contact OpenAI support

### Reporting Issues

When reporting issues, include:

1. **Environment info:**
```bash
node --version
npm --version
# OS and browser
```

2. **Error messages:**
   - Full error text
   - Stack traces
   - Console logs

3. **Steps to reproduce:**
   - Exact actions taken
   - Expected behavior
   - Actual behavior

4. **Configuration:**
   - Agent setup
   - Tool definitions
   - Network environment

### Debug Checklist

- [ ] Check browser console for errors
- [ ] Verify API key is valid
- [ ] Test with simple agent first
- [ ] Check network connectivity
- [ ] Review agent instructions
- [ ] Monitor tool execution
- [ ] Inspect WebRTC connection
- [ ] Check audio permissions
- [ ] Review event logs
- [ ] Test in different browser