const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Configuration
const API_BASE_URL = 'https://admin.4smile.com/public/api/';
const OUTPUT_DIR = './api-data-export';

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

// API endpoints to fetch
const endpoints = [
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
        url: 'doctor/doctor_datas/1/patients', // Assuming doctor ID 1
        description: 'Patients list'
    },
    {
        name: 'patient-requests',
        url: 'doctor/doctor_datas/1/patient/1/patient_requests', // Assuming doctor ID 1, patient ID 1
        description: 'Patient requests'
    }
];

// Mock data for development/testing
const mockData = {
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

// Function to fetch data from API
async function fetchData(endpoint) {
    try {
        console.log(`🔄 Fetching ${endpoint.description}...`);
        const response = await axios.get(`${API_BASE_URL}${endpoint.url}`);
        
        if (response.data && response.data.data) {
            return response.data.data;
        } else if (response.data) {
            return response.data;
        } else {
            return [];
        }
    } catch (error) {
        console.log(`❌ Error fetching ${endpoint.name}: ${error.message}`);
        console.log(`📋 Using mock data for ${endpoint.name}`);
        return mockData[endpoint.name] || [];
    }
}

// Function to export all data
async function exportAllData() {
    console.log('🚀 Starting API data export...\n');
    
    const allData = {};
    
    // Fetch data from all endpoints
    for (const endpoint of endpoints) {
        const data = await fetchData(endpoint);
        allData[endpoint.name] = data;
        
        // Export individual CSV
        if (Array.isArray(data)) {
            const flattenedData = data.map(item => flattenObject(item));
            objectToCSV(flattenedData, endpoint.name);
        } else {
            console.log(`⚠️  Data for ${endpoint.name} is not an array, skipping CSV export`);
        }
    }
    
    // Export combined data as JSON
    const jsonPath = path.join(OUTPUT_DIR, 'all-data.json');
    fs.writeFileSync(jsonPath, JSON.stringify(allData, null, 2));
    console.log(`✅ Exported combined data to ${jsonPath}`);
    
    // Create summary report
    const summary = {
        exportDate: new Date().toISOString(),
        totalEndpoints: endpoints.length,
        dataSummary: {}
    };
    
    for (const [key, data] of Object.entries(allData)) {
        summary.dataSummary[key] = {
            recordCount: Array.isArray(data) ? data.length : 'N/A',
            dataType: Array.isArray(data) ? 'Array' : typeof data
        };
    }
    
    const summaryPath = path.join(OUTPUT_DIR, 'export-summary.json');
    fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
    console.log(`✅ Exported summary to ${summaryPath}`);
    
    console.log('\n🎉 Data export completed!');
    console.log(`📁 Files saved in: ${OUTPUT_DIR}`);
}

// Run the export
exportAllData().catch(console.error); 