"use client"

import React, { useState, useMemo } from "react"
import { 
  Plane, 
  Clock, 
  MapPin, 
  Wifi, 
  WifiOff, 
  ArrowRight, 
  DollarSign,
  Filter,
  SortAsc,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader,
  Star,
  Zap
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Flight } from "@/types"

interface FlightResultsProps {
  flights: Flight[]
  isLoading: boolean
  error?: string
}

export default function FlightResults({ flights, isLoading, error }: FlightResultsProps) {
  const [sortBy, setSortBy] = useState<'time' | 'price' | 'duration' | 'status'>('time')
  const [filterBy, setFilterBy] = useState<'all' | 'active' | 'scheduled' | 'landed'>('all')

  // Sort and filter flights
  const processedFlights = useMemo(() => {
    let filtered = flights

    // Apply filter
    if (filterBy !== 'all') {
      filtered = filtered.filter(flight => {
        const status = flight.status?.toLowerCase()
        switch (filterBy) {
          case 'active':
            return status === 'active' || status === 'en-route' || status === 'boarding'
          case 'scheduled':
            return status === 'scheduled' || status === 'on time'
          case 'landed':
            return status === 'landed' || status === 'arrived'
          default:
            return true
        }
      })
    }

    // Apply sort
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price':
          return (a.price || 0) - (b.price || 0)
        case 'duration':
          return a.duration.localeCompare(b.duration)
        case 'status':
          return (a.status || '').localeCompare(b.status || '')
        case 'time':
        default:
          const timeA = a.departure?.time || a.arrival?.time || ''
          const timeB = b.departure?.time || b.arrival?.time || ''
          return timeA.localeCompare(timeB)
      }
    })
  }, [flights, sortBy, filterBy])

  if (isLoading) {
    return (
      <Card className="w-full bg-gray-800 border-gray-700">
        <CardContent className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center space-y-4">
            <Loader className="h-8 w-8 animate-spin text-blue-400" />
            <p className="text-lg font-medium text-white">Searching for flights...</p>
            <p className="text-sm text-gray-400">Getting real-time data from multiple sources</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="w-full bg-gray-800 border-red-500/50">
        <CardContent className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center space-y-4 text-center">
            <AlertCircle className="h-12 w-12 text-red-400" />
            <div>
              <h3 className="text-lg font-semibold text-red-400">Search Error</h3>
              <p className="text-sm text-gray-400 mt-1">{error}</p>
            </div>
            <Button variant="outline" onClick={() => window.location.reload()} className="border-gray-600 text-white hover:bg-gray-700">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (flights.length === 0) {
    return (
      <Card className="w-full bg-gray-800 border-gray-700">
        <CardContent className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center space-y-4 text-center">
            <Plane className="h-12 w-12 text-gray-500" />
            <div>
              <h3 className="text-lg font-semibold text-gray-300">No Flights Found</h3>
              <p className="text-sm text-gray-500 mt-1">
                Try adjusting your search criteria or check back later for new flights
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="w-full space-y-4">
      {/* Results Header with Controls */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle className="text-xl text-white flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-400" />
                Flight Results
                {processedFlights.some(f => f.price && f.price < 200) && (
                  <span className="text-xs bg-green-500 text-white px-2 py-1 rounded-full ml-2">Best Deals</span>
                )}
              </CardTitle>
              <p className="text-sm text-gray-400 mt-1">
                Found {processedFlights.length} flights{flights.length !== processedFlights.length && ` (${flights.length} total)`}
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2">
              <Select value={filterBy} onValueChange={(value: string) => setFilterBy(value as 'all' | 'active' | 'scheduled' | 'landed')}>
                <SelectTrigger className="w-[140px] bg-gray-700 border-gray-600 text-white">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="all" className="text-white">All Flights</SelectItem>
                  <SelectItem value="active" className="text-white">Active</SelectItem>
                  <SelectItem value="scheduled" className="text-white">Scheduled</SelectItem>
                  <SelectItem value="landed" className="text-white">Landed</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={(value: string) => setSortBy(value as 'time' | 'price' | 'duration' | 'status')}>
                <SelectTrigger className="w-[140px] bg-gray-700 border-gray-600 text-white">
                  <SortAsc className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="time" className="text-white">Time</SelectItem>
                  <SelectItem value="price" className="text-white">Price</SelectItem>
                  <SelectItem value="duration" className="text-white">Duration</SelectItem>
                  <SelectItem value="status" className="text-white">Status</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Flight Cards */}
      <div className="space-y-4">
        {processedFlights.map((flight, index) => (
          <FlightCard key={flight.id || index} flight={flight} />
        ))}
      </div>
    </div>
  )
}

function getStatusColor(status: string) {
  switch (status?.toLowerCase()) {
    case "active":
    case "en-route":
    case "boarding":
      return "text-green-300 bg-green-900/30 border-green-600"
    case "landed":
    case "arrived":
      return "text-blue-300 bg-blue-900/30 border-blue-600"
    case "scheduled":
    case "on time":
      return "text-gray-300 bg-gray-700/30 border-gray-600"
    case "cancelled":
      return "text-red-300 bg-red-900/30 border-red-600"
    case "delayed":
      return "text-orange-300 bg-orange-900/30 border-orange-600"
    default:
      return "text-gray-400 bg-gray-800/30 border-gray-600"
  }
}

function getStatusIcon(status: string) {
  switch (status?.toLowerCase()) {
    case "active":
    case "en-route":
    case "boarding":
      return <Plane className="h-4 w-4" />
    case "landed":
    case "arrived":
      return <CheckCircle className="h-4 w-4" />
    case "cancelled":
      return <XCircle className="h-4 w-4" />
    case "delayed":
      return <AlertCircle className="h-4 w-4" />
    case "scheduled":
    case "on time":
    default:
      return <Clock className="h-4 w-4" />
  }
}

function FlightCard({ flight }: { flight: Flight }) {
  const statusColor = getStatusColor(flight.status || "")
  const statusIcon = getStatusIcon(flight.status || "")
  const isActive = flight.status?.toLowerCase() === "active" || flight.status?.toLowerCase() === "en-route"
  const isBestDeal = flight.price && flight.price < 200

  return (
    <Card className={`hover:shadow-xl transition-all duration-300 border-l-4 bg-gray-800 border-gray-700 hover:bg-gray-700/50 ${
      isActive ? 'border-l-green-500 shadow-green-500/20' : 
      isBestDeal ? 'border-l-yellow-500 shadow-yellow-500/20' : 
      'border-l-blue-500'
    }`}>
      <CardContent className="p-6">
        {/* Flight Header */}
        <div className="flex flex-col md:flex-row justify-between items-start mb-4">
          <div className="flex items-center space-x-3 mb-2 md:mb-0">
            <div className="flex items-center space-x-2">
              <Plane className="h-5 w-5 text-blue-400" />
              <span className="font-bold text-lg text-white">{flight.flightNumber}</span>
            </div>
            <div className="text-sm text-gray-400">
              {flight.airline}
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1 ${statusColor}`}>
              {statusIcon}
              {flight.status || 'Unknown'}
            </div>
            {flight.price && (
              <div className={`flex items-center font-semibold ${isBestDeal ? 'text-yellow-400' : 'text-green-400'}`}>
                <DollarSign className="h-4 w-4" />
                {flight.price}
                {isBestDeal && <Star className="h-3 w-3 ml-1 fill-current" />}
              </div>
            )}
          </div>
        </div>

        {/* Route Information */}
        {(flight.departure || flight.arrival) && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center mb-4 p-4 bg-gray-900/50 rounded-lg border border-gray-600">
            {/* Departure */}
            {flight.departure && (
              <div className="text-center md:text-left">
                <div className="text-2xl font-bold text-white">
                  {flight.departure.time}
                </div>
                <div className="text-sm font-medium text-gray-300">
                  {flight.departure.airport}
                </div>
                <div className="text-xs text-gray-500">
                  {flight.departure.city && `${flight.departure.city}, `}
                  {flight.departure.country}
                </div>
                {flight.departure.gate && (
                  <div className="text-xs text-blue-400 mt-1 bg-blue-900/30 px-2 py-1 rounded">
                    Gate {flight.departure.gate}
                  </div>
                )}
              </div>
            )}

            {/* Flight Path */}
            <div className="flex items-center justify-center relative">
              <div className="flex items-center space-x-2 text-gray-500">
                <div className="w-8 h-px bg-gray-600"></div>
                <ArrowRight className="h-4 w-4" />
                <div className="w-8 h-px bg-gray-600"></div>
              </div>
              {flight.duration && (
                <div className="absolute top-full mt-1 text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded border border-gray-600">
                  {flight.duration}
                </div>
              )}
            </div>

            {/* Arrival */}
            {flight.arrival && (
              <div className="text-center md:text-right">
                <div className="text-2xl font-bold text-white">
                  {flight.arrival.time}
                </div>
                <div className="text-sm font-medium text-gray-300">
                  {flight.arrival.airport}
                </div>
                <div className="text-xs text-gray-500">
                  {flight.arrival.city && `${flight.arrival.city}, `}
                  {flight.arrival.country}
                </div>
                {flight.arrival.gate && (
                  <div className="text-xs text-blue-400 mt-1 bg-blue-900/30 px-2 py-1 rounded">
                    Gate {flight.arrival.gate}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Additional Flight Details */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          {flight.aircraft && (
            <div className="flex items-center space-x-2">
              <Plane className="h-4 w-4 text-gray-500" />
              <span className="text-gray-400">Aircraft:</span>
              <span className="font-medium text-gray-300">{flight.aircraft}</span>
            </div>
          )}
          
          {flight.gate && (
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-gray-500" />
              <span className="text-gray-400">Gate:</span>
              <span className="font-medium text-gray-300">{flight.gate}</span>
            </div>
          )}
          
          {flight.duration && (
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <span className="text-gray-400">Duration:</span>
              <span className="font-medium text-gray-300">{flight.duration}</span>
            </div>
          )}

          {flight.source && (
            <div className="flex items-center space-x-2">
              {flight.source.includes('real') ? (
                <Wifi className="h-4 w-4 text-green-400" />
              ) : (
                <WifiOff className="h-4 w-4 text-orange-400" />
              )}
              <span className="text-gray-400">Source:</span>
              <span className="font-medium text-xs text-gray-300">{flight.source}</span>
            </div>
          )}
        </div>

        {/* Special Indicators */}
        <div className="mt-4 flex gap-2 flex-wrap">
          {isActive && (
            <div className="p-3 bg-green-900/30 border border-green-600 rounded-lg">
              <div className="flex items-center space-x-2 text-green-300">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">Live tracking enabled</span>
              </div>
            </div>
          )}
          
          {isBestDeal && (
            <div className="p-3 bg-yellow-900/30 border border-yellow-600 rounded-lg">
              <div className="flex items-center space-x-2 text-yellow-300">
                <Star className="h-4 w-4 fill-current" />
                <span className="text-sm font-medium">Best Deal Alert</span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
