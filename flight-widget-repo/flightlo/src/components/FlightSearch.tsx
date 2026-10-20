'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DatePicker } from '@/components/ui/date-picker'
import { 
  Plane, 
  Search, 
  Clock, 
  MapPin, 
  Filter, 
  Calendar,
  Users,
  ArrowUpDown,
  Loader2,
  Star,
  TrendingDown,
  TrendingUp,
  ArrowRightLeft,
  CheckCircle2,
  Shield,
  Sparkles
} from 'lucide-react'
import { Flight, Airport, Airline } from '@/types'

interface FlightSearchProps {
  onFlightResults: (flights: Flight[]) => void
  onAirportInfo: (airport: Airport, departures: Flight[]) => void
  onSearchStateChange?: (isSearching: boolean) => void
}

export default function FlightSearch({ 
  onFlightResults, 
  onAirportInfo, 
  onSearchStateChange 
}: FlightSearchProps) {
  const [activeTab, setActiveTab] = useState('route')
  const [isSearching, setIsSearching] = useState(false)
  
  // Route search state
  const [routeForm, setRouteForm] = useState({
    origin: '',
    destination: '',
    departureDate: new Date().toISOString().split('T')[0], // Format as YYYY-MM-DD
    returnDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days from now
    passengers: 1,
    class: 'economy',
    tripType: 'roundtrip'
  })

  // Airline search state
  const [airlineForm, setAirlineForm] = useState({
    airline: '',
    country: '',
    date: ''
  })

  // Airport info state
  const [airportForm, setAirportForm] = useState({
    airport: '',
    country: ''
  })

  // Suggestions state
  const [suggestions, setSuggestions] = useState<{
    airports: Airport[]
    airlines: Airline[]
    showOriginSuggestions: boolean
    showDestinationSuggestions: boolean
    showAirlineSuggestions: boolean
    showAirportSuggestions: boolean
  }>({
    airports: [],
    airlines: [],
    showOriginSuggestions: false,
    showDestinationSuggestions: false,
    showAirlineSuggestions: false,
    showAirportSuggestions: false
  })

  // Refs for suggestion handling
  const originRef = useRef<HTMLDivElement>(null)
  const destinationRef = useRef<HTMLDivElement>(null)
  const airlineRef = useRef<HTMLDivElement>(null)
  const airportRef = useRef<HTMLDivElement>(null)

  // Popular destinations for suggestions
  const popularDestinations = [
    { code: 'NYC', city: 'New York', country: 'United States', icon: '🗽' },
    { code: 'LON', city: 'London', country: 'United Kingdom', icon: '🇬🇧' },
    { code: 'PAR', city: 'Paris', country: 'France', icon: '🇫🇷' },
    { code: 'TOK', city: 'Tokyo', country: 'Japan', icon: '🇯🇵' },
    { code: 'DUB', city: 'Dubai', country: 'UAE', icon: '🇦🇪' },
    { code: 'SIN', city: 'Singapore', country: 'Singapore', icon: '🇸🇬' }
  ]

  // Search for airports/airlines as user types - Enhanced global search
  const handleInputChange = async (value: string, type: 'origin' | 'destination' | 'airline' | 'airport') => {
    if (value.length < 2) {
      setSuggestions(prev => ({ 
        ...prev, 
        airports: [],
        airlines: [],
        [`show${type.charAt(0).toUpperCase() + type.slice(1)}Suggestions`]: false
      }))
      return
    }

    try {
      // Use debouncing for better performance
      const endpoint = (type === 'origin' || type === 'destination' || type === 'airport') ? '/api/airports' : '/api/airlines'
      const queryParams = new URLSearchParams({
        query: value,
        limit: '12'  // Increased for better global coverage
      })
      
      const response = await fetch(`${endpoint}?${queryParams}`)
      const data = await response.json()
      
      if (response.ok) {
        setSuggestions(prev => ({
          ...prev,
          [type === 'airline' ? 'airlines' : 'airports']: data[type === 'airline' ? 'airlines' : 'airports'] || [],
          [`show${type.charAt(0).toUpperCase() + type.slice(1)}Suggestions`]: true
        }))
      }
    } catch (error) {
      console.error(`Error fetching ${type} suggestions:`, error)
    }
  }

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (originRef.current && !originRef.current.contains(event.target as Node)) {
        setSuggestions(prev => ({ ...prev, showOriginSuggestions: false }))
      }
      if (destinationRef.current && !destinationRef.current.contains(event.target as Node)) {
        setSuggestions(prev => ({ ...prev, showDestinationSuggestions: false }))
      }
      if (airlineRef.current && !airlineRef.current.contains(event.target as Node)) {
        setSuggestions(prev => ({ ...prev, showAirlineSuggestions: false }))
      }
      if (airportRef.current && !airportRef.current.contains(event.target as Node)) {
        setSuggestions(prev => ({ ...prev, showAirportSuggestions: false }))
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Swap origin and destination
  const swapOriginDestination = () => {
    setRouteForm(prev => ({
      ...prev,
      origin: prev.destination,
      destination: prev.origin
    }))
  }

  // Search flights by route
  const searchFlightsByRoute = async () => {
    if (!routeForm.origin || !routeForm.destination) {
      alert('Please enter both origin and destination airports')
      return
    }

    setIsSearching(true)
    onSearchStateChange?.(true)

    try {
      const params = new URLSearchParams({
        origin: routeForm.origin.split(' - ')[0],
        destination: routeForm.destination.split(' - ')[0],
        date: routeForm.departureDate || new Date().toISOString().split('T')[0],
        passengers: routeForm.passengers.toString(),
        class: routeForm.class
      })

      const response = await fetch(`/api/flights/search?${params}`)
      const data = await response.json()

      if (response.ok) {
        onFlightResults(data.flights || [])
      } else {
        throw new Error(data.error || 'Failed to search flights')
      }
    } catch (error) {
      console.error('Flight search error:', error)
      alert('Failed to search flights. Please try again.')
    } finally {
      setIsSearching(false)
      onSearchStateChange?.(false)
    }
  }

  // Search flights by airline
  const searchFlightsByAirline = async () => {
    if (!airlineForm.airline) {
      alert('Please select an airline')
      return
    }

    setIsSearching(true)
    onSearchStateChange?.(true)

    try {
      const params = new URLSearchParams({
        airline: airlineForm.airline.split(' - ')[0],
        country: airlineForm.country,
        date: airlineForm.date || new Date().toISOString().split('T')[0]
      })

      const response = await fetch(`/api/flights/search?${params}`)
      const data = await response.json()

      if (response.ok) {
        onFlightResults(data.flights || [])
      } else {
        throw new Error(data.error || 'Failed to search flights')
      }
    } catch (error) {
      console.error('Airline search error:', error)
      alert('Failed to search flights by airline. Please try again.')
    } finally {
      setIsSearching(false)
      onSearchStateChange?.(false)
    }
  }

  // Get airport information
  const getAirportInformation = async () => {
    if (!airportForm.airport) {
      alert('Please select an airport')
      return
    }

    setIsSearching(true)
    onSearchStateChange?.(true)

    try {
      // First get airport details
      const airportResponse = await fetch(`/api/airports?query=${encodeURIComponent(airportForm.airport.split(' - ')[0])}&limit=1`)
      const airportData = await airportResponse.json()

      if (!airportResponse.ok || !airportData.airports?.[0]) {
        throw new Error('Airport not found')
      }

      const airport = airportData.airports[0]

      // Then get departures for this airport
      const departuresResponse = await fetch(`/api/flights/search?origin=${encodeURIComponent(airport.code)}`)
      const departuresData = await departuresResponse.json()

      onAirportInfo(airport, departuresData.flights || [])
    } catch (error) {
      console.error('Airport info error:', error)
      alert('Failed to get airport information. Please try again.')
    } finally {
      setIsSearching(false)
      onSearchStateChange?.(false)
    }
  }

  return (
    <Card className="w-full max-w-5xl mx-auto bg-gray-800 border-gray-700">
      <CardHeader className="text-center bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
        <CardTitle className="flex items-center justify-center gap-3 text-3xl font-bold">
          <div className="bg-white/20 p-2 rounded-lg">
            <Plane className="h-8 w-8" />
          </div>
          Flight Tracker Pro
        </CardTitle>
        <CardDescription className="text-blue-100 text-lg">
          Real-time flight data from multiple sources worldwide • Compare prices like Skyscanner
        </CardDescription>
      </CardHeader>

      <CardContent className="p-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-gray-700 mb-8">
            <TabsTrigger value="route" className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <MapPin className="h-4 w-4" />
              <span className="hidden sm:inline">Route Search</span>
              <span className="sm:hidden">Route</span>
            </TabsTrigger>
            <TabsTrigger value="airline" className="flex items-center gap-2 data-[state=active]:bg-purple-600 data-[state=active]:text-white">
              <Plane className="h-4 w-4" />
              <span className="hidden sm:inline">By Airline</span>
              <span className="sm:hidden">Airline</span>
            </TabsTrigger>
            <TabsTrigger value="airport" className="flex items-center gap-2 data-[state=active]:bg-green-600 data-[state=active]:text-white">
              <Clock className="h-4 w-4" />
              <span className="hidden sm:inline">Airport Info</span>
              <span className="sm:hidden">Airport</span>
            </TabsTrigger>
          </TabsList>

          {/* Route Search Tab */}
          <TabsContent value="route" className="space-y-6 mt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">From</label>
                <Input
                  placeholder="Origin airport (e.g., JFK, New York)"
                  value={routeForm.origin}
                  onChange={(e) => {
                    setRouteForm(prev => ({ ...prev, origin: e.target.value }))
                    handleInputChange(e.target.value, 'airport')
                  }}
                  className="w-full"
                />
                {suggestions.airports.length > 0 && routeForm.origin && (
                  <div className="border rounded-md mt-1 bg-white shadow-sm max-h-40 overflow-y-auto">
                    {suggestions.airports.slice(0, 5).map((airport) => (
                      <div
                        key={airport.code}
                        className="p-2 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                        onClick={() => {
                          setRouteForm(prev => ({ ...prev, origin: `${airport.code} - ${airport.city}` }))
                          setSuggestions(prev => ({ ...prev, airports: [] }))
                        }}
                      >
                        <div className="font-medium">{airport.code} - {airport.name}</div>
                        <div className="text-sm text-gray-500">{airport.city}, {airport.country}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">To</label>
                <Input
                  placeholder="Destination airport (e.g., LAX, Los Angeles)"
                  value={routeForm.destination}
                  onChange={(e) => {
                    setRouteForm(prev => ({ ...prev, destination: e.target.value }))
                    handleInputChange(e.target.value, 'airport')
                  }}
                  className="w-full"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Departure Date</label>
                <Input
                  type="date"
                  value={routeForm.departureDate}
                  onChange={(e) => setRouteForm(prev => ({ ...prev, departureDate: e.target.value }))}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Passengers</label>
                <Select
                  value={routeForm.passengers.toString()}
                  onValueChange={(value) => setRouteForm(prev => ({ ...prev, passengers: parseInt(value) }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                      <SelectItem key={num} value={num.toString()}>
                        {num} {num === 1 ? 'Passenger' : 'Passengers'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Class</label>
                <Select
                  value={routeForm.class}
                  onValueChange={(value) => setRouteForm(prev => ({ ...prev, class: value as 'economy' | 'business' | 'first' }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="economy">Economy</SelectItem>
                    <SelectItem value="business">Business</SelectItem>
                    <SelectItem value="first">First Class</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              onClick={searchFlightsByRoute}
              disabled={isSearching}
              className="w-full md:w-auto"
              size="lg"
            >
              {isSearching ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Search Flights
                </>
              )}
            </Button>
          </TabsContent>

          {/* Airline Search Tab */}
          <TabsContent value="airline" className="space-y-4 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Airline</label>
                <Input
                  placeholder="Airline name or code (e.g., AA, American Airlines)"
                  value={airlineForm.airline}
                  onChange={(e) => {
                    setAirlineForm(prev => ({ ...prev, airline: e.target.value }))
                    handleInputChange(e.target.value, 'airline')
                  }}
                />
                {suggestions.airlines.length > 0 && airlineForm.airline && (
                  <div className="border rounded-md mt-1 bg-white shadow-sm max-h-40 overflow-y-auto">
                    {suggestions.airlines.slice(0, 5).map((airline) => (
                      <div
                        key={airline.code}
                        className="p-2 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                        onClick={() => {
                          setAirlineForm(prev => ({ ...prev, airline: `${airline.code} - ${airline.name}` }))
                          setSuggestions(prev => ({ ...prev, airlines: [] }))
                        }}
                      >
                        <div className="font-medium flex items-center gap-2">
                          {airline.logo} {airline.code} - {airline.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {airline.country} {airline.alliance && `• ${airline.alliance}`}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Country (Optional)</label>
                <Input
                  placeholder="Country name"
                  value={airlineForm.country}
                  onChange={(e) => setAirlineForm(prev => ({ ...prev, country: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Date</label>
              <Input
                type="date"
                value={airlineForm.date}
                onChange={(e) => setAirlineForm(prev => ({ ...prev, date: e.target.value }))}
                min={new Date().toISOString().split('T')[0]}
                className="w-full md:w-auto"
              />
            </div>

            <Button
              onClick={searchFlightsByAirline}
              disabled={isSearching}
              className="w-full md:w-auto"
              size="lg"
            >
              {isSearching ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Searching...
                </>
              ) : (
                <>
                  <Filter className="h-4 w-4 mr-2" />
                  Search by Airline
                </>
              )}
            </Button>
          </TabsContent>

          {/* Airport Info Tab */}
          <TabsContent value="airport" className="space-y-4 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Airport</label>
                <Input
                  placeholder="Airport name or code (e.g., JFK, New York)"
                  value={airportForm.airport}
                  onChange={(e) => {
                    setAirportForm(prev => ({ ...prev, airport: e.target.value }))
                    handleInputChange(e.target.value, 'airport')
                  }}
                />
                {suggestions.airports.length > 0 && airportForm.airport && (
                  <div className="border rounded-md mt-1 bg-white shadow-sm max-h-40 overflow-y-auto">
                    {suggestions.airports.slice(0, 5).map((airport) => (
                      <div
                        key={airport.code}
                        className="p-2 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                        onClick={() => {
                          setAirportForm(prev => ({ ...prev, airport: `${airport.code} - ${airport.city}` }))
                          setSuggestions(prev => ({ ...prev, airports: [] }))
                        }}
                      >
                        <div className="font-medium">{airport.code} - {airport.name}</div>
                        <div className="text-sm text-gray-500">{airport.city}, {airport.country}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Country (Optional)</label>
                <Input
                  placeholder="Country name"
                  value={airportForm.country}
                  onChange={(e) => setAirportForm(prev => ({ ...prev, country: e.target.value }))}
                />
              </div>
            </div>

            <Button
              onClick={getAirportInformation}
              disabled={isSearching}
              className="w-full md:w-auto"
              size="lg"
            >
              {isSearching ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Loading...
                </>
              ) : (
                <>
                  <MapPin className="h-4 w-4 mr-2" />
                  Get Airport Info
                </>
              )}
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
