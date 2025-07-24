# Government Billing Solution MVP

A comprehensive Progressive Web Application (PWA) built with Ionic 8 and React for government invoice billing with advanced offline capabilities, modern UI/UX, and cross-platform compatibility.

## 🏛️ Project Overview

The Government Billing Solution MVP is a modern, feature-rich billing application designed specifically for government agencies and public sector organizations. Built as a Progressive Web App, it provides a native app-like experience while maintaining web accessibility and cross-platform compatibility.

### Key Highlights

- **🌐 Progressive Web App**: Full offline functionality with service workers
- **📱 Cross-Platform**: Native experience on mobile, tablet, and desktop
- **🏛️ Government-Ready**: Designed for public sector billing requirements
- **� Blockchain Integration**: Starknet-powered file storage with IPFS and token subscriptions
- **�🔒 Secure & Private**: Client-side processing ensures data privacy
- **⚡ Performance Optimized**: Fast loading with intelligent caching
- **🎨 Modern UI**: Ionic 8 components with dark/light theme support

## 🛠️ Technology Stack

### Frontend Framework

- **React 18.2.0** - Modern UI library with hooks and concurrent features
- **TypeScript 5.1.6** - Type-safe development environment
- **Ionic 8.0.0** - Cross-platform UI components and native app features
- **Vite 5.0.0** - Fast build tool and development server

### PWA & Mobile

- **Vite PWA Plugin 0.19.0** - Progressive Web App capabilities
- **Workbox** - Service worker and caching strategies
- **Capacitor 5.7.0** - Native app deployment and device APIs
- **Capacitor Plugins** - Camera, filesystem, share, and preferences

### Data & Storage

- **IndexedDB** - Client-side database for offline storage
- **Local Storage** - Persistent user preferences
- **Background Sync** - Offline data synchronization
- **Crypto-JS 4.2.0** - Data encryption and security

### Export & PDF Generation

- **jsPDF 3.0.1** - Client-side PDF generation
- **html2canvas 1.4.1** - HTML to canvas conversion
- **CSV Export** - Spreadsheet data export functionality

### Blockchain & Web3

- **Starknet** - Layer 2 blockchain for scalable smart contracts
- **@starknet-react/core** - React hooks for Starknet integration
- **IPFS** - Decentralized file storage via Pinata gateway
- **Web3 Wallets** - ArgentX and Braavos wallet support
- **Smart Contracts** - Token-based subscription and file management

### Development Tools

- **ESLint** - Code linting and quality checks
- **Cypress** - End-to-end testing
- **Vitest** - Unit testing framework
- **PWA Assets Generator** - Automated icon and manifest generation

## 🚀 Quick Start

### Prerequisites

- **Node.js 16+** (LTS recommended)
- **npm 8+** or **yarn 1.22+**

### Installation

```bash
# Clone the repository
git clone https://github.com/anisharma07/Govt-billing-solution-MVP.git
cd Govt-billing-solution-MVP

# Install dependencies
npm install

# Generate PWA assets (icons, manifest)
npm run generate-pwa-assets

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Mobile Development

```bash
# Add mobile platforms
npx cap add android
npx cap add ios

# Sync web app with native platforms
npx cap sync

