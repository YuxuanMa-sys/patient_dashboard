import { CurrencyPipe, NgClass, NgFor, NgIf } from '@angular/common';
import { DatePipe } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    OnInit,
    ViewEncapsulation,
} from '@angular/core';
import {
    FormsModule,
    ReactiveFormsModule,
    UntypedFormBuilder,
    UntypedFormGroup,
    Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FuseAlertComponent } from '@fuse/components/alert';

@Component({
    selector: 'settings-plan-billing',
    templateUrl: './plan-billing.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [
        FormsModule,
        ReactiveFormsModule,
        FuseAlertComponent,
        MatRadioModule,
        NgClass,
        NgFor,
        NgIf,
        MatIconModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatOptionModule,
        MatButtonModule,
        MatCheckboxModule,
        CurrencyPipe,
        DatePipe,
    ],
})
export class SettingsPlanBillingComponent implements OnInit {
    planBillingForm: UntypedFormGroup;
    paymentForm: UntypedFormGroup;
    billingCycle: 'monthly' | 'yearly' = 'monthly';
    selectedPlan: string = 'professional';
    // Payment method selection
    selectedPaymentMethod: string = 'card';

    // Mocked subscription info for the current user
    subscriptionInfo = {
        plan: 'Professional',
        status: 'Active',
        lastBilled: new Date('2024-05-01'),
        nextBilling: new Date('2024-06-01'),
        billingEmail: 'user@email.com',
        canUpgrade: true
    };

    // Dental clinic management system plans
    plans = [
        {
            id: 'starter',
            name: 'Starter Plan',
            badge: 'BASIC',
            badgeColor: 'bg-blue-100 text-blue-600',
            monthlyPrice: 29,
            yearlyPrice: 290,
            features: [
                'Up to 100 patient records',
                'Basic appointment scheduling',
                'Patient communication tools',
                'Basic reporting & analytics',
                'Email support',
                'Mobile app access'
            ],
            getButtonText: (currentPlan: string) => currentPlan === 'starter' ? 'Current Plan' : 'Downgrade to Starter',
            getButtonStyle: (currentPlan: string) => currentPlan === 'starter' ? 'bg-gray-200 text-gray-500 border border-gray-200 cursor-not-allowed' : 'bg-white text-gray-900 border border-gray-300 hover:bg-gray-50',
            cardStyle: 'bg-white border-gray-200'
        },
        {
            id: 'professional',
            name: 'Professional Plan',
            badge: 'POPULAR',
            badgeColor: 'bg-orange-500 text-white',
            monthlyPrice: 79,
            yearlyPrice: 790,
            features: [
                'Up to 1,000 patient records',
                'Advanced appointment scheduling',
                'Treatment planning & notes',
                'Insurance claim management',
                'Automated reminders & notifications',
                'Comprehensive reporting',
                'Priority support',
                'Staff management (up to 5 users)'
            ],
            getButtonText: (currentPlan: string) => currentPlan === 'professional' ? 'Current Plan' : (currentPlan === 'starter' ? 'Upgrade to Professional' : 'Downgrade to Professional'),
            getButtonStyle: (currentPlan: string) => currentPlan === 'professional' ? 'bg-gray-200 text-gray-500 border border-gray-200 cursor-not-allowed' : 'bg-white text-gray-900 hover:bg-gray-50',
            cardStyle: 'bg-gray-900 text-white',
            isHighlighted: true
        },
        {
            id: 'enterprise',
            name: 'Enterprise Plan',
            badge: 'ADVANCED',
            badgeColor: 'bg-green-500 text-white',
            monthlyPrice: 0,
            yearlyPrice: 0,
            isCustom: true,
            features: [
                'Unlimited patient records',
                'Multi-location support',
                'Advanced analytics & insights',
                'Custom integrations & API access',
                'Dedicated account manager',
                'Custom training & onboarding',
                'HIPAA compliance tools',
                'Unlimited staff users'
            ],
            getButtonText: (currentPlan: string) => currentPlan === 'enterprise' ? 'Current Plan' : 'Upgrade to Enterprise',
            getButtonStyle: (currentPlan: string) => currentPlan === 'enterprise' ? 'bg-gray-200 text-gray-500 border border-gray-200 cursor-not-allowed' : 'bg-gray-900 text-white hover:bg-gray-800',
            cardStyle: 'bg-white border-gray-200'
        }
    ];

