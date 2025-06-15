import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LocationData, LocationsByDate, TrackingSettings } from '@/types/location';

interface LocationState {
  // Current location data
  currentLocation: LocationData | null;
  setCurrentLocation: (location: LocationData) => void;
  
  // Historical location data organized by date
  locationsByDate: LocationsByDate;
  addLocation: (location: LocationData) => void;
  clearLocations: () => void;
  clearLocationsByDate: (date: string) => void;
  
  // Tracking settings
  trackingSettings: TrackingSettings;
  updateTrackingSettings: (settings: Partial<TrackingSettings>) => void;
  
  // Selected date for filtering
  selectedDate: string | null;
  setSelectedDate: (date: string | null) => void;
}

// Format date as YYYY-MM-DD
export const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toISOString().split('T')[0];
};

// Default tracking settings
const defaultTrackingSettings: TrackingSettings = {
  isTracking: false,
  foregroundInterval: 5000, // 5 seconds
  backgroundInterval: 60000, // 1 minute
  distanceInterval: 10, // 10 meters
  accuracyLevel: 'balanced',
};

export const useLocationStore = create<LocationState>()(
  persist(
    (set) => ({
      currentLocation: null,
      locationsByDate: {},
      trackingSettings: defaultTrackingSettings,
      selectedDate: null,
      
      setCurrentLocation: (location) => set({ currentLocation: location }),
      
      addLocation: (location) => set((state) => {
        const date = formatDate(location.timestamp);
        const existingLocations = state.locationsByDate[date] || [];
        
        return {
          locationsByDate: {
            ...state.locationsByDate,
            [date]: [...existingLocations, location],
          },
          currentLocation: location,
        };
      }),
      
      clearLocations: () => set({ locationsByDate: {} }),
      
      clearLocationsByDate: (date) => set((state) => {
        const newLocationsByDate = { ...state.locationsByDate };
        delete newLocationsByDate[date];
        return { locationsByDate: newLocationsByDate };
      }),
      
      updateTrackingSettings: (settings) => set((state) => ({
        trackingSettings: { ...state.trackingSettings, ...settings },
      })),
      
      setSelectedDate: (date) => set({ selectedDate: date }),
    }),
    {
      name: 'location-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        locationsByDate: state.locationsByDate,
        trackingSettings: state.trackingSettings,
      }),
    }
  )
);