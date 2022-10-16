import { Component, OnInit } from '@angular/core';

import { Country, ProfileReadOnly, User } from '../_models';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { first } from 'rxjs/operators';

import {
  AccountService,
  AlertService,
  CountryService,
  NotificationService,
  ProfileService,
  SparePartService
} from '../_services';
import { ListcontentModel } from "../_models/listcontent.model";
import { EnvService } from '../_services/env/env.service';


@Component({
  selector: 'app-spareList',
  templateUrl: './sparepartlist.html',
})
export class SparePartListComponent implements OnInit {
  user: User;
  form: FormGroup;
  sparePartList;
  loading = false;
  submitted = false;
  isSave = false;
  customerId: string;
  type: string = "D";
  countries: Country[];
  profilePermission: ProfileReadOnly;
  hasAddAccess: boolean = false;
  hasDeleteAccess: boolean = false;
  showGrid = true;
  hasReadAccess: boolean = false;
  hasUpdateAccess: boolean = false;
  list: ListcontentModel;
  isDist: boolean = false;
  isCust: boolean;
  isEng: boolean;


  constructor(
    private router: Router,
    private accountService: AccountService,
    private profileService: ProfileService,
    private sparePartService: SparePartService,
    private environment: EnvService,
  ) {

  }

  ngOnInit() {

    this.user = this.accountService.userValue;
    let role = JSON.parse(localStorage.getItem('roles'));

    this.profilePermission = this.profileService.userProfileValue;
    if (this.profilePermission != null) {
      let profilePermission = this.profilePermission.permissions.filter(x => x.screenCode == "SSPAR");
      if (profilePermission.length > 0) {
        this.hasAddAccess = profilePermission[0].create;
        this.hasDeleteAccess = profilePermission[0].delete;
        this.hasReadAccess = profilePermission[0].read;
        this.hasUpdateAccess = profilePermission[0].update;
      }
    }
    if (this.user.username == "admin") {
      this.hasAddAccess = true;
      this.hasDeleteAccess = true;
      this.hasReadAccess = true;
      this.hasUpdateAccess = true;
    }
    else {
      role = role[0]?.itemCode;
    }

    if (role == this.environment.distRoleCode) this.isDist = true;
    else if (role == this.environment.engRoleCode) this.isEng = true;
    else if (role == this.environment.custRoleCode) this.isCust = true;

    this.sparePartService.getAll().pipe(first())
      .subscribe((data: any) => this.GetList(data.object));
  }

  ShowData(event) {
    this.showGrid = event
  }

  toggleFilter() {
    this.showGrid = !this.showGrid
  }

  DataFilter(event) {
    this.showGrid = true
    this.sparePartList = event;
  }

  Add() {
    this.router.navigate(['sparepart']);
  }
  export() {
    this.router.navigate(['exportsparepart']);
  }

  GetList(data: any) {
    this.sparePartList = []
    data.forEach(x => {
      this.list = new ListcontentModel()
      this.list.id = x.id
      this.list.firstItem = x.partNo
      this.list.secondItem = x.qty
      this.list.thirdItem = x.partTypeName

      this.list.firstItemLabel = 'Part No:'
      this.list.secondItemLabel = 'Quantity:'
      this.list.thirdItemLabel = 'Part Type:'

      this.sparePartList.push(this.list)
    })
  }

}
