import { Alert } from 'react-native';

export const showQuotationExpiredAlert = (quotationNumber?: string) => {
  Alert.alert(
    'Quotation Expired',
    `Validity period of ${quotationNumber ? `quotation ${quotationNumber}` : 'this quotation'} has ended`,
    [{ text: 'OK' }]
  );
};