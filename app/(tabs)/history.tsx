import React, { useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import { useLocationStore } from '@/hooks/useLocationStore';
import Map from '@/components/Map';
import DatePicker from '@/components/DatePicker';
import LocationStats from '@/components/LocationStats';
import Colors from '@/constants/colors';

export default function HistoryScreen() {
  const { 
    locationsByDate, 
    selectedDate, 
    setSelectedDate 
  } = useLocationStore();

  // Get locations for the selected date or all locations if no date is selected
  const getLocationsToDisplay = () => {
    if (selectedDate) {
      return locationsByDate[selectedDate] || [];
    }
    
    // Flatten all locations from all dates
    return Object.values(locationsByDate).flat();
  };

  const locations = getLocationsToDisplay();
  const hasLocations = Object.keys(locationsByDate).length > 0;

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: "Location History",
          headerTitleAlign: 'center',
        }}
      />

      <ScrollView style={styles.scrollView}>
        <DatePicker 
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
        />

        {hasLocations ? (
          <>
            <LocationStats locations={locations} />
            
            <View style={styles.mapContainer}>
              {locations.length > 0 ? (
                <Map 
                  locations={locations}
                  showCurrentLocation={false}
                />
              ) : (
                <View style={styles.emptyMapContainer}>
                  <Text style={styles.emptyText}>
                    No location data for this date.
                  </Text>
                </View>
              )}
            </View>
          </>
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              No location history available.
            </Text>
            <Text style={styles.emptySubtext}>
              Start tracking on the Map tab to record your movements.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  scrollView: {
    flex: 1,
  },
  mapContainer: {
    height: 300,
    marginHorizontal: 16,
    marginVertical: 10,
    borderRadius: 12,
    overflow: 'hidden',
  },
  emptyMapContainer: {
    height: 300,
    backgroundColor: Colors.dark.card,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    marginTop: 100,
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