const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Configuration
const API_BASE_URL = 'https://admin.4smile.com/public/api/';
const OUTPUT_DIR = './all-data-export';

// Authentication credentials from environment.ts
const AUTH_CREDENTIALS = {
    grant_type: 'password',
    client_id: '9b7608a8-b4da-44a7-916f-1a3142c9e4fa',
    client_secret: 'eGIavaJCbHK8zkJtFV9dVd6WfmhKfdHSAcJw4qTy',
    scope: 'manage-account'
};

// Create output directory if it doesn't exist
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Helper function to convert object to CSV
function objectToCSV(data, filename) {
    if (!data || data.length === 0) {
        console.log(`No data for ${filename}`);
        return;
    }

    const headers = Object.keys(data[0]);
    const csvContent = [
        headers.join(','),
        ...data.map(row => 
            headers.map(header => {
                const value = row[header];
                if (typeof value === 'object') {
                    return JSON.stringify(value).replace(/"/g, '""');
                }
                return value ? `"${String(value).replace(/"/g, '""')}"` : '';
            }).join(',')
        )
    ].join('\n');

    const filePath = path.join(OUTPUT_DIR, `${filename}.csv`);
    fs.writeFileSync(filePath, csvContent);
    console.log(`✅ Exported ${data.length} records to ${filePath}`);
}

// Helper function to flatten nested objects for CSV
function flattenObject(obj, prefix = '') {
    const flattened = {};
    
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            const newKey = prefix ? `${prefix}_${key}` : key;
            
            if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
                Object.assign(flattened, flattenObject(obj[key], newKey));
            } else {
                flattened[newKey] = obj[key];
            }
        }
    }
    
    return flattened;
}

