import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  Modal, 
  FlatList,
  Platform
} from 'react-native';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useLocationStore } from '@/hooks/useLocationStore';

interface DatePickerProps {
  onSelectDate: (date: string | null) => void;
  selectedDate: string | null;
}

const DatePicker = ({ onSelectDate, selectedDate }: DatePickerProps) => {
  const [modalVisible, setModalVisible] = useState(false);
  const { locationsByDate } = useLocationStore();
  
  // Get available dates from location data
  const availableDates = Object.keys(locationsByDate).sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  );

  // Format date for display
  const formatDateForDisplay = (dateString: string) => {
    if (!dateString) return 'All Time';
    
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Get location count for a date
  const getLocationCount = (date: string) => {
    return locationsByDate[date]?.length || 0;
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.dateSelector} 
        onPress={() => setModalVisible(true)}
      >
        <Calendar size={20} color={Colors.dark.primary} />
        <Text style={styles.dateText}>
          {selectedDate ? formatDateForDisplay(selectedDate) : 'All Time'}
        </Text>
        <ChevronDown size={20} color={Colors.dark.secondaryText} />
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Date</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[
                styles.dateItem,
                !selectedDate && styles.selectedDateItem
              ]}
              onPress={() => {
                onSelectDate(null);
                setModalVisible(false);
              }}
            >
              <Text style={[
                styles.dateItemText,
                !selectedDate && styles.selectedDateItemText
              ]}>
                All Time
              </Text>
              <Text style={styles.locationCount}>
                {Object.values(locationsByDate).reduce((acc, locations) => acc + locations.length, 0)} points
              </Text>
            </TouchableOpacity>

            <FlatList
              data={availableDates}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.dateItem,
                    selectedDate === item && styles.selectedDateItem
                  ]}
                  onPress={() => {
                    onSelectDate(item);
                    setModalVisible(false);
                  }}
                >
                  <Text style={[
                    styles.dateItemText,
                    selectedDate === item && styles.selectedDateItemText
                  ]}>
                    {formatDateForDisplay(item)}
                  </Text>
                  <Text style={styles.locationCount}>
                    {getLocationCount(item)} points
                  </Text>
                </TouchableOpacity>
              )}
              style={styles.dateList}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

// Custom ChevronDown component
const ChevronDown = ({ size, color }: { size: number, color: string }) => {
  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <ChevronRight size={size} color={color} style={{ transform: [{ rotate: '90deg' }] }} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.card,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 16,
  },
  dateText: {
    color: Colors.dark.text,
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
    marginLeft: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: Colors.dark.card,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  modalTitle: {
    color: Colors.dark.text,
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  closeButtonText: {
    color: Colors.dark.primary,
    fontSize: 16,
  },
  dateList: {
    marginTop: 8,
  },
  dateItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  selectedDateItem: {
    backgroundColor: `${Colors.dark.primary}20`,
  },
  dateItemText: {
    color: Colors.dark.text,
    fontSize: 16,
  },
  selectedDateItemText: {
    color: Colors.dark.primary,
    fontWeight: 'bold',
  },
  locationCount: {
    color: Colors.dark.secondaryText,
    fontSize: 14,
  },
});

export default DatePicker;