# Open in native IDEs
npx cap open android
npx cap open ios
```

## ✨ Features Overview

| #      | Feature                    | Description                                                               | Documentation                                           |
| ------ | -------------------------- | ------------------------------------------------------------------------- | ------------------------------------------------------- |
| **1**  | **Autosave Functionality** | Automatic saving with configurable intervals and manual save options      | [📄 View Details](.github/1.AUTOSAVE_FEATURE.md)        |
| **2**  | **Dark Mode Theme**        | Complete dark/light theme switching with system preference detection      | [📄 View Details](.github/2.DARK_MODE.md)               |
| **3**  | **Logo Integration**       | Company logo upload, management, and invoice integration                  | [📄 View Details](.github/3.ADD_LOGO_FEATURE.md)        |
| **4**  | **Advanced Cell Styling**  | Rich text formatting, colors, borders, and alignment options              | [📄 View Details](.github/4.SHEET_CELL_STYLING.md)      |
| **5**  | **Export Functionality**   | PDF, CSV, and multi-sheet export with mobile sharing support              | [📄 View Details](.github/5.CLIENT_EXPORT_FEATURES.md)  |
| **6**  | **Camera Integration**     | Photo capture for receipts and documentation using device camera          | [📄 View Details](.github/6.CAPACITOR_CAMERA_PLUGIN.md) |
| **7**  | **App Icons & Splash**     | Professional branding with adaptive icons and splash screens              | [📄 View Details](.github/7.APP_ICONS_SPLASH_SCREEN.md) |
| **8**  | **Digital Signatures**     | Electronic signature capture and integration into invoices                | [📄 View Details](.github/8.SIGNATURE_PLUGIN.md)        |
| **9**  | **Storage Management**     | Intelligent quota handling and storage optimization                       | [📄 View Details](.github/9.STORAGE_QUOTA_HANDLING.md)  |
| **10** | **PWA & Ionic 8 Upgrade**  | Progressive Web App capabilities with latest Ionic framework              | [📄 View Details](.github/10.PWA_IONIC_UPGRADE.md)      |
| **11** | **Bulk File Operations**   | Save all to server & move all from server with progress tracking          | [📄 View Details](.github/11.BULK_FILE_OPERATIONS.md)   |
| **12** | **Starknet Integration**   | Blockchain file storage with IPFS, token subscriptions, and Web3 features | [📄 View Details](.github/12_STARKNET_INTEGRATION.md)   |

## 🌐 PWA Features

### 🔧 Installation & Updates

- **App Installation**: Installable on any device from browsers
- **Auto Updates**: Automatic service worker updates with user notifications
- **Cross-Platform**: Works on desktop, mobile, and tablets

### 🌐 Offline Capabilities

- **Offline Indicator**: Visual status indicator for connection state
- **Background Sync**: Queue form submissions when offline, sync when online
- **Offline Storage**: Local data persistence with IndexedDB for invoices, customers, and drafts
- **Offline Fallback**: Custom pages for offline-only content

### 📱 Native App Experience

- **App Shortcuts**: Quick access to create invoice, view invoices, and manage customers
- **Standalone Display**: Full-screen app experience when installed
- **App-like UI**: Native-feeling interface with proper theming

### 🔔 Smart Notifications

- **Push Notifications**: Server-sent notifications support
- **Local Notifications**: App-generated notifications
- **Permission Management**: User-controlled notification preferences

### 🎨 Enhanced Manifest

- **Rich Metadata**: Comprehensive app information for app stores
- **Multiple Icons**: Optimized icons for all device types including maskable icons
- **Screenshots**: App store ready screenshots
- **Categories**: Properly categorized as business/finance/productivity app

## � Blockchain Features

### 🌟 Starknet Integration

- **Decentralized Storage**: Files stored on IPFS with blockchain references
- **Smart Contracts**: Token-based subscription and file management on Starknet Sepolia
- **Web3 Wallets**: Support for ArgentX and Braavos wallets
- **Token Economy**: PPT token-powered subscription plans for file storage

### 📊 Smart Contract Addresses (Sepolia Testnet)

- **MedInvoice Contract**: `0x05edb37e3fcc79257f0969dc6807b5f9b517e260ecddd26779ab082f0f532ad6`
- **MedToken Contract**: `0x008c6e8700604e987069cfb5debf6fd359dc09f00f1c61ddac1e52b6e5ceff4`
- **Voyager Links**: Available in [Starknet Integration Documentation](.github/12_STARKNET_INTEGRATION.md)

### 🔐 Blockchain Operations

- **Save to Blockchain**: Upload files to IPFS and store references on Starknet
- **Load from Blockchain**: Retrieve files directly from IPFS using blockchain data
- **Subscription Management**: Purchase storage plans with PPT tokens
- **File Limits**: Smart contract-enforced storage quotas and usage tracking

### 💰 Subscription Plans

- **Basic Plan**: 10 files for 100 PPT tokens
- **Standard Plan**: 50 files for 400 PPT tokens
- **Premium Plan**: 200 files for 1200 PPT tokens

## �🚀 Getting Started

### Prerequisites

- Node.js 16+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd Govt-billing-solution-MVP

# Install dependencies
npm install

# Generate PWA assets (if needed)
npm run generate-pwa-assets

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Blockchain Setup (Optional)

For blockchain features, you'll need:

```bash
# Environment variables for IPFS
VITE_PINATA_API_KEY=your_pinata_api_key
VITE_PINATA_SECRET_API_KEY=your_pinata_secret
VITE_PINATA_JWT=your_pinata_jwt_token

