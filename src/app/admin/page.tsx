import Link from 'next/link';

const cards = [
  {
    title: 'Analytics',
    description: 'View pricing statistics and trends',
    href: '/admin/analytics',
    icon: '📈',
  },
  {
    title: 'Services',
    description: 'Manage available services',
    href: '/admin/services',
    icon: '🔧',
  },
  {
    title: 'Configuration',
    description: 'Edit pricing parameters',
    href: '/admin/config',
    icon: '⚙️',
  },
  {
    title: 'Calculations',
    description: 'View client calculations',
    href: '/admin/calculations',
    icon: '🧮',
  },
];

export default function AdminPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="block p-6 bg-white rounded-lg border border-gray-200 hover:border-blue-400 hover:shadow-md transition-all"
          >
            <div className="text-3xl mb-3">{card.icon}</div>
            <h2 className="text-lg font-medium text-gray-900">{card.title}</h2>
            <p className="mt-1 text-sm text-gray-500">{card.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
