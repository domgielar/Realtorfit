/// <reference types="@types/google.maps" />
'use client'

import { useEffect, useRef, useState } from 'react'
import {
  Map,
  AdvancedMarker,
  useMap,
  useMapsLibrary,
  useApiIsLoaded,
} from '@vis.gl/react-google-maps'

export interface LocationSelection {
  label: string
  lat: number
  lng: number
  radiusMi: number
}

interface Props {
  value: LocationSelection | null
  onChange: (v: LocationSelection) => void
  placeholder?: string
  minRadius?: number
  maxRadius?: number
}

// Runs inside <Map> — draws the circle + marker, handles map clicks
function MapOverlay({
  value,
  onMapClick,
}: {
  value: LocationSelection | null
  onMapClick: (lat: number, lng: number) => void
}) {
  const map = useMap()
  const mapsLib = useMapsLibrary('maps')

  // Register click-to-pin on the map
  useEffect(() => {
    if (!map) return
    const listener = map.addListener(
      'click',
      (e: google.maps.MapMouseEvent) => {
        if (e.latLng) onMapClick(e.latLng.lat(), e.latLng.lng())
      },
    )
    return () => listener.remove()
  }, [map, onMapClick])

  // Draw radius circle
  useEffect(() => {
    if (!map || !value || !mapsLib) return
    const circle = new mapsLib.Circle({
      map,
      center: { lat: value.lat, lng: value.lng },
      radius: value.radiusMi * 1609.34,
      fillColor: '#bd5d3d',
      fillOpacity: 0.13,
      strokeColor: '#bd5d3d',
      strokeOpacity: 0.55,
      strokeWeight: 2,
      clickable: false,
    })
    return () => circle.setMap(null)
  }, [map, mapsLib, value?.lat, value?.lng, value?.radiusMi])

  // Pan + zoom to pin whenever it moves
  useEffect(() => {
    if (!map || !value) return
    map.panTo({ lat: value.lat, lng: value.lng })
    const zoom =
      value.radiusMi <= 5
        ? 13
        : value.radiusMi <= 15
          ? 11
          : value.radiusMi <= 30
            ? 10
            : value.radiusMi <= 60
              ? 9
              : 8
    map.setZoom(zoom)
  }, [map, value?.lat, value?.lng, value?.radiusMi])

  if (!value) return null

  return (
    <AdvancedMarker position={{ lat: value.lat, lng: value.lng }}>
      <div
        style={{
          width: 14,
          height: 14,
          borderRadius: '50%',
          backgroundColor: '#bd5d3d',
          border: '2.5px solid white',
          boxShadow: '0 2px 6px rgba(0,0,0,0.35)',
        }}
      />
    </AdvancedMarker>
  )
}