# Install Starknet wallet (ArgentX or Braavos)
# Visit: https://www.argent.xyz/ or https://braavos.app/
```

### PWA Testing

1. **Development**: PWA features work in dev mode with `devOptions.enabled: true`
2. **Production**: Build and serve the app to test full PWA functionality
3. **Installation**: Look for browser install prompts or use browser settings

## 🎮 Interactive Testing & Development

### PWA Testing Dashboard

Navigate to **Settings page** to access the comprehensive PWA testing panel:

- **📱 App Installation**: One-click install button with install status
- **🌐 Connection Status**: Real-time online/offline indicator
- **💾 Offline Storage**: Test data persistence with "Test Save" functionality
- **🔔 Push Notifications**: Test notification system with permission management
- **📊 Feature Status**: Visual indicators for all PWA capabilities
- **🔄 Update Management**: Manual update checks and service worker controls

### Development Testing Guide

#### **1. 🚀 Start the Application**

```bash
npm run dev
# Navigate to http://localhost:5173
```

#### **2. 📱 Test PWA Installation**

- Look for download icon in Home page toolbar
- Check browser address bar for install prompt
- Click to install app to desktop/home screen
- Verify standalone mode operation

#### **3. 🌐 Test Offline Functionality**

- Disconnect internet connection
- Notice red offline indicator in toolbar
- App continues to work with cached data
- Automatic "You're offline!" notification appears

#### **4. 💾 Test Data Persistence**

- Go to Settings page → PWA Features Demo
- Click "Test Save" button to store data locally
- Data persists even when offline or after browser restart

#### **5. 🔔 Test Push Notifications**

- Click "Test Notify" in PWA Demo section
- Grant notification permission when prompted
- Receive test notification with app branding

#### **6. 🔄 Test Automatic Updates**

- Make code changes and rebuild application
- Update notification appears automatically in UI
- Click notification to apply updates seamlessly

### **PWA Feature Locations in UI:**

- **🏠 Home Page**: Online status indicator + install button (top toolbar)
- **⚙️ Settings Page**: Complete PWA dashboard + interactive testing tools
- **🔔 Notifications**: Appear automatically for updates and offline status
- **📱 Mobile Menu**: Native-style action sheets and modals

## 📦 Build & Deployment

### Production Build

```bash
# Build optimized production bundle
npm run build

# Preview production build locally
npm run preview

# Build mobile apps
npx cap build android
npx cap build ios
```

### PWA Deployment Checklist

#### Essential Requirements

- [x] **HTTPS enabled** (required for PWA features)
- [x] **Service worker accessible** at `/sw.js`
- [x] **Web manifest linked** in HTML head
- [x] **Icons and assets** properly referenced
- [x] **Offline fallbacks** implemented

#### Post-Deployment Verification

```bash
# Run Lighthouse audit
npx lighthouse https://yourdomain.com --view

# Check PWA score (should be 100/100)
# Verify Performance (90+)
# Verify Accessibility (90+)
# Verify Best Practices (90+)
# Verify SEO (90+)
```

### Environment Configuration

```bash
# Production environment variables
VITE_API_BASE_URL=https://api.yourdomain.com
VITE_APP_VERSION=1.0.0
VITE_PWA_ENABLED=true
VITE_VAPID_PUBLIC_KEY=your_vapid_public_key
```

## 🔧 Advanced Configuration

### Service Worker Configuration

The app uses Workbox for advanced caching strategies:

```typescript
// Automatic caching for app shell
workbox: {
  globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/api\./,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api-cache',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 60 * 60 * 24 // 24 hours
        }
      }
    }
  ]
}
```

### Capacitor Native Features

```typescript
// Camera integration
import { Camera, CameraResultType } from '@capacitor/camera';

// File system access
import { Filesystem, Directory } from '@capacitor/filesystem';

