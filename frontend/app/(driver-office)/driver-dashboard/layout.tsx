import DriverDashboardLayout from '@/components/dashboard/driver/driver-dashboard-layout';

interface DriverLayoutProps {
  children: React.ReactNode;
}

export default function DriverLayout({ children }: DriverLayoutProps) {
  return <DriverDashboardLayout>{children}</DriverDashboardLayout>;
}