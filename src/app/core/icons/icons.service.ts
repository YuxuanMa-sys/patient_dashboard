import { inject, Injectable } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

@Injectable({ providedIn: 'root' })
export class IconsService {
    /**
     * Constructor
     */
    constructor() {
        const domSanitizer = inject(DomSanitizer);
        const matIconRegistry = inject(MatIconRegistry);
        
        console.log('IconsService: Initializing custom icons...');

        // Register icon sets
        matIconRegistry.addSvgIconSet(
            domSanitizer.bypassSecurityTrustResourceUrl(
                'icons/material-twotone.svg'
            )
        );
        matIconRegistry.addSvgIconSetInNamespace(
            'mat_outline',
            domSanitizer.bypassSecurityTrustResourceUrl(
                'icons/material-outline.svg'
            )
        );
        matIconRegistry.addSvgIconSetInNamespace(
            'mat_solid',
            domSanitizer.bypassSecurityTrustResourceUrl(
                'icons/material-solid.svg'
            )
        );
        matIconRegistry.addSvgIconSetInNamespace(
            'feather',
            domSanitizer.bypassSecurityTrustResourceUrl('icons/feather.svg')
        );
        matIconRegistry.addSvgIconSetInNamespace(
            'heroicons_outline',
            domSanitizer.bypassSecurityTrustResourceUrl(
                'icons/heroicons-outline.svg'
            )
        );
        matIconRegistry.addSvgIconSetInNamespace(
            'heroicons_solid',
            domSanitizer.bypassSecurityTrustResourceUrl(
                'icons/heroicons-solid.svg'
            )
        );
        matIconRegistry.addSvgIconSetInNamespace(
            'heroicons_mini',
            domSanitizer.bypassSecurityTrustResourceUrl(
                'icons/heroicons-mini.svg'
            )
        );

        // Register custom navigation icons
        try {
            matIconRegistry.addSvgIcon(
                'custom_overview',
                domSanitizer.bypassSecurityTrustResourceUrl('icons/overview.svg')
            );
            console.log('Registered custom_overview icon');
            
            matIconRegistry.addSvgIcon(
                'custom_patients',
                domSanitizer.bypassSecurityTrustResourceUrl('icons/patients.svg')
            );
            console.log('Registered custom_patients icon');
        } catch (error) {
            console.error('Error registering custom icons:', error);
        }
        matIconRegistry.addSvgIcon(
            'custom_new_patient_request',
            domSanitizer.bypassSecurityTrustResourceUrl('icons/new-patient-request.svg')
        );
        matIconRegistry.addSvgIcon(
            'custom_appointments',
            domSanitizer.bypassSecurityTrustResourceUrl('icons/appointments.svg')
        );
        matIconRegistry.addSvgIcon(
            'custom_appointment_request',
            domSanitizer.bypassSecurityTrustResourceUrl('icons/appointment-request.svg')
        );
        matIconRegistry.addSvgIcon(
            'custom_announcement',
            domSanitizer.bypassSecurityTrustResourceUrl('icons/announcement.svg')
        );
        matIconRegistry.addSvgIcon(
            'custom_promotion',
            domSanitizer.bypassSecurityTrustResourceUrl('icons/promotion.svg')
        );
        matIconRegistry.addSvgIcon(
            'custom_inbox',
            domSanitizer.bypassSecurityTrustResourceUrl('icons/inbox.svg')
        );
        matIconRegistry.addSvgIcon(
            'custom_notification',
            domSanitizer.bypassSecurityTrustResourceUrl('icons/notification.svg')
        );
        matIconRegistry.addSvgIcon(
            'custom_clinic_setting',
            domSanitizer.bypassSecurityTrustResourceUrl('icons/clinic-setting.svg')
        );
        matIconRegistry.addSvgIcon(
            'custom_clinic_gallery',
            domSanitizer.bypassSecurityTrustResourceUrl('icons/clinic-gallery.svg')
        );
        matIconRegistry.addSvgIcon(
            'custom_provider',
            domSanitizer.bypassSecurityTrustResourceUrl('icons/provider.svg')
        );
        matIconRegistry.addSvgIcon(
            'custom_logout',
            domSanitizer.bypassSecurityTrustResourceUrl('icons/logout.svg')
        );
        
        console.log('IconsService: Custom icons registered successfully');
    }
}
