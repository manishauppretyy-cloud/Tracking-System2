const statusColors = {
  ACTIVE: 'bg-emerald-100 text-emerald-700',
  IDLE: 'bg-amber-100 text-amber-700',
  MAINTENANCE: 'bg-orange-100 text-orange-700',
  OFFLINE: 'bg-gray-100 text-gray-600',
  PENDING: 'bg-blue-100 text-blue-700',
  IN_TRANSIT: 'bg-indigo-100 text-indigo-700',
  DELIVERED: 'bg-emerald-100 text-emerald-700',
  DELAYED: 'bg-red-100 text-red-700',
  CANCELLED: 'bg-gray-100 text-gray-600',
};

const StatusBadge = ({ status }) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium font-mono ${statusColors[status] || 'bg-gray-100 text-gray-600'}`}>
    {status?.replace('_', ' ')}
  </span>
);

export default StatusBadge;
