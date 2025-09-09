# PrimeERP - ERPNext React Native Mobile App

A comprehensive React Native mobile application built with Expo for ERPNext integration, providing access to key business functions on mobile devices.

## Features

### 📊 Dashboard
- Real-time KPIs: Today's Sales, Order Count, Pending Deliveries, Leave Requests, Expenses
- Interactive charts using Victory Native
- Pull-to-refresh functionality

### 👥 Customer Management
- Customer list with search and pagination
- Create/Edit customer forms with validation
- Customer details: Name, Email, Phone, Address

### 📦 Item Management
- Item catalog with search functionality
- Create/Edit items with pricing and stock info
- Item details: Code, Name, Rate, Description, UOM

### 💼 Sales Operations
- Quotation management (List/Create/Edit)
- Sales Order tracking
- Delivery Note management
- Status-based filtering and sorting

### 🏢 HR & Finance
- Leave Request management
- Expense Claim tracking
- Employee profile management

### ⚙️ Settings & Configuration
- ERPNext server URL configuration
- API Key & Secret management
- Dark/Light theme toggle
- Push notification settings

## Tech Stack

- **React Native** with Expo SDK 53+
- **React Navigation** (Bottom Tabs + Stack Navigation)
- **Axios** for API communication
- **AsyncStorage** for local data persistence
- **Formik + Yup** for form handling and validation
- **Victory Native** for charts and data visualization
- **React Native Paper** for Material Design components
- **Expo Notifications** for push notifications

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd PrimeERP
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Run on device/simulator**
   ```bash
   # For Android
   npm run android
   
   # For iOS
   npm run ios
   
   # For Web
   npm run web
   ```

## ERPNext Configuration

### 1. API Key Setup
1. Login to your ERPNext instance
2. Go to User Profile → API Access
3. Generate API Key and Secret
4. Note down both values for app configuration

### 2. CORS Configuration
Add your mobile app domain to ERPNext CORS settings:
```python
# In site_config.json
{
  "allow_cors": "*",
  "cors_headers": [
    "Authorization",
    "Content-Type",
    "X-Frappe-CSRF-Token"
  ]
}
```

### 3. Custom API Endpoints (Optional)
For push notifications, add this custom method to ERPNext:

```python
# In custom app or frappe core
@frappe.whitelist()
def save_push_token(token, device_type):
    # Save push token logic
    pass
```

## App Configuration

1. **Open the app and navigate to Settings**
2. **Enter your ERPNext server details:**
   - Server URL: `https://your-erpnext-server.com`
   - API Key: Your generated API key
   - API Secret: Your generated API secret
3. **Test the connection**
4. **Configure app preferences (theme, notifications)**

## API Endpoints Used

The app communicates with ERPNext using these REST endpoints:

- `GET /api/resource/{doctype}` - List documents
- `GET /api/resource/{doctype}/{name}` - Get specific document
- `POST /api/resource/{doctype}` - Create document
- `PUT /api/resource/{doctype}/{name}` - Update document
- `DELETE /api/resource/{doctype}/{name}` - Delete document
- `POST /api/method/{method}` - Call custom methods

## Supported Doctypes

- Customer
- Item
- Quotation
- Sales Order
- Delivery Note
- Leave Application
- Expense Claim
- User

## Security Features

- Secure API key/secret storage using AsyncStorage
- Token-based authentication
- HTTPS communication
- Input validation and sanitization

## Development

### Project Structure
```
src/
├── components/          # Reusable UI components
├── navigation/          # Navigation configuration
├── screens/            # Screen components
├── services/           # API and notification services
├── types/              # TypeScript interfaces
└── utils/              # Utility functions
```

### Adding New Screens
1. Create screen component in `src/screens/`
2. Add navigation route in `src/navigation/AppNavigator.tsx`
3. Update types in `src/types/index.ts` if needed

### Customizing API Calls
Modify `src/services/api.ts` to add new endpoints or customize existing ones.

## Troubleshooting

### Common Issues

1. **Connection Failed**
   - Verify server URL format (include https://)
   - Check API key/secret validity
   - Ensure CORS is properly configured

2. **Push Notifications Not Working**
   - Verify notification permissions
   - Check Expo push notification setup
   - Ensure custom API endpoint exists

3. **Build Errors**
   - Clear node_modules and reinstall
   - Check Expo CLI version compatibility
   - Verify all dependencies are installed

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For issues and questions:
- Create an issue in the repository
- Check ERPNext documentation
- Review Expo documentation for mobile-specific issues