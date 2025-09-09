import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { TextInput } from 'react-native-paper';
import ApiService from '../services/api';
import { Customer } from '../types';

const CustomerSchema = Yup.object().shape({
  customer_name: Yup.string().required('Customer name is required'),
  email_id: Yup.string().email('Invalid email'),
  mobile_no: Yup.string(),
  address_line1: Yup.string(),
  city: Yup.string(),
  state: Yup.string(),
  pincode: Yup.string(),
});

export default function CustomerFormScreen({ route, navigation }: any) {
  const customer = route?.params?.customer;
  const isEdit = !!customer;

  const initialValues: Partial<Customer> = {
    customer_name: customer?.customer_name || '',
    email_id: customer?.email_id || '',
    mobile_no: customer?.mobile_no || '',
    address_line1: customer?.address_line1 || '',
    city: customer?.city || '',
    state: customer?.state || '',
    pincode: customer?.pincode || '',
  };

  const handleSubmit = async (values: Partial<Customer>) => {
    try {
      if (isEdit) {
        await ApiService.updateDoc('Customer', customer.name, values);
        Alert.alert('Success', 'Customer updated successfully');
      } else {
        await ApiService.createDoc('Customer', values);
        Alert.alert('Success', 'Customer created successfully');
      }
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to save customer');
      console.error('Failed to save customer:', error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Formik
        initialValues={initialValues}
        validationSchema={CustomerSchema}
        onSubmit={handleSubmit}
      >
        {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
          <View style={styles.form}>
            <TextInput
              label="Customer Name *"
              value={values.customer_name}
              onChangeText={handleChange('customer_name')}
              onBlur={handleBlur('customer_name')}
              error={touched.customer_name && !!errors.customer_name}
              style={styles.input}
            />
            {touched.customer_name && errors.customer_name && (
              <Text style={styles.errorText}>{errors.customer_name}</Text>
            )}

            <TextInput
              label="Email"
              value={values.email_id}
              onChangeText={handleChange('email_id')}
              onBlur={handleBlur('email_id')}
              error={touched.email_id && !!errors.email_id}
              keyboardType="email-address"
              style={styles.input}
            />
            {touched.email_id && errors.email_id && (
              <Text style={styles.errorText}>{errors.email_id}</Text>
            )}

            <TextInput
              label="Mobile Number"
              value={values.mobile_no}
              onChangeText={handleChange('mobile_no')}
              onBlur={handleBlur('mobile_no')}
              keyboardType="phone-pad"
              style={styles.input}
            />

            <TextInput
              label="Address Line 1"
              value={values.address_line1}
              onChangeText={handleChange('address_line1')}
              onBlur={handleBlur('address_line1')}
              style={styles.input}
            />

            <TextInput
              label="City"
              value={values.city}
              onChangeText={handleChange('city')}
              onBlur={handleBlur('city')}
              style={styles.input}
            />

            <TextInput
              label="State"
              value={values.state}
              onChangeText={handleChange('state')}
              onBlur={handleBlur('state')}
              style={styles.input}
            />

            <TextInput
              label="Pincode"
              value={values.pincode}
              onChangeText={handleChange('pincode')}
              onBlur={handleBlur('pincode')}
              keyboardType="numeric"
              style={styles.input}
            />

            <TouchableOpacity style={styles.submitButton} onPress={() => handleSubmit()}>
              <Text style={styles.submitButtonText}>
                {isEdit ? 'Update Customer' : 'Create Customer'}
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