import { useEffect, useState, useRef } from 'react';
import { analyticsService } from '../services';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { locationService } from '../services';
import useSocket from '../hooks/useSocket';

// Fix leaflet icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const createDotIcon = (color) => L.divIcon({
  className: '',
  html: `<div class="w-4 h-4 rounded-full border-2 border-white shadow-lg ${color === 'green' ? 'bg-emerald-500 pulse-green' : color === 'red' ? 'bg-red-500 pulse-red' : 'bg-yellow-500'}"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

// ── Metric Card ──────────────────────────────────────────────────────────────
const MetricCard = ({ icon, iconBg, iconColor, badge, badgeColor, label, value }) => (
  <div className="metric-card bg-white p-stack-md rounded-xl shadow-card border border-white">
    <div className="flex items-center justify-between mb-4">
      <span className={`p-2 ${iconBg} ${iconColor} rounded-lg material-symbols-outlined`}>{icon}</span>
      <span className={`${badgeColor} font-data-numeric text-data-numeric`}>{badge}</span>
    </div>
    <h3 className="text-on-surface-variant font-label-caps text-label-caps uppercase tracking-wider">{label}</h3>
    <p className="font-headline-lg text-headline-lg mt-1" style={{ fontFamily: 'Geist, sans-serif' }}>{value}</p>
  </div>
);

// ── Activity Feed Item ───────────────────────────────────────────────────────
const FeedItem = ({ dotColor, title, desc, time }) => (
  <div className="p-4 rounded-2xl hover:bg-surface-container-low transition-all border border-transparent hover:border-surface-variant">
    <div className="flex gap-4">
      <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${dotColor}`} />
      <div>
        <p className="text-body-sm font-semibold mb-1">{title}</p>
        <p className="text-xs text-on-surface-variant mb-2">{desc}</p>
        <span className="text-[10px] text-on-surface-variant font-data-numeric bg-surface-container p-1 rounded">{time}</span>
      </div>
    </div>
  </div>
);

