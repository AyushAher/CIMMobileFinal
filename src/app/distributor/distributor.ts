import { Component, OnInit } from '@angular/core';

import { User, Distributor, Country, ResultMsg, ProfileReadOnly } from '../_models';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';

import { AccountService, AlertService, DistributorService, CountryService, NotificationService, ProfileService } from '../_services';


@Component({
  selector: 'app-distributor',
  templateUrl: './distributor.html',
})
export class DistributorComponent implements OnInit {
  user: User;
  form: FormGroup;
  distributorModel: Distributor;
  submitted = false;
  distributorId: string;
  type: string = "D";
  countries: Country[];
  profilePermission: ProfileReadOnly;
  hasReadAccess: boolean = false;
  hasUpdateAccess: boolean = false;
  hasDeleteAccess: boolean = false;
  hasAddAccess: boolean = false;
  isEditMode: boolean;
  isNewMode: boolean;


  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private accountService: AccountService,
    private alertService: AlertService,
    private distributorService: DistributorService,
    private countryService: CountryService,
    private notificationService: NotificationService,
    private profileService: ProfileService
  ) { }

  ngOnInit() {
    this.user = this.accountService.userValue;
    this.profilePermission = this.profileService.userProfileValue;
    if (this.profilePermission != null) {
      let profilePermission = this.profilePermission.permissions.filter(x => x.screenCode == "SDIST");
      if (profilePermission.length > 0) {
        this.hasReadAccess = profilePermission[0].read;
        this.hasAddAccess = profilePermission[0].create;
        this.hasDeleteAccess = profilePermission[0].delete;
        this.hasUpdateAccess = profilePermission[0].update;
      }
    }
    if (this.user.username == "admin") {
      this.hasAddAccess = true;
      this.hasDeleteAccess = true;
      this.hasUpdateAccess = true;
      this.hasReadAccess = true;
    }


    this.form = this.formBuilder.group({
      distname: ['', Validators.required],
      payterms: ['', Validators.required],
      isblocked: false,
      isactive: true,
      isdeleted: [false],
      address: this.formBuilder.group({
        street: ['', Validators.required],
        area: ['', Validators.required],
        place: ['', Validators.required],
        city: ['', Validators.required],
        countryid: ['', Validators.required],
        zip: ['', Validators.compose([Validators.minLength(4), Validators.maxLength(15)])],
        geolat: ['', Validators.required],
        geolong: ['', Validators.required],
        isActive: false,
      }),
    });
    this.countryService.getAll()
      .pipe(first()).subscribe((data: any) => this.countries = data.object);

    this.distributorId = this.route.snapshot.paramMap.get('id');
    if (this.distributorId != null) {
      this.hasAddAccess = this.user.username == "admin"

      this.distributorService.getById(this.distributorId)
        .pipe(first()).subscribe((data: any) => this.form.patchValue(data.object));

      this.form.disable()
    }
    else {
      this.isEditMode = true;
    }

  }

  get f() {
    return this.form.controls;
  }


  EditMode() {
    if (confirm("Are you sure you want to edit the record?")) {
      this.isEditMode = true;
      this.form.enable();
    }
  }

  Back() {

    if ((this.isEditMode || this.isNewMode)) {
      if (confirm("Are you sure want to go back? All unsaved changes will be lost!"))
        this.router.navigate(["distributorlist"]);
    }

    else this.router.navigate(["distributorlist"]);

  }

  CancelEdit() {
    this.form.disable()
     this.isEditMode = false;
    this.isNewMode = false;
  }

  DeleteRecord() {
    if (confirm("Are you sure you want to edit the record?")) {
      this.distributorService.delete(this.distributorId).pipe(first())
        .subscribe((data: any) => {
          if (data.result)
            this.router.navigate(["distributorlist"]);
        })
    }
  }


  get a() {
    return this.form.controls.address;
  }

  onSubmit() {
    this.submitted = true;

    // reset alerts on submit
    this.alertService.clear();

    // stop here if form is invalid
    if (this.form.invalid) return;


    if (this.distributorId == null) {
      this.distributorService.save(this.form.value)
        .pipe(first())
        .subscribe({
          next: (data: ResultMsg) => {
            //debugger;
            if (data.result) {
              this.notificationService.showSuccess(data.resultMessage, "Success");
              this.router.navigate(["distributorlist"]);
            }
          }
        });
    }
    else {
      this.distributorModel = this.form.value;
      this.distributorModel.id = this.distributorId;
      this.distributorService.update(this.distributorId, this.form.value)
        .pipe(first())
        .subscribe({
          next: (data: ResultMsg) => {
            //debugger;
            if (data.result) {
              this.notificationService.showSuccess(data.resultMessage, "Success");
              this.router.navigate(["distributorlist"]);
            }
          }
        });
    }


  }

}
