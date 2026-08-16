import React, { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";

const icon = L.divIcon({
  className: "",
  html: `<div style="width:34px;height:34px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:linear-gradient(135deg,#0ea5e9,#0369a1);border:2.5px solid #fff;box-shadow:0 3px 8px rgba(2,32,58,.4)"><div style="position:absolute;inset:0;display:grid;place-items:center;transform:rotate(45deg);font-size:15px">🔧</div></div>`,
  iconSize: [34, 34],
  iconAnchor: [17, 34],
  popupAnchor: [0, -30],
});

const homeIcon = L.divIcon({
  className: "",
  html: `<div style="width:30px;height:30px;border-radius:50%;background:#ef4444;border:2.5px solid #fff;box-shadow:0 3px 8px rgba(2,32,58,.4);display:grid;place-items:center;font-size:14px">🏠</div>`,
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});

function FlyTo({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center && map) map.flyTo(center, 12, { duration: 0.8 });
  }, [center, map]);
  return null;
}

export default function MapView({ center, mechanics = [], onSelect, selectedId }) {
  const mapRef = useRef(null);

  return (
    <MapContainer
      ref={mapRef}
      center={center || [13.0827, 80.2707]}
      zoom={12}
      className="map"
      scrollWheelZoom
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {center && <Marker position={center} icon={homeIcon} zIndexOffset={999}>
        <Popup>Your location</Popup>
      </Marker>}
      {mechanics.map((m) => (
        <Marker
          key={m.user_id}
          position={[m.lat, m.lng]}
          icon={icon}
          zIndexOffset={selectedId === m.user_id ? 500 : 0}
          eventHandlers={{ click: () => onSelect && onSelect(m) }}
        >
          <Popup>
            <div className="map-pop">
              <b>{m.name}</b><br />
              ⭐ {m.rating ?? "New"} · {m.reviews_count} reviews<br />
              {m.distance_km != null && <>📍 {m.distance_km} km away<br /></>}
              {m.verified && <span style={{ color: "#059669" }}>✓ Verified</span>}
            </div>
          </Popup>
        </Marker>
      ))}
      {center && <FlyTo center={center} />}
    </MapContainer>
  );
}
