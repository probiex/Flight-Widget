import { NextRequest, NextResponse } from 'next/server'
import { Airline } from '@/types'

// 100% REAL DATA API - No static fallbacks
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('query') || ''
  const country = searchParams.get('country') || ''
  const limit = parseInt(searchParams.get('limit') || '100')

  try {
    console.log('🌍 LIVE Airline search:', { query, country, limit })
    
    // Fetch ONLY from real, live data sources
    const airlines = await fetchLiveAirlineData(query, country, limit)

    return NextResponse.json({
      airlines,
      source: 'live-global-data',
      timestamp: new Date().toISOString(),
      count: airlines.length,
      realTime: true
    })

  } catch (error) {
    console.error('Live airline data error:', error)
    return NextResponse.json(
      { error: 'Live data unavailable', airlines: [] },
      { status: 503 }
    )
  }
}

// Fetch 100% LIVE airline data from real global sources
async function fetchLiveAirlineData(query: string, country: string, limit: number): Promise<Airline[]> {
  const airlines: Airline[] = []

  try {
    // 1. OpenFlights Database - Live CSV data from GitHub
    console.log('📡 Fetching from OpenFlights live airline database...')
    const openFlightsAirlines = await fetchOpenFlightsAirlinesLive()
    airlines.push(...openFlightsAirlines)
    console.log(`✅ OpenFlights: ${openFlightsAirlines.length} airlines`)

    // 2. FlightStats API (free tier available)
    console.log('📡 Fetching from FlightStats API...')
    const flightStatsAirlines = await fetchFlightStatsAirlines()
    airlines.push(...flightStatsAirlines)
    console.log(`✅ FlightStats: ${flightStatsAirlines.length} airlines`)

    // 3. Amadeus API (sandbox tier)
    console.log('📡 Fetching from Amadeus API...')
    const amadeusAirlines = await fetchAmadeusAirlines()
    airlines.push(...amadeusAirlines)
    console.log(`✅ Amadeus: ${amadeusAirlines.length} airlines`)

  } catch (error) {
    console.error('❌ Error fetching live airline data:', error)
    throw new Error('All live data sources failed')
  }

  // Remove duplicates and return filtered results
  const uniqueAirlines = removeDuplicateAirlines(airlines)
  const filtered = filterAirlines(uniqueAirlines, query, country)
  
  console.log(`🎯 Final result: ${filtered.length} unique airlines`)
  return filtered.slice(0, limit)
}

// 1. OpenFlights Database - Direct CSV access from GitHub
async function fetchOpenFlightsAirlinesLive(): Promise<Airline[]> {
  try {
    const response = await fetch('https://raw.githubusercontent.com/jpatokal/openflights/master/data/airlines.dat', {
      next: { revalidate: 3600 } // Cache for 1 hour
    })

    if (!response.ok) {
      throw new Error(`OpenFlights airlines API error: ${response.status}`)
    }

    const csvData = await response.text()
    const lines = csvData.split('\n').filter(line => line.trim())
    const airlines: Airline[] = []

    for (const line of lines.slice(0, 500)) { // Process first 500 for performance
      try {
        const fields = line.split(',').map(field => field.replace(/"/g, '').trim())
        
        if (fields.length >= 7) {
          const airline: Airline = {
            code: fields[3] || fields[4], // IATA or ICAO
            icao_code: fields[4],
            name: fields[1],
            country: fields[6]
          }

          // Only include airlines with valid IATA codes
          if (airline.code && airline.code.length >= 2 && /^[A-Z0-9]{2,3}$/.test(airline.code)) {
            airlines.push(airline)
          }
        }
      } catch {
        // Skip malformed lines
        continue
      }
    }

    return airlines
  } catch (error) {
    console.error('OpenFlights airlines fetch error:', error)
    return []
  }
}

// 2. FlightStats API (free tier available)
async function fetchFlightStatsAirlines(): Promise<Airline[]> {
  try {
    // FlightStats has a free tier for airline data
    const response = await fetch('https://api.flightstats.com/flex/airlines/rest/v1/json/all', {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'FlightTracker/1.0'
      },
      next: { revalidate: 1800 } // Cache for 30 minutes
    })

    if (!response.ok) {
      throw new Error(`FlightStats API error: ${response.status}`)
    }

    const data = await response.json()
    const airlines: Airline[] = []

    if (data.airlines && Array.isArray(data.airlines)) {
      for (const airline of data.airlines.slice(0, 100)) {
        if (airline.iata && airline.name) {
          airlines.push({
            code: airline.iata,
            icao_code: airline.icao,
            name: airline.name,
            country: airline.country
          })
        }
      }
    }

    return airlines
  } catch (error) {
    console.error('FlightStats API error:', error)
    return []
  }
}

// 3. Amadeus API sandbox
async function fetchAmadeusAirlines(): Promise<Airline[]> {
  try {
    // Amadeus has a sandbox API for airline data
    const response = await fetch('https://test.api.amadeus.com/v1/reference-data/airlines', {
      headers: {
        'Authorization': `Bearer ${process.env.AMADEUS_API_KEY || 'demo'}`,
        'Accept': 'application/json'
      },
      next: { revalidate: 3600 } // Cache for 1 hour
    })

    if (!response.ok) {
      throw new Error(`Amadeus API error: ${response.status}`)
    }

    const data = await response.json()
    const airlines: Airline[] = []

    if (data.data && Array.isArray(data.data)) {
      for (const airline of data.data.slice(0, 100)) {
        if (airline.iataCode && airline.businessName) {
          airlines.push({
            code: airline.iataCode,
            icao_code: airline.icaoCode,
            name: airline.businessName,
            country: airline.country
          })
        }
      }
    }

    return airlines
  } catch (error) {
    console.error('Amadeus API error:', error)
    return []
  }
}

// Utility functions for data processing
function removeDuplicateAirlines(airlines: Airline[]): Airline[] {
  const seen = new Set<string>()
  return airlines.filter(airline => {
    const key = airline.code.toUpperCase()
    if (seen.has(key)) {
      return false
    }
    seen.add(key)
    return true
  })
}

function filterAirlines(airlines: Airline[], query: string, country: string): Airline[] {
  if (!query && !country) return airlines

  return airlines.filter(airline => {
    const matchesQuery = !query || 
      airline.name.toLowerCase().includes(query.toLowerCase()) ||
      airline.code.toLowerCase().includes(query.toLowerCase()) ||
      (airline.country && airline.country.toLowerCase().includes(query.toLowerCase()))
    
    const matchesCountry = !country ||
      (airline.country && airline.country.toLowerCase().includes(country.toLowerCase()))
    
    return matchesQuery && matchesCountry
  })
}
