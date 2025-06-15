import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, Dimensions, Platform, Text } from 'react-native';
import { LocationData } from '@/types/location';
import Colors from '@/constants/colors';
import { useLocationStore } from '@/hooks/useLocationStore';

// Only import MapView on native platforms
let MapView: any;
let Marker: any;
let Polyline: any;
let PROVIDER_GOOGLE: any;

// Conditionally import react-native-maps only on native platforms
if (Platform.OS !== 'web') {
  try {
    const Maps = require('react-native-maps');
    MapView = Maps.default;
    Marker = Maps.Marker;
    Polyline = Maps.Polyline;
    PROVIDER_GOOGLE = Maps.PROVIDER_GOOGLE;
  } catch (error) {
    console.error('Error loading react-native-maps:', error);
  }
}

interface MapProps {
  locations: LocationData[];
  initialRegion?: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
  showCurrentLocation?: boolean;
}

const Map = ({ 
  locations, 
  initialRegion, 
  showCurrentLocation = true 
}: MapProps) => {
  const mapRef = useRef<any>(null);
  const { currentLocation } = useLocationStore();
  const [region, setRegion] = useState(initialRegion);

  // Calculate initial region if not provided
  useEffect(() => {
    if (!initialRegion && locations.length > 0) {
      // Find bounds of all locations
      const latitudes = locations.map(loc => loc.coords.latitude);
      const longitudes = locations.map(loc => loc.coords.longitude);
      
      const minLat = Math.min(...latitudes);
      const maxLat = Math.max(...latitudes);
      const minLng = Math.min(...longitudes);
      const maxLng = Math.max(...longitudes);
      
      // Add padding
      const latDelta = (maxLat - minLat) * 1.5 || 0.01;
      const lngDelta = (maxLng - minLng) * 1.5 || 0.01;
      
      setRegion({
        latitude: (minLat + maxLat) / 2,
        longitude: (minLng + maxLng) / 2,
        latitudeDelta: Math.max(latDelta, 0.01),
        longitudeDelta: Math.max(lngDelta, 0.01),
      });
    } else if (!initialRegion && currentLocation) {
      // Use current location if available
      setRegion({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  }, [locations, initialRegion, currentLocation]);

  // Focus on current location
  const focusCurrentLocation = () => {
    if (currentLocation && mapRef.current && Platform.OS !== 'web') {
      mapRef.current.animateToRegion({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  };

  // Focus on current location when it changes
  useEffect(() => {
    if (showCurrentLocation && currentLocation && Platform.OS !== 'web') {
      focusCurrentLocation();
    }
  }, [currentLocation, showCurrentLocation]);

  if (!region) {
    return <View style={styles.container} />;
  }

  // Web fallback component
  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        <View style={styles.webMapFallback}>
          <Text style={styles.webMapText}>
            {locations.length > 0 
              ? `Map view with ${locations.length} location points`
              : 'Map view - location data will appear here'}
          </Text>
          {locations.length > 0 && (
            <Text style={styles.webMapSubtext}>
              Latest position: {locations[locations.length - 1].coords.latitude.toFixed(6)}, {locations[locations.length - 1].coords.longitude.toFixed(6)}
            </Text>
          )}
          <Text style={styles.webMapNote}>
            Full map view available on mobile devices
          </Text>
        </View>
      </View>
    );
  }

  // If MapView is not available, show a fallback
  if (!MapView) {
    return (
      <View style={styles.container}>
        <View style={styles.webMapFallback}>
          <Text style={styles.webMapText}>
            Map component could not be loaded
          </Text>
          <Text style={styles.webMapNote}>
            Please check your installation of react-native-maps
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={region}
        customMapStyle={Colors.dark.mapStyle}
      >
        {/* Path line */}
        {locations.length > 1 && (
          <Polyline
            coordinates={locations.map(loc => ({
              latitude: loc.coords.latitude,
              longitude: loc.coords.longitude,
            }))}
            strokeWidth={3}
            strokeColor={Colors.dark.primary}
          />
        )}
        
        {/* Start marker */}
        {locations.length > 0 && (
          <Marker
            coordinate={{
              latitude: locations[0].coords.latitude,
              longitude: locations[0].coords.longitude,
            }}
            pinColor="green"
            title="Start"
          />
        )}
        
        {/* End marker (if not current location) */}
        {locations.length > 1 && (
          <Marker
            coordinate={{
              latitude: locations[locations.length - 1].coords.latitude,
              longitude: locations[locations.length - 1].coords.longitude,
            }}
            pinColor={showCurrentLocation ? Colors.dark.primary : "red"}
            title={showCurrentLocation ? "Current" : "End"}
          />
        )}
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  map: {
    width: Dimensions.get('window').width,
    height: '100%',
  },
  webMapFallback: {
    flex: 1,
    backgroundColor: Colors.dark.card,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    borderRadius: 12,
  },
  webMapText: {
    color: Colors.dark.text,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  webMapSubtext: {
    color: Colors.dark.primary,
    fontSize: 14,
    marginTop: 10,
    textAlign: 'center',
  },
  webMapNote: {
    color: Colors.dark.secondaryText,
    fontSize: 12,
    marginTop: 20,
    textAlign: 'center',
  }
});

export default Map;