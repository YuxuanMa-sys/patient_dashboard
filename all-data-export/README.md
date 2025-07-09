# Data Export Summary

Generated on: 7/8/2025, 5:43:23 PM

## Authentication Status
- Access Token: ❌ Failed
- Method: None

## Files Exported

### API Data (REST Endpoints)
- `api-upcoming-appointments.csv` - Upcoming appointments
- `api-past-appointments.csv` - Past appointments
- `api-today-appointments.csv` - Today's appointments
- `api-cancelled-appointments.csv` - Cancelled appointments
- `api-categories.csv` - Service categories
- `api-patients.csv` - Patients list
- `api-patient-requests.csv` - Patient requests

### Firebase Data (Collections)
- `firebase-patients.csv` - Firebase patients collection
- `firebase-staff.csv` - Firebase staff collection
- `firebase-appointments.csv` - Firebase appointments collection
- `firebase-services.csv` - Firebase services collection
- `firebase-announcements.csv` - Firebase announcements collection
- `firebase-clinic-details.csv` - Firebase clinic-details collection

### Combined Data
- `all-data.json` - Complete dataset in JSON format
- `export-summary.json` - Export summary and statistics

## Data Sources

### API Endpoints
- Base URL: https://admin.4smile.com/public/api/
- Total endpoints: 7
- Authentication: Without Authentication

### Firebase Collections
- Collections exported: 6
- Note: Firebase data is currently using mock data. To export real Firebase data, configure Firebase Admin SDK.

## Usage

1. CSV files can be opened in Excel, Google Sheets, or any spreadsheet application
2. JSON files contain the complete data structure
3. Summary file provides statistics about the export

## Next Steps

To export real Firebase data:
1. Add Firebase Admin SDK service account key
2. Update the Firebase initialization in the script
3. Run the export again
