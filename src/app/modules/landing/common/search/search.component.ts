import { FuseCardComponent } from '@3DexCRM/components/card';
import { CommonModule, DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component, ElementRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, NgForm, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subject } from 'rxjs';
import { Observable } from 'rxjs/internal/Observable';
import { HomeService } from '../../home/home.service';

import { MatAutocompleteModule, MatAutocompleteSelectedEvent, MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { startWith, map, takeUntil, take, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { LandingService } from '../../landing.service';
import { FuseAlertType } from '@3DexCRM/components/alert';

declare var google: any;

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
  encapsulation: ViewEncapsulation.None,
  // exportAs       : 'search',
  standalone: true,
  imports: [MatButtonModule, RouterLink, MatIconModule, FuseCardComponent, CommonModule,
    MatSlideToggleModule, MatDatepickerModule, ReactiveFormsModule, DatePipe,
    MatSelectModule,
    MatOptionModule,
    MatInputModule,
    MatAutocompleteModule,
    FormsModule
  ],

  providers: [DatePipe]
})
export class SearchFilterComponent {

  locationSearch: any[] = [];
  services: any[] = [];
  insurances: any;
  searchForm: FormGroup;
  minDate: Date;
  topDoctors: any;
  serviceCtrl = new FormControl();
  filteredServices: Observable<any[]>;
  faqCategories: any[];
  afterLoad: boolean;
  recentAll = [];
  locationSearchCtrl = new FormControl();
  filteredLocationSearch: Observable<any[]>;
  formData = {
    email: '', // Initialize the email property as an empty string
  };
  error: any;
  alert: { type: FuseAlertType; message: string } = {
    type: 'success',
    message: '',
  };
  showAlert: boolean;

  private _unsubscribeAll: Subject<any> = new Subject<any>();
  addressDataAvailable: boolean;
  @ViewChild('autocompleteInput', { static: true }) autocompleteInput!: ElementRef;
  @ViewChild('autocompleteInput', { read: MatAutocompleteTrigger }) autocompleteInputTrigger!: MatAutocompleteTrigger;
  showCurrentLocation: boolean;

  /**
   * Constructor
   */
  constructor(
    private _generalService: LandingService,
    private _changeDetectorRef: ChangeDetectorRef,
    private fb: FormBuilder,
    private datePipe: DatePipe,
    private router: Router,
    private route: ActivatedRoute,
  ) {
  }

  ngOnInit(): void {
    this.getData();
    this.minDate = new Date();
    this.searchForm = this.fb.group({
      address: [''],
      city: [''],
      state: [''],
      zip_code: [''],
      services: [''],
      specializations: [''],
      insurance: [''],
      availability: [''],
      verified: ['No'],
      user_latitude: [''],
      user_longitude: ['']
    });

    const currentUser = JSON.parse(localStorage.getItem('address')) ?? '';

    if (currentUser) {
      this.locationSearchCtrl.setValue(currentUser.city || currentUser.state || currentUser.country);
    }


    this.serviceCtrl = new FormControl();
    this.filteredServices = this.serviceCtrl.valueChanges.pipe(
      startWith(''),
      map((value) => this._filterServices(value))
    );

    this.initializeAutocomplete();
    this.searchFilter();
  }

