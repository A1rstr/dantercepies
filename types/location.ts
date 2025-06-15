export interface LocationData {
  id: string;
  timestamp: number;
  coords: {
    latitude: number;
    longitude: number;
    altitude: number | null;
    accuracy: number | null;
    altitudeAccuracy: number | null;
    heading: number | null;
    speed: number | null;
  };
}

export interface LocationsByDate {
  [date: string]: LocationData[];
}

export interface TrackingSettings {
  isTracking: boolean;
  foregroundInterval: number; // in milliseconds
  backgroundInterval: number; // in milliseconds
  distanceInterval: number; // in meters
  accuracyLevel: 'low' | 'balanced' | 'high';
}