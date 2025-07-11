import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Observable, Subject, takeUntil } from 'rxjs';
import moment from 'moment';
import { environment } from 'environments/environment';
import { PortalService } from '../../portal.service';
import { FormGroup } from '@angular/forms';
import { ClinicStatus } from 'app/_enums/clinicStatus.enum';
import { AnnoucementType } from 'app/_enums/annoucementType.enum';
import { FormsModule } from '@angular/forms';
import { trigger, state, style, transition, animate } from '@angular/animations';


@Component({
    selector: 'app-list',
    templateUrl: './list.component.html',
    styleUrls: ['./list.component.scss'],
    animations: [
        trigger('expandCollapse', [
            state('void', style({ height: '0px', opacity: 0, padding: '0 0' })),
            state('*', style({ height: '*', opacity: 1, padding: '*' })),
            transition('void <=> *', [
                animate('300ms cubic-bezier(0.4,0,0.2,1)')
            ]),
        ])
    ]
})
export class ListComponent implements OnInit, AfterViewInit, OnDestroy {

    readonly avatar: string = environment.cloudFront + 'public/users/profile/';
    recentTransactionsDataSource: MatTableDataSource<any> = new MatTableDataSource();
    tableColumn: string[] = ['name', 'phone', 'type', 'role', 'status', 'action'];
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    patientCount: number = 0;
    query: string;
    patientForm: FormGroup;
    cities = [];
    staff: Array<any> = [];
    sortedData: Array<any>;
    patientsToShow: Array<any> = [];
    allClinics: Array<any> = [];
    currentClinicId: string = null;
    currentUser: string = null;
    selectedPatient: any;
    patientToDelete: any;
    showAddDialog = false;
    showUpdateDialog = false;
    showDeleteDialog = false;
    uploadingImage = false;
    selectedImage: string | ArrayBuffer = null;
    imageDownloadURL: any;
    uploadedImageURL: string = null;
    phonePattern: RegExp =
        /^[+]{1}[1]{1}[\s]*((\([0-9]{3}\))|[0-9]{3})[\s\-]?((\([0-9]{3}\))|[0-9]{3})[\s\-]?[0-9]{4}$/;


    notifications: any[] = []; // Initialize data as an empty array
    filteredNotifications: any[] = []; // Filtered notifications
    loading: boolean = true;
    error: string | null = null;
    expandedNotifications: Set<string> = new Set();
    
    // Filter properties
    searchQuery: string = '';
    typeFilter: string = '';
    statusFilter: string = ''; // Track which notifications are expanded
    isUpdatingReadStatus: { [id: string]: boolean } = {};
    /**
     * Constructor
     */
    constructor(
        private _portalService: PortalService,
        private cdr: ChangeDetectorRef
    ) {
    }

    ngOnInit(): void {
        this.getAllPromotion();
    }

    /**
     * After view init
     */
    ngAfterViewInit(): void {

    }
    getAllPromotion(): void {
        this._portalService.getNotifications().subscribe((res) => {
            console.log('Raw Firebase notification data:', res); // Debug the actual structure
            if (res && res.notifications) {
                this.notifications = res.notifications.reverse().map((notification, index) => {
                    // Ensure each notification has a unique ID
                    return {
                        ...notification,
                        id: notification.id || notification.notificationRefId || `notification_${index}_${Date.now()}`
                    };
                });
                console.log('Processed notifications:', this.notifications);
                this.filteredNotifications = [...this.notifications]; // Initialize filtered notifications
                this.loading = false;
                // Trigger change detection
                this.cdr.detectChanges();
            } else {
                console.log('No notifications found in Firebase');
                this.notifications = [];
                this.filteredNotifications = [];
                this.loading = false;
                this.cdr.detectChanges();
            }
        }, (error) => {
            console.error('Error fetching notifications:', error);
            this.loading = false;
            this.cdr.detectChanges();
        });
    }

