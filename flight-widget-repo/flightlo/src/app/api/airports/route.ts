import { NextRequest, NextResponse } from 'next/server'
import { Airport } from '@/types'

// 100% REAL DATA API - No static fallbacks
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('query') || ''
  const country = searchParams.get('country') || ''
  const limit = parseInt(searchParams.get('limit') || '100')

  try {
    console.log('🌍 LIVE Airport search:', { query, country, limit })
    
    // Fetch ONLY from real, live data sources
    const airports = await fetchLiveAirportData(query, country, limit)

    return NextResponse.json({
      airports,
      source: 'live-global-data',
      timestamp: new Date().toISOString(),
      count: airports.length,
      realTime: true
    })

  } catch (error) {
    console.error('Live airport data error:', error)
    return NextResponse.json(
      { error: 'Live data unavailable', airports: [] },
      { status: 503 }
    )
  }
}

// Fetch 100% LIVE airport data from real global sources
async function fetchLiveAirportData(query: string, country: string, limit: number): Promise<Airport[]> {
  const airports: Airport[] = []

  try {
    // 1. OpenFlights Database - Live CSV data from GitHub
    console.log('📡 Fetching from OpenFlights live database...')
    const openFlightsAirports = await fetchOpenFlightsLiveData()
    airports.push(...openFlightsAirports)
    console.log(`✅ OpenFlights: ${openFlightsAirports.length} airports`)

    // 2. Airport-codes.org API (free tier)
    console.log('📡 Fetching from Airport-codes.org...')
    const apiAirports = await fetchAirportCodesAPI()
    airports.push(...apiAirports)
    console.log(`✅ Airport-codes API: ${apiAirports.length} airports`)

    // 3. Geonames.org airports data (free tier)
    console.log('📡 Fetching from Geonames.org...')
    const geonamesAirports = await fetchGeonamesAirports()
    airports.push(...geonamesAirports)
    console.log(`✅ Geonames: ${geonamesAirports.length} airports`)

  } catch (error) {
    console.error('❌ Error fetching live airport data:', error)
    throw new Error('All live data sources failed')
  }

  // Remove duplicates and return filtered results
  const uniqueAirports = removeDuplicateAirports(airports)
  const filtered = filterAirports(uniqueAirports, query, country)
  
  console.log(`🎯 Final result: ${filtered.length} unique airports`)
  return filtered.slice(0, limit)
}

// 1. OpenFlights Database - Direct CSV access from GitHub
async function fetchOpenFlightsLiveData(): Promise<Airport[]> {
  try {
    const response = await fetch('https://raw.githubusercontent.com/jpatokal/openflights/master/data/airports.dat', {
      next: { revalidate: 3600 } // Cache for 1 hour
    })

    if (!response.ok) {
      throw new Error(`OpenFlights API error: ${response.status}`)
    }

    const csvData = await response.text()
    const lines = csvData.split('\n').filter(line => line.trim())
    const airports: Airport[] = []

    for (const line of lines.slice(0, 1000)) { // Process first 1000 for performance
      try {
        const fields = line.split(',').map(field => field.replace(/"/g, '').trim())
        
        if (fields.length >= 8) {
          const airport: Airport = {
            code: fields[4] || fields[5], // IATA or ICAO
            name: fields[1],
            city: fields[2],
            country: fields[3],
            coordinates: {
              lat: parseFloat(fields[6]) || 0,
              lng: parseFloat(fields[7]) || 0
            }
          }

          // Only include airports with valid IATA codes
          if (airport.code && airport.code.length === 3 && /^[A-Z]{3}$/.test(airport.code)) {
            airports.push(airport)
          }
        }
      } catch {
        // Skip malformed lines
        continue
      }
    }

    return airports
  } catch (error) {
    console.error('OpenFlights fetch error:', error)
    return []
  }
}

// 2. Airport-codes.org API (free tier available)
async function fetchAirportCodesAPI(): Promise<Airport[]> {
  try {
    // Free tier allows limited requests - use sparingly
    const response = await fetch('https://api.airport-codes.org/airports?search=international&limit=50', {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'FlightTracker/1.0'
      },
      next: { revalidate: 1800 } // Cache for 30 minutes
    })

    if (!response.ok) {
      throw new Error(`Airport-codes API error: ${response.status}`)
    }

    const data = await response.json()
    const airports: Airport[] = []

    if (data.airports && Array.isArray(data.airports)) {
      for (const airport of data.airports) {
        if (airport.iata && airport.name) {
          airports.push({
            code: airport.iata,
            name: airport.name,
            city: airport.city || airport.municipality,
            country: airport.country || airport.iso_country,
            coordinates: {
              lat: parseFloat(airport.latitude) || 0,
              lng: parseFloat(airport.longitude) || 0
            }
          })
        }
      }
    }

    return airports
  } catch (error) {
    console.error('Airport-codes API error:', error)
    return []
  }
}

// 3. Geonames.org airports data
async function fetchGeonamesAirports(): Promise<Airport[]> {
  try {
    // Use the free geonames API for airport data
    const response = await fetch('http://api.geonames.org/searchJSON?q=airport&featureCode=AIRP&maxRows=50&username=demo', {
      next: { revalidate: 3600 } // Cache for 1 hour
    })

    if (!response.ok) {
      throw new Error(`Geonames API error: ${response.status}`)
    }

    const data = await response.json()
    const airports: Airport[] = []

    if (data.geonames && Array.isArray(data.geonames)) {
      for (const place of data.geonames) {
        // Extract airport code from name if possible
        const codeMatch = place.name.match(/\(([A-Z]{3})\)/)
        const code = codeMatch ? codeMatch[1] : null

        if (code && place.name) {
          airports.push({
            code: code,
            name: place.name.replace(/\([A-Z]{3}\)/, '').trim(),
            city: place.adminName1 || place.toponymName,
            country: place.countryName,
            coordinates: {
              lat: parseFloat(place.lat) || 0,
              lng: parseFloat(place.lng) || 0
            }
          })
        }
      }
    }

    return airports
  } catch (error) {
    console.error('Geonames API error:', error)
    return []
  }
}

// Utility functions for data processing
function removeDuplicateAirports(airports: Airport[]): Airport[] {
  const seen = new Set<string>()
  return airports.filter(airport => {
    const key = airport.code.toUpperCase()
    if (seen.has(key)) {
      return false
    }
    seen.add(key)
    return true
  })
}

function filterAirports(airports: Airport[], query: string, country: string): Airport[] {
  if (!query && !country) return airports

  return airports.filter(airport => {
    const matchesQuery = !query || 
      airport.name.toLowerCase().includes(query.toLowerCase()) ||
      airport.city.toLowerCase().includes(query.toLowerCase()) ||
      airport.code.toLowerCase().includes(query.toLowerCase())
    
    const matchesCountry = !country ||
      airport.country.toLowerCase().includes(country.toLowerCase())
    
    return matchesQuery && matchesCountry
  })
}