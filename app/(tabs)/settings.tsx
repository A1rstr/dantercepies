import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  Switch, 
  ScrollView,
  Alert,
  Platform
} from 'react-native';
import { Stack } from 'expo-router';
import { Sliders, Trash2, Info } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useLocationStore } from '@/hooks/useLocationStore';
import { useLocationTracking } from '@/hooks/useLocationTracking';

export default function SettingsScreen() {
  const { 
    trackingSettings, 
    updateTrackingSettings, 
    clearLocations,
    locationsByDate
  } = useLocationStore();
  const { isTracking, stopTracking } = useLocationTracking();
  
  // Local state for interval sliders
  const [foregroundInterval, setForegroundInterval] = useState(trackingSettings.foregroundInterval / 1000);
  const [distanceInterval, setDistanceInterval] = useState(trackingSettings.distanceInterval);
  
  // Handle accuracy level change
  const handleAccuracyChange = (level: 'low' | 'balanced' | 'high') => {
    updateTrackingSettings({ accuracyLevel: level });
  };
  
  // Handle clear data confirmation
  const handleClearData = () => {
    if (Platform.OS === 'web') {
      if (confirm('Are you sure you want to clear all location data? This action cannot be undone.')) {
        if (isTracking) {
          stopTracking();
        }
        clearLocations();
      }
    } else {
      Alert.alert(
        'Clear All Data',
        'Are you sure you want to clear all location data? This action cannot be undone.',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Clear', 
            style: 'destructive',
            onPress: () => {
              if (isTracking) {
                stopTracking();
              }
              clearLocations();
            }
          }
        ]
      );
    }
  };
  
  // Apply interval changes
  const applyIntervalChanges = () => {
    updateTrackingSettings({
      foregroundInterval: foregroundInterval * 1000,
      distanceInterval: distanceInterval
    });
    
    if (isTracking) {
      Alert.alert(
        'Restart Tracking Required',
        'Please stop and restart tracking for these changes to take effect.',
        [{ text: 'OK' }]
      );
    }
  };
  
  // Calculate total data points
  const totalDataPoints = Object.values(locationsByDate).reduce(
    (sum, locations) => sum + locations.length, 
    0
  );

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: "Settings",
          headerTitleAlign: 'center',
        }}
      />
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Sliders size={20} color={Colors.dark.primary} />
            <Text style={styles.sectionTitle}>Tracking Settings</Text>
          </View>
          
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Accuracy Level</Text>
            <View style={styles.accuracySelector}>
              <TouchableOpacity
                style={[
                  styles.accuracyOption,
                  trackingSettings.accuracyLevel === 'low' && styles.accuracyOptionSelected
                ]}
                onPress={() => handleAccuracyChange('low')}
              >
                <Text style={[
                  styles.accuracyOptionText,
                  trackingSettings.accuracyLevel === 'low' && styles.accuracyOptionTextSelected
                ]}>
                  Low
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.accuracyOption,
                  trackingSettings.accuracyLevel === 'balanced' && styles.accuracyOptionSelected
                ]}
                onPress={() => handleAccuracyChange('balanced')}
              >
                <Text style={[
                  styles.accuracyOptionText,
                  trackingSettings.accuracyLevel === 'balanced' && styles.accuracyOptionTextSelected
                ]}>
                  Balanced
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.accuracyOption,
                  trackingSettings.accuracyLevel === 'high' && styles.accuracyOptionSelected
                ]}
                onPress={() => handleAccuracyChange('high')}
              >
                <Text style={[
                  styles.accuracyOptionText,
                  trackingSettings.accuracyLevel === 'high' && styles.accuracyOptionTextSelected
                ]}>
                  High
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>
              Time Interval: {foregroundInterval} seconds
            </Text>
            <View style={styles.sliderContainer}>
              <Text style={styles.sliderLabel}>5s</Text>
              <View style={styles.slider}>
                {Platform.OS === 'web' ? (
                  <input
                    type="range"
                    min="5"
                    max="60"
                    value={foregroundInterval}
                    onChange={(e) => setForegroundInterval(parseInt(e.target.value))}
                    style={{ width: '100%' }}
                  />
                ) : (
                  // For native, you would use a Slider component here
                  // Since we're not installing additional packages, we'll use a simple TouchableOpacity
                  <View style={styles.sliderTrack}>
                    <View 
                      style={[
                        styles.sliderFill, 
                        { width: `${((foregroundInterval - 5) / 55) * 100}%` }
                      ]} 
                    />
                  </View>
                )}
              </View>
              <Text style={styles.sliderLabel}>60s</Text>
            </View>
          </View>
          
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>
              Distance Filter: {distanceInterval} meters
            </Text>
            <View style={styles.sliderContainer}>
              <Text style={styles.sliderLabel}>5m</Text>
              <View style={styles.slider}>
                {Platform.OS === 'web' ? (
                  <input
                    type="range"
                    min="5"
                    max="50"
                    value={distanceInterval}
                    onChange={(e) => setDistanceInterval(parseInt(e.target.value))}
                    style={{ width: '100%' }}
                  />
                ) : (
                  <View style={styles.sliderTrack}>
                    <View 
                      style={[
                        styles.sliderFill, 
                        { width: `${((distanceInterval - 5) / 45) * 100}%` }
                      ]} 
                    />
                  </View>
                )}
              </View>
              <Text style={styles.sliderLabel}>50m</Text>
            </View>
          </View>
          
          <TouchableOpacity
            style={styles.applyButton}
            onPress={applyIntervalChanges}
          >
            <Text style={styles.applyButtonText}>Apply Changes</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Info size={20} color={Colors.dark.primary} />
            <Text style={styles.sectionTitle}>Data Management</Text>
          </View>
          
          <View style={styles.dataInfo}>
            <Text style={styles.dataInfoText}>
              Total data points: {totalDataPoints}
            </Text>
            <Text style={styles.dataInfoText}>
              Days recorded: {Object.keys(locationsByDate).length}
            </Text>
            <Text style={styles.dataInfoSubtext}>
              All location data is stored locally on your device only.
            </Text>
          </View>
          
          <TouchableOpacity
            style={styles.dangerButton}
            onPress={handleClearData}
          >
            <Trash2 size={18} color="#FFF" />
            <Text style={styles.dangerButtonText}>Clear All Location Data</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.versionText}>
            Location Tracker v1.0.0
          </Text>
          <Text style={styles.privacyText}>
            Your privacy matters. All location data is stored locally on your device and is never shared with any third parties.
          </Text>
        </View>
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
  section: {
    backgroundColor: Colors.dark.card,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    color: Colors.dark.text,
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  settingItem: {
    marginBottom: 20,
  },
  settingLabel: {
    color: Colors.dark.text,
    fontSize: 16,
    marginBottom: 8,
  },
  accuracySelector: {
    flexDirection: 'row',
    backgroundColor: Colors.dark.border,
    borderRadius: 8,
    overflow: 'hidden',
  },
  accuracyOption: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
  },
  accuracyOptionSelected: {
    backgroundColor: Colors.dark.primary,
  },
  accuracyOptionText: {
    color: Colors.dark.secondaryText,
    fontSize: 14,
  },
  accuracyOptionTextSelected: {
    color: '#FFF',
    fontWeight: '500',
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sliderLabel: {
    color: Colors.dark.secondaryText,
    fontSize: 12,
    width: 30,
  },
  slider: {
    flex: 1,
    height: 30,
    justifyContent: 'center',
  },
  sliderTrack: {
    height: 4,
    backgroundColor: Colors.dark.border,
    borderRadius: 2,
  },
  sliderFill: {
    height: 4,
    backgroundColor: Colors.dark.primary,
    borderRadius: 2,
  },
  applyButton: {
    backgroundColor: Colors.dark.primary,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  applyButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '500',
  },
  dataInfo: {
    marginBottom: 16,
  },
  dataInfoText: {
    color: Colors.dark.text,
    fontSize: 16,
    marginBottom: 4,
  },
  dataInfoSubtext: {
    color: Colors.dark.secondaryText,
    fontSize: 14,
    marginTop: 8,
  },
  dangerButton: {
    backgroundColor: Colors.dark.danger,
    borderRadius: 8,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dangerButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  versionText: {
    color: Colors.dark.secondaryText,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 8,
  },
  privacyText: {
    color: Colors.dark.secondaryText,
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
});