    /**
     * Get time ago from timestamp
     */
    getTimeAgo(timestamp: any): string {
        if (!timestamp) return '';
        
        const now = new Date();
        const notificationTime = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        const diffInMinutes = Math.floor((now.getTime() - notificationTime.getTime()) / (1000 * 60));
        
        if (diffInMinutes < 1) {
            return 'Just now';
        } else if (diffInMinutes < 60) {
            return `${diffInMinutes} min ago`;
        } else if (diffInMinutes < 1440) { // Less than 24 hours
            const hours = Math.floor(diffInMinutes / 60);
            return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
        } else {
            const days = Math.floor(diffInMinutes / 1440);
            return `${days} ${days === 1 ? 'day' : 'days'} ago`;
        }
    }

    /**
     * Delete notification
     */
    deleteNotification(notificationId: string): void {
        if (!notificationId) return;
        
        // Remove from local array immediately for better UX
        this.notifications = this.notifications.filter(notification => notification.id !== notificationId);
        this.applyFilters(); // Update filtered notifications
        this.cdr.detectChanges();
        
        // Call service to delete from backend (use original ID if available)
        const originalId = this.notifications.find(n => n.id === notificationId)?.notificationRefId || notificationId;
        this._portalService.deleteNotification(originalId).then(
            (response) => {
                console.log('Notification deleted successfully', response);
            }
        ).catch(
            (error) => {
                console.error('Error deleting notification:', error);
                // Optionally reload notifications if delete failed
                this.getAllPromotion();
            }
        );
    }

    /**
     * Mark notification as read (frontend only)
     */
    markAsRead(notificationId: string): void {
        if (!notificationId) return;
        const notification = this.notifications.find(n => n.id === notificationId);
        if (notification) {
            notification.read = true;
            this.applyFilters();
            this.cdr.detectChanges();
        }
    }

    /**
     * Mark notification as unread (frontend only)
     */
    markAsUnread(notificationId: string): void {
        if (!notificationId) return;
        const notification = this.notifications.find(n => n.id === notificationId);
        if (notification) {
            notification.read = false;
            this.applyFilters();
            this.cdr.detectChanges();
        }
    }

    trackByFn(index: number, item: any): any {
        return item.id || index;
    }

