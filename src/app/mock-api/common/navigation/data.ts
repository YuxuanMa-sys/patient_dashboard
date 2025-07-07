/* eslint-disable */
import { FuseNavigationItem } from '@fuse/components/navigation';

export const defaultNavigation: FuseNavigationItem[] = [
    {
        id   : 'dashboard',
        title: 'Overview',
        type : 'basic',
        icon : 'mat_solid:dashboard',
        link : '/portal/dashboard'
    },
    {
        id   : 'patients',
        title: 'Patients',
        type : 'basic',
        icon : 'mat_solid:people',
        link : '/portal/patients'
    },
    {
        id   : 'new-patient-requests',
        title: 'New Patient Requests',
        type : 'basic',
        icon : 'mat_solid:person_add',
        link : '/portal/new-patients'
    },
    {
        id   : 'appointments',
        title: 'Appointments',
        type : 'basic',
        icon : 'mat_solid:schedule',
        link : '/portal/appointments-list'
    },
    {
        id   : 'appointment-requests',
        title: 'Appointment Requests',
        type : 'basic',
        icon : 'mat_solid:event_note',
        link : '/portal/requests'
    },
    {
        id   : 'announcements',
        title: 'Announcements',
        type : 'basic',
        icon : 'mat_solid:campaign',
        link : '/portal/announcements'
    },
    {
        id   : 'promotions',
        title: 'Promotions',
        type : 'basic',
        icon : 'mat_solid:card_giftcard',
        link : '/portal/promotion'
    },
    {
        id   : 'inbox',
        title: 'Inbox',
        type : 'basic',
        icon : 'mat_solid:inbox',
        link : '#'
    },
    {
        id   : 'notifications',
        title: 'Notifications',
        type : 'basic',
        icon : 'mat_solid:notifications',
        link : '/portal/notifications'
    },
    {
        id   : 'clinic-settings',
        title: 'Clinic Settings',
        type : 'basic',
        icon : 'mat_solid:settings',
        link : '/portal/settings'
    },
    {
        id   : 'clinic-gallery',
        title: 'Clinic Gallery',
        type : 'basic',
        icon : 'mat_solid:photo_library',
        link : '/portal/clinic-gallery'
    },
    {
        id   : 'providers',
        title: 'Providers',
        type : 'basic',
        icon : 'mat_solid:medical_services',
        link : '/portal/providers'
    },
    {
        id   : 'logout',
        title: 'Logout',
        type : 'basic',
        icon : 'mat_solid:logout',
        link : '/sign-out'
    }
];

export const compactNavigation: FuseNavigationItem[] = [
    {
        id   : 'dashboard',
        title: 'Overview',
        type : 'basic',
        icon : 'mat_solid:dashboard',
        link : '/portal/dashboard'
    },
    {
        id   : 'patients',
        title: 'Patients',
        type : 'basic',
        icon : 'mat_solid:people',
        link : '/portal/patients'
    },
    {
        id   : 'appointments',
        title: 'Appointments',
        type : 'basic',
        icon : 'mat_solid:schedule',
        link : '/portal/appointments-list'
    },
    {
        id   : 'settings',
        title: 'Settings',
        type : 'basic',
        icon : 'mat_solid:settings',
        link : '/portal/settings'
    }
];

export const futuristicNavigation: FuseNavigationItem[] = [
    {
        id   : 'dashboard',
        title: 'Overview',
        type : 'basic',
        icon : 'mat_solid:dashboard',
        link : '/portal/dashboard'
    }
];

export const horizontalNavigation: FuseNavigationItem[] = [
    {
        id   : 'dashboard',
        title: 'Overview',
        type : 'basic',
        icon : 'mat_solid:dashboard',
        link : '/portal/dashboard'
    }
];
