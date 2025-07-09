const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Configuration
const OUTPUT_DIR = './firebase-data-export';

// Create output directory if it doesn't exist
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Initialize Firebase Admin (you'll need to add your service account key)
// For now, we'll create a mock export function
function initializeFirebase() {
    try {
        // You would need to add your Firebase service account key
        // const serviceAccount = require('./path-to-your-service-account-key.json');
        // admin.initializeApp({
        //     credential: admin.credential.cert(serviceAccount)
        // });
        console.log('⚠️  Firebase not initialized - using mock data');
        return false;
    } catch (error) {
        console.log('❌ Error initializing Firebase:', error.message);
        return false;
    }
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

// Mock Firebase data based on the codebase analysis
const mockFirebaseData = {
    'patients': [
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
        },
        {
            id: 'pat_002',
            fname: 'Sarah',
            lname: 'Johnson',
            email: 'sarah.johnson@example.com',
            phone: '+1234567892',
            profilePictureUrl: 'images/avatars/female-01.jpg',
            languages: ['English'],
            dental_needs: ['Orthodontics', 'Braces'],
            uid: 'firebase_uid_002',
            createdAt: '2021-02-20T14:15:00Z',
            address: '456 Oak Ave, City, State 12345',
            dateOfBirth: '1990-07-22',
            emergencyContact: {
                name: 'Mike Johnson',
                phone: '+1234567893',
                relationship: 'Parent'
            }
        }
    ],
    'staff': [
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
        },
        {
            id: 'staff_002',
            name: 'Dr. Olivia Wilde',
            specialization: 'Orthodontics',
            email: 'dr.wilde@clinic.com',
            phone: '+1234567895',
            avatar: 'images/avatars/female-03.jpg',
            chatUid: 'cometchat_002',
            availability: {
                days: ['Monday', 'Wednesday', 'Friday'],
                hours: ['10:00', '18:00']
            }
        }
    ],
    'appointments': [
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
        },
        {
            id: 'apt_002',
            patientId: 'pat_002',
            doctorId: 'staff_002',
            appointmentType: 'Orthodontics Consultation',
            status: 'Completed',
            appointmentFor: 'Virtual',
            date: '2024-01-10T14:00:00Z',
            selectedSlot: '02:00 PM',
            appointmentReason: 'Braces consultation and fitting',
            confirmed_date: '2024-01-10T14:00:00Z',
            patient: {
                id: 'pat_002',
                fname: 'Sarah',
                lname: 'Johnson',
                profilePictureUrl: 'images/avatars/female-01.jpg'
            },
            doctor: {
                id: 'staff_002',
                name: 'Dr. Olivia Wilde',
                specialization: 'Orthodontics'
            }
        }
    ],
    'families': [
        {
            id: 'family_001',
            patientId: 'pat_001',
            members: [
                {
                    id: 'member_001',
                    name: 'Jane Doe',
                    relationship: 'Spouse',
                    phone: '+1234567891',
                    email: 'jane.doe@example.com'
                },
                {
                    id: 'member_002',
                    name: 'Junior Doe',
                    relationship: 'Child',
                    phone: '+1234567896',
                    email: 'junior.doe@example.com'
                }
            ]
        }
    ],
    'announcements': [
        {
            id: 'ann_001',
            title: 'Holiday Schedule',
            message: 'Clinic will be closed on December 25th for Christmas',
            type: 'general',
            createdAt: '2023-12-20T09:00:00Z',
            isActive: true
        },
        {
            id: 'ann_002',
            title: 'New Services Available',
            message: 'We now offer Invisalign treatments',
            type: 'service',
            createdAt: '2023-12-15T14:30:00Z',
            isActive: true
        }
    ],
    'services': [
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
        },
        {
            id: 'service_003',
            name: 'Free Consultation',
            description: 'Initial consultation with our dental experts',
            price: '$0',
            discount: '$0',
            discountedPrice: '$0',
            tag: 'Free Consultation',
            isActive: true
        }
    ],
    'notifications': {
        id: 'ClinicAll',
        notifications: [
            {
                id: 'notif_001',
                userAvatar: 'images/avatars/female-03.jpg',
                userName: 'Sarah Johnson',
                message: 'has requested for a virtual appointment on 27th September, 2021 | 04:30 pm',
                time: '2021-09-27T16:30:00Z',
                read: false
            },
            {
                id: 'notif_002',
                userAvatar: 'images/avatars/male-04.jpg',
                userName: 'Michael Chen',
                message: 'has requested for an in-person appointment on 28th September, 2021 | 02:15 pm',
                time: '2021-09-28T14:15:00Z',
                read: true
            }
        ]
    },
    'clinic_details': {
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
        virtualOperatingHours: {
            monday: { open: '10:00', close: '16:00', closed: false },
            tuesday: { open: '10:00', close: '16:00', closed: false },
            wednesday: { open: '10:00', close: '16:00', closed: false },
            thursday: { open: '10:00', close: '16:00', closed: false },
            friday: { open: '10:00', close: '16:00', closed: false },
            saturday: { open: '10:00', close: '14:00', closed: false },
            sunday: { open: '00:00', close: '00:00', closed: true }
        },
        status: 'active'
    }
};

// Function to export Firebase data
async function exportFirebaseData() {
    console.log('🚀 Starting Firebase data export...\n');
    
    const allData = {};
    
    // Export each collection
    for (const [collectionName, data] of Object.entries(mockFirebaseData)) {
        console.log(`🔄 Exporting ${collectionName}...`);
        
        if (Array.isArray(data)) {
            allData[collectionName] = data;
            objectToCSV(data, collectionName);
        } else {
            // For single documents like clinic_details and notifications
            allData[collectionName] = [data];
            objectToCSV([data], collectionName);
        }
    }
    
    // Export combined data as JSON
    const jsonPath = path.join(OUTPUT_DIR, 'firebase-all-data.json');
    fs.writeFileSync(jsonPath, JSON.stringify(allData, null, 2));
    console.log(`✅ Exported combined Firebase data to ${jsonPath}`);
    
    // Create summary report
    const summary = {
        exportDate: new Date().toISOString(),
        totalCollections: Object.keys(mockFirebaseData).length,
        dataSummary: {}
    };
    
    for (const [key, data] of Object.entries(allData)) {
        summary.dataSummary[key] = {
            recordCount: Array.isArray(data) ? data.length : 'N/A',
            dataType: Array.isArray(data) ? 'Array' : typeof data
        };
    }
    
    const summaryPath = path.join(OUTPUT_DIR, 'firebase-export-summary.json');
    fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
    console.log(`✅ Exported Firebase summary to ${summaryPath}`);
    
    console.log('\n🎉 Firebase data export completed!');
    console.log(`📁 Files saved in: ${OUTPUT_DIR}`);
}

// Run the export
exportFirebaseData().catch(console.error); 