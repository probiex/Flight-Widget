// Airport types
export interface Airport {
  code: string
  name: string
  city: string
  country: string
  icao?: string
  timezone?: string
  elevation?: number
  coordinates?: {
    lat: number
    lng: number
  }
}

// Airline types
export interface Airline {
  code: string // IATA code (2-letter)
  icao_code?: string // ICAO code (3-letter)
  name: string
  country?: string
  logo?: string
  alliance?: string | null
}

// Flight types
export interface Flight {
  id: string
  airline: string
  flightNumber: string
  aircraft?: string
  departure?: {
    airport: string
    time: string
    gate?: string
    terminal?: string
    city?: string
    country?: string
  }
  arrival?: {
    airport: string
    time: string
    gate?: string
    terminal?: string
    city?: string
    country?: string
  }
  duration: string
  status?: FlightStatus
  price?: number
  gate?: string
  source?: string
}

export type FlightStatus = 
  | 'On Time'
  | 'Delayed'
  | 'Cancelled'
  | 'Boarding'
  | 'Departed'
  | 'Arrived'
  | 'Scheduled'
  | 'active'
  | 'landed'
  | 'en-route'

// Search types
export interface FlightSearchParams {
  departure: string
  arrival: string
  date: string
  passengers?: number
  class?: 'economy' | 'business' | 'first'
}

export interface AirlineSearchParams {
  airline: string
  date: string
}

export interface AirportInfoParams {
  airport: string
}

// API Response types
export interface FlightSearchResponse {
  flights: Flight[]
  totalCount: number
  searchId: string
}

export interface AirportInfoResponse {
  airport: Airport
  statistics: {
    dailyFlights: number
    airlines: number
    destinations: number
    terminals: number
    gates: number
    runways: number
  }
  departures: Flight[]
}
