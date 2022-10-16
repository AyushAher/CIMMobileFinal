import { Component, OnInit } from '@angular/core';

import { Country, ProfileReadOnly, User } from '../_models';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { first } from 'rxjs/operators';

import {
  AccountService,
  AlertService,
  CountryService,
  DistributorRegionService,
  DistributorService,
  NotificationService,
  ProfileService
} from '../_services';
import { ListcontentModel } from "../_models/listcontent.model";


@Component({
  selector: 'app-distributorRgList',
  templateUrl: './distregionlist.html',
})
export class DistributorRegionListComponent implements OnInit {
  user: User;
  form: FormGroup;
  distributorModel = [];
  loading = false;
  submitted = false;
  isSave = false;
  distributorId: string;
  type: string = "D";
  countries: Country[];
  profilePermission: ProfileReadOnly;
  hasAddAccess: boolean = false;
  hasDeleteAccess: boolean = false;
  hasReadAccess: boolean = false;
  list: ListcontentModel;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private accountService: AccountService,
    private distributorService: DistributorService,
    private profileService: ProfileService,
  ) {
  }

  ngOnInit() {
    this.user = this.accountService.userValue;
    this.profilePermission = this.profileService.userProfileValue;
    if (this.profilePermission != null) {
      let profilePermission = this.profilePermission.permissions.filter(x => x.screenCode == "SDIST");
      if (profilePermission.length > 0) {
        this.hasAddAccess = profilePermission[0].create;
        this.hasDeleteAccess = profilePermission[0].delete;
        this.hasReadAccess = profilePermission[0].read;
      }
    }
    if (this.user.username == "admin") {
      this.hasAddAccess = true;
      this.hasDeleteAccess = true;
      this.hasReadAccess = true;
    }


    this.distributorId = this.route.snapshot.paramMap.get('id');
    this.distributorService.getById(this.distributorId)
      .pipe(first())
      .subscribe({
        next: (data: any) => {
          this.GetList(data.object.regions)
        },
        error: error => {

          this.loading = false;
        }
      });

  }

  GetList(data: any) {
    data.forEach(x => {
      this.list = new ListcontentModel()
      this.list.id = x.id
      this.list.firstItem = x.region
      this.list.secondItem = x.payterms
      this.list.thirdItem = x.distregname

      this.list.firstItemLabel = 'Distributor Region:'
      this.list.secondItemLabel = 'Pay Term:'
      this.list.thirdItemLabel = 'Dist Region Name:'

      this.distributorModel.push(this.list)
    })
  }

}
