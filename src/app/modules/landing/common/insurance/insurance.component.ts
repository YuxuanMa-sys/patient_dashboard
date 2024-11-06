import { TextFieldModule } from '@angular/cdk/text-field';
import { AsyncPipe, CommonModule, DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnDestroy, OnInit, QueryList, ViewChildren, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatOptionModule, MatRippleModule } from '@angular/material/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';

import { debounceTime, map, Observable, of, Subject, Subscription, switchMap, takeUntil } from 'rxjs';

import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { ScrollStrategy, ScrollStrategyOptions } from '@angular/cdk/overlay';
import { environment } from 'environments/environment';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDividerModule } from '@angular/material/divider';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { PortalService } from 'app/modules/portal/portal.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';


@Component({
    selector: 'insurance',
    templateUrl: './insurance.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [NgIf, MatButtonModule, MatIconModule, FormsModule,
        ReactiveFormsModule,
        TextFieldModule, NgFor, MatCheckboxModule,
        RouterLink, MatSelectModule,
        NgClass, MatRippleModule, MatMenuModule, MatDialogModule, AsyncPipe,
        MatFormFieldModule,
        MatInputModule,
        MatOptionModule,
        MatRadioModule,
        MatDatepickerModule, MatDividerModule, DatePipe, CommonModule],
    providers: [DatePipe]
})
export class InsuranceModalComponent implements OnInit, OnDestroy {

    loading: boolean;
    error: string;
    form: FormGroup;
    single: any;
    /**
     * Constructor
     */
    constructor(
        private _portalService: PortalService,
        private cdr: ChangeDetectorRef,
        @Inject(MAT_DIALOG_DATA) private _data: { data: any },
        private _matDialogRef: MatDialogRef<InsuranceModalComponent>,
        private _scrollStrategyOptions: ScrollStrategyOptions,
        private router: Router,
        private route: ActivatedRoute,
        private datePipe: DatePipe,
        private fb: FormBuilder,
    ) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        this.form = this.fb.group({
            name: [null, Validators.required],
            status: [true],
            createdAt: new Date(),
        });

        this.single = this._data;

        if (this.single !== 'add') {
            this.single.createdAt = this.single.createdAt && this.single.createdAt.seconds ? new Date(this.single.createdAt.seconds * 1000) : null;
            this.form.patchValue(this.single);
        }
        console.log(this._data);

        // const dob = patient.dob && patient.dob.seconds ? new Date(patient.dob.seconds * 1000) : null;


    }


    async save(): Promise<void> {
        console.log(this.form.value);

        if (this.form.valid) {
            const formData = {
                ...this.form.value,
                // status: this.form.value.status === 'true' || this.form.value.status === true ? true : false,
            };
            if (this.single === 'add') {
                this._portalService.createInsurance(formData)
                    .then((res) => {
                        console.log('Patient created successfully with ID:', res.id);

                        this._matDialogRef.close({ ...res, id: res.id });
                        // Optionally, navigate or reload data if needed
                    })
                    .catch((error) => console.error('Error creating patient:', error));
            } else {

                this._portalService.updateInsurance(this.single.id, formData)
                    .then((res: any) => {
                        this._matDialogRef.close(res);
                        console.log('Patient updated successfully!'

                        )})
                    .catch((error) => console.error('Error updating patient:', error));
            }

        }
    }


    close() {
        this._matDialogRef.close();
    }
    /**
    * On destroy
    */
    ngOnDestroy(): void {
        // // Unsubscribe from all subscriptions
        // this._unsubscribeAll.next(null);
        // this._unsubscribeAll.complete();
    }


    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------



    /**
     * Track by function for ngFor loops
     *
     * @param index
     * @param item
     */
    trackByFn(index: number, item: any): any {
        return item.id || index;
    }


}