  searchFilter() {
    this.route.queryParams.subscribe((searchParams) => {
      const formattedServices = searchParams.services ? `[${searchParams.services}]` : '';
      const formattedInsurance = searchParams.insurance ? `[${searchParams.insurance}]` : '';
      const formattedSpecializations = searchParams.specializations ? `[${searchParams.specializations}]` : '';
      // const formattedEducations = searchParams.educations ? `[${searchParams.educations}]` : '';
      const formattedLanguages = searchParams.languages ? `[${searchParams.languages}]` : '';
      // this.serviceCtrl = searchParams.services;
      const searchParameters = {
        address: searchParams.address || '',
        insurance: searchParams.insurance ? Number(searchParams.insurance.replace(/\[|\]/g, '')) : null,
        services: searchParams.services ? Number(searchParams.services.replace(/\[|\]/g, '')) : null,
        specializations: searchParams.specializations ? Number(searchParams.specializations.replace(/\[|\]/g, '')) : null,
        availability: searchParams.availability || null,
        verified: searchParams.verified || '',
        // educations: formattedEducations,
        languages: formattedLanguages,
        user_latitude: searchParams.user_latitude || '',
        user_longitude: searchParams.user_longitude || '',
      };
      // this.serviceCtrl.setValue(searchParams.services);
      this.searchForm.patchValue(searchParameters);

      this.filteredServices.pipe(
        take(1) // Take only the first emitted value
      ).subscribe((services) => {
        if (searchParams.services && services) {
          const searchServiceId = parseInt(searchParams.services); // Convert string to number
          const matchedService = services.find(service => service.id === searchServiceId);

          if (matchedService) {
            this.serviceCtrl.setValue(matchedService.name);
          }
        }
      });

      // formValue['availability'] = this.datePipe.transform(formValue['availability'], 'yyyy-MM-dd');
      // return portalService.search(searchParameters);
    });
  }

  private _filterServices(value: string): any[] {
    const filterValue = value.toLowerCase();

    return this.services.filter((service) =>
      service.name.toLowerCase().includes(filterValue)
    );
  }



  ngAfterViewInit() {

  }


  onOptionHover(serviceName: string, inputField: HTMLInputElement) {
    // Set the input field's value to the hovered option's name
    inputField.value = serviceName;
  }

  onOptionSelected(value: MatAutocompleteSelectedEvent): void {

    this.searchForm.controls.services.setValue(value);
  }



  getData() {
    this._generalService.services$
      .pipe(
        takeUntil(this._unsubscribeAll),
        map((res: any) => (res && res.data ? res.data : [])) // Ensure data is an array
      )
      .subscribe((filteredServices) => {
        this.services = filteredServices;
        this._changeDetectorRef.markForCheck();
      });

    this._generalService.insurance$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((res: any) => {
        this.insurances = res['data'];
        this._changeDetectorRef.markForCheck();
      });
  }

  onToggleChange(event: any) {
    // this.searchForm.controls.verified.setValue(event.target.value ? 'Yes' : 'No');
  }


  search() {
    if (!this.searchForm.value) return;
    const formValue = this.searchForm.value;

    formValue['availability'] = this.datePipe.transform(formValue['availability'], 'yyyy-MM-dd');
    this.router.navigate(['/doctors/'], {
      relativeTo: this.route,
      queryParams: formValue,
      queryParamsHandling: 'merge',
    });

    this._changeDetectorRef.markForCheck();

    const formattedServices = formValue.services ? `[${formValue.services}]` : '';
    const formattedInsurance = formValue.insurance ? `[${formValue.insurance}]` : '';
    const formattedSpecializations = formValue.specializations ? `[${formValue.specializations}]` : '';
    const formattedLanguages = formValue.languages ? `[${formValue.languages}]` : '';

    const searchParameters = {
      address: formValue.address || '',
      insurance: formattedInsurance,
      services: formattedServices,
      specializations: formattedSpecializations,
      availability: formValue.availability || null,
      languages: formattedLanguages,
      user_latitude: formValue.user_latitude || '',
      user_longitude: formValue.user_longitude || '',
    };


    // this._generalService.search(searchParameters).subscribe(() => {
    //   this._changeDetectorRef.markForCheck();
    // });

    // this._generalService.search(searchParameters)
    //   .pipe(takeUntil(this._unsubscribeAll))
    //   .subscribe((res) => {
    //     this._changeDetectorRef.markForCheck();
    //   });
  }

