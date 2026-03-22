import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Timeline Manager',
  description: 'Project timeline management with Gantt chart, team management, and leave requests',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-surface text-gray-200 font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