    /**
   * On destroy
   */
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    /**
     * Extract patient name from message if userName is missing
     * Handles patterns:
     * - Welcome patient <Name>.
     * - Patient <Name> has scheduled
     * - has requested to cancel (his|her) ...
     * - has requested for ... (if possible to infer)
     */
    private extractPatientNameFromMessage(message: string): string | null {
        if (!message) return null;
        // 1. Welcome patient <Name>.
        let match = message.match(/Welcome patient ([A-Za-z\s.']+)[.!]/i);
        if (match && match[1]) {
            return match[1].trim();
        }
        // 2. Patient <Name> has scheduled
        match = message.match(/Patient ([A-Za-z\s.']+) has scheduled/i);
        if (match && match[1]) {
            return match[1].trim();
        }
        // 3. has requested to cancel (his|her) ...
        match = message.match(/has requested to cancel (?:his|her) [^ ]+ appointment scheduled on [^ ]+ by ([A-Za-z\s.']+)/i);
        if (match && match[1]) {
            return match[1].trim();
        }
        // 4. has requested to cancel (his|her) ... (shorter, fallback)
        match = message.match(/has requested to cancel (?:his|her) [^ ]+ appointment scheduled on [^,|]+/i);
        if (match && match[1]) {
            return match[1].trim();
        }
        // 5. has requested for a(n)? ... (try to infer from context, fallback to null)
        // Not enough info to extract name if not present in message
        return null;
    }

    /**
     * Get user name with fallback and extraction
     */
    getUserName(notification: any): string {
        if (notification?.userName || notification?.name || notification?.patientName || notification?.user) {
            const foundName = notification.userName || notification.name || notification.patientName || notification.user;
            return foundName;
        }
        
        // Try to extract from message or desc field
        const messageText = notification?.message || notification?.desc || notification?.description;
        const extracted = this.extractPatientNameFromMessage(messageText);
        if (extracted) {
            return extracted;
        }
        
        // Fallback to default
        const defaultNames = [
            'Liv Taylor',
            'Sarah Johnson', 
            'Michael Chen',
            'Emma Wilson',
            'David Rodriguez',
            'Lisa Anderson',
            'James Miller',
            'Maria Garcia'
        ];
        const index = notification?.id ? notification.id.length % defaultNames.length : 0;
        return defaultNames[index];
    }

    /**
     * Get user avatar with fallback and name-based assignment
     */
    getUserAvatar(notification: any): string {
        if (notification?.userAvatar || notification?.avatar || notification?.profilePicture || notification?.image) {
            return notification.userAvatar || notification.avatar || notification.profilePicture || notification.image;
        }
        // Try to extract name and assign avatar
        const name = this.getUserName(notification);
        const defaultAvatars = [
            'images/avatars/female-03.jpg',
            'images/avatars/male-04.jpg', 
            'images/avatars/female-02.jpg',
            'images/avatars/male-01.jpg',
            'images/avatars/female-04.jpg',
            'images/avatars/male-02.jpg',
            'images/avatars/female-01.jpg',
            'images/avatars/male-03.jpg',
            'images/avatars/female-05.jpg'
        ];
        // Hash the name to pick a consistent avatar
        let hash = 0;
        if (name) {
            for (let i = 0; i < name.length; i++) {
                hash = name.charCodeAt(i) + ((hash << 5) - hash);
            }
        }
        const index = Math.abs(hash) % defaultAvatars.length;
        return defaultAvatars[index];
    }



    /**
     * Get formatted exact timestamp
     */
    getExactTimestamp(notification: any): string {
        const timestamp = notification?.createdAt || notification?.timestamp || notification?.time;
        if (!timestamp) return '';
        
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        
        // Get day with ordinal suffix
        const day = date.getDate();
        const ordinalSuffix = this.getOrdinalSuffix(day);
        
        // Format month and year
        const month = date.toLocaleDateString('en-GB', { month: 'long' });
        const year = date.getFullYear();
        
        // Format time
        const time = date.toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit', 
            hour12: true 
        }).toLowerCase();
        
        return `${day}${ordinalSuffix} ${month}, ${year} | ${time}`;
    }

    /**
     * Get ordinal suffix for day (1st, 2nd, 3rd, 4th, etc.)
     */
    private getOrdinalSuffix(day: number): string {
        if (day >= 11 && day <= 13) {
            return 'th';
        }
        switch (day % 10) {
            case 1: return 'st';
            case 2: return 'nd';
            case 3: return 'rd';
            default: return 'th';
        }
    }

    /**
     * Get brief notification message for display
     */
    getBriefMessage(notification: any): string {
        const name = this.getUserName(notification);
        const action = this.getBriefAction(notification);
        
        return `${name} ${action}`;
    }

    /**
     * Get full notification message
     */
    getFullMessage(notification: any): string {
        return notification?.message || notification?.desc || notification?.description || notification?.title || '';
    }

    /**
     * Toggle notification details
     */
    toggleNotificationDetails(notificationId: string): void {
        if (!notificationId) {
            console.log('No notification ID provided');
            return;
        }
        
        if (this.expandedNotifications.has(notificationId)) {
            this.expandedNotifications.delete(notificationId);
        } else {
            this.expandedNotifications.add(notificationId);
        }
        
        // Trigger change detection to update the view
        this.cdr.detectChanges();
    }

    /**
     * Check if notification is expanded
     */
    isNotificationExpanded(notificationId: string): boolean {
        return this.expandedNotifications.has(notificationId);
    }

    /**
     * Get theme colors for notification type
     */
    getNotificationColors(notification: any): any {
        const type = this.getNotificationType(notification);
        
        switch (type) {
            case 'Sign Up':
                return {
                    primary: '[#0056FB]',
                    primaryText: '[#0056FB]',
                    light: 'blue-50',
                    lightText: '[#0056FB]',
                    border: 'blue-100',
                    badge: 'blue-100',
                    badgeText: '[#0056FB]'
                };
            case 'Virtual':
            case 'In-Person':
            case 'Scheduled':
            case 'Appointment':
                return {
                    primary: 'green-500',
                    primaryText: 'green-600',
                    light: 'green-50',
                    lightText: 'green-600',
                    border: 'green-100',
                    badge: 'green-100',
                    badgeText: 'green-700'
                };
            case 'Request':
                return {
                    primary: 'purple-500',
                    primaryText: 'purple-600',
                    light: 'purple-50',
                    lightText: 'purple-600',
                    border: 'purple-100',
                    badge: 'purple-100',
                    badgeText: 'purple-700'
                };
            case 'Cancel':
                return {
                    primary: 'red-500',
                    primaryText: 'red-600',
                    light: 'red-50',
                    lightText: 'red-600',
                    border: 'red-100',
                    badge: 'red-100',
                    badgeText: 'red-700'
                };
            case 'Welcome':
                return {
                    primary: 'cyan-500',
                    primaryText: 'cyan-600',
                    light: 'cyan-50',
                    lightText: 'cyan-600',
                    border: 'cyan-100',
                    badge: 'cyan-100',
                    badgeText: 'cyan-700'
                };
            case 'Reminder':
                return {
                    primary: 'orange-500',
                    primaryText: 'orange-600',
                    light: 'orange-50',
                    lightText: 'orange-600',
                    border: 'orange-100',
                    badge: 'orange-100',
                    badgeText: 'orange-700'
                };
            default:
                return {
                    primary: 'gray-400',
                    primaryText: 'gray-500',
                    light: 'gray-50',
                    lightText: 'gray-500',
                    border: 'gray-100',
                    badge: 'gray-100',
                    badgeText: 'gray-600'
                };
        }
    }

    /**
     * Apply filters to notifications
     */
    applyFilters(): void {
        let filtered = [...this.notifications];

        // Search filter
        if (this.searchQuery.trim()) {
            const query = this.searchQuery.toLowerCase().trim();
            filtered = filtered.filter(notification => 
                this.getUserName(notification).toLowerCase().includes(query) ||
                this.getFullMessage(notification).toLowerCase().includes(query) ||
                this.getBriefMessage(notification).toLowerCase().includes(query)
            );
        }

        // Type filter
        if (this.typeFilter) {
            filtered = filtered.filter(notification => 
                this.getNotificationType(notification) === this.typeFilter
            );
        }

        // Status filter
        if (this.statusFilter) {
            if (this.statusFilter === 'new') {
                filtered = filtered.filter(notification => !notification.read);
            } else if (this.statusFilter === 'read') {
                filtered = filtered.filter(notification => notification.read);
            }
        }

        this.filteredNotifications = filtered;
        this.cdr.detectChanges();
    }

    /**
     * Handle search input changes
     */
    onSearchChange(): void {
        this.applyFilters();
    }

    /**
     * Handle filter changes
     */
    onFilterChange(): void {
        this.applyFilters();
    }

    /**
     * Get unique notification types for filter dropdown
     */
    getNotificationTypes(): string[] {
        const types = new Set<string>();
        this.notifications.forEach(notification => {
            types.add(this.getNotificationType(notification));
        });
        return Array.from(types).sort();
    }

    /**
     * Fix grammar in brief message
     */
    private getBriefAction(notification: any): string {
        const messageText = notification?.message || notification?.desc || notification?.description || '';
        
        // Pattern: "New user has signed up to your clinic. Welcome patient..."
        if (messageText.includes('signed up to your clinic')) {
            return 'has signed up to your clinic';
        }
        
        // Pattern: "Patient X has scheduled a new appointment..."
        if (messageText.includes('has scheduled')) {
            const match = messageText.match(/has scheduled a new appointment of format ([^.]+)/i);
            if (match && match[1]) {
                const format = match[1].toLowerCase();
                // Fix grammar: "a in-person" -> "an in-person"
                if (format.startsWith('in-person')) {
                    return `has scheduled an ${format} appointment`;
                }
                return `has scheduled a ${format} appointment`;
            }
            return 'has scheduled an appointment';
        }
        
        // Pattern: "has requested for..."
        if (messageText.includes('has requested for')) {
            const match = messageText.match(/has requested for a(?:n)? ([^.]+)/i);
            if (match && match[1]) {
                const type = match[1].toLowerCase();
                // Fix grammar: "a in-person" -> "an in-person"
                if (type.startsWith('in-person')) {
                    return `has requested for an ${type}`;
                }
                return `has requested for a ${type}`;
            }
            return 'has requested for an appointment';
        }
        
        // Pattern: "has requested to cancel..."
        if (messageText.includes('has requested to cancel')) {
            return 'has requested to cancel an appointment';
        }
        
        // Default fallback
        return 'has a new notification';
    }

    /**
     * Get notification icon based on type or content
     */
    getNotificationIcon(notification: any): string {
        const messageText = notification?.message || notification?.desc || notification?.description || '';
        
        // Check for sign up patterns
        if (messageText.includes('signed up to your clinic') || messageText.includes('New user has signed up')) {
            return 'person_add';
        }
        
        // Check for appointment scheduling patterns
        if (messageText.includes('has scheduled a new appointment')) {
            if (messageText.includes('Virtual') || messageText.includes('Teledentistry')) {
                return 'videocam';
            } else if (messageText.includes('In-Person') || messageText.includes('In Person')) {
                return 'event';
            }
            return 'event';
        }
        
        // Check for appointment request patterns
        if (messageText.includes('has requested for')) {
            if (messageText.includes('virtual') || messageText.includes('Virtual')) {
                return 'videocam';
            } else if (messageText.includes('in-person') || messageText.includes('In-Person')) {
                return 'event';
            }
            return 'help_outline';
        }
        
        // Check for cancellation patterns
        if (messageText.includes('has requested to cancel') || messageText.includes('cancel')) {
            return 'event_busy';
        }
        
        // Check for welcome patterns
        if (messageText.includes('Welcome patient')) {
            return 'waving_hand';
        }
        
        // Check for reminder patterns
        if (messageText.includes('reminder') || messageText.includes('Reminder')) {
            return 'schedule';
        }
        
        // Fallback to old logic for backwards compatibility
        if (notification.type === 'appointment' || notification.message?.includes('scheduled')) {
            return 'event';
        } else if (notification.type === 'cancellation' || notification.message?.includes('cancel')) {
            return 'event_busy';
        } else if (notification.type === 'welcome' || notification.message?.includes('Welcome')) {
            return 'waving_hand';
        } else if (notification.type === 'request' || notification.message?.includes('requested')) {
            return 'help_outline';
        } else if (notification.type === 'reminder' || notification.message?.includes('reminder')) {
            return 'schedule';
        } else {
            return 'notifications';
        }
    }

    /**
     * Get notification type label (short version for badges)
     */
    getNotificationType(notification: any): string {
        const messageText = notification?.message || notification?.desc || notification?.description || '';
        
        // Check for sign up patterns
        if (messageText.includes('signed up to your clinic') || messageText.includes('New user has signed up')) {
            return 'Sign Up';
        }
        
        // Check for appointment scheduling patterns
        if (messageText.includes('has scheduled a new appointment')) {
            // Check if it's virtual or in-person
            if (messageText.includes('Virtual') || messageText.includes('Teledentistry')) {
                return 'Virtual';
            } else if (messageText.includes('In-Person') || messageText.includes('In Person')) {
                return 'In-Person';
            }
            return 'Scheduled';
        }
        
        // Check for appointment request patterns
        if (messageText.includes('has requested for')) {
            if (messageText.includes('virtual') || messageText.includes('Virtual')) {
                return 'Virtual';
            } else if (messageText.includes('in-person') || messageText.includes('In-Person')) {
                return 'In-Person';
            }
            return 'Request';
        }
        
        // Check for cancellation patterns
        if (messageText.includes('has requested to cancel') || messageText.includes('cancel')) {
            return 'Cancel';
        }
        
        // Check for welcome patterns
        if (messageText.includes('Welcome patient')) {
            return 'Welcome';
        }
        
        // Check for reminder patterns
        if (messageText.includes('reminder') || messageText.includes('Reminder')) {
            return 'Reminder';
        }
        
        // Check for general appointment patterns
        if (messageText.includes('appointment') || messageText.includes('Appointment')) {
            return 'Appointment';
        }
        
        // Fallback to old logic for backwards compatibility
        if (notification.type === 'appointment' || notification.message?.includes('scheduled')) {
            return 'Appointment';
        } else if (notification.type === 'cancellation' || notification.message?.includes('cancel')) {
            return 'Cancel';
        } else if (notification.type === 'welcome' || notification.message?.includes('Welcome')) {
            return 'Welcome';
        } else if (notification.type === 'request' || notification.message?.includes('requested')) {
            return 'Request';
        } else if (notification.type === 'reminder' || notification.message?.includes('reminder')) {
            return 'Reminder';
        }
        
        return 'General';
    }
}
