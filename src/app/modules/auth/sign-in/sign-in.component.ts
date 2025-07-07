import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import {
    FormsModule,
    NgForm,
    ReactiveFormsModule,
    UntypedFormBuilder,
    UntypedFormGroup,
    Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { FuseAlertComponent, FuseAlertType } from '@fuse/components/alert';
import { AuthService } from 'app/core/auth/auth.service';

@Component({
    selector: 'auth-sign-in',
    templateUrl: './sign-in.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations,
    standalone: true,
    imports: [
        RouterLink,
        FuseAlertComponent,
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        MatCheckboxModule,
        MatProgressSpinnerModule,
    ],
    styles: [`
        /* Import Google Fonts for better typography */
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@400;500;600;700&display=swap');
        
        .auth-sign-in {
            font-family: 'Inter', 'Poppins', system-ui, -apple-system, sans-serif;
            height: 100vh;
            overflow: hidden;
        }
        
        /* Clean input styling to match the design */
        .auth-sign-in input {
            font-family: 'Inter', 'Poppins', system-ui, -apple-system, sans-serif !important;
            border: none !important;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1) !important;
            background: #FFFFFF !important;
            border-radius: 8px !important;
            font-size: 16px !important;
            font-weight: 500 !important;
            transition: all 0.3s ease !important;
        }
        
        .auth-sign-in input:focus {
            outline: none !important;
            box-shadow: 0 0 0 2px #0056FB !important;
            transform: translateY(-1px) !important;
        }
        
        .auth-sign-in input::placeholder {
            color: #999 !important;
            font-weight: 400 !important;
        }
        
        .auth-sign-in button {
            font-family: 'Inter', 'Poppins', system-ui, -apple-system, sans-serif !important;
            transition: all 0.3s ease !important;
        }
        
        .auth-sign-in button:hover {
            transform: translateY(-1px) !important;
            box-shadow: 0 4px 12px rgba(0, 86, 251, 0.3) !important;
        }
        
        .auth-sign-in label {
            font-family: 'Inter', 'Poppins', system-ui, -apple-system, sans-serif !important;
            font-weight: 500 !important;
        }
        
        /* Typography improvements */
        .auth-sign-in h1 {
            font-weight: 700 !important;
            letter-spacing: -0.025em !important;
        }
        
        /* Links styling */
        .auth-sign-in a {
            transition: all 0.2s ease !important;
        }
        
        .auth-sign-in a:hover {
            text-decoration: underline !important;
        }
        
        /* Remove default form field styling */
        .auth-sign-in .mat-mdc-form-field {
            display: none !important;
        }
        
        /* Custom focus and hover states */
        .auth-sign-in .focus\:ring-2:focus {
            ring-width: 2px !important;
            ring-color: #0056FB !important;
        }
        
        /* Doctor image container styling */
        .auth-sign-in .doctor-container {
            filter: drop-shadow(0 10px 25px rgba(0, 0, 0, 0.1));
        }
        
        /* Exact color matches from design */
        .main-blue { color: #0056FB; background-color: #0056FB; }
        .main-orange { color: #FFB91D; background-color: #FFB91D; }
        .text-primary { color: #344153; }
        .text-secondary { color: #666666; }
        .bg-light { background-color: #F2F5F9; }
        
        /* Responsive adjustments */
        @media (max-width: 768px) {
            .auth-sign-in {
                flex-direction: column;
            }
            
            .auth-sign-in .flex-1.max-w-md {
                max-width: 100%;
                min-height: 300px;
            }
        }
    `]
})
export class AuthSignInComponent implements OnInit {
    @ViewChild('signInNgForm') signInNgForm: NgForm;

    alert: { type: FuseAlertType; message: string } = {
        type: 'success',
        message: '',
    };
    signInForm: UntypedFormGroup;
    showAlert: boolean = false;
    showPassword: boolean = false;

    /**
     * Constructor
     */
    constructor(
        private _activatedRoute: ActivatedRoute,
        private _authService: AuthService,
        private _formBuilder: UntypedFormBuilder,
        private _router: Router
    ) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        // Create the form
        this.signInForm = this._formBuilder.group({
            email: [
                'umer@4smile.com',
                [Validators.required, Validators.email],
            ],
            password: ['1660Umer@', Validators.required],
            phone: ['+92-333-6787103'],
        });
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Toggle password visibility
     */
    togglePasswordVisibility(): void {
        this.showPassword = !this.showPassword;
    }

    /**
     * Sign in
     */
    signIn(): void {
        // Return if the form is invalid
        if (this.signInForm.invalid) {
            return;
        }

        // Disable the form
        this.signInForm.disable();

        // Hide the alert
        this.showAlert = false;

        // Sign in
        this._authService.signIn(this.signInForm.value).subscribe(
            () => {
                // Set the redirect url.
                // The '/signed-in-redirect' is a dummy url to catch the request and redirect the user
                // to the correct page after a successful sign in. This way, that url can be set via
                // routing file and we don't have to touch here.
                const redirectURL =
                    this._activatedRoute.snapshot.queryParamMap.get(
                        'redirectURL'
                    ) || '/signed-in-redirect';

                // Navigate to the redirect url
                this._router.navigateByUrl(redirectURL);
            },
            (response) => {
                // Re-enable the form
                this.signInForm.enable();

                // Reset the form
                this.signInNgForm.resetForm();

                // Set the alert
                this.alert = {
                    type: 'error',
                    message: 'Wrong email or password',
                };

                // Show the alert
                this.showAlert = true;
            }
        );
    }
}