    // Show cancel subscription button for current plan
    showCancelSubscription(planId: string): boolean {
        return planId === this.selectedPlan;
    }

    // Payment methods data (simplified for the new design)
    paymentMethods = [
        { id: 'card', name: 'Credit/Debit Card', description: 'Visa, Mastercard, American Express', icon: 'credit_card', iconColor: 'text-blue-600' },
        { id: 'google-pay', name: 'Google Pay', description: 'Pay with your Google account', icon: 'account_balance_wallet', iconColor: 'text-green-600' },
        { id: 'bank', name: 'Bank Transfer', description: 'Direct bank transfer (ACH)', icon: 'account_balance', iconColor: 'text-purple-600' }
    ];

    countries = [
        { value: 'US', label: 'United States' },
        { value: 'CA', label: 'Canada' },
        { value: 'UK', label: 'United Kingdom' },
        { value: 'DE', label: 'Germany' },
        { value: 'FR', label: 'France' },
        { value: 'AU', label: 'Australia' },
        { value: 'JP', label: 'Japan' }
    ];

    /**
     * Constructor
     */
    constructor(private _formBuilder: UntypedFormBuilder) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        // Create the forms
        this.planBillingForm = this._formBuilder.group({
            plan: [this.selectedPlan],
            billingCycle: [this.billingCycle]
        });

        this.paymentForm = this._formBuilder.group({
            paymentMethod: [this.selectedPaymentMethod],
            country: ['US', Validators.required],
            address: ['', Validators.required],
            cardNumber: ['', Validators.required],
            expiry: ['', Validators.required],
            cvc: ['', Validators.required],
            billingIsSame: [true]
        });
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Toggle billing cycle
     */
    toggleBillingCycle(cycle: 'monthly' | 'yearly'): void {
        this.billingCycle = cycle;
        this.planBillingForm.patchValue({ billingCycle: cycle });
    }

    /**
     * Select plan
     */
    selectPlan(planId: string): void {
        this.selectedPlan = planId;
        this.planBillingForm.patchValue({ plan: planId });
        // Update summary card info to reflect the selected plan
        const planObj = this.plans.find(p => p.id === planId);
        if (planObj) {
            this.subscriptionInfo.plan = planObj.name;
            // Optionally, update billing dates to mock a new cycle
            const now = new Date();
            this.subscriptionInfo.lastBilled = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
            this.subscriptionInfo.nextBilling = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 29);
        }
    }

    /**
     * Select payment method
     */
    selectPaymentMethod(method: string): void {
        this.selectedPaymentMethod = method;
        this.paymentForm.patchValue({ paymentMethod: method });
    }

    /**
     * Get plan price based on billing cycle
     */
    getPlanPrice(plan: any): number {
        if (plan.isCustom) return 0;
        return this.billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;
    }

    /**
     * Get plan price text
     */
    getPlanPriceText(plan: any): string {
        if (plan.isCustom) return 'Custom Pricing';
        const price = this.getPlanPrice(plan);
        const cycle = this.billingCycle === 'monthly' ? 'month' : 'year';
        return `$${price} /${cycle}`;
    }

    /**
     * Get selected payment method
     */
    getSelectedPaymentMethod(): any {
        return this.paymentMethods.find(method => method.id === this.selectedPaymentMethod);
    }

    /**
     * Save billing settings
     */
    saveBillingSettings(): void {
        if (this.planBillingForm.valid && this.paymentForm.valid) {
            const billingData = {
                ...this.planBillingForm.value,
                ...this.paymentForm.value
            };
            console.log('Saving billing settings:', billingData);
            // Implement save logic here
        }
    }

    /**
     * Cancel changes
     */
    cancelChanges(): void {
        this.planBillingForm.reset();
        this.paymentForm.reset();
        this.billingCycle = 'monthly';
        this.selectedPlan = 'professional';
        this.selectedPaymentMethod = 'card';
    }
}
