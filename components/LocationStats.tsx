import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { MapPin, Clock, Activity } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { LocationData } from '@/types/location';

interface LocationStatsProps {
  locations: LocationData[];
}

const LocationStats = ({ locations }: LocationStatsProps) => {
  if (locations.length === 0) {
    return null;
  }

  // Calculate total distance in meters
  const calculateTotalDistance = () => {
    let totalDistance = 0;
    
    for (let i = 1; i < locations.length; i++) {
      const prevLoc = locations[i - 1];
      const currLoc = locations[i];
      
      totalDistance += calculateDistance(
        prevLoc.coords.latitude,
        prevLoc.coords.longitude,
        currLoc.coords.latitude,
        currLoc.coords.longitude
      );
    }
    
    return totalDistance;
  };

  // Calculate distance between two points using Haversine formula
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3; // Earth radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  };

  // Calculate duration in milliseconds
  const calculateDuration = () => {
    if (locations.length < 2) return 0;
    return locations[locations.length - 1].timestamp - locations[0].timestamp;
  };

  // Format distance for display
  const formatDistance = (meters: number) => {
    if (meters < 1000) {
      return `${Math.round(meters)} m`;
    } else {
      return `${(meters / 1000).toFixed(2)} km`;
    }
  };

  // Format duration for display
  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  };

  const totalDistance = calculateTotalDistance();
  const duration = calculateDuration();

  return (
    <View style={styles.container}>
      <View style={styles.statItem}>
        <MapPin size={16} color={Colors.dark.primary} />
        <Text style={styles.statLabel}>Points</Text>
        <Text style={styles.statValue}>{locations.length}</Text>
      </View>
      
      <View style={styles.divider} />
      
      <View style={styles.statItem}>
        <Activity size={16} color={Colors.dark.primary} />
        <Text style={styles.statLabel}>Distance</Text>
        <Text style={styles.statValue}>{formatDistance(totalDistance)}</Text>
      </View>
      
      <View style={styles.divider} />
      
      <View style={styles.statItem}>
        <Clock size={16} color={Colors.dark.primary} />
        <Text style={styles.statLabel}>Duration</Text>
        <Text style={styles.statValue}>{formatDuration(duration)}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.dark.card,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 10,
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    color: Colors.dark.secondaryText,
    fontSize: 12,
    marginTop: 4,
  },
  statValue: {
    color: Colors.dark.text,
    fontSize: 16,
    fontWeight: '600',
    marginTop: 2,
  },
  divider: {
    width: 1,
    backgroundColor: Colors.dark.border,
    marginHorizontal: 8,
  },
});

export default LocationStats;