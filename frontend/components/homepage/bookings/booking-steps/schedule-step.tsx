'use client';

import { motion } from 'framer-motion';
import { Calendar, Clock, ChevronLeft, ChevronRight, Loader, Check } from 'lucide-react';
import { GuestBookingService } from '@/services/guest-booking.service';
import { useState, useEffect, useRef } from 'react';
import { BookingStepProps } from '@/types/guest-booking-types';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';

export default function ScheduleStep({
  formData,
  updateFormData,
  onPrev,
  onNext,
  isSubmitting,
  errors,
}: BookingStepProps) {
  const [existingBookings, setExistingBookings] = useState<any[]>([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [bookedDates, setBookedDates] = useState<string[]>([]);
  
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  
  const maxDate = new Date();
  maxDate.setMonth(maxDate.getMonth() + 3);
  const maxDateStr = maxDate.toISOString().split('T')[0];

  useEffect(() => {
    const fetchExistingBookings = async () => {
      if (!formData.serviceCategoryId) return;

      setIsLoadingBookings(true);
      try {
        const bookings = await GuestBookingService.getExistingBookings(
          formData.passengerPhone || 'guest',
          formData.serviceCategoryId
        );
        
        const dates = bookings.map(booking => booking.date);
        setBookedDates(dates);
        
        if (formData.date && dates.includes(formData.date)) {
          updateFormData({ date: '', time: '' });
          setSelectedDate(null);
        }
      } catch (error) {
        console.error('Failed to load bookings:', error);
      } finally {
        setIsLoadingBookings(false);
      }
    };

    fetchExistingBookings();
  }, [formData.serviceCategoryId, formData.passengerPhone]);

  const handleDateChange = (value: string) => {
    if (bookedDates.includes(value)) {
      alert('Date already booked. Select another.');
      updateFormData({ date: '', time: '' });
      setSelectedDate(null);
      return;
    }
    setSelectedDate(value);
    updateFormData({ date: value });
  };

  const handleTimeChange = (value: string) => {
    updateFormData({ time: value });
  };

  const handleNotesChange = (value: string) => {
    updateFormData({ notes: value });
  };

  const formatSelectedDate = (dateStr: string) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-4"
    >
      <div className="text-center mb-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Schedule</h2>
        <p className="text-xs text-gray-600">Pick date & time</p>
      </div>

      <div className="space-y-3">
        {errors.date && (
          <div className="bg-red-50 border border-red-100 rounded-lg p-2">
            <p className="text-red-700 text-xs text-center">{errors.date}</p>
          </div>
        )}

        {errors.time && (
          <div className="bg-red-50 border border-red-100 rounded-lg p-2">
            <p className="text-red-700 text-xs text-center">{errors.time}</p>
          </div>
        )}

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-700 flex items-center">
              <Calendar className="w-3 h-3 mr-1" />
              Date *
            </label>
            <div className="relative">
              <input
                type="date"
                value={formData.date}
                onChange={(e) => handleDateChange(e.target.value)}
                min={todayStr}
                max={maxDateStr}
                className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-200 outline-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-700 flex items-center">
              <Clock className="w-3 h-3 mr-1" />
              Time *
            </label>
            <input
              type="time"
              value={formData.time}
              onChange={(e) => handleTimeChange(e.target.value)}
              min="06:00"
              max="23:00"
              className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-200 outline-none"
              required
            />
            <p className="text-xs text-gray-500">
              Hours: 6:00 AM - 11:00 PM
            </p>
          </div>

          {formData.date && !bookedDates.includes(formData.date) && (
            <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-blue-700 font-medium mb-1">Selected</div>
                  <div className="text-sm font-semibold text-gray-900">
                    {formatSelectedDate(formData.date)}
                  </div>
                  <div className="text-xs text-gray-600">
                    at {formData.time || '--:--'}
                  </div>
                </div>
                <div className="bg-blue-100 rounded-full p-1.5">
                  <Check className="w-4 h-4 text-blue-600" />
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="block text-xs font-medium text-gray-700">
              Notes (Optional)
            </label>
            <textarea
              rows={2}
              value={formData.notes || ''}
              onChange={(e) => handleNotesChange(e.target.value)}
              placeholder="Special requirements or instructions..."
              className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-200 outline-none resize-none placeholder-gray-400"
            />
            <p className="text-xs text-gray-500">
              Let driver know about special needs
            </p>
          </div>
        </div>

        {formData.date && bookedDates.includes(formData.date) && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-4 w-4 text-red-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-2">
                <h3 className="text-xs font-medium text-red-800">
                  Already Booked
                </h3>
                <p className="text-xs text-red-700 mt-0.5">
                  One booking per date allowed. Pick another date.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={onPrev}
            disabled={isSubmitting}
            className="flex-1 bg-white border border-gray-300 text-gray-700 py-2.5 rounded-lg font-medium text-sm hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 flex items-center justify-center disabled:opacity-50"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back
          </motion.button>
          
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={onNext}
            disabled={isSubmitting || !formData.date || !formData.time || bookedDates.includes(formData.date)}
            className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg font-medium text-sm shadow hover:shadow-md disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
          >
            {isSubmitting ? (
              <>
                <Loader className="w-4 h-4 animate-spin mr-1" />
                Loading...
              </>
            ) : bookedDates.includes(formData.date) ? (
              'Date Booked'
            ) : (
              <>
                Review
                <ChevronRight className="w-4 h-4 ml-1" />
              </>
            )}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}