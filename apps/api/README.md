# WebVitals API Server

This is the Express.js backend API server for WebVitals.io (separate from Next.js for independent deployment).

## Development

```bash
# From the monorepo root
npm run dev

# Or from this directory
npm run dev
```

## Build

```bash
# From the monorepo root
npm run build

# Or from this directory
npm run build
```

## Dependencies

This app depends on:
- `@webvitals/types` - Shared TypeScript types

## Structure

- `src/` - API server source code
- `dist/` - Compiled JavaScript output (generated)

## Status

Currently a placeholder with a basic health check endpoint. Full API implementation coming in Week 3.
