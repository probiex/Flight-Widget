// Airport types
export interface Airport {
  code: string
  name: string
  city: string
  country: string
  timezone?: string
  coordinates?: {
    lat: number
    lng: number
  }
}

// Airline types
export interface Airline {
  iata_code: string
  icao_code?: string
  name: string
  country?: string
  logo?: string
}

// Flight types
export interface Flight {
  id: string
  airline: Airline | string
  flightNumber: string
  callsign?: string
  flight_iata?: string
  origin_iata?: string
  destination_iata?: string
  origin_airport?: string
  destination_airport?: string
  departure_scheduled?: string
  arrival_scheduled?: string
  aircraft_type?: string
  status?: string
  latitude?: number
  longitude?: number
  altitude?: number
  velocity?: number
  last_updated?: string
  departure?: {
    airport: Airport
    time: Date
    gate?: string
    terminal?: string
  }
  arrival?: {
    airport: Airport
    time: Date
    gate?: string
    terminal?: string
  }
  duration: number
  stops?: number
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
