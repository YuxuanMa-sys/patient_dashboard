/* eslint-disable */
import { FuseNavigationItem } from '@fuse/components/navigation';

export const defaultNavigation: FuseNavigationItem[] = [
    {
        id   : 'dashboard',
        title: 'Overview',
        type : 'basic',
        // icon : 'heroicons_outline:chart-pie',
        image : 'menu/menu1.svg',
        link : '/portal/dashboard'
    },
    {
        id   : 'patients',
        title: 'Patients',
        type : 'basic',
        // icon : 'heroicons_outline:chart-pie',
        image : 'menu/menu2.svg',
        link : '/portal/patients'
    },

    {
        id   : 'newpatients',
        title: 'New Patient Requests',
        type : 'basic',
        // icon : 'heroicons_outline:chart-pie',
        image : 'menu/menu3.svg',
        link : '/portal/new-patients'
    },
    {
        id   : 'appointments',
        title: 'Appointments',
        type : 'basic',
        // icon : 'heroicons_outline:chart-pie',
        image : 'menu/menu4.svg',
        link : '/portal/appointments-list'
    },

    {
        id   : 'requests',
        title: 'Appointment Requests',
        type : 'basic',
        // icon : 'heroicons_outline:chart-pie',
        image : 'menu/menu5.svg',
        link : '/portal/requests'
    },
    {
        id   : 'announcements',
        title: 'Announcements',
        type : 'basic',
        // icon : 'heroicons_outline:chart-pie',
        image : 'menu/menu6.svg',
        link : '/portal/announcements'
    },
    {
        id   : 'promotion',
        title: 'Promotion',
        type : 'basic',
        // icon : 'heroicons_outline:chart-pie',
        image : 'menu/menu7.svg',
        link : '/portal/promotion'
    },

    {
        id   : 'inbox',
        title: 'Inbox',
        type : 'basic',
        // icon : 'heroicons_outline:chart-pie',
        image : 'menu/menu8.svg',
        link : '/portal/staff'
    },
    {
        id   : 'notifications',
        title: 'Notifications',
        type : 'basic',
        // icon : 'heroicons_outline:chart-pie',
        image : 'menu/menu9.svg',
        link : '/portal/notifications'
    },
    {
        id   : 'staff',
        title: 'Staff',
        type : 'basic',
        // icon : 'heroicons_outline:chart-pie',
        image : 'menu/menu10.svg',
        link : '/portal/staff'
    },
    {
        id   : 'insurance',
        title: 'Insurance',
        type : 'basic',
        // icon : 'heroicons_outline:chart-pie',
        image : 'menu/menu10.svg',
        link : '/portal/insurance'
    },
    {
        id   : 'setting',
        title: 'Clinic Settings',
        type : 'basic',
        // icon : 'heroicons_outline:chart-pie',
        image : 'menu/menu11.svg',
        link : '/portal/settings'
    },

    {
        id   : 'clinic',
        title: 'Clinic Details',
        type : 'basic',
        // icon : 'heroicons_outline:chart-pie',
        image : 'menu/menu11.svg',
        link : '/portal/clinic-details'
    },

    {
        id   : 'logout',
        title: 'Logout',
        type : 'basic',
        // icon : 'heroicons_outline:chart-pie',
        image : 'menu/menu11.svg',
        link : '/portal/setting'
    },


];
export const compactNavigation: FuseNavigationItem[] = [
    {
        id   : 'example',
        title: 'Example',
        type : 'basic',
        icon : 'heroicons_outline:chart-pie',
        link : '/example'
    },
    {
        id   : 'example2',
        title: 'Example2',
        type : 'basic',
        icon : 'heroicons_outline:chart-pie',
        link : '/example'
    }
];
export const futuristicNavigation: FuseNavigationItem[] = [
    {
        id   : 'example',
        title: 'Example',
        type : 'basic',
        icon : 'heroicons_outline:chart-pie',
        link : '/example'
    }
];
export const horizontalNavigation: FuseNavigationItem[] = [
    {
        id   : 'example',
        title: 'Example',
        type : 'basic',
        icon : 'heroicons_outline:chart-pie',
        link : '/example'
    }
];
