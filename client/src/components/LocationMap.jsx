import React, { useEffect, useState, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMap } from 'react-leaflet'
import L from 'leaflet'
import { geocodeAddress } from '../utils/geocodeAddress'

// Custom blue pin SVG with home icon inside
const blueHomePinSvg = `
<svg width="42" height="46" viewBox="0 0 42 46" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M21 0C10.5 0 2 8.5 2 19C2 31.5 21 46 21 46C21 46 40 31.5 40 19C40 8.5 31.5 0 21 0Z" fill="#2563EB" stroke="#FFFFFF" stroke-width="2"/>
  <path d="M21 12L14 18.5V25H18V20H24V25H28V18.5L21 12Z" fill="#FFFFFF"/>
</svg>
`

const blueHomePinIcon = L.divIcon({
    html: blueHomePinSvg,
    className: 'custom-pin-icon',
    iconSize: [42, 46],
    iconAnchor: [21, 46],
    popupAnchor: [0, -42]
})

const DEFAULT_CENTER = [40.7128, -74.0060]

// Helper component to dynamically update map center and zoom when they change
const ChangeMapView = ({ center, zoom }) => {
    const map = useMap()
    useEffect(() => {
        if (center && center[0] !== undefined && center[1] !== undefined) {
            map.setView(center, zoom)
        }
    }, [center, zoom, map])
    return null
}

const LocationMap = ({ hotels = [] }) => {

    const [hotelLocations, setHotelLocations] = useState([])
    const [loading, setLoading] = useState(true)
    const mapRef = useRef(null)
    const hotelIds = hotels.map(hotel => hotel._id).join(',')

    useEffect(() => {
        if (!hotels.length) {
            setHotelLocations([])
            setLoading(false)
            return
        }

        const loadLocations = async () => {
            setLoading(true)

            // Deduplicate hotels by _id
            const uniqueHotels = [];
            const seen = new Set();
            for (const hotel of hotels) {
                if (hotel && hotel._id && !seen.has(hotel._id)) {
                    seen.add(hotel._id);
                    uniqueHotels.push(hotel);
                }
            }

            const locations = await Promise.all(
                uniqueHotels.map(async (hotel) => {
                    const coords = await geocodeAddress(hotel.address, hotel.city)
                    if (!coords) return null
                    return { ...hotel, ...coords }
                })
            )

            setHotelLocations(locations.filter(Boolean))
            setLoading(false)
        }

        loadLocations()
    }, [hotelIds])

    // Update section title from "Location" to "Location on map"
    useEffect(() => {
        if (mapRef.current) {
            const parent = mapRef.current.parentElement;
            if (parent) {
                const h2 = parent.querySelector('h2');
                if (h2 && (h2.textContent === 'Location' || h2.textContent === 'Location on map')) {
                    h2.textContent = 'Location on map';
                }
            }
        }
    }, [loading, hotelLocations])

    if (loading) {
        return (
            <div className='h-[500px] w-full flex items-center justify-center bg-gray-100 rounded-xl text-gray-500'>
                Loading map...
            </div>
        )
    }

    if (!hotelLocations.length) {
        return (
            <div className='h-[500px] w-full flex items-center justify-center bg-gray-100 rounded-xl text-gray-500'>
                Location not found
            </div>
        )
    }

    // Determine center of the map
    let center = DEFAULT_CENTER
    let zoom = 5

    if (hotelLocations.length === 1) {
        center = [hotelLocations[0].lat, hotelLocations[0].lng]
        zoom = 13
    } else if (hotelLocations.length > 1) {
        const avgLat = hotelLocations.reduce((sum, loc) => sum + loc.lat, 0) / hotelLocations.length
        const avgLng = hotelLocations.reduce((sum, loc) => sum + loc.lng, 0) / hotelLocations.length
        center = [avgLat, avgLng]
        zoom = 11
    }

    // Format city and region/country dynamically for display text below the map
    const hotelCity = hotelLocations[0]?.city || "Los Angeles"
    let displayAddress = `${hotelCity}, USA`
    if (hotelCity.toLowerCase().includes("los angeles")) {
        displayAddress = "Los Angeles, California, USA"
    } else if (hotelCity.toLowerCase().includes("new york")) {
        displayAddress = "New York, New York, USA"
    } else if (hotelCity.toLowerCase().includes("london")) {
        displayAddress = "London, United Kingdom"
    } else if (hotelCity.toLowerCase().includes("paris")) {
        displayAddress = "Paris, France"
    } else if (hotelCity.toLowerCase().includes("singapore")) {
        displayAddress = "Singapore"
    } else if (hotelCity.toLowerCase().includes("dubai")) {
        displayAddress = "Dubai, United Arab Emirates"
    }

    return (
        <div ref={mapRef} className="w-full">
            {/* Inline CSS styling to keep all Leaflet overrides self-contained */}
            <style>{`
                .custom-blue-tooltip {
                    background-color: #2563EB !important;
                    color: white !important;
                    border: none !important;
                    border-radius: 6px !important;
                    padding: 8px 16px !important;
                    font-family: 'Outfit', sans-serif !important;
                    font-weight: 500 !important;
                    font-size: 13px !important;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06) !important;
                    white-space: nowrap !important;
                }
                .leaflet-tooltip-top.custom-blue-tooltip::before {
                    border-top-color: #2563EB !important;
                }
            `}</style>

            <MapContainer
                center={center}
                zoom={zoom}
                scrollWheelZoom={false}
                style={{ height: "500px", width: "100%" }}
                className='rounded-xl z-0'
            >
                <TileLayer
                    attribution='&copy; OpenStreetMap contributors &copy; CARTO'
                    url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                />

                <ChangeMapView center={center} zoom={zoom} />

                {hotelLocations.map((hotel) => (
                    <React.Fragment key={hotel._id}>
                        {/* Hotel Pin Marker */}
                        <Marker
                            position={[hotel.lat, hotel.lng]}
                            icon={blueHomePinIcon}
                        >
                            <Tooltip
                                permanent
                                direction="top"
                                className="custom-blue-tooltip"
                                offset={[0, -45]}
                            >
                                Exact location provided after booking
                            </Tooltip>
                            <Popup>
                                <strong>{hotel.name}</strong>
                                <br />
                                {hotel.address}
                            </Popup>
                        </Marker>

                    </React.Fragment>
                ))}
            </MapContainer>

            {/* Address Details below the map */}
            <div className='mt-5 font-inter'>
                <h3 className='text-lg font-bold text-gray-800'>{displayAddress}</h3>
                <p className='text-sm text-gray-500 mt-1'>It's like a home away from home.</p>
            </div>
        </div>
    )
}

export default LocationMap
