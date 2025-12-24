// Upcoming Rides Component
import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Car, 
  User, 
  Phone,
  MoreVertical,
  CheckCircle,
  Navigation,
  ArrowRight,
  ChevronRight
} from 'lucide-react';
import { RideHistory } from '@/types/ride-history.types';
import { format } from 'date-fns';

interface UpcomingRidesProps {
  rides: RideHistory[];
  loading: boolean;
  error: string | null;
}

const statusConfig = {
  PENDING: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  CONFIRMED: { label: 'Confirmed', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  ASSIGNED: { label: 'Assigned', color: 'bg-blue-100 text-blue-800', icon: User },
  DRIVER_EN_ROUTE: { label: 'On the way', color: 'bg-purple-100 text-purple-800', icon: Navigation },
  DEFAULT: { label: 'Scheduled', color: 'bg-gray-100 text-gray-800', icon: Calendar }
};

const formatDateTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const rideDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  let dayString = format(date, 'MMM d');
  if (rideDate.getTime() === today.getTime()) {
    dayString = 'Today';
  } else if (rideDate.getTime() === tomorrow.getTime()) {
    dayString = 'Tomorrow';
  }

  const timeString = format(date, 'h:mm a');
  return `${dayString}, ${timeString}`;
};

export const UpcomingRides = ({ rides, loading, error }: UpcomingRidesProps) => {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
        <div className="animate-pulse space-y-6">
          <div className="h-6 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="h-32 bg-gray-100 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="w-8 h-8 bg-red-500 rounded-full"></div>
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Error loading rides</h3>
          <p className="text-sm text-gray-600 mb-4">{error}</p>
          <button className="text-sm font-medium text-[#0A2342] hover:text-[#9BC9FF] transition-colors">
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (rides.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200 text-center">
        <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <Calendar className="w-10 h-10 text-blue-500" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-3">No upcoming rides</h3>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          You don't have any upcoming rides scheduled. Book your first ride to get started!
        </p>
        <Link
          href="/customer-dashboard/book-ride"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-[#0A2342] to-[#1a365d] text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transition-all duration-200"
        >
          Book Your First Ride
          <ArrowRight className="w-5 h-5" />
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Upcoming Rides
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Your scheduled transportation services
            </p>
          </div>
          <Link 
            href="/customer-dashboard/ride-history"
            className="inline-flex items-center gap-1 text-sm font-medium text-[#0A2342] hover:text-[#9BC9FF] transition-colors"
          >
            View all
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      <div className="divide-y divide-gray-100">
        {rides.map((ride, index) => {
          const status = statusConfig[ride.status as keyof typeof statusConfig] || statusConfig.DEFAULT;
          const StatusIcon = status.icon;
          
          return (
            <motion.div
              key={ride.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-6 hover:bg-gray-50/50 transition-colors group"
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
                    <Calendar className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">
                      {formatDateTime(ride.scheduledAt)}
                    </h3>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${status.color}`}>
                        <StatusIcon className="w-3 h-3" />
                        {status.label}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">
                    ${ride.finalPrice?.toFixed(2) || '0.00'}
                  </p>
                  <p className="text-sm text-gray-600">Total fare</p>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mt-1">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-500">Pickup Location</p>
                    <p className="text-gray-900 font-medium">{ride.pickup}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-100 flex items-center justify-center mt-1">
                    <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-500">Drop-off Location</p>
                    <p className="text-gray-900 font-medium">{ride.dropoff}</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-6 border-t border-gray-200">
                <div className="flex flex-wrap gap-4">
                  <span className="inline-flex items-center gap-1.5 text-sm text-gray-600 bg-gray-100 px-3 py-1.5 rounded-lg">
                    <Car className="w-4 h-4" />
                    {ride.serviceType}
                  </span>
                  {ride.distance && (
                    <span className="inline-flex items-center gap-1.5 text-sm text-gray-600 bg-gray-100 px-3 py-1.5 rounded-lg">
                      <Navigation className="w-4 h-4" />
                      {ride.distance.toFixed(1)} miles
                    </span>
                  )}
                </div>
                
                {ride.driver && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-medium">
                      {ride.driver.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{ride.driver.name}</p>
                      <p className="text-xs text-gray-600">Assigned driver</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};