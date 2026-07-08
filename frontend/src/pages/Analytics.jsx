import { useEffect, useState } from 'react';
import { analyticsService } from '../services';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend, CartesianGrid,
} from 'recharts';
import toast from 'react-hot-toast';

const PIE_COLORS = ['#22c55e', '#f59e0b', '#f97316', '#6b7280'];

const KpiCard = ({ label, value, icon, iconBg, iconColor, sub, subColor }) => (
  <div className="metric-card bg-white p-stack-md rounded-xl shadow-card border border-white">
    <div className="flex items-center justify-between mb-4">
      <span className={`p-2 ${iconBg} ${iconColor} rounded-lg material-symbols-outlined`}>{icon}</span>
      {sub && <span className={`font-data-numeric text-data-numeric ${subColor}`}>{sub}</span>}
    </div>
    <h3 className="text-on-surface-variant font-label-caps text-label-caps uppercase tracking-wider">{label}</h3>
    <p className="font-headline-lg text-headline-lg mt-1" style={{ fontFamily: 'Geist, sans-serif' }}>{value ?? '—'}</p>
  </div>
);

const ChartCard = ({ title, children }) => (
  <div className="bg-white rounded-3xl shadow-card border border-white p-6">
    <h2 className="font-headline-md text-headline-md mb-5" style={{ fontFamily: 'Geist, sans-serif' }}>{title}</h2>
    {children}
  </div>
);

const Analytics = () => {
  const [stats, setStats] = useState(null);
  const [trend, setTrend] = useState([]);
  const [vehicleStatus, setVehicleStatus] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      analyticsService.getStats(),
      analyticsService.getDeliveryTrend(),
      analyticsService.getVehicleStatus(),
    ])
      .then(([s, t, v]) => { setStats(s.data); setTrend(t.data); setVehicleStatus(v.data); })
      .catch(() => toast.error('Failed to load analytics'))
      .finally(() => setLoading(false));
  }, []);

  const kpis = [
    { label: 'Deliveries Today',   value: stats?.deliveriesToday,    icon: 'local_shipping',   iconBg: 'bg-emerald-100', iconColor: 'text-emerald-700', sub: 'Today',   subColor: 'text-emerald-600' },
    { label: 'Active Deliveries',  value: stats?.activeDeliveries,   icon: 'directions_car',   iconBg: 'bg-blue-100',    iconColor: 'text-blue-700',    sub: 'Live',    subColor: 'text-blue-600' },
    { label: 'Delayed Shipments',  value: stats?.delayedDeliveries,  icon: 'warning',          iconBg: 'bg-red-100',     iconColor: 'text-red-700',     sub: 'Alert',   subColor: 'text-red-600' },
    { label: 'Fleet Utilization',  value: stats ? `${stats.vehicleUtilization}%` : '—', icon: 'speed', iconBg: 'bg-amber-100', iconColor: 'text-amber-700', sub: 'Capacity', subColor: 'text-amber-600' },
    { label: 'Total Vehicles',     value: stats?.totalVehicles,      icon: 'garage',           iconBg: 'bg-surface-container-highest', iconColor: 'text-primary', sub: 'Fleet', subColor: 'text-on-surface-variant' },
    { label: 'Active Vehicles',    value: stats?.activeVehicles,     icon: 'electric_car',     iconBg: 'bg-indigo-100',  iconColor: 'text-indigo-700',  sub: 'On Road', subColor: 'text-indigo-600' },
    { label: 'Total Drivers',      value: stats?.totalDrivers,       icon: 'person',           iconBg: 'bg-purple-100',  iconColor: 'text-purple-700',  sub: 'Registered', subColor: 'text-purple-600' },
    { label: 'Completed Total',    value: stats?.completedDeliveries,icon: 'check_circle',     iconBg: 'bg-emerald-100', iconColor: 'text-emerald-700', sub: 'All time', subColor: 'text-emerald-600' },
  ];

  if (loading) return (
    <div>
      <div className="mb-stack-lg">
        <div className="h-8 w-48 bg-surface-container rounded-xl animate-pulse mb-2" />
        <div className="h-4 w-32 bg-surface-container rounded-xl animate-pulse" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-gutter mb-stack-lg">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl shadow-card p-stack-md h-28 animate-pulse" />
        ))}
      </div>
    </div>
  );

  return (
    <div>
      <div className="mb-stack-lg">
        <h1 className="font-headline-md text-headline-md text-on-surface" style={{ fontFamily: 'Geist, sans-serif' }}>
          Analytics
        </h1>
        <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">Fleet performance overview</p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-gutter mb-stack-lg">
        {kpis.map((k) => <KpiCard key={k.label} {...k} />)}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter mb-stack-lg">

        {/* Bar Chart — spans 2 cols */}
        <div className="lg:col-span-2">
          <ChartCard title="Delivery Trend — Last 7 Days">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={trend} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ededf9" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 11, fontFamily: 'JetBrains Mono', fill: '#434655' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fontFamily: 'JetBrains Mono', fill: '#434655' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e1e2ed', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', fontFamily: 'Inter' }}
                  cursor={{ fill: '#ededf9' }}
                />
                <Legend wrapperStyle={{ fontFamily: 'JetBrains Mono', fontSize: '11px' }} />
                <Bar dataKey="delivered" fill="#22c55e" radius={[6, 6, 0, 0]} name="Delivered" />
                <Bar dataKey="delayed"   fill="#ef4444" radius={[6, 6, 0, 0]} name="Delayed" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Pie Chart */}
        <ChartCard title="Vehicle Status">
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={vehicleStatus} dataKey="count" nameKey="status"
                cx="50%" cy="50%" outerRadius={85} innerRadius={45}
                paddingAngle={3}>
                {vehicleStatus.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ borderRadius: '12px', border: '1px solid #e1e2ed', fontFamily: 'Inter' }}
              />
              <Legend wrapperStyle={{ fontFamily: 'JetBrains Mono', fontSize: '11px' }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Line Chart — full width */}
      <ChartCard title="Delivery Performance Trend">
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={trend}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ededf9" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 11, fontFamily: 'JetBrains Mono', fill: '#434655' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fontFamily: 'JetBrains Mono', fill: '#434655' }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ borderRadius: '12px', border: '1px solid #e1e2ed', fontFamily: 'Inter' }}
            />
            <Legend wrapperStyle={{ fontFamily: 'JetBrains Mono', fontSize: '11px' }} />
            <Line type="monotone" dataKey="delivered" stroke="#22c55e" strokeWidth={2.5} dot={{ r: 4, fill: '#22c55e' }} name="Delivered" />
            <Line type="monotone" dataKey="delayed"   stroke="#ef4444" strokeWidth={2.5} dot={{ r: 4, fill: '#ef4444' }} name="Delayed" />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
};

export default Analytics;
