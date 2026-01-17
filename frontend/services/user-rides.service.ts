"use client";

import axios from 'axios';
import { CreateRideDto } from '@/types/booking.types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1000';

export const RidesService = {
  getUserRides: async () => {

    
    try {
      const response = await axios.get(`${API_BASE_URL}/rides`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching user rides:', error);
      throw error;
    }
  },

  getUpcomingRides: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/rides/upcoming`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching upcoming rides:', error);
      throw error;
    }
  },

  createRide: async (data: CreateRideDto) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/rides`, data, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error creating ride:', error);
      throw error;
    }
  },

  getRideDetails: async (rideId: number) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/rides/${rideId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching ride details:', error);
      throw error;
    }
  },

  cancelRide: async (rideId: number) => {
    try {
      const response = await axios.patch(
        `${API_BASE_URL}/rides/${rideId}/cancel`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error cancelling ride:', error);
      throw error;
    }
  }
};