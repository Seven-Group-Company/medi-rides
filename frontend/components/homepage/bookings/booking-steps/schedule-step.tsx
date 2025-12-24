'use client';

import { motion } from 'framer-motion';
import { Calendar, Clock, DollarSign, ChevronLeft, ChevronRight, Loader, Check } from 'lucide-react';
import { GuestBookingService } from '@/services/guest-booking.service';
import { useState, useEffect, useRef } from 'react';
import { BookingStepProps } from '@/types/guest-booking-types';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { EventInput, DateSelectArg, EventClickArg } from '@fullcalendar/core';

export default function ScheduleStep({
  formData,
  updateFormData,
  onPrev,
  onNext,
  isSubmitting,
  errors,
  categories,
}: BookingStepProps) {
  const [isCalculatingPrice, setIsCalculatingPrice] = useState(false);
  const [existingBookings, setExistingBookings] = useState<EventInput[]>([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [bookedDates, setBookedDates] = useState<string[]>([]);
  const calendarRef = useRef<FullCalendar>(null);
  
  // Calculate minimum date (today)
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  
  // Calculate maximum date (3 months from now)
  const maxDate = new Date();
  maxDate.setMonth(maxDate.getMonth() + 3);
  const maxDateStr = maxDate.toISOString().split('T')[0];

  useEffect(() => {
  const fetchExistingBookings = async () => {
    if (!formData.serviceCategoryId) {
      return;
    }

    setIsLoadingBookings(true);
    try {
      // Fetch ALL bookings for this service category (global availability)
      const bookings = await GuestBookingService.getExistingBookings(
        formData.passengerPhone || 'guest', // Pass phone or default
        formData.serviceCategoryId
      );
      
      // Convert bookings to FullCalendar events
      const events = bookings.map(booking => ({
        start: `${booking.date}T${booking.time}`,
        end: addHoursToTime(`${booking.date}T${booking.time}`, 2),
        textColor: '#ffffff',
        display: 'background',
        extendedProps: {
          status: booking.status,
        }
      }));
      
      // Extract just the dates that are booked (by anyone)
      const dates = bookings.map(booking => booking.date);
      setBookedDates(dates);
      setExistingBookings(events);
      
      // Clear selected date if it's already booked
      if (formData.date && dates.includes(formData.date)) {
        updateFormData({ date: '', time: '' });
        setSelectedDate(null);
      }
    } catch (error) {
      console.error('Failed to fetch existing bookings:', error);
    } finally {
      setIsLoadingBookings(false);
    }
  };

  fetchExistingBookings();
}, [formData.serviceCategoryId, formData.passengerPhone]);

  // Calculate price when form data changes
  useEffect(() => {
    const calculatePrice = async () => {
      if (!formData.serviceCategoryId || !formData.distanceMiles || formData.distanceMiles === 0 || !formData.date || !formData.time) {
        return;
      }

      setIsCalculatingPrice(true);
      try {
        const price = await GuestBookingService.calculateEstimatedPrice(
          formData.serviceCategoryId,
          formData.distanceMiles,
          formData.date,
          formData.time
        );
        updateFormData({ estimatedPrice: price });
      } catch (error) {
        console.error('Failed to calculate price:', error);
      } finally {
        setIsCalculatingPrice(false);
      }
    };

    const timer = setTimeout(() => {
      calculatePrice();
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.serviceCategoryId, formData.distanceMiles, formData.date, formData.time, updateFormData]);


const handleDateSelect = (selectInfo: DateSelectArg) => {
  const selectedDateStr = selectInfo.startStr.split('T')[0];
  const selectedTimeStr = selectInfo.startStr.split('T')[1]?.substring(0, 5) || '09:00';
  
  if (bookedDates.includes(selectedDateStr)) {
    alert('This date is fully booked. We provide one ride per day. Please select a different date.');
    selectInfo.view.calendar.unselect();
    return;
  }

  setSelectedDate(selectedDateStr);
  updateFormData({ 
    date: selectedDateStr,
    time: selectedTimeStr 
  });
  
  selectInfo.view.calendar.unselect();
};

const handleDateChange = (value: string) => {
  if (bookedDates.includes(value)) {
    alert('This date is fully booked. We provide one ride per day. Please select a different date.');
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

  // Helper function to add hours to time
  const addHoursToTime = (dateTimeStr: string, hours: number): string => {
    const date = new Date(dateTimeStr);
    date.setHours(date.getHours() + hours);
    return date.toISOString();
  };

  // Check if a date is booked
  const isDateBooked = (dateStr: string): boolean => {
    return bookedDates.includes(dateStr);
  };

  // Find selected service
  const selectedService = categories.find(cat => cat.id === formData.serviceCategoryId);

  // Format date for display
  const formatSelectedDate = (dateStr: string) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Custom day cell content renderer
  const dayCellContent = (info: any) => {
    const dateStr = info.date.toISOString().split('T')[0];
    const isToday = dateStr === todayStr;
    const isBooked = bookedDates.includes(dateStr);
    const isSelected = selectedDate === dateStr;
    
    return (
      <div className="relative h-full w-full flex items-center justify-center">
        <div 
          className={`
            w-8 h-8 flex items-center justify-center rounded-full text-sm
            ${isToday ? 'bg-blue-100 text-blue-600 font-medium' : ''}
            ${isBooked ? 'bg-red-100 text-red-600 line-through' : ''}
            ${isSelected ? 'bg-blue-600 text-white font-medium' : ''}
            ${!isBooked && !isSelected && !isToday ? 'hover:bg-gray-100' : ''}
          `}
        >
          {info.dayNumberText}
        </div>
        {isSelected && !isBooked && (
          <Check className="absolute top-0 right-0 w-4 h-4 text-blue-600" />
        )}
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Schedule Your Ride</h2>
        <p className="text-gray-600 text-sm">Select an available date and time for your ride</p>
      </div>

      <div className="space-y-4">
        {/* Error Message */}
        {errors.date && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="bg-red-50 border border-red-100 rounded-xl p-3 mb-4"
          >
            <p className="text-red-700 text-sm text-center">{errors.date}</p>
          </motion.div>
        )}

        {errors.time && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="bg-red-50 border border-red-100 rounded-xl p-3 mb-4"
          >
            <p className="text-red-700 text-sm text-center">{errors.time}</p>
          </motion.div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Right Column - Calendar */}
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                Select from Calendar
              </label>
              <div className="bg-white border-2 border-gray-200 rounded-xl p-4">
                {isLoadingBookings ? (
                  <div className="flex items-center justify-center h-64">
                    <Loader className="w-8 h-8 animate-spin text-blue-600" />
                    <span className="ml-2 text-gray-600">Loading calendar...</span>
                  </div>
                ) : (
                  <div className="h-96">
                    <FullCalendar
                      ref={calendarRef}
                      plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                      initialView="dayGridMonth"
                      headerToolbar={{
                        left: 'prev,next',
                        center: 'title',
                        right: ''
                      }}
                      selectable={true}
                      selectMirror={true}
                      dayMaxEvents={true}
                      weekends={true}
                      events={existingBookings}
                      select={handleDateSelect}
                      eventClick={(clickInfo: EventClickArg) => {
                        alert(`This date is already booked (Status: ${clickInfo.event.extendedProps.status})`);
                      }}
                      validRange={{
                        start: todayStr,
                        end: maxDateStr
                      }}
                      dayCellContent={dayCellContent}
                      height="100%"
                      selectConstraint={{
                        start: todayStr,
                        end: maxDateStr
                      }}
                      businessHours={{
                        daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
                        startTime: '06:00',
                        endTime: '23:00',
                      }}
                      eventTimeFormat={{
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true
                      }}
                      dayCellClassNames={(info) => {
                        const dateStr = info.date.toISOString().split('T')[0];
                        const classes = [];
                        if (bookedDates.includes(dateStr)) {
                          classes.push('bg-red-50', 'opacity-50');
                        }
                        if (selectedDate === dateStr && !bookedDates.includes(dateStr)) {
                          classes.push('selected-date');
                        }
                        return classes;
                      }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Calendar Legend */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-gray-700">Calendar Legend</p>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-blue-600 mr-2"></div>
                  <span className="text-xs text-gray-600">Selected</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-red-100 mr-2"></div>
                  <span className="text-xs text-gray-600">Booked</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-blue-100 mr-2"></div>
                  <span className="text-xs text-gray-600">Today</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 border border-gray-300 rounded-full mr-2"></div>
                  <span className="text-xs text-gray-600">Available</span>
                </div>
              </div>
            </div>

            {/* Booking Statistics */}
            {bookedDates.length > 0 && (
              <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
                <p className="text-xs font-medium text-amber-800 mb-1">
                  <span className="font-bold">{bookedDates.length}</span> date{bookedDates.length > 1 ? 's' : ''} already booked
                </p>
                <p className="text-xs text-amber-700">
                  {formData.passengerPhone 
                    ? `You have existing bookings for this service`
                    : `Some dates are unavailable for this service`}
                </p>
              </div>
            )}
          </div>

          {/* Left Column - Form Inputs */}
          <div className="lg:col-span-2 space-y-6">
            {/* Date and Time Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  Date *
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleDateChange(e.target.value)}
                    min={todayStr}
                    max={maxDateStr}
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all duration-300"
                  />
                  {formData.date && bookedDates.includes(formData.date) && (
                    <div className="absolute inset-0 bg-red-50 border-2 border-red-200 rounded-xl flex items-center justify-center">
                      <span className="text-red-600 text-sm font-medium">Already Booked</span>
                    </div>
                  )}
                </div>
              </div> */}

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  Time *
                </label>
                <div className="relative">
                  <input
                    type="time"
                    value={formData.time}
                    onChange={(e) => handleTimeChange(e.target.value)}
                    min="06:00"
                    max="23:00"
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all duration-300"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Service hours: 6:00 AM - 11:00 PM
                  </p>
                </div>
              </div>
            </div>

            {/* Selected Date Display */}
            {formData.date && !bookedDates.includes(formData.date) && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center text-sm text-blue-700 font-medium mb-1">
                      <Calendar className="w-4 h-4 mr-2" />
                      Selected Date & Time
                    </div>
                    <div className="text-lg font-bold text-gray-900">
                      {formatSelectedDate(formData.date)}
                    </div>
                    <div className="text-gray-600">
                      at {formData.time || '--:--'}
                    </div>
                  </div>
                  <div className="bg-blue-100 rounded-full p-2">
                    <Check className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>
            )}

            {/* Selected Service Info
            {selectedService && (
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                    <DollarSign className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{selectedService.name}</div>
                    <div className="text-sm text-gray-600 mt-1">
                      {formData.date && formData.time ? (
                        <>
                          Estimated price: 
                          {isCalculatingPrice ? (
                            <span className="ml-2 inline-flex items-center">
                              <Loader className="w-3 h-3 animate-spin mr-1" />
                              calculating...
                            </span>
                          ) : (
                            <span className="font-bold text-blue-600 ml-2">
                              ${formData.estimatedPrice?.toFixed(2) || '0.00'}
                            </span>
                          )}
                        </>
                      ) : (
                        'Select date and time to see estimated price'
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )} */}

            {/* Additional Notes */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Additional Notes (Optional)
              </label>
              <textarea
                rows={3}
                value={formData.notes || ''}
                onChange={(e) => handleNotesChange(e.target.value)}
                placeholder="Any special requirements, medical equipment, or notes for the driver..."
                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all duration-300 resize-none placeholder-gray-400"
              />
              <p className="text-xs text-gray-500">
                Let us know if you have any special requirements or instructions for the driver.
              </p>
            </div>
          </div>

                  </div>

        {/* Warning if trying to book on already booked date */}
{formData.date && bookedDates.includes(formData.date) && (
  <div className="bg-red-50 border border-red-200 rounded-xl p-4">
    <div className="flex items-start">
      <div className="flex-shrink-0">
        <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
      </div>
      <div className="ml-3">
        <h3 className="text-sm font-medium text-red-800">
          Date Already Booked
        </h3>
        <div className="mt-2 text-sm text-red-700">
          <p>
            You already have a booking on this date. Our policy allows only one booking per date. 
            Please select a different date from the calendar.
          </p>
        </div>
      </div>
    </div>
  </div>
)}

        {/* Navigation Buttons */}
        <div className="flex gap-3 pt-4">
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={onPrev}
            disabled={isSubmitting}
            className="flex-1 bg-white border border-gray-300 text-gray-700 py-3 rounded-xl font-semibold hover:border-blue-300 hover:bg-blue-50 transition-all duration-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-5 h-5 mr-2" />
            Back
          </motion.button>
          
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={onNext}
            disabled={isSubmitting || !formData.date || !formData.time || bookedDates.includes(formData.date)}
            className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center"
          >
            {isSubmitting ? (
              <>
                <Loader className="w-5 h-5 animate-spin mr-2" />
                Loading...
              </>
            ) : bookedDates.includes(formData.date) ? (
              'Date Already Booked'
            ) : (
              <>
                Review Booking
                <ChevronRight className="w-5 h-5 ml-2" />
              </>
            )}
          </motion.button>
        </div>
      </div>

      <style jsx global>{`
        .fc {
          height: 100%;
        }
        
        .fc .fc-view {
          height: 100% !important;
        }
        
        .fc .fc-daygrid-day.fc-day-today {
          background-color: #dbeafe;
        }
        
        .fc .fc-daygrid-day.selected-date {
          background-color: #eff6ff;
        }
        
        .fc .fc-daygrid-day-number {
          font-size: 0.875rem;
          padding: 2px;
        }
        
        .fc .fc-col-header-cell {
          font-size: 0.75rem;
          padding: 4px 2px;
        }
        
        .fc .fc-toolbar-title {
          font-size: 1rem;
          font-weight: 600;
        }
        
        .fc .fc-button {
          font-size: 0.75rem;
          padding: 4px 8px;
        }
        
        .fc .fc-daygrid-day {
          cursor: pointer;
        }
        
        .fc .fc-daygrid-day.fc-day-disabled {
          background-color: #f3f4f6;
          cursor: not-allowed;
        }
        
        .fc-event {
          cursor: not-allowed;
        }
        
        .fc-h-event {
          border: none;
          background-color: #fecaca;
        }
      `}</style>
    </motion.div>
  );
}