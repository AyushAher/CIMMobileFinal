import { Component, OnInit } from '@angular/core';

import { ProfileReadOnly, User } from '../_models';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { first } from 'rxjs/operators';

import { AccountService, AlertService, CountryService, NotificationService, ProfileService } from '../_services';
import { ListcontentModel } from "../_models/listcontent.model";


@Component({
  selector: 'app-countryList',
  templateUrl: './countrylist.html',
})
export class CountryListComponent implements OnInit {
  user: User;
  form: FormGroup;
  countryList: any = [];
  loading = false;
  submitted = false;
  isSave = false;
  profilePermission: ProfileReadOnly;
  hasReadAccess: boolean = false;
  hasUpdateAccess: boolean = false;
  hasDeleteAccess: boolean = false;
  hasAddAccess: boolean = false;
  list: ListcontentModel;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private accountService: AccountService,
    private alertService: AlertService,
    private countryService: CountryService,
    private notificationService: NotificationService,
    private profileService: ProfileService,
  ) {

  }

  ngOnInit() {
    this.user = this.accountService.userValue;
    this.profilePermission = this.profileService.userProfileValue;
    if (this.profilePermission != null) {
      let profilePermission = this.profilePermission.permissions.filter(x => x.screenCode == "SCOUN");
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

    this.countryService.getAll()
      .pipe(first())
      .subscribe({
        next: (data: any) => {
          data.object.forEach(x => {
            this.list = new ListcontentModel()
            this.list.id = x.id

            this.list.firstItem = x.name
            this.list.secondItem = x.iso_2
            this.list.thirdItem = x.iso_3

            this.list.firstItemLabel = 'Country Name:'
            this.list.secondItemLabel = 'ISO Code 2:'
            this.list.thirdItemLabel = 'ISO Code 3:'

            this.countryList.push(this.list)
          }
          )
        },
        error: error => {

          this.loading = false;
        }
      });
    setTimeout(() => this.loading = false, 1000)
  }
}