export default function LocationPicker({
  value,
  onChange,
  placeholder = 'Search for a city or town…',
  minRadius = 5,
  maxRadius = 50,
}: Props) {
  const [query, setQuery] = useState('')
  const [searching, setSearching] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)
  const geocodingLib = useMapsLibrary('geocoding')
  const apiLoaded = useApiIsLoaded()
  const geocoderRef = useRef<google.maps.Geocoder | null>(null)

  useEffect(() => {
    if (!geocodingLib) return
    geocoderRef.current = new geocodingLib.Geocoder()
  }, [geocodingLib])

  const defaultRadius = Math.round(((minRadius + maxRadius) / 2) / 5) * 5

  // Extracts "Town, State" (e.g. "Worcester, MA") from a geocoder result
  function townLabel(result: google.maps.GeocoderResult): string {
    const get = (type: string) =>
      result.address_components.find((c) => c.types.includes(type))
    const locality =
      get('locality') ?? get('sublocality') ?? get('administrative_area_level_3') ?? get('administrative_area_level_2')
    const state = get('administrative_area_level_1')
    if (locality && state) return `${locality.long_name}, ${state.short_name}`
    if (locality) return locality.long_name
    if (state) return state.long_name
    return result.formatted_address
  }

  // Called when the user clicks on the map — reverse geocodes to nearest town
  const handleMapClick = (lat: number, lng: number) => {
    const radiusMi = value?.radiusMi ?? defaultRadius
    if (!geocoderRef.current) {
      onChange({ label: 'Selected location', lat, lng, radiusMi })
      return
    }
    geocoderRef.current.geocode({ location: { lat, lng } }, (results, status) => {
      const label =
        status === 'OK' && results?.[0]
          ? townLabel(results[0])
          : 'Selected location'
      onChange({ label, lat, lng, radiusMi })
    })
  }

  // Called when the user submits the search form — forward geocodes to nearest town
  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!query.trim() || !geocoderRef.current) return
    setSearching(true)
    setSearchError(null)
    geocoderRef.current.geocode({ address: query.trim() }, (results, status) => {
      setSearching(false)
      if (status === 'OK' && results?.[0]) {
        const loc = results[0].geometry.location
        onChange({
          label: townLabel(results[0]),
          lat: loc.lat(),
          lng: loc.lng(),
          radiusMi: value?.radiusMi ?? defaultRadius,
        })
        setQuery('')
      } else {
        setSearchError('Location not found — try a different city, town, or zip code.')
      }
    })
  }

  return (
    <div className="space-y-2.5">
      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <svg
            className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
            style={{ color: 'var(--color-muted)' }}
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
              clipRule="evenodd"
            />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setSearchError(null)
            }}
            placeholder={placeholder}
            className="w-full pl-10 pr-3.5 py-3 text-[14px] border-[1.5px] border-[--color-line] rounded-[10px] bg-[--color-paper] text-[--color-ink] placeholder:text-[--color-muted] outline-none focus:border-[--color-clay] transition-colors"
          />
        </div>
        <button
          type="submit"
          disabled={searching || !query.trim() || !apiLoaded}
          className="px-4 rounded-[10px] text-[14px] font-semibold text-white shrink-0 transition-opacity disabled:opacity-40"
          style={{ backgroundColor: 'var(--color-clay)' }}
        >
          {searching ? '…' : 'Go'}
        </button>
      </form>

      {searchError && (
        <p className="text-[12px] text-red-500 -mt-0.5 pl-0.5">{searchError}</p>
      )}

      {/* Map */}
      <div
        className="relative rounded-xl overflow-hidden border border-[--color-line]"
        style={{ height: '280px' }}
      >
        {!value && (
          <div className="absolute inset-x-0 bottom-3 z-10 flex justify-center pointer-events-none">
            <p
              className="rounded-lg px-3 py-1.5 text-[12px] shadow-sm"
              style={{
                background: 'rgba(255,255,255,0.92)',
                color: 'var(--color-ink-soft)',
              }}
            >
              📍 Click anywhere on the map to drop a pin
            </p>
          </div>
        )}
        <Map
          defaultCenter={{ lat: 42.26, lng: -71.9 }}
          defaultZoom={8}
          mapId="DEMO_MAP_ID"
          style={{ width: '100%', height: '100%' }}
          gestureHandling="cooperative"
          disableDefaultUI
        >
          <MapOverlay value={value} onMapClick={handleMapClick} />
        </Map>
      </div>

      {/* Radius slider + label */}
      {value ? (
        <div
          className="rounded-[10px] px-3.5 py-3"
          style={{ background: 'var(--color-paper)' }}
        >
          <div className="flex items-center justify-between mb-2">
            <span
              className="text-[13px] truncate pr-4 min-w-0"
              style={{ color: 'var(--color-ink-soft)' }}
            >
              📍 {value.label}
            </span>
            <span
              className="text-[14px] font-semibold shrink-0"
              style={{ color: 'var(--color-ink)' }}
            >
              {value.radiusMi} mi radius
            </span>
          </div>
          <input
            type="range"
            min={minRadius}
            max={maxRadius}
            step={5}
            value={value.radiusMi}
            className="w-full accent-[--color-clay]"
            onChange={(e) => onChange({ ...value, radiusMi: +e.target.value })}
          />
          <div
            className="flex justify-between text-[11px] mt-0.5"
            style={{ color: 'var(--color-muted)' }}
          >
            <span>{minRadius} mi</span>
            <span>{maxRadius} mi</span>
          </div>
        </div>
      ) : (
        <p
          className="text-[13px] text-center py-0.5"
          style={{ color: 'var(--color-muted)' }}
        >
          Search above or click the map to set your location
        </p>
      )}
    </div>
  )
}
