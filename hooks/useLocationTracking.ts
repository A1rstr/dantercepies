import { useEffect, useRef } from 'react';
import { Platform, Alert } from 'react-native';
import * as Location from 'expo-location';
import { useLocationStore } from './useLocationStore';
import { LocationData } from '@/types/location';

export const useLocationTracking = () => {
  const { 
    trackingSettings, 
    updateTrackingSettings, 
    addLocation, 
    setCurrentLocation 
  } = useLocationStore();
  
  const locationSubscription = useRef<Location.LocationSubscription | null>(null);

  // Request permissions and start tracking
  const startTracking = async () => {
    try {
      const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
      
      if (foregroundStatus !== 'granted') {
        console.log('Foreground location permission denied');
        return false;
      }
      
      // Request background permissions on iOS
      if (Platform.OS === 'ios') {
        const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
        if (backgroundStatus !== 'granted') {
          console.log('Background location permission not granted');
          // Continue anyway, just without background tracking
        }
      }
      
      // Get current position immediately
      const currentPosition = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      
      const locationData: LocationData = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        coords: {
          latitude: currentPosition.coords.latitude,
          longitude: currentPosition.coords.longitude,
          altitude: currentPosition.coords.altitude,
          accuracy: currentPosition.coords.accuracy,
          altitudeAccuracy: currentPosition.coords.altitudeAccuracy,
          heading: currentPosition.coords.heading,
          speed: currentPosition.coords.speed,
        },
      };
      
      setCurrentLocation(locationData);
      addLocation(locationData);
      
      // Set up accuracy based on user settings
      let accuracy;
      switch (trackingSettings.accuracyLevel) {
        case 'low':
          accuracy = Location.Accuracy.Lowest;
          break;
        case 'high':
          accuracy = Location.Accuracy.Highest;
          break;
        default:
          accuracy = Location.Accuracy.Balanced;
      }
      
      // Start location updates
      locationSubscription.current = await Location.watchPositionAsync(
        {
          accuracy,
          distanceInterval: trackingSettings.distanceInterval,
          timeInterval: trackingSettings.foregroundInterval,
        },
        (location) => {
          const newLocationData: LocationData = {
            id: Date.now().toString(),
            timestamp: Date.now(),
            coords: {
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              altitude: location.coords.altitude,
              accuracy: location.coords.accuracy,
              altitudeAccuracy: location.coords.altitudeAccuracy,
              heading: location.coords.heading,
              speed: location.coords.speed,
            },
          };
          
          setCurrentLocation(newLocationData);
          addLocation(newLocationData);
        }
      );
      
      updateTrackingSettings({ isTracking: true });
      return true;
    } catch (error) {
      console.error('Error starting location tracking:', error);
      
      // Show a more user-friendly error message
      if (Platform.OS !== 'web') {
        Alert.alert(
          "Location Error",
          "There was a problem accessing your location. Please check your device settings and ensure location services are enabled.",
          [{ text: "OK" }]
        );
      }
      
      return false;
    }
  };
  
  // Stop tracking
  const stopTracking = () => {
    if (locationSubscription.current) {
      locationSubscription.current.remove();
      locationSubscription.current = null;
      updateTrackingSettings({ isTracking: false });
      return true;
    }
    return false;
  };
  
  // Clean up subscription when component unmounts
  useEffect(() => {
    return () => {
      if (locationSubscription.current) {
        locationSubscription.current.remove();
      }
    };
  }, []);
  
  return {
    isTracking: trackingSettings.isTracking,
    startTracking,
    stopTracking,
  };
};