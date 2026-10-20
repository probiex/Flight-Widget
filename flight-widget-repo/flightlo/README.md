# Flight Tracker Pro ✈️

A comprehensive, modern Next.js flight tracking application that provides real-time flight data from multiple APIs. Built for air travelers who need reliable, up-to-date flight information.

![Flight Tracker Pro](https://img.shields.io/badge/Next.js-15-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

## 🌟 Features

### Multi-Source Real-Time Data
- **OpenSky Network API** - Real-time flight tracking
- **OpenFlights Database** - Comprehensive airport and airline data
- **Enhanced Simulation** - Fallback data with realistic patterns
- **Live Updates** - Real-time status tracking for active flights

### Advanced Search Capabilities
- **Route Search** - Find flights between specific airports
- **Airline Search** - Browse flights by specific airlines
- **Airport Information** - Detailed airport data with live departures
- **Smart Suggestions** - Auto-complete for airports and airlines

### User-Friendly Interface
- **Responsive Design** - Works seamlessly on all devices
- **Modern UI** - Clean, intuitive interface with Tailwind CSS
- **Interactive Components** - Powered by Radix UI primitives
- **Real-time Indicators** - Visual feedback for live data

### Professional Features
- **Advanced Filtering** - Sort by time, price, duration, or status
- **Status Tracking** - Real-time flight status updates
- **Comprehensive Details** - Aircraft type, gates, terminals, coordinates
- **Error Handling** - Graceful fallbacks and user-friendly error messages

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd flightlo
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Start development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🛠️ Technology Stack

### Core Framework
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **React 18** - Latest React features

### Styling & UI
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **Lucide React** - Beautiful icon library
- **CSS Variables** - Dynamic theming support

### Data & APIs
- **OpenSky Network** - Real-time flight tracking
- **OpenFlights Database** - Airport and airline data
- **Fetch API** - HTTP client for API calls
- **Server-Side APIs** - Next.js API routes

### Development Tools
- **ESLint** - Code linting
- **TypeScript Compiler** - Type checking
- **PostCSS** - CSS processing

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # Server-side API routes
│   │   ├── airlines/      # Airline data API
│   │   ├── airports/      # Airport data API
│   │   └── flights/       # Flight search API
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx          # Home page
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── AirportInfo.tsx   # Airport information display
│   ├── FlightResults.tsx # Flight results with filtering
│   ├── FlightSearch.tsx  # Multi-tab search interface
│   ├── Header.tsx        # Application header
│   └── Footer.tsx        # Application footer
├── lib/                  # Utility functions
│   └── utils.ts          # Helper utilities
└── types/                # TypeScript definitions
    └── index.ts          # Type definitions
```

## 🔧 API Documentation

### Flight Search API
```typescript
GET /api/flights/search
Parameters:
- origin?: string        # Origin airport code or city
- destination?: string   # Destination airport code or city
- airline?: string       # Airline code or name
- country?: string       # Country filter
```

### Airport Information API
```typescript
GET /api/airports
Parameters:
- query?: string    # Airport code, name, or city
- country?: string  # Country filter
- limit?: number    # Maximum results (default: 50)
```

### Airline Data API
```typescript
GET /api/airlines
Parameters:
- query?: string    # Airline code or name
- country?: string  # Country filter
- limit?: number    # Maximum results (default: 50)
```

## 🎯 Usage Guide

### 1. Route Search
- Enter origin and destination airports
- Select departure date and passenger count
- Choose travel class (Economy, Business, First)
- Click "Search Flights" for results

### 2. Airline Search
- Type airline name or code for suggestions
- Optionally filter by country
- Select date for flight data
- View all flights from that airline

### 3. Airport Information
- Search for any airport worldwide
- View comprehensive airport statistics
- Check live departure information
- See real-time flight status updates

### 4. Results Management
- Filter results by flight status
- Sort by time, price, duration, or status
- View detailed flight information
- Track real-time status updates

## 🌐 Deployment

### Vercel (Recommended)
1. **Push to GitHub/GitLab**
2. **Connect to Vercel**
3. **Deploy automatically**

```bash
npm run build    # Test production build
npm run start    # Test production server
```

### Other Platforms
- **Netlify** - Connect repository and deploy
- **Railway** - One-click deployment
- **Docker** - Containerized deployment

### Environment Variables
No environment variables required for basic functionality. All APIs used are free and don't require keys.

## 🔄 Data Sources

### Real-Time Data
- **OpenSky Network** - Live flight tracking
- **OpenFlights** - Airport and airline database
- **GitHub Datasets** - Backup airport codes

### Enhanced Simulation
When real APIs are unavailable, the app uses:
- Realistic flight patterns
- Time-based scheduling
- Status distribution modeling
- Geographic route simulation

## 🛡️ Error Handling

- **Graceful Degradation** - Fallback to simulation data
- **User-Friendly Messages** - Clear error explanations
- **Retry Mechanisms** - Automatic retry for failed requests
- **Loading States** - Visual feedback during data fetching

## 🎨 Customization

### Theming
- Edit `src/app/globals.css` for color schemes
- Modify Tailwind config for design system
- Update component styles in individual files

### Adding Data Sources
1. Create new API route in `src/app/api/`
2. Add data fetching logic
3. Update types in `src/types/index.ts`
4. Integrate in components

### UI Modifications
- Components use Tailwind CSS classes
- Radix UI primitives for accessibility
- Responsive design patterns throughout

## 📈 Performance

### Optimization Features
- **Server-Side Rendering** - Fast initial page loads
- **Static Generation** - Pre-built pages where possible
- **Code Splitting** - Automatic chunk optimization
- **Image Optimization** - Next.js image handling

### Best Practices
- TypeScript for type safety
- Component composition patterns
- Efficient state management
- Minimal API calls with caching

## 🤝 Contributing

1. **Fork the repository**
2. **Create feature branch**
3. **Make your changes**
4. **Add tests if applicable**
5. **Submit pull request**

### Development Guidelines
- Follow TypeScript best practices
- Use existing component patterns
- Maintain responsive design
- Add proper error handling

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🆘 Support

### Common Issues
- **Build Errors** - Check Node.js version (18+)
- **API Timeouts** - Network connectivity issues
- **Missing Data** - Fallback simulation will activate

### Getting Help
- Check GitHub Issues
- Review API documentation
- Test with sample data

---

**Built with ❤️ for air travelers worldwide**

Transform your flight tracking experience with real-time data, modern design, and comprehensive features for all your travel needs.