// Native sharing
import { Share } from '@capacitor/share';
```

## 🧪 Quality Assurance

### Testing Strategy

- **Unit Tests**: Vitest for component testing
- **E2E Tests**: Cypress for user flow testing
- **PWA Audit**: Lighthouse for PWA compliance
- **Mobile Testing**: Device testing via Capacitor

### Performance Benchmarks

- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Time to Interactive**: < 3.0s
- **Cumulative Layout Shift**: < 0.1

### Browser Compatibility

- ✅ **Chrome 90+** (Full PWA support)
- ✅ **Firefox 85+** (Full PWA support)
- ✅ **Safari 14+** (PWA support with limitations)
- ✅ **Edge 90+** (Full PWA support)
- ⚠️ **Mobile Browsers** (Recommend native app for best experience)

## � Architecture & Technical Implementation

### Project Structure

```
src/
├── abis/                # Smart contract ABIs and constants
│   ├── constants.ts     # Contract addresses
│   ├── medInvoiceAbi.ts # Main contract ABI
│   └── medToken.ts      # Token contract ABI
├── components/          # Reusable UI components
│   ├── Menu/            # Export menu with PDF/CSV functionality
│   ├── Files/           # File management interface (includes blockchain)
│   ├── Storage/         # Local storage utilities
│   ├── wallet/          # Blockchain wallet components
│   │   ├── WalletConnection.tsx # Wallet connection interface
│   │   ├── Subscription.tsx     # Subscription management
│   │   └── SubscriptionPlans.tsx # Storage plan purchasing
│   └── socialcalc/      # Spreadsheet engine
├── contexts/            # React context providers
│   ├── ThemeContext.tsx # Dark/light theme management
│   └── InvoiceContext.tsx # Invoice state management
├── hooks/               # Custom React hooks
│   ├── usePWA.ts        # PWA functionality hooks
│   ├── useContractRead.ts  # Blockchain read operations
│   └── useContractWrite.ts # Blockchain write operations
├── pages/               # Main application pages
├── services/            # Business logic and APIs
│   ├── exportAsPdf.ts   # PDF generation service
│   ├── exportAsCsv.ts   # CSV export service
│   └── cloud-service.ts # Cloud integration
└── utils/               # Utility functions
    ├── offlineStorage.ts # IndexedDB wrapper
    ├── backgroundSync.ts # Offline sync logic
    ├── ipfs.ts          # IPFS integration with Pinata
    └── walletHelpers.ts # Blockchain wallet utilities
```

### State Management

- **React Context**: Global state for themes and invoice data
- **Local State**: Component-specific state with hooks
- **Persistent Storage**: IndexedDB for offline data persistence
- **Cache Management**: Service worker for network resource caching

### Security Features

- **Client-side Processing**: All data processing happens locally
- **Encryption**: Sensitive data encrypted with Crypto-JS
- **HTTPS Enforcement**: Required for PWA and security
- **CSP Headers**: Content Security Policy for XSS protection

## 🛠 Development Guidelines

### Code Quality Standards

```bash
# Linting and formatting
npm run lint              # ESLint checks
npm run type-check        # TypeScript validation
npm run test:unit         # Unit tests with Vitest
npm run test:e2e          # End-to-end tests with Cypress
```

### Component Development

- **TypeScript First**: All components written in TypeScript
- **Ionic Components**: Use Ionic UI components for consistency
- **Responsive Design**: Mobile-first approach with Ionic breakpoints
- **Accessibility**: WCAG 2.1 AA compliance for government standards

### Performance Optimization

- **Code Splitting**: Lazy loading for routes and components
- **Tree Shaking**: Unused code elimination
- **Asset Optimization**: Image compression and modern formats
- **Bundle Analysis**: Regular bundle size monitoring

## 🧪 Comprehensive Testing Guide

### **Automated Testing**

```bash
# Run all tests
npm test

# Unit tests with coverage
npm run test:unit -- --coverage

# End-to-end testing
npm run test:e2e

