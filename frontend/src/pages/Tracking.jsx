import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { locationService } from '../services';
import useSocket from '../hooks/useSocket';
import toast from 'react-hot-toast';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const statusStyle = {
  ACTIVE:      { dot: 'bg-emerald-500 pulse-green', badge: 'bg-emerald-100 text-emerald-700' },
  IDLE:        { dot: 'bg-amber-400',               badge: 'bg-amber-100 text-amber-700' },
  MAINTENANCE: { dot: 'bg-orange-400',              badge: 'bg-orange-100 text-orange-700' },
  OFFLINE:     { dot: 'bg-gray-400 pulse-red',      badge: 'bg-gray-100 text-gray-500' },
};

const createVehicleIcon = (status) => {
  const color = status === 'ACTIVE' ? '#22c55e' : status === 'OFFLINE' ? '#ef4444' : '#f59e0b';
  return L.divIcon({
    className: '',
    html: `<div style="width:36px;height:36px;background:${color};border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.2);display:flex;align-items:center;justify-content:center;">
      <span style="font-family:'Material Symbols Outlined';font-size:18px;color:white;line-height:1;">directions_car</span>
    </div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });
};

const Tracking = () => {
  const [vehicles, setVehicles] = useState([]);
  const [selected, setSelected] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    locationService.getLive()
      .then((res) => { setVehicles(res.data); if (res.data[0]) setSelected(res.data[0]); })
      .catch(() => toast.error('Failed to load live locations'))
      .finally(() => setLoading(false));
  }, []);

  useSocket('location:updated', ({ vehicleId, latitude, longitude, timestamp }) => {
    setVehicles((prev) =>
      prev.map((v) => v.id === vehicleId
        ? { ...v, status: 'ACTIVE', locations: [{ latitude, longitude, timestamp }] }
        : v
      )
    );
    if (selected?.id === vehicleId) {
      setHistory((prev) => [{ latitude, longitude, timestamp }, ...prev.slice(0, 49)]);
    }
  });

  const handleSelect = async (v) => {
    setSelected(v);
    try {
      const res = await locationService.getHistory(v.id);
      setHistory(res.data);
    } catch { setHistory([]); }
  };

  const center = vehicles[0]?.locations?.[0]
    ? [vehicles[0].locations[0].latitude, vehicles[0].locations[0].longitude]
    : [40.7128, -74.006];

  const polyline = history.map((l) => [l.latitude, l.longitude]);

  return (
    <div>
      <div className="mb-stack-lg">
        <h1 className="font-headline-md text-headline-md text-on-surface" style={{ fontFamily: 'Geist, sans-serif' }}>
          Live Tracking
        </h1>
        <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
          Real-time vehicle positions · {vehicles.length} active
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-gutter" style={{ height: 'calc(100vh - 220px)', minHeight: '560px' }}>

        {/* Vehicle List Panel */}
        <div className="w-full lg:w-72 flex-shrink-0 bg-white rounded-3xl shadow-card border border-white flex flex-col overflow-hidden">
          <div className="p-5 border-b border-surface-variant">
            <h3 className="font-headline-md text-headline-md" style={{ fontFamily: 'Geist, sans-serif' }}>Fleet</h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">{vehicles.length} vehicles tracked</p>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {loading ? (
              <div className="p-4 space-y-3">
                {[1,2,3,4].map((i) => <div key={i} className="h-16 bg-surface-container rounded-xl animate-pulse" />)}
              </div>
            ) : vehicles.length === 0 ? (
              <div className="p-8 text-center text-on-surface-variant">
                <span className="material-symbols-outlined text-[40px] block mb-2 text-outline">location_off</span>
                <p className="font-body-sm text-body-sm">No active vehicles</p>
              </div>
            ) : vehicles.map((v) => {
              const st = statusStyle[v.status] || statusStyle.IDLE;
              const isSelected = selected?.id === v.id;
              return (
                <button key={v.id} onClick={() => handleSelect(v)}
                  className={`w-full text-left p-4 border-b border-surface-variant hover:bg-surface-container-low transition-all ${isSelected ? 'bg-primary/5 border-l-4 border-l-primary' : ''}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-data-numeric text-data-numeric font-bold text-on-surface">{v.vehicleNumber}</span>
                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full font-label-caps text-label-caps ${st.badge}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                      {v.status}
                    </span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">{v.driver?.user?.name || 'No driver'}</p>
                  {v.locations?.[0] && (
                    <p className="font-data-numeric text-[10px] text-outline mt-1">
                      {v.locations[0].latitude.toFixed(4)}, {v.locations[0].longitude.toFixed(4)}
                    </p>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Map Panel */}
        <div className="flex-1 relative bg-surface-container rounded-3xl shadow-lg overflow-hidden border border-white">
          {/* Map filter overlay */}
          <div className="absolute top-5 left-5 z-[400] flex gap-2">
            <div className="bg-white px-4 py-2 rounded-full shadow-md font-body-sm font-medium flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full pulse-green" />
              Live Tracking
            </div>
            {selected && (
              <div className="bg-white/90 backdrop-blur px-4 py-2 rounded-full shadow-md font-data-numeric text-data-numeric flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] text-primary">my_location</span>
                {selected.vehicleNumber}
              </div>
            )}
          </div>

          <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }} zoomControl={false}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {vehicles.map((v) => {
              const loc = v.locations?.[0];
              if (!loc) return null;
              return (
                <Marker key={v.id} position={[loc.latitude, loc.longitude]}
                  icon={createVehicleIcon(v.status)}
                  eventHandlers={{ click: () => handleSelect(v) }}>
                  <Popup>
                    <div className="text-sm space-y-1 min-w-[140px]">
                      <p className="font-bold font-mono">{v.vehicleNumber}</p>
                      <p className="text-gray-500">{v.type}</p>
                      <p className="text-gray-500">Driver: {v.driver?.user?.name || 'None'}</p>
                      <p className="font-mono text-xs text-gray-400">
                        {loc.latitude.toFixed(5)}, {loc.longitude.toFixed(5)}
                      </p>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
            {polyline.length > 1 && (
              <Polyline positions={polyline} color="#004ac6" weight={3} opacity={0.6} dashArray="6 4" />
            )}
          </MapContainer>

          {/* Selected vehicle detail card */}
          {selected && (
            <div className="absolute bottom-5 right-5 z-[400] w-72 bg-white/95 backdrop-blur-xl p-5 rounded-2xl shadow-modal border border-white/50">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold">
                  {selected.driver?.user?.name?.[0] || selected.vehicleNumber?.[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-body-sm font-bold text-on-surface truncate">
                    {selected.driver?.user?.name || 'No Driver'}
                  </p>
                  <p className="font-data-numeric text-[11px] text-on-surface-variant">{selected.vehicleNumber}</p>
                </div>
                <span className={`w-2.5 h-2.5 rounded-full ${statusStyle[selected.status]?.dot || 'bg-gray-400'}`} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-surface-container-low p-3 rounded-xl">
                  <p className="font-label-caps text-[10px] text-on-surface-variant uppercase mb-1">Type</p>
                  <p className="font-data-numeric text-data-numeric font-bold">{selected.type}</p>
                </div>
                <div className="bg-surface-container-low p-3 rounded-xl">
                  <p className="font-label-caps text-[10px] text-on-surface-variant uppercase mb-1">Status</p>
                  <p className="font-data-numeric text-data-numeric font-bold">{selected.status}</p>
                </div>
              </div>
              {selected.locations?.[0] && (
                <p className="font-data-numeric text-[10px] text-outline mt-3 text-center">
                  Last update: {new Date(selected.locations[0].timestamp).toLocaleTimeString()}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Tracking;
