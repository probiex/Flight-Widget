# FlightTracker Pro - Copilot Instructions

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## Project Overview
This is a comprehensive Next.js flight tracking application that provides real-time flight data from multiple APIs. The application allows users to search flights by country, destination, airline, and view detailed airport information.

## Technology Stack
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI primitives
- **Icons**: Lucide React
- **Data Fetching**: TanStack Query (React Query)
- **Date Handling**: date-fns
- **HTTP Client**: Axios

## Key Features
- Multi-tab flight search (Route, Airline, Airport Info)
- Real-time flight data from multiple APIs
- Airport information and live departures
- Responsive design for all devices
- Advanced filtering and sorting
- Real-time status updates

## API Sources
- OpenSky Network API (real-time flight tracking)
- AviationStack API (flight schedules and data)
- OpenFlights Database (airports and airlines)
- Multiple backup data sources

## Development Guidelines
1. **Components**: Use TypeScript interfaces for all props
2. **Styling**: Implement responsive design with Tailwind CSS
3. **API Routes**: Create server-side API routes for external API calls
4. **Error Handling**: Implement comprehensive error boundaries
5. **Performance**: Use React Query for caching and data management
6. **Accessibility**: Follow WCAG guidelines for all components

## File Structure
- `/src/app` - Next.js App Router pages and layouts
- `/src/components` - Reusable React components
- `/src/lib` - Utility functions and configurations
- `/src/types` - TypeScript type definitions
- `/src/app/api` - Server-side API routes

## Coding Standards
- Use functional components with hooks
- Implement proper TypeScript typing
- Follow Next.js best practices for performance
- Use server components where appropriate
- Implement proper SEO optimization
