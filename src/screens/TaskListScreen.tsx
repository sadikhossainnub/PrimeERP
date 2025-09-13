import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ApiService from '../services/api';

interface Task {
  name: string;
  subject: string;
  description?: string;
  status: string;
  priority: string;
  exp_end_date?: string;
  assigned_by: string;
  assigned_to: string;
}

export default function TaskListScreen() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentUser, setCurrentUser] = useState<string>('');

  const fetchData = async () => {
    try {
      const user = await ApiService.getCurrentUser();
      setCurrentUser(user.email);
      const taskData = await ApiService.getTasks(user.email);
      setTasks(taskData.data || []);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const renderTaskItem = ({ item }: { item: Task }) => (
    <TouchableOpacity style={styles.taskItem}>
      <View style={styles.taskHeader}>
        <Text style={styles.taskTitle}>{item.subject}</Text>
        <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(item.priority) }]}>
          <Text style={styles.priorityText}>{item.priority}</Text>
        </View>
      </View>
      {item.description && (
        <Text style={styles.taskDescription} numberOfLines={2}>{item.description}</Text>
      )}
      <View style={styles.taskFooter}>
        <View style={styles.statusContainer}>
          <Ionicons name={getStatusIcon(item.status)} size={16} color={getStatusColor(item.status)} />
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>{item.status}</Text>
        </View>
        {item.exp_end_date && (
          <Text style={styles.dueDate}>Due: {new Date(item.exp_end_date).toLocaleDateString()}</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return '#ef4444';
      case 'Medium': return '#f59e0b';
      case 'Low': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return '#10b981';
      case 'Working': return '#3b82f6';
      case 'Pending Review': return '#f59e0b';
      case 'Open': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completed': return 'checkmark-circle';
      case 'Working': return 'play-circle';
      case 'Pending Review': return 'time';
      default: return 'ellipse';
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Text>Loading tasks...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={tasks}
        renderItem={renderTaskItem}
        keyExtractor={(item) => item.name}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.centerContainer}>
            <Text style={styles.emptyText}>No tasks assigned to you</Text>
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
  taskItem: {
    backgroundColor: '#f8fafc',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#030213',
    flex: 1,
    marginRight: 8,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '500',
  },
  taskDescription: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 12,
    lineHeight: 20,
  },
  taskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '500',
  },
  dueDate: {
    fontSize: 12,
    color: '#64748b',
  },
  emptyText: {
    fontSize: 16,
    color: '#717182',
  },
});