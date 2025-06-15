import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { MapPin, Pause, Play } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useLocationStore } from '@/hooks/useLocationStore';
import { useLocationTracking } from '@/hooks/useLocationTracking';

const TrackingStatus = () => {
  const { currentLocation, trackingSettings } = useLocationStore();
  const { isTracking, startTracking, stopTracking } = useLocationTracking();

  const handleToggleTracking = async () => {
    if (isTracking) {
      stopTracking();
    } else {
      await startTracking();
    }
  };

  // Format coordinates to 6 decimal places
  const formatCoordinate = (value: number | null | undefined) => {
    if (value === null || value === undefined) return 'N/A';
    return value.toFixed(6);
  };

  return (
    <View style={styles.container}>
      <View style={styles.statusContainer}>
        <View style={styles.statusHeader}>
          <View style={styles.statusIndicator}>
            {isTracking ? (
              <ActivityIndicator size="small" color={Colors.dark.success} />
            ) : (
              <View style={[styles.dot, { backgroundColor: Colors.dark.inactive }]} />
            )}
            <Text style={styles.statusText}>
              {isTracking ? 'Tracking Active' : 'Tracking Inactive'}
            </Text>
          </View>
          
          <TouchableOpacity
            style={[
              styles.toggleButton,
              { backgroundColor: isTracking ? Colors.dark.danger : Colors.dark.success }
            ]}
            onPress={handleToggleTracking}
          >
            {isTracking ? (
              <Pause size={16} color="#FFF" />
            ) : (
              <Play size={16} color="#FFF" />
            )}
            <Text style={styles.toggleButtonText}>
              {isTracking ? 'Stop' : 'Start'}
            </Text>
          </TouchableOpacity>
        </View>
        
        {currentLocation && (
          <View style={styles.locationInfo}>
            <View style={styles.locationRow}>
              <MapPin size={16} color={Colors.dark.primary} />
              <Text style={styles.locationLabel}>Current Position:</Text>
            </View>
            <Text style={styles.coordinateText}>
              Lat: {formatCoordinate(currentLocation.coords.latitude)}
            </Text>
            <Text style={styles.coordinateText}>
              Lng: {formatCoordinate(currentLocation.coords.longitude)}
            </Text>
            {currentLocation.coords.accuracy && (
              <Text style={styles.accuracyText}>
                Accuracy: ±{Math.round(currentLocation.coords.accuracy)}m
              </Text>
            )}
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  statusContainer: {
    backgroundColor: Colors.dark.card,
    borderRadius: 12,
    padding: 16,
    width: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  statusText: {
    color: Colors.dark.text,
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  toggleButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  locationInfo: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.dark.border,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationLabel: {
    color: Colors.dark.text,
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
  coordinateText: {
    color: Colors.dark.secondaryText,
    fontSize: 14,
    marginBottom: 4,
  },
  accuracyText: {
    color: Colors.dark.primary,
    fontSize: 12,
    marginTop: 4,
  },
});

export default TrackingStatus;