# PWA audit
npm run lighthouse
```

### **Manual Testing Checklist**

#### **PWA Functionality**

- [ ] App installs from browser
- [ ] Works offline after installation
- [ ] Updates notify user automatically
- [ ] Standalone mode functions correctly
- [ ] Push notifications work (if enabled)

#### **Core Features**

- [ ] Invoice creation and editing
- [ ] PDF export with correct formatting
- [ ] CSV export with clean data
- [ ] Camera integration for photos
- [ ] Dark/light theme switching
- [ ] Autosave functionality

#### **Mobile Testing**

- [ ] Touch interactions work smoothly
- [ ] Native sharing functions correctly
- [ ] Capacitor plugins work as expected
- [ ] Performance is acceptable on low-end devices

### **Browser Compatibility Testing**

| Browser     | PWA Support | Install     | Offline | Notifications |
| ----------- | ----------- | ----------- | ------- | ------------- |
| Chrome 90+  | ✅ Full     | ✅ Yes      | ✅ Yes  | ✅ Yes        |
| Firefox 85+ | ✅ Full     | ✅ Yes      | ✅ Yes  | ✅ Yes        |
| Safari 14+  | ⚠️ Limited  | ⚠️ iOS only | ✅ Yes  | ❌ No         |
| Edge 90+    | ✅ Full     | ✅ Yes      | ✅ Yes  | ✅ Yes        |

### **Performance Testing**

```bash
# Lighthouse CI for continuous monitoring
npm install -g @lhci/cli
lhci autorun

# Bundle analyzer
npm run build -- --analyze

# Memory leak detection
npm run test:memory
```

## 🤝 Contributing & Support

### Contributing Guidelines

1. **Fork the repository** from the main branch
2. **Create feature branch** (`git checkout -b feature/AmazingFeature`)
3. **Follow coding standards** (ESLint, TypeScript, Ionic guidelines)
4. **Add tests** for new features and bug fixes
5. **Update documentation** for API changes
6. **Commit changes** (`git commit -m 'Add AmazingFeature'`)
7. **Push to branch** (`git push origin feature/AmazingFeature`)
8. **Open Pull Request** with detailed description

### Development Setup for Contributors

```bash
# Clone your fork
git clone https://github.com/yourusername/Govt-billing-solution-MVP.git
cd Govt-billing-solution-MVP

# Add upstream remote
git remote add upstream https://github.com/anisharma07/Govt-billing-solution-MVP.git

# Install dependencies
npm install

# Create development branch
git checkout -b feature/your-feature-name

# Start development server
npm run dev
```

### Code Standards

- **TypeScript**: Strict mode enabled for type safety
- **ESLint**: Follow configured linting rules
- **Prettier**: Consistent code formatting
- **Conventional Commits**: Use conventional commit format
- **Testing**: Maintain test coverage above 80%

### 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

### 🆘 Getting Help

#### **Technical Support**

- **GitHub Issues**: [Report bugs and request features](https://github.com/anisharma07/Govt-billing-solution-MVP/issues)
- **Discussions**: [Community discussions and Q&A](https://github.com/anisharma07/Govt-billing-solution-MVP/discussions)
- **Documentation**: Check `.github/` folder for detailed feature documentation

#### **Quick Links**

- 🏠 **[Live Demo](https://your-demo-url.com)** - Try the app online
- 📖 **[API Documentation](https://your-api-docs.com)** - Backend API reference
- 🎥 **[Video Tutorials](https://your-tutorials.com)** - Setup and usage guides
- 💬 **[Discord Community](https://discord.gg/your-invite)** - Real-time support

#### **Government & Enterprise Support**

For enterprise implementations and government procurement:

- 📧 **Email**: enterprise@yourcompany.com
- 📞 **Phone**: +1 (555) 123-4567
- 🏢 **Business Hours**: Monday-Friday, 9 AM - 6 PM EST

---

## 🚀 Quick Start Summary

```bash
# 1. Clone and install
git clone https://github.com/anisharma07/Govt-billing-solution-MVP.git
cd Govt-billing-solution-MVP && npm install

# 2. Generate PWA assets
npm run generate-pwa-assets

# 3. Start development
npm run dev

# 4. Build for production
npm run build && npm run preview

# 5. Test PWA features
# - Install app from browser
# - Test offline functionality
# - Verify export features

# 6. Test Blockchain features (Optional)
# - Install ArgentX/Braavos wallet
# - Connect wallet in Settings
# - Save files to blockchain
# - Purchase storage plans with PPT tokens
```

**Ready to revolutionize government billing with Web3? 🏛️💼🔗**

---

_Built with ❤️ for the public sector. This project is part of the digital transformation initiative to modernize government operations with cutting-edge web technologies._
