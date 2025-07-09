/* eslint-disable */
import { FuseNavigationItem } from '@fuse/components/navigation';

export const defaultNavigation: FuseNavigationItem[] = [
    {
        id   : 'dashboard',
        title: 'Overview',
        type : 'basic',
        image: 'icons/overview.png',
        link : '/portal/dashboard'
    },
    {
        id   : 'patients',
        title: 'Patients',
        type : 'basic',
        image: 'icons/patients.png',
        link : '/portal/patients'
    },
    {
        id   : 'new-patient-requests',
        title: 'New Patient Requests',
        type : 'basic',
        image: 'icons/new_patient.png',
        link : '/portal/new-patients'
    },
    {
        id   : 'appointments',
        title: 'Appointments',
        type : 'basic',
        image: 'icons/appointment.png',
        link : '/portal/appointments-list'
    },
    {
        id   : 'appointment-requests',
        title: 'Appointment Requests',
        type : 'basic',
        image: 'icons/appointment_request.png',
        link : '/portal/requests',
        badge: {
            title: '',
            classes: 'w-2 h-2 bg-red-500 text-red-500 rounded-full'
        }
    },
    {
        id   : 'announcements',
        title: 'Announcements',
        type : 'basic',
        image: 'icons/announcement.png',
        link : '/portal/announcements'
    },
    {
        id   : 'promotions',
        title: 'Promotions',
        type : 'basic',
        image: 'icons/promotion.png',
        link : '/portal/promotion'
    },
    {
        id   : 'inbox',
        title: 'Inbox',
        type : 'basic',
        image: 'icons/inbox.png',
        link : '#'
    },
    {
        id   : 'notifications',
        title: 'Notifications',
        type : 'basic',
        image: 'icons/notification.png',
        link : '/portal/notifications',
        badge: {
            title: '',
            classes: 'w-2 h-2 bg-blue-500 text-blue-500 rounded-full'
        }
    },
    {
        id   : 'clinic-settings',
        title: 'Clinic Settings',
        type : 'basic',
        image: 'icons/setting.png',
        link : '/portal/settings'
    },
    {
        id   : 'clinic-gallery',
        title: 'Clinic Gallery',
        type : 'basic',
        image: 'icons/gallery.png',
        link : '/portal/clinic-gallery'
    },
    {
        id   : 'providers',
        title: 'Providers',
        type : 'basic',
        image: 'icons/provider.png',
        link : '/portal/providers'
    },
    {
        id   : 'logout',
        title: 'Logout',
        type : 'basic',
        image: 'icons/logout.png',
        link : '/sign-out'
    }
];

export const compactNavigation: FuseNavigationItem[] = [
    {
        id   : 'dashboard',
        title: 'Overview',
        type : 'basic',
        image: 'icons/overview.png',
        link : '/portal/dashboard'
    },
    {
        id   : 'patients',
        title: 'Patients',
        type : 'basic',
        image: 'icons/patients.png',
        link : '/portal/patients'
    },
    {
        id   : 'appointments',
        title: 'Appointments',
        type : 'basic',
        image: 'icons/appointment.png',
        link : '/portal/appointments-list'
    },
    {
        id   : 'settings',
        title: 'Settings',
        type : 'basic',
        image: 'icons/setting.png',
        link : '/portal/settings'
    }
];

export const futuristicNavigation: FuseNavigationItem[] = [
    {
        id   : 'dashboard',
        title: 'Overview',
        type : 'basic',
        image: 'icons/overview.png',
        link : '/portal/dashboard'
    }
];

export const horizontalNavigation: FuseNavigationItem[] = [
    {
        id   : 'dashboard',
        title: 'Overview',
        type : 'basic',
        image: 'icons/overview.png',
        link : '/portal/dashboard'
    }
];
