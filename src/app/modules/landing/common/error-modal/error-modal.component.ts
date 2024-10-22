import { TextFieldModule } from '@angular/cdk/text-field';
import { AsyncPipe, NgClass, NgFor, NgIf } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnDestroy, OnInit, QueryList, ViewChildren, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRippleModule } from '@angular/material/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';


import { debounceTime, map, Observable, of, Subject, Subscription, switchMap, takeUntil } from 'rxjs';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FuseScrollbarDirective } from '@3DexCRM/directives/scrollbar';
import { ScrollStrategy, ScrollStrategyOptions } from '@angular/cdk/overlay';
import { cloneDeep } from 'lodash';

@Component({
    selector: 'error-modal',
    templateUrl: './error-modal.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [NgIf, MatButtonModule, MatFormFieldModule, MatInputModule, MatIconModule, FormsModule,
        TextFieldModule, NgFor, MatCheckboxModule,
        RouterLink,
        NgClass, MatRippleModule, MatMenuModule, MatDialogModule, AsyncPipe],
})
export class ErrorModalComponent implements OnInit, OnDestroy, AfterViewInit {
    note$: Observable<any>;
    single: any;
    singleAvailibity: any;
    labels$: Observable<any[]>;
    buttonStatus: boolean;
    formValue = {};

    noteChanged: Subject<any> = new Subject<any>();
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        @Inject(MAT_DIALOG_DATA) public data: any,
        public dialogRef: MatDialogRef<ErrorModalComponent>,
        private route: ActivatedRoute,
        private _matDialog: MatDialog,
        private _router: Router,
    ) {
    }


    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        this.single = this.data;
    }
    /**
     * On destroy
     */
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    ngAfterViewInit(): void {

    }

    close() {
        this.dialogRef.close();
    }
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
