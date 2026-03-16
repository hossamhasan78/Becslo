import { ReactNode } from 'react';
import Navigation from '@/components/admin/Navigation';

export default function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="p-6">
        {children}
      </main>
    </div>
  );
}