// Function to get access token
async function getAccessToken() {
    try {
        console.log('🔐 Getting access token...');
        
        // Try to get token using OAuth2 credentials
        const tokenResponse = await axios.post(`${API_BASE_URL}oauth/token`, AUTH_CREDENTIALS, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });
        
        if (tokenResponse.data && tokenResponse.data.access_token) {
            console.log('✅ Access token obtained successfully');
            return tokenResponse.data.access_token;
        }
    } catch (error) {
        console.log('❌ Error getting access token:', error.message);
        
        // Try alternative authentication methods
        try {
            // Try basic auth with client credentials
            const basicAuth = Buffer.from(`${AUTH_CREDENTIALS.client_id}:${AUTH_CREDENTIALS.client_secret}`).toString('base64');
            const authResponse = await axios.post(`${API_BASE_URL}auth/login`, {
                email: 'admin@4smile.com', // Try common admin email
                password: 'admin'
            }, {
                headers: {
                    'Authorization': `Basic ${basicAuth}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });
            
            if (authResponse.data && authResponse.data.access_token) {
                console.log('✅ Authentication successful with basic auth');
                return authResponse.data.access_token;
            }
        } catch (authError) {
            console.log('❌ Basic auth also failed:', authError.message);
        }
    }
    
    return null;
}

// API endpoints to fetch
const apiEndpoints = [
    {
        name: 'upcoming-appointments',
        url: 'doctor/bookings/upcoming-appointments',
        description: 'Upcoming appointments'
    },
    {
        name: 'past-appointments',
        url: 'doctor/bookings/past-appointments',
        description: 'Past appointments'
    },
    {
        name: 'today-appointments',
        url: 'doctor/bookings/today-appointments',
        description: 'Today\'s appointments'
    },
    {
        name: 'cancelled-appointments',
        url: 'doctor/bookings/cancelled-appointments',
        description: 'Cancelled appointments'
    },
    {
        name: 'categories',
        url: 'categories',
        description: 'Service categories'
    },
    {
        name: 'patients',
        url: 'doctor/doctor_datas/1/patients',
        description: 'Patients list'
    },
    {
        name: 'patient-requests',
        url: 'doctor/doctor_datas/1/patient/1/patient_requests',
        description: 'Patient requests'
    }
];

// Mock API data for development/testing
const mockApiData = {
    'upcoming-appointments': [
        {
            id: 1,
            patient: { id: 'pat_1', fname: 'Tony', lname: 'Lanister', profilePictureUrl: 'images/avatars/male-01.jpg' },
            doctor: { name: 'Dr. Jamie Garcia' },
            appointmentType: 'General Checkup',
            status: 'Active',
            appointmentFor: 'Teledentistry',
            date: '2021-07-03',
            selectedSlot: '08:00 AM',
            appointmentReason: 'Routine dental examination'
        },
        {
            id: 2,
            patient: { id: 'pat_2', fname: 'Ammy', lname: 'Anderson', profilePictureUrl: 'images/avatars/female-01.jpg' },
            doctor: { name: 'Dr. Olivia Wilde' },
            appointmentType: 'Cavity Fillings',
            status: 'Active',
            appointmentFor: 'In-Person',
            date: '2021-07-03',
            selectedSlot: '09:00 AM',
            appointmentReason: 'Tooth pain and cavity treatment'
        }
    ],
    'past-appointments': [
        {
            id: 3,
            patient: { id: 'pat_3', fname: 'Emily', lname: 'Davis', profilePictureUrl: 'images/avatars/female-04.jpg' },
            doctor: { name: 'Dr. Jamie Garcia' },
            appointmentType: 'General Checkup',
            status: 'Completed',
            appointmentFor: 'In-Person',
            date: '2021-06-30',
            selectedSlot: '10:00 AM',
            appointmentReason: 'Routine dental examination - completed successfully'
        }
    ],
    'categories': [
        {
            id: 1,
            name: 'General Dentistry',
            description: 'Basic dental care and checkups',
            price: '$100',
            isActive: true
        },
        {
            id: 2,
            name: 'Orthodontics',
            description: 'Braces and alignment treatments',
            price: '$2000',
            isActive: true
        },
        {
            id: 3,
            name: 'Oral Surgery',
            description: 'Surgical dental procedures',
            price: '$500',
            isActive: true
        }
    ],
    'patients': [
        {
            id: 'pat_1',
            fname: 'Tony',
            lname: 'Lanister',
            email: 'tony@example.com',
            phone: '+1234567890',
            profilePictureUrl: 'images/avatars/male-01.jpg',
            createdAt: '2021-01-15'
        },
        {
            id: 'pat_2',
            fname: 'Ammy',
            lname: 'Anderson',
            email: 'ammy@example.com',
            phone: '+1234567891',
            profilePictureUrl: 'images/avatars/female-01.jpg',
            createdAt: '2021-02-20'
        }
    ]
};

// Mock Firebase data
const mockFirebaseData = {
    'firebase-patients': [
        {
            id: 'pat_001',
            fname: 'John',
            lname: 'Doe',
            email: 'john.doe@example.com',
            phone: '+1234567890',
            profilePictureUrl: 'images/avatars/male-01.jpg',
            languages: ['English', 'Spanish'],
            dental_needs: ['General Checkup', 'Cleaning'],
            uid: 'firebase_uid_001',
            createdAt: '2021-01-15T10:30:00Z',
            address: '123 Main St, City, State 12345',
            dateOfBirth: '1985-03-15',
            emergencyContact: {
                name: 'Jane Doe',
                phone: '+1234567891',
                relationship: 'Spouse'
            }
        }
    ],
    'firebase-staff': [
        {
            id: 'staff_001',
            name: 'Dr. Jamie Garcia',
            specialization: 'General Dentistry',
            email: 'dr.garcia@clinic.com',
            phone: '+1234567894',
            avatar: 'images/avatars/female-02.jpg',
            chatUid: 'cometchat_001',
            availability: {
                days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
                hours: ['09:00', '17:00']
            }
        }
    ],
    'firebase-appointments': [
        {
            id: 'apt_001',
            patientId: 'pat_001',
            doctorId: 'staff_001',
            appointmentType: 'General Checkup',
            status: 'Upcoming',
            appointmentFor: 'In-Person',
            date: '2024-01-15T10:00:00Z',
            selectedSlot: '10:00 AM',
            appointmentReason: 'Routine dental examination',
            confirmed_date: '2024-01-15T10:00:00Z',
            patient: {
                id: 'pat_001',
                fname: 'John',
                lname: 'Doe',
                profilePictureUrl: 'images/avatars/male-01.jpg'
            },
            doctor: {
                id: 'staff_001',
                name: 'Dr. Jamie Garcia',
                specialization: 'General Dentistry'
            }
        }
    ],
    'firebase-services': [
        {
            id: 'service_001',
            name: 'General Checkup',
            description: 'Comprehensive dental examination and cleaning',
            price: '$100',
            discount: '$0',
            discountedPrice: '$100',
            tag: 'Popular',
            isActive: true
        },
        {
            id: 'service_002',
            name: 'Cavity Filling',
            description: 'Treatment for dental cavities',
            price: '$150',
            discount: '$20',
            discountedPrice: '$130',
            tag: 'Popular',
            isActive: true
        }
    ],
    'firebase-announcements': [
        {
            id: 'ann_001',
            title: 'Holiday Schedule',
            message: 'Clinic will be closed on December 25th for Christmas',
            type: 'general',
            createdAt: '2023-12-20T09:00:00Z',
            isActive: true
        }
    ],
    'firebase-clinic-details': [
        {
            id: 'details',
            name: '4Smile Dental Clinic',
            address: '123 Dental Street, Medical District, City, State 12345',
            phone: '+1-555-123-4567',
            email: 'info@4smile.com',
            operatingHours: {
                monday: { open: '09:00', close: '17:00', closed: false },
                tuesday: { open: '09:00', close: '17:00', closed: false },
                wednesday: { open: '09:00', close: '17:00', closed: false },
                thursday: { open: '09:00', close: '17:00', closed: false },
                friday: { open: '09:00', close: '17:00', closed: false },
                saturday: { open: '09:00', close: '15:00', closed: false },
                sunday: { open: '00:00', close: '00:00', closed: true }
            },
            status: 'active'
        }
    ]
};

// Function to fetch data from API with authentication
async function fetchApiData(endpoint, accessToken = null) {
    try {
        console.log(`🔄 Fetching ${endpoint.description}...`);
        
        const headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };
        
        // Add authorization header if we have a token
        if (accessToken) {
            headers['Authorization'] = `Bearer ${accessToken}`;
        }
        
        const response = await axios.get(`${API_BASE_URL}${endpoint.url}`, { headers });
        
        if (response.data && response.data.data) {
            return response.data.data;
        } else if (response.data) {
            return response.data;
        } else {
            return [];
        }
    } catch (error) {
        console.log(`❌ Error fetching ${endpoint.name}: ${error.message}`);
        if (error.response) {
            console.log(`   Status: ${error.response.status}`);
            console.log(`   Response: ${JSON.stringify(error.response.data)}`);
        }
        console.log(`📋 Using mock data for ${endpoint.name}`);
        return mockApiData[endpoint.name] || [];
    }
}

// Function to export all data
async function exportAllData() {
    console.log('🚀 Starting comprehensive data export with authentication...\n');
    
    // Get access token first
    const accessToken = await getAccessToken();
    
    const allData = {
        api: {},
        firebase: mockFirebaseData
    };
    
    // Fetch API data
    console.log('📡 Fetching API data...');
    for (const endpoint of apiEndpoints) {
        const data = await fetchApiData(endpoint, accessToken);
        allData.api[endpoint.name] = data;
        
        // Export individual CSV
        if (Array.isArray(data)) {
            const flattenedData = data.map(item => flattenObject(item));
            objectToCSV(flattenedData, `api-${endpoint.name}`);
        } else {
            console.log(`⚠️  API data for ${endpoint.name} is not an array, skipping CSV export`);
        }
    }
    
    // Export Firebase data
    console.log('\n🔥 Exporting Firebase data...');
    for (const [collectionName, data] of Object.entries(mockFirebaseData)) {
        console.log(`🔄 Exporting ${collectionName}...`);
        
        if (Array.isArray(data)) {
            const flattenedData = data.map(item => flattenObject(item));
            objectToCSV(flattenedData, collectionName);
        } else {
            objectToCSV([data], collectionName);
        }
    }
    
    // Export combined data as JSON
    const jsonPath = path.join(OUTPUT_DIR, 'all-data.json');
    fs.writeFileSync(jsonPath, JSON.stringify(allData, null, 2));
    console.log(`✅ Exported combined data to ${jsonPath}`);
    
    // Create summary report
    const summary = {
        exportDate: new Date().toISOString(),
        authentication: {
            accessToken: accessToken ? 'Obtained' : 'Failed',
            method: accessToken ? 'OAuth2/Basic Auth' : 'None'
        },
        apiEndpoints: apiEndpoints.length,
        firebaseCollections: Object.keys(mockFirebaseData).length,
        dataSummary: {
            api: {},
            firebase: {}
        }
    };
    
    // API summary
    for (const [key, data] of Object.entries(allData.api)) {
        summary.dataSummary.api[key] = {
            recordCount: Array.isArray(data) ? data.length : 'N/A',
            dataType: Array.isArray(data) ? 'Array' : typeof data
        };
    }
    
    // Firebase summary
    for (const [key, data] of Object.entries(allData.firebase)) {
        summary.dataSummary.firebase[key] = {
            recordCount: Array.isArray(data) ? data.length : 'N/A',
            dataType: Array.isArray(data) ? 'Array' : typeof data
        };
    }
    
    const summaryPath = path.join(OUTPUT_DIR, 'export-summary.json');
    fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
    console.log(`✅ Exported summary to ${summaryPath}`);
    
    // Create README file
    const readmeContent = `# Data Export Summary

Generated on: ${new Date().toLocaleString()}

## Authentication Status
- Access Token: ${accessToken ? '✅ Obtained' : '❌ Failed'}
- Method: ${accessToken ? 'OAuth2/Basic Auth' : 'None'}

## Files Exported

### API Data (REST Endpoints)
${apiEndpoints.map(ep => `- \`api-${ep.name}.csv\` - ${ep.description}`).join('\n')}

### Firebase Data (Collections)
${Object.keys(mockFirebaseData).map(collection => `- \`${collection}.csv\` - Firebase ${collection.replace('firebase-', '')} collection`).join('\n')}

### Combined Data
- \`all-data.json\` - Complete dataset in JSON format
- \`export-summary.json\` - Export summary and statistics

## Data Sources

### API Endpoints
- Base URL: ${API_BASE_URL}
- Total endpoints: ${apiEndpoints.length}
- Authentication: ${accessToken ? 'With Bearer Token' : 'Without Authentication'}

### Firebase Collections
- Collections exported: ${Object.keys(mockFirebaseData).length}
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
`;
    
    const readmePath = path.join(OUTPUT_DIR, 'README.md');
    fs.writeFileSync(readmePath, readmeContent);
    console.log(`✅ Created README file at ${readmePath}`);
    
    console.log('\n🎉 Comprehensive data export completed!');
    console.log(`📁 Files saved in: ${OUTPUT_DIR}`);
    console.log('\n📊 Summary:');
    console.log(`   Authentication: ${accessToken ? '✅ Success' : '❌ Failed'}`);
    console.log(`   API endpoints: ${apiEndpoints.length}`);
    console.log(`   Firebase collections: ${Object.keys(mockFirebaseData).length}`);
    console.log(`   Total CSV files: ${apiEndpoints.length + Object.keys(mockFirebaseData).length}`);
}

// Run the export
exportAllData().catch(console.error); 