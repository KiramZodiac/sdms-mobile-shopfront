# SDM Electronics Mobile Shopfront

## Project Description

A modern, responsive e-commerce platform for SDM Electronics - Uganda's premier destination for quality electronics and gadgets. Built with React, TypeScript, and Supabase.

## Features

- 🛍️ Complete e-commerce functionality with cart and checkout
- 📱 Mobile-first responsive design with bottom navigation
- 💳 Flutterwave payment integration
- 🏪 Comprehensive admin dashboard for product management
- 🔍 Advanced product search and filtering
- 📦 Real-time inventory management
- 🎨 Modern UI with Tailwind CSS and shadcn/ui
- 🔐 Secure authentication and authorization
- 📊 Analytics integration with Vercel Analytics
- ⚡ PWA support with service worker caching
- 🎯 SEO optimized with proper meta tags

## Technologies Used

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, shadcn/ui components
- **Backend**: Supabase (Database, Authentication, Storage)
- **Payment**: Flutterwave integration
- **Analytics**: Vercel Analytics & Speed Insights
- **Deployment**: Vercel with optimized configurations

## Getting Started

### Prerequisites
- Node.js 18+ and npm installed
- Supabase project set up
- Flutterwave account for payments

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd sdms-mobile-shopfront

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Fill in your actual environment variables

# Start development server
npm run dev
```

### Environment Variables

Required environment variables (see `.env.example`):

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_FLUTTERWAVE_PUBLIC_KEY=your_flutterwave_public_key
OPENAI_API_KEY=your_openai_api_key
```

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── admin/          # Admin dashboard components
│   └── ui/             # shadcn/ui components
├── hooks/              # Custom React hooks
├── integrations/       # External service integrations
├── pages/              # Main application pages
└── lib/                # Utility functions and helpers
```

## Deployment

### Production Checklist
- ✅ Security headers configured
- ✅ Environment variables set
- ✅ Database migrations applied
- ✅ Storage policies secured
- ✅ PWA manifest configured
- ✅ Analytics integrated

### Deploy to Vercel

```bash
# Build for production
npm run build

# Deploy (if using Vercel CLI)
vercel deploy --prod
```

The project includes optimized Vercel configuration with:
- Security headers (CSP, XSS protection)
- Static asset caching
- Proper routing for SPA

## Key Features

### Customer Features
- Browse products by categories
- Advanced search and filtering
- Product details with images/videos
- Shopping cart functionality
- Secure checkout with Flutterwave
- Mobile-optimized navigation

### Admin Features
- Product management (CRUD operations)
- Category management
- Banner/carousel management
- Marquee text configuration
- Real-time inventory tracking
- Secure admin authentication

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

Private project for SDM Electronics Uganda.

## Support

For technical support or questions:
- Email: info@sdmelectronics.ug
- Phone: +256 755 869 853
