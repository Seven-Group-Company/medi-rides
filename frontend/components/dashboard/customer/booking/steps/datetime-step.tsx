'use client';

import { motion } from 'framer-motion';
import { Calendar, Clock, AlertCircle, Check } from 'lucide-react';
import { BookingStepProps } from '@/types/booking.types';
import { useState, useEffect } from 'react';

export default function DateTimeStep({ 
  formData, 
  updateFormData, 
  errors, 
  onNext, 
  onBack,
  bookedDates = [] // Add this prop
}: BookingStepProps & { bookedDates?: string[] }) {
  
  const [selectedDate, setSelectedDate] = useState<string | null>(formData.date || null);
  const [bookedDatesSet, setBookedDatesSet] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (bookedDates) {
      setBookedDatesSet(new Set(bookedDates));
    }
  }, [bookedDates]);

  const handleDateChange = (date: string) => {
    // Check if date is already booked
    if (bookedDatesSet.has(date)) {
      alert('This date already has a booking. Please select a different date.');
      return;
    }
    
    setSelectedDate(date);
    updateFormData({ date });
  };

  const handleTimeChange = (time: string) => {
    updateFormData({ time });
  };

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  
  // Calculate maximum date (3 months from now)
  const maxDate = new Date();
  maxDate.setMonth(maxDate.getMonth() + 3);
  const maxDateStr = maxDate.toISOString().split('T')[0];

  // Generate next 30 days for calendar view
  const generateCalendarDays = () => {
    const days = [];
    const currentDate = new Date(today);
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(currentDate);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      const isToday = dateStr === todayStr;
      const isBooked = bookedDatesSet.has(dateStr);
      const isSelected = selectedDate === dateStr;
      
      days.push({
        date: date,
        dateStr,
        day: date.getDate(),
        month: date.getMonth(),
        year: date.getFullYear(),
        isToday,
        isBooked,
        isSelected,
        isPast: date < today,
        isAvailable: !isBooked && date >= today,
      });
    }
    
    return days;
  };

  const calendarDays = generateCalendarDays();
  
  // Format date for display
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-8"
    >
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-3">Schedule Your Ride</h2>
        <p className="text-gray-600 mb-6">Select your preferred date and time</p>
      </div>

      {/* Calendar View */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-gray-900">Select Date</h3>
          </div>
          <div className="text-sm text-gray-500">
            {selectedDate ? formatDate(selectedDate) : 'No date selected'}
          </div>
        </div>

        {/* Date Picker */}
        <div className="mb-4">
          <input
            type="date"
            value={formData.date || ''}
            onChange={(e) => handleDateChange(e.target.value)}
            min={todayStr}
            max={maxDateStr}
            className={`w-full p-4 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
              errors.date ? 'border-red-500' : 'border-gray-200'
            }`}
          />
          {errors.date && (
            <p className="text-sm text-red-600 mt-2">{errors.date}</p>
          )}
        </div>

        {/* Quick Calendar Grid */}
        <div className="mb-6">
          <div className="grid grid-cols-7 gap-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
                {day}
              </div>
            ))}
            
            {calendarDays.map((day) => (
              <button
                key={day.dateStr}
                type="button"
                onClick={() => day.isAvailable && handleDateChange(day.dateStr)}
                disabled={!day.isAvailable}
                className={`
                  p-2 rounded-lg text-sm font-medium transition-all
                  ${day.isSelected ? 'bg-blue-600 text-white' : ''}
                  ${day.isToday && !day.isSelected ? 'bg-blue-100 text-blue-600 border border-blue-200' : ''}
                  ${day.isBooked ? 'bg-red-50 text-red-400 line-through cursor-not-allowed' : ''}
                  ${!day.isSelected && !day.isToday && !day.isBooked && day.isAvailable 
                    ? 'hover:bg-gray-100 hover:border-gray-300 border border-transparent' 
                    : ''}
                  ${!day.isAvailable ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                <div className="flex flex-col items-center">
                  <span>{day.day}</span>
                  {day.isSelected && !day.isBooked && (
                    <Check className="w-3 h-3 mt-1" />
                  )}
                  {day.isBooked && (
                    <AlertCircle className="w-3 h-3 mt-1" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Time Selection */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2 mb-4">
            <Clock className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-gray-900">Select Time</h3>
          </div>
          
          <input
            type="time"
            value={formData.time || ''}
            onChange={(e) => handleTimeChange(e.target.value)}
            min="06:00"
            max="23:00"
            className={`w-full p-4 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
              errors.time ? 'border-red-500' : 'border-gray-200'
            }`}
          />
          {errors.time && (
            <p className="text-sm text-red-600 mt-2">{errors.time}</p>
          )}
        </div>

        {/* Time Suggestions */}
        <div className="mt-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Popular Time Slots</h4>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {['08:00', '10:00', '12:00', '14:00', '16:00', '18:00'].map((time) => (
              <button
                key={time}
                type="button"
                onClick={() => handleTimeChange(time)}
                className={`p-3 rounded-lg border transition-colors ${
                  formData.time === time
                    ? 'border-blue-500 bg-blue-50 text-blue-600'
                    : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                }`}
              >
                {time}
              </button>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-center space-x-4 text-xs">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-600 rounded-sm mr-1"></div>
              <span className="text-gray-600">Selected</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-red-50 border border-red-200 rounded-sm mr-1"></div>
              <span className="text-gray-600">Booked</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-100 border border-blue-200 rounded-sm mr-1"></div>
              <span className="text-gray-600">Today</span>
            </div>
          </div>
        </div>
      </div>

      {/* Warning if trying to book on already booked date */}
      {formData.date && bookedDatesSet.has(formData.date) && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                This date is already booked
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>
                  You already have a ride scheduled on {formatDate(formData.date)}. 
                  Please select a different date.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pt-8 border-t border-gray-200">
        <motion.button
          type="button"
          onClick={onBack}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="py-3.5 px-6 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors duration-200 sm:flex-1"
        >
          Back
        </motion.button>
        
        <motion.button
          type="button"
          onClick={onNext}
          disabled={!formData.date || !formData.time || bookedDatesSet.has(formData.date)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`py-3.5 px-6 text-white rounded-xl font-medium transition-colors duration-200 sm:flex-1 ${
            bookedDatesSet.has(formData.date)
              ? 'bg-red-500 hover:bg-red-600 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {bookedDatesSet.has(formData.date) ? 'Date Already Booked' : 'Continue to Review'}
        </motion.button>
      </div>
    </motion.div>
  );
}