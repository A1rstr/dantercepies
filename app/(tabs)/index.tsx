import React, { useEffect } from 'react';
import { StyleSheet, View, Text, Platform, Alert } from 'react-native';
import { Stack } from 'expo-router';
import { useLocationStore } from '@/hooks/useLocationStore';
import { useLocationTracking } from '@/hooks/useLocationTracking';
import Map from '@/components/Map';
import TrackingStatus from '@/components/TrackingStatus';
import Colors from '@/constants/colors';

export default function MapScreen() {
  const { 
    locationsByDate, 
    currentLocation, 
    selectedDate, 
    setSelectedDate 
  } = useLocationStore();
  const { isTracking, startTracking } = useLocationTracking();

  // Get locations for the selected date or all locations if no date is selected
  const getLocationsToDisplay = () => {
    if (selectedDate) {
      return locationsByDate[selectedDate] || [];
    }
    
    // Flatten all locations from all dates
    return Object.values(locationsByDate).flat();
  };

  // Request location permissions on first load
  useEffect(() => {
    const requestPermissions = async () => {
      try {
        // Start tracking automatically on first load
        if (!isTracking && !currentLocation) {
          const success = await startTracking();
          if (!success && Platform.OS !== 'web') {
            Alert.alert(
              "Location Permission Required",
              "This app needs location permission to track your movements. Please enable it in your device settings.",
              [{ text: "OK" }]
            );
          }
        }
      } catch (error) {
        console.error('Error requesting permissions:', error);
      }
    };

    requestPermissions();
    // Reset selected date when viewing the map
    setSelectedDate(null);
  }, []);

  const locations = getLocationsToDisplay();

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: "Location Tracker",
          headerTitleAlign: 'center',
        }}
      />

      {locations.length > 0 || currentLocation ? (
        <Map 
          locations={locations}
          showCurrentLocation={true}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            No location data available.
          </Text>
          <Text style={styles.emptySubtext}>
            Start tracking to see your movements on the map.
          </Text>
        </View>
      )}

      <TrackingStatus />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.dark.text,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.dark.secondaryText,
    textAlign: 'center',
    marginTop: 8,
  },
});