// ── Dashboard ────────────────────────────────────────────────────────────────
const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [selected, setSelected] = useState(null);
  const [feed, setFeed] = useState([
    { id: 1, dot: 'bg-red-500',     title: 'Critical Delay: TRK-9114',  desc: 'Mechanical alert triggered. Maintenance dispatched to I-95 North.', time: '2 mins ago' },
    { id: 2, dot: 'bg-emerald-500', title: 'Delivery Success',           desc: 'TRK-4421 completed delivery #SO-10294 in Seattle Hub.',             time: '14 mins ago' },
    { id: 3, dot: 'bg-blue-500',    title: 'Route Optimized',            desc: 'AI recalculated route for West Coast cluster due to weather.',       time: '32 mins ago' },
    { id: 4, dot: 'bg-yellow-500',  title: 'Driver Shift Change',        desc: '12 drivers ending shifts. Night crew handovers in progress.',        time: '1 hour ago' },
    { id: 5, dot: 'bg-emerald-500', title: 'Maintenance Cleared',        desc: 'TRK-5502 is back in service after successful inspection.',           time: '2 hours ago' },
  ]);
  const feedIdRef = useRef(10);

  useEffect(() => {
    analyticsService.getStats()
      .then((r) => setStats(r.data))
      .catch(() => {});

    locationService.getLive()
      .then((r) => { setVehicles(r.data); if (r.data[0]) setSelected(r.data[0]); })
      .catch(() => {});
  }, []);

  // Real-time location updates
  useSocket('location:updated', ({ vehicleId, latitude, longitude, timestamp }) => {
    setVehicles((prev) =>
      prev.map((v) => v.id === vehicleId
        ? { ...v, status: 'ACTIVE', locations: [{ latitude, longitude, timestamp }] }
        : v
      )
    );
    // Push to feed
    feedIdRef.current += 1;
    setFeed((prev) => [
      { id: feedIdRef.current, dot: 'bg-blue-500', title: 'Location Updated', desc: `Vehicle ${vehicleId.slice(-6)} sent new GPS coordinates.`, time: 'Just now' },
      ...prev.slice(0, 7),
    ]);
  });

  const mapCenter = vehicles[0]?.locations?.[0]
    ? [vehicles[0].locations[0].latitude, vehicles[0].locations[0].longitude]
    : [37.7749, -122.4194];

  const metrics = [
    { icon: 'health_and_safety', iconBg: 'bg-emerald-100', iconColor: 'text-emerald-700', badge: '+2.4%',  badgeColor: 'text-emerald-600', label: 'Fleet Health Score',  value: stats ? `${stats.vehicleUtilization}%` : '—' },
    { icon: 'local_shipping',    iconBg: 'bg-blue-100',    iconColor: 'text-blue-700',    badge: `+${stats?.activeDeliveries ?? 0}`, badgeColor: 'text-blue-600',    label: 'Active Deliveries',  value: stats?.activeDeliveries ?? '—' },
    { icon: 'route',             iconBg: 'bg-surface-container-highest', iconColor: 'text-primary', badge: 'Stable', badgeColor: 'text-on-surface-variant', label: 'Vehicles on Road', value: stats?.activeVehicles ?? '—' },
    { icon: 'warning',           iconBg: 'bg-red-100',     iconColor: 'text-red-700',     badge: `-${stats?.delayedDeliveries ?? 0}`, badgeColor: 'text-red-600',  label: 'Delayed Shipments',  value: stats?.delayedDeliveries ?? '—' },
  ];

  return (
    <div>
      {/* ── Top Metrics ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter mb-stack-lg">
        {metrics.map((m) => <MetricCard key={m.label} {...m} />)}
      </div>

      {/* ── Map + Activity Feed ── */}
      <div className="flex flex-col lg:flex-row gap-gutter">

        {/* Live Fleet Map */}
        <div className="lg:w-[68%] relative h-[600px] bg-surface-container rounded-3xl shadow-lg overflow-hidden border border-white">

          {/* Map filter buttons */}
          <div className="absolute top-6 left-6 z-[400] flex gap-2">
            <button className="bg-white px-4 py-2 rounded-full shadow-md text-body-sm font-medium flex items-center gap-2 hover:bg-surface-container-low transition-all">
              <span className="w-2 h-2 bg-emerald-500 rounded-full" /> All Vehicles
            </button>
            <button className="bg-white/80 backdrop-blur px-4 py-2 rounded-full shadow-md text-body-sm font-medium flex items-center gap-2 hover:bg-white transition-all">
              Alerts Only
            </button>
          </div>

          {/* Leaflet Map */}
          <MapContainer center={mapCenter} zoom={12} style={{ height: '100%', width: '100%' }} zoomControl={false}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {vehicles.map((v) => {
              const loc = v.locations?.[0];
              if (!loc) return null;
              const color = v.status === 'ACTIVE' ? 'green' : v.status === 'OFFLINE' ? 'red' : 'yellow';
              return (
                <Marker
                  key={v.id}
                  position={[loc.latitude, loc.longitude]}
                  icon={createDotIcon(color)}
                  eventHandlers={{ click: () => setSelected(v) }}
                >
                  <Popup>
                    <p className="font-bold font-mono text-xs">{v.vehicleNumber}</p>
                    <p className="text-xs text-gray-500">{v.driver?.user?.name || 'No driver'}</p>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>

          {/* Floating Vehicle Info Card */}
          {selected && (
            <div className="absolute bottom-6 right-6 z-[400] w-80 bg-white/95 backdrop-blur-xl p-6 rounded-2xl shadow-modal border border-white/50">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-bold text-lg border border-outline-variant">
                  {selected.driver?.user?.name?.[0] || selected.vehicleNumber?.[0] || 'V'}
                </div>
                <div>
                  <h4 className="font-body-md font-bold">{selected.driver?.user?.name || 'No Driver'}</h4>
                  <p className="text-on-surface-variant font-data-numeric text-xs">Vehicle ID: {selected.vehicleNumber}</p>
                </div>
                <span className="ml-auto material-symbols-outlined text-on-surface-variant cursor-pointer text-[20px]">open_in_new</span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-surface-container-low p-3 rounded-xl">
                  <p className="text-[10px] uppercase text-on-surface-variant font-label-caps mb-1">Status</p>
                  <p className="font-data-numeric text-body-md font-bold">{selected.status}</p>
                </div>
                <div className="bg-surface-container-low p-3 rounded-xl">
                  <p className="text-[10px] uppercase text-on-surface-variant font-label-caps mb-1">Type</p>
                  <p className="font-data-numeric text-body-md font-bold">{selected.type}</p>
                </div>
              </div>

              {selected.locations?.[0] && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs font-medium">
                    <span className="text-on-surface-variant">Last GPS Update</span>
                    <span className="text-primary font-mono">
                      {new Date(selected.locations[0].timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="font-mono text-xs text-on-surface-variant">
                    {selected.locations[0].latitude.toFixed(5)}, {selected.locations[0].longitude.toFixed(5)}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Live Activity Feed */}
        <div className="flex-grow bg-white rounded-3xl shadow-lg border border-white flex flex-col h-[600px] overflow-hidden">
          <div className="p-6 border-b border-surface-variant flex items-center justify-between">
            <h3 className="font-headline-md text-headline-md" style={{ fontFamily: 'Geist, sans-serif' }}>Live Activity</h3>
            <span className="material-symbols-outlined text-primary">sensors</span>
          </div>

          <div className="flex-grow overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {feed.map((item) => (
              <FeedItem key={item.id} dotColor={item.dot} title={item.title} desc={item.desc} time={item.time} />
            ))}
          </div>

          <div className="p-4 bg-surface-container-low">
            <button className="w-full py-2 text-xs font-bold text-primary font-label-caps uppercase tracking-widest hover:underline">
              View Full Logs
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
