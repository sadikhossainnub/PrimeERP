import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { TextInput } from 'react-native-paper';
import ApiService from '../services/api';
import { Item } from '../types';

const ItemSchema = Yup.object().shape({
  item_code: Yup.string().required('Item code is required'),
  item_name: Yup.string().required('Item name is required'),
  standard_rate: Yup.number().min(0, 'Rate must be positive'),
});

export default function ItemFormScreen({ route, navigation }: any) {
  const item = route?.params?.item;
  const isEdit = !!item;

  const initialValues: Partial<Item> = {
    item_code: item?.item_code || '',
    item_name: item?.item_name || '',
    standard_rate: item?.standard_rate || 0,
    description: item?.description || '',
    item_group: item?.item_group || 'All Item Groups',
    uom: item?.uom || 'Nos',
  };

  const handleSubmit = async (values: Partial<Item>) => {
    try {
      if (isEdit) {
        await ApiService.updateDoc('Item', item.name, values);
        Alert.alert('Success', 'Item updated successfully');
      } else {
        await ApiService.createDoc('Item', values);
        Alert.alert('Success', 'Item created successfully');
      }
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to save item');
      console.error('Failed to save item:', error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Formik
        initialValues={initialValues}
        validationSchema={ItemSchema}
        onSubmit={handleSubmit}
      >
        {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
          <View style={styles.form}>
            <TextInput
              label="Item Code *"
              value={values.item_code}
              onChangeText={handleChange('item_code')}
              onBlur={handleBlur('item_code')}
              error={touched.item_code && !!errors.item_code}
              style={styles.input}
              editable={!isEdit}
            />
            {touched.item_code && errors.item_code && (
              <Text style={styles.errorText}>{errors.item_code}</Text>
            )}

            <TextInput
              label="Item Name *"
              value={values.item_name}
              onChangeText={handleChange('item_name')}
              onBlur={handleBlur('item_name')}
              error={touched.item_name && !!errors.item_name}
              style={styles.input}
            />
            {touched.item_name && errors.item_name && (
              <Text style={styles.errorText}>{errors.item_name}</Text>
            )}

            <TextInput
              label="Standard Rate"
              value={values.standard_rate?.toString()}
              onChangeText={handleChange('standard_rate')}
              onBlur={handleBlur('standard_rate')}
              error={touched.standard_rate && !!errors.standard_rate}
              keyboardType="numeric"
              style={styles.input}
            />
            {touched.standard_rate && errors.standard_rate && (
              <Text style={styles.errorText}>{errors.standard_rate}</Text>
            )}

            <TextInput
              label="Description"
              value={values.description}
              onChangeText={handleChange('description')}
              onBlur={handleBlur('description')}
              multiline
              numberOfLines={3}
              style={styles.input}
            />

            <TextInput
              label="Item Group"
              value={values.item_group}
              onChangeText={handleChange('item_group')}
              onBlur={handleBlur('item_group')}
              style={styles.input}
            />

            <TextInput
              label="Unit of Measure"
              value={values.uom}
              onChangeText={handleChange('uom')}
              onBlur={handleBlur('uom')}
              style={styles.input}
            />

            <TouchableOpacity style={styles.submitButton} onPress={() => handleSubmit()}>
              <Text style={styles.submitButtonText}>
                {isEdit ? 'Update Item' : 'Create Item'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </Formik>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  form: {
    padding: 20,
  },
  input: {
    marginBottom: 15,
    backgroundColor: 'white',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: -10,
    marginBottom: 10,
  },
  submitButton: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});