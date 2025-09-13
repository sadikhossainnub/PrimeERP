import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity, Alert, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import * as Device from 'expo-device';
import ApiService from '../services/api';

interface AttendanceRecord {
  name: string;
  employee: string;
  attendance_date: string;
  status: string;
  in_time?: string;
  out_time?: string;
}

export default function AttendanceListScreen() {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentUser, setCurrentUser] = useState<string>('');
  const [checkingIn, setCheckingIn] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const [todayStatus, setTodayStatus] = useState<{ checkedIn: boolean; checkedOut: boolean }>({ checkedIn: false, checkedOut: false });
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [deviceId, setDeviceId] = useState<string>('');

  const fetchData = async () => {
    try {
      const user = await ApiService.getCurrentUser();
      setCurrentUser(user.email);
      
      // Try to fetch attendance data
      const attendanceData = await ApiService.getAttendance();
      const records = attendanceData.data || [];
      setAttendance(records);
      
      // Check today's status
      const today = new Date().toISOString().split('T')[0];
      const todayRecord = records.find((record: AttendanceRecord) => 
        record.attendance_date === today
      );
      setTodayStatus({
        checkedIn: !!todayRecord?.in_time,
        checkedOut: !!todayRecord?.out_time
      });
    } catch (error: any) {
      console.error('Failed to fetch attendance:', error);
      // Show user-friendly error message
      if (error.response?.status === 403) {
        Alert.alert(
          'Permission Error', 
          'You do not have permission to access attendance records. Please contact your administrator.'
        );
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
    getCurrentLocation();
    getDeviceId();
  }, []);

  const getCurrentLocation = async () => {
    try {
      console.log('Requesting location permission...');
      const { status } = await Location.requestForegroundPermissionsAsync();
      console.log('Location permission status:', status);
      
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location permission is required for attendance tracking.');
        return;
      }

      console.log('Getting current position...');
      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        timeout: 10000,
        maximumAge: 1000,
      });
      
      console.log('Location received:', currentLocation.coords);
      setLocation({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Location Error', 'Unable to get your location. Please check your GPS settings.');
    }
  };

  const getDeviceId = async () => {
    try {
      const id = Device.osInternalBuildId || Device.modelId || 'unknown-device';
      console.log('Device ID:', id);
      setDeviceId(id);
    } catch (error) {
      console.error('Error getting device ID:', error);
      setDeviceId('unknown-device');
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const renderAttendanceItem = ({ item }: { item: AttendanceRecord }) => (
    <View style={styles.attendanceItem}>
      <View style={styles.dateContainer}>
        <Text style={styles.date}>{new Date(item.attendance_date).toLocaleDateString()}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
      {item.in_time && (
        <View style={styles.timeRow}>
          <Ionicons name="log-in" size={16} color="#10b981" />
          <Text style={styles.timeText}>In: {item.in_time}</Text>
        </View>
      )}
      {item.out_time && (
        <View style={styles.timeRow}>
          <Ionicons name="log-out" size={16} color="#ef4444" />
          <Text style={styles.timeText}>Out: {item.out_time}</Text>
        </View>
      )}
    </View>
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Present': return '#10b981';
      case 'Absent': return '#ef4444';
      case 'Half Day': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const handleCheckIn = async () => {
    if (!location) {
      Alert.alert('Location Required', 'Please wait for location to be detected.');
      return;
    }
    
    setCheckingIn(true);
    try {
      await ApiService.checkIn(currentUser, location, deviceId);
      Alert.alert('Success', 'Checked in successfully!');
      fetchData();
    } catch (error: any) {
      console.error('Check-in error:', error);
      Alert.alert('Error', error.message || 'Failed to check in. Please try again.');
    } finally {
      setCheckingIn(false);
    }
  };

  const handleCheckOut = async () => {
    if (!location) {
      Alert.alert('Location Required', 'Please wait for location to be detected.');
      return;
    }
    
    setCheckingOut(true);
    try {
      await ApiService.checkOut(currentUser, location, deviceId);
      Alert.alert('Success', 'Checked out successfully!');
      fetchData();
    } catch (error: any) {
      console.error('Check-out error:', error);
      Alert.alert('Error', error.message || 'Failed to check out. Please try again.');
    } finally {
      setCheckingOut(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Text>Loading attendance...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Check In/Out Buttons */}
      <View style={styles.actionContainer}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.checkInButton, todayStatus.checkedIn && styles.disabledButton]} 
          onPress={handleCheckIn}
          disabled={todayStatus.checkedIn || checkingIn}
        >
          <Ionicons name="log-in" size={20} color="#ffffff" />
          <Text style={styles.actionButtonText}>
            {checkingIn ? 'Checking In...' : todayStatus.checkedIn ? 'Checked In' : 'Check In'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.checkOutButton, (!todayStatus.checkedIn || todayStatus.checkedOut) && styles.disabledButton]} 
          onPress={handleCheckOut}
          disabled={!todayStatus.checkedIn || todayStatus.checkedOut || checkingOut}
        >
          <Ionicons name="log-out" size={20} color="#ffffff" />
          <Text style={styles.actionButtonText}>
            {checkingOut ? 'Checking Out...' : todayStatus.checkedOut ? 'Checked Out' : 'Check Out'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Location Info */}
      <View style={styles.infoContainer}>
        <Text style={styles.infoTitle}>Location & Device Info</Text>
        {location ? (
          <Text style={styles.infoText}>📍 {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}</Text>
        ) : (
          <Text style={styles.infoText}>📍 Getting location...</Text>
        )}
        <Text style={styles.infoText}>📱 Device: {deviceId || 'Getting device ID...'}</Text>
      </View>

      {/* Map */}
      {location ? (
        <View style={styles.mapContainer}>
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: location.latitude,
              longitude: location.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
            showsUserLocation={true}
            showsMyLocationButton={true}
          >
            <Marker
              coordinate={location}
              title="Your Location"
              description={`Device: ${deviceId}`}
            />
          </MapView>
        </View>
      ) : (
        <View style={styles.mapPlaceholder}>
          <Text style={styles.placeholderText}>Loading map...</Text>
        </View>
      )}

      <FlatList
        data={attendance}
        renderItem={renderAttendanceItem}
        keyExtractor={(item) => item.name}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.centerContainer}>
            <Text style={styles.emptyText}>No attendance records found</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  attendanceItem: {
    backgroundColor: '#f8fafc',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  date: {
    fontSize: 16,
    fontWeight: '600',
    color: '#030213',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '500',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  timeText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#64748b',
  },
  emptyText: {
    fontSize: 16,
    color: '#717182',
  },
  actionContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  checkInButton: {
    backgroundColor: '#10b981',
  },
  checkOutButton: {
    backgroundColor: '#ef4444',
  },
  disabledButton: {
    backgroundColor: '#9ca3af',
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  mapContainer: {
    height: 200,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  map: {
    flex: 1,
  },
  infoContainer: {
    backgroundColor: '#f8fafc',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#030213',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4,
  },
  mapPlaceholder: {
    height: 200,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  placeholderText: {
    color: '#64748b',
    fontSize: 14,
  },
});