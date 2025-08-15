# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Development
- `npm install` - Install all dependencies (requires Node.js 18+)
- `npm run dev` - Start development server on localhost:5173
- `npm run build` - Build for production (outputs to `dist/`)
- `npm run preview` - Preview production build
- `npm test` - Run tests using Vitest
- `npm run deploy` - Build and deploy to Cloudflare Pages

### Testing
- `vitest run` - Run all tests once
- `vitest` - Run tests in watch mode

## Architecture Overview

### Application Structure
This is a React + Vite SPA that serves as a cybersecurity infrastructure directory for federal entities. The application provides interactive mapping, threat intelligence feeds, and federal compliance features.

### Key Technologies
- **Frontend**: React 19, Vite 7, TypeScript/JSX
- **Styling**: Tailwind CSS with custom design tokens
- **Mapping**: MapLibre GL (uses `VITE_MAP_STYLE_URL` env var, defaults to MapLibre demo tiles)
- **Routing**: React Router DOM with SPA fallback via Cloudflare Pages Function
- **RSS/Feed Processing**: fast-xml-parser for cybersecurity feeds
- **Deployment**: Cloudflare Pages with D1 database integration

### Core Pages and Navigation
- **Home** (`/`): Landing page with search and entity filters 
- **Browse** (`/browse`): Interactive map with federal entity exploration
- **Dashboard** (`/dashboard`): Enhanced dashboard with threat intelligence
- **Threat Intelligence** (`/feeds`, `/threat-intelligence`): Advanced feed dashboard with topic clustering
- **Entity Pages** (`/entity/:id`): Detailed federal entity information
- **Map** (`/map`): Standalone map interface
- **Federal Infrastructure** (`/federal-infrastructure`): Infrastructure mapping
- **Incident Report** (`/report-incident`): Emergency incident reporting

### Data Architecture

#### Federal Entity Schema
Entities follow `schema/entity.schema.json` with required fields:
- Geographic: `lat`, `lng`, `city`, `state`
- Organizational: `agency`, `office_name`, `role_type`
- Operational: `sectors`, `functions`, `priority`
- Contact: `contact_public` (website required)

Data files are stored in `src/data/`:
- `summary.json` - Main entity database
- `offices.json` - Office hierarchy
- `federalEntities.ts` - Entity definitions
- `agency_index.json`, `sector_index.json` - Taxonomies

#### URL State Management
Browse interface stores state in query params:
```
?z=5&c=-98.5,39.8&b=-125,24,-66,49&f={"sectors":["Water"]}&s=ENTITY_ID
```

### Services Architecture

#### Cybersecurity Feed Management
- **feedManager.js**: Unified feed orchestration with federal compliance and enhanced clustering
- **topicDetectionService.ts**: AI-powered topic detection and feed clustering by cybersecurity domains
- **feedCacheService.ts**: Advanced caching with LRU eviction, compression, and intelligent invalidation
- **cisaKevService.ts**: CISA Known Exploited Vulnerabilities integration
- **cveEnrichmentService.ts**: CVE data enrichment and correlation
- **stixTaxiiService.ts**: STIX/TAXII 2.1 threat intelligence
- **emergencyResponseService.ts**: Emergency alerting and response
- **federalDataRetentionService.ts**: Compliance data retention

The feed system supports multiple formats (RSS, JSON, STIX/TAXII) with federal compliance features including FISMA Moderate, NIST 800-53 Rev 5, and automatic KEV catalog integration. Advanced features include intelligent topic clustering, performance optimization for large datasets, and comprehensive search capabilities.

### Component Organization

#### UI Components (`src/components/`)
- **Layout.jsx**: Main application shell with navigation
- **Map components**: `map/AtlasMap.tsx`, `map/DetailDrawer.tsx`, `map/SearchBox.tsx`
- **Search**: `Search/AdvancedSearch.tsx`, `SearchModal.jsx`
- **Feeds**: Enhanced feed system with intelligent clustering
  - `FeedDashboard.tsx`: Main dashboard with topic clustering and advanced filtering
  - `Feeds/FeedGroup.tsx`: Collapsible topic groups with trend analysis
  - `Feeds/FeedCard.tsx`: Individual feed items with severity indicators
  - `Feeds/FeedFilters.tsx`: Multi-select filtering with quick presets
  - `Feeds/FeedSearch.tsx`: Advanced search with suggestions and CVE detection
  - `Feeds/VirtualizedFeedList.tsx`: Performance-optimized virtual scrolling for large datasets
- **Accessibility**: Full a11y toolkit in `accessibility/`
- **Federal Features**: `FederalEntityMap.tsx`, `FederalEntitySearch.tsx`

#### Security and Performance
- **Security**: CSP headers via `functions/[[catchall]].ts`, security utilities in `utils/security.ts`
- **Performance**: Optimized chunking in `vite.config.js`, performance monitoring hooks, virtual scrolling for large datasets
- **Caching**: Advanced multi-layer caching with LRU eviction, compression, and intelligent cache invalidation
- **Topic Intelligence**: Automated feed clustering by cybersecurity domains (ransomware, APT, critical infrastructure, etc.)
- **Search Optimization**: Real-time search with CVE detection, topic suggestions, and filtered result caching

### Configuration

#### Environment Variables
- `VITE_MAP_STYLE_URL` - Custom map style URL (optional, defaults to MapLibre demo)

#### Build Configuration
- **Vite**: Custom chunking strategy for vendor libraries and app components
- **Tailwind**: Custom design tokens via CSS variables in `styles/tokens.css`
- **Cloudflare**: D1 database binding (`cisadx-ti`), Pages Functions for SPA routing

### Content Security Policy
The CSP allows MapLibre demo tiles by default. For custom map providers (MapTiler, Mapbox, Carto):
1. Set `VITE_MAP_STYLE_URL` environment variable
2. Update CSP in `functions/[[catchall]].ts` to allow your tile domains in `style-src`, `img-src`, and `connect-src`

### Development Patterns

#### Accessibility
All interactive elements support keyboard navigation:
- `/` - focus global search
- `f` - toggle filters  
- `ArrowUp`/`ArrowDown` - navigate results
- `Enter` - open selected result

#### Error Handling
- `ErrorBoundary.jsx` wraps the entire application
- Service failures gracefully degrade to cached data
- Offline detection with UI feedback

#### Federal Compliance
The application implements several federal requirements:
- FISMA Moderate security controls
- NIST 800-53 Rev 5 implementation
- STIX/TAXII 2.1 threat intelligence sharing
- CISA KEV catalog integration
- Federal PKI compatibility
- Data retention compliance

When working with threat intelligence features, ensure federal sharing requirements are maintained and all security controls remain compliant.