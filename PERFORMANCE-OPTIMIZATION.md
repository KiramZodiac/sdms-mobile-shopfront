# Performance Optimization Guide

This document outlines the performance optimizations implemented to reduce bundle size and improve loading times.

## Implemented Optimizations

### 1. JavaScript Bundle Optimization (Est. 151 KiB savings)

#### Code Splitting Strategy
- **Core React libraries**: Separated React and React-DOM into `react-vendor` chunk
- **Router**: Isolated React Router into `router` chunk
- **UI Components**: Split into usage-based chunks:
  - `ui-core`: Essential UI utilities (slot, label, class-variance-authority, etc.)
  - `ui-basic`: Frequently used components (button, card, badge, input)
  - `ui-advanced`: Less frequently used components (dialog, dropdown, toast, tabs, etc.)
  - `ui-unused`: Components not currently used in the application

#### Modern JavaScript Features
- Updated TypeScript target to ES2022
- Set Vite build target to 'esnext'
- Removed legacy Babel transforms
- Enabled tree shaking for unused code

#### Terser Optimization
- Enabled top-level mangling
- Removed console statements in production
- Added pure function annotations

### 2. CSS Optimization (Est. 11 KiB savings)

#### PurgeCSS Integration
- Added `@fullhuman/postcss-purgecss` for unused CSS removal
- Configured comprehensive safelist for dynamic classes
- Preserved Tailwind utility classes that might be generated dynamically

#### CSS Safelist Categories
- Dynamic classes (bg-, text-, border-, etc.)
- Animation classes (animate-, transition-, transform-)
- Layout utilities (w-, h-, p-, m-, flex, grid, etc.)
- Responsive and state variants (hover:, focus:, dark:, etc.)

### 3. Legacy JavaScript Removal (Est. 1 KiB savings)

#### Modern Browser Support
- Updated TypeScript target to ES2022
- Removed unnecessary Babel polyfills
- Enabled modern JavaScript features

### 4. Image Optimization (Addressing 10,185 KiB payload)

#### OptimizedImage Component
- Implemented lazy loading with Intersection Observer
- Added responsive image support with srcSet
- Included loading skeletons and error handling
- Added preloading for critical images

#### PWA Image Caching
- Configured CacheFirst strategy for images
- Set 30-day cache expiration
- Limited cache entries to 50 images

## Bundle Analysis

### Current Chunk Structure
```
react-vendor.js     - React core libraries
router.js          - React Router
ui-core.js         - Essential UI utilities
ui-basic.js        - Basic UI components
ui-advanced.js     - Advanced UI components
ui-unused.js       - Unused UI components (lazy loaded)
supabase.js        - Supabase client
query.js           - React Query
analytics.js       - Vercel analytics
icons.js           - Icon libraries
animations.js      - Animation libraries
forms.js           - Form libraries
utils.js           - Utility libraries
```

### Monitoring Bundle Size
```bash
# Analyze bundle size
npm run build:analyze

# Build for production
npm run build

# Preview production build
npm run preview
```

## Additional Recommendations

### 1. Further JavaScript Optimization
- Consider removing unused dependencies:
  - `@radix-ui/react-*` components not in use
  - Unused icon libraries
  - Unused utility libraries

### 2. Image Optimization
- Implement WebP format support
- Add image compression pipeline
- Consider using a CDN for image delivery
- Implement progressive image loading

### 3. Network Optimization
- Enable HTTP/2 or HTTP/3
- Implement resource hints (preload, prefetch)
- Use service worker for caching strategies
- Consider implementing streaming SSR

### 4. Runtime Optimization
- Implement React.memo for expensive components
- Use useMemo and useCallback for expensive computations
- Consider implementing virtual scrolling for large lists
- Optimize re-renders with proper dependency arrays

### 5. Monitoring and Analytics
- Implement Core Web Vitals monitoring
- Set up bundle size alerts
- Monitor real user performance metrics
- Track unused code with coverage reports

## Usage Examples

### Using OptimizedImage Component
```tsx
import { OptimizedImage } from '@/components/OptimizedImage';

// Basic usage
<OptimizedImage
  src="/path/to/image.jpg"
  alt="Description"
  width={400}
  height={300}
/>

// With priority loading (above the fold)
<OptimizedImage
  src="/hero-image.jpg"
  alt="Hero"
  priority={true}
  width={1200}
  height={600}
/>

// With lazy loading and placeholder
<OptimizedImage
  src="/product-image.jpg"
  alt="Product"
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
  sizes="(max-width: 768px) 100vw, 50vw"
/>
```

### Preloading Critical Images
```tsx
import { PreloadImage } from '@/components/OptimizedImage';

// In your main layout or critical pages
<PreloadImage src="/critical-hero-image.jpg" />
```

## Performance Metrics

### Before Optimization
- Total JavaScript: ~226.9 KiB
- Unused JavaScript: ~150.5 KiB
- Total CSS: ~14.9 KiB
- Unused CSS: ~11.3 KiB
- Legacy JavaScript: ~0.6 KiB
- Total Network Payload: ~10,185 KiB

### After Optimization (Expected)
- Total JavaScript: ~75 KiB (67% reduction)
- Unused JavaScript: ~0 KiB (100% reduction)
- Total CSS: ~3.6 KiB (76% reduction)
- Unused CSS: ~0 KiB (100% reduction)
- Legacy JavaScript: ~0 KiB (100% reduction)
- Total Network Payload: Significantly reduced with image optimization

## Maintenance

### Regular Tasks
1. **Monthly**: Run bundle analysis and remove unused dependencies
2. **Quarterly**: Review and update performance budgets
3. **On Release**: Monitor Core Web Vitals in production
4. **Continuous**: Monitor bundle size changes in CI/CD

### Tools and Commands
```bash
# Analyze current bundle
npm run build:analyze

# Check for unused dependencies
npx depcheck

# Monitor bundle size in CI
npm run build -- --reportCompressedSize

# Test performance locally
npm run build && npm run preview
```

## Troubleshooting

### Common Issues
1. **PurgeCSS removing needed styles**: Check safelist configuration
2. **Large bundle size**: Run analyzer and identify large dependencies
3. **Slow image loading**: Check image optimization and lazy loading
4. **Legacy JavaScript warnings**: Update TypeScript target and remove polyfills

### Debug Commands
```bash
# Debug PurgeCSS
NODE_ENV=production npm run build

# Check TypeScript compilation
npx tsc --noEmit

# Analyze specific chunks
npx vite-bundle-analyzer dist --port 8888
``` 