  initializeAutocomplete() {

    const autocomplete = new google.maps.places.Autocomplete(this.autocompleteInput.nativeElement, {
      types: ['geocode'],
      componentRestrictions: { country: 'us' },
    });

    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();

      // Extract necessary values from the place object
      const addressComponents = this.getAddressComponents(place);

      // Save the extracted data to localStorage
      const placeData = {
        address: place.formatted_address || '',
        city: addressComponents.city || '',
        state: addressComponents.state || '',
        zip_code: addressComponents.zip_code || '',
        user_latitude: place.geometry?.location.lat() || '',
        user_longitude: place.geometry?.location.lng() || ''
      };
      localStorage.setItem('address', JSON.stringify(placeData));

      // Update form with extracted values
      this.searchForm.patchValue(placeData);
      this.locationSearchCtrl.setValue(placeData.address); // Set the address to the input field
    });
  }

  getAddressComponents(place: any) {
    const components: any = {};

    for (const component of place.address_components) {
      const types = component.types;

      if (types.includes('locality')) {
        components.city = component.long_name;
      } else if (types.includes('administrative_area_level_1')) {
        components.state = component.short_name;
      } else if (types.includes('postal_code')) {
        components.zip_code = component.long_name;
      }
    }

    return components;
  }

  // Improved filtering logic
  _filterLocationSearch(value: string) {
    const filterValue = value?.toLowerCase() || '';
    return this.locationSearch
      .filter(option => option?.address?.toLowerCase().includes(filterValue))
      .map(option => ({
        ...option,
        highlightedAddress: this.highlightMatch(option.address, filterValue)
      }));
  }

  highlightMatch(address: string, filterValue: string): string {
    // Escape special characters in filterValue
    const escapedFilterValue = filterValue.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    // Use regex to match the exact substring
    const regex = new RegExp(`(${escapedFilterValue})`, 'gi');

    // Replace only the matching substring, not individual characters
    return address.replace(regex, '<span class="highlight font-semibold ">$1</span>');
  }


  getLocationFromAddress(address: string): Promise<google.maps.GeocoderResult[]> {
    return new Promise((resolve, reject) => {
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ address }, (results, status) => {
        if (status === 'OK') {
          resolve(results);
        } else {
          reject(status);
        }
      });
    });
  }

  modelChangeAddressFn(event: any) {
    const inputValue = event.target.value;
    this.showCurrentLocation = !inputValue; // Show current location only when input is empty
  }



  // Function to handle input changes and debounce API calls
  async modelChangeAddressFnOld(event: any) {
    const searchTerm = (event.target as HTMLInputElement).value;

    if (searchTerm.length < 3) {
      this.locationSearch = []; // Clear the dropdown if input is less than 3 characters
      return;
    }

    const service = new google.maps.places.AutocompleteService();
    service.getPlacePredictions({ input: searchTerm }, (predictions, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
        this.locationSearch = predictions.map((prediction) => ({
          address: prediction.description,
          placeId: prediction.place_id
        }));

        // Trigger change detection to update the dropdown
        this.filteredLocationSearch = this.locationSearchCtrl.valueChanges.pipe(
          startWith(''),
          debounceTime(300),
          distinctUntilChanged(),
          map(value => this._filterLocationSearch(value || ''))
        );
      }
    });
  }

  onLocationSelect(item: any) {
    // Handle the selection of a location from the dropdown
    console.log('Selected place:', item);
    // this.locationSearchCtrl.setValue(item.address);
    this.fetchPlaceDetails(item.placeId);
  }

  fetchPlaceDetails(placeId: string) {
    const service = new google.maps.places.PlacesService(this.autocompleteInput.nativeElement);
    service.getDetails({ placeId }, (place, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK && place) {
        const addressComponents = this.getAddressComponents(place);

        const placeData = {
          address: place.formatted_address || '',
          city: addressComponents.city || '',
          state: addressComponents.state || '',
          zip_code: addressComponents.zip_code || '',
          user_latitude: place.geometry?.location.lat() || '',
          user_longitude: place.geometry?.location.lng() || ''
        };

        this.searchForm.patchValue(placeData);
        // Update form with extracted values
        this.locationSearchCtrl.setValue(placeData.address); // Set the address to the input field
        localStorage.setItem('address', JSON.stringify(placeData));
      }
    });
  }

  trackByFn(index: number, item: any): any {
    return item.id || index;
  }




  ngOnDestroy(): void {
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }
}


