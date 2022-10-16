import { Component, OnInit } from '@angular/core';

import { Country, ProfileReadOnly, User } from '../_models';
import { Router } from '@angular/router';
import { FormGroup } from '@angular/forms';
import { first } from 'rxjs/operators';

import {
  AccountService,
  ProfileService,
  UserProfileService
} from '../_services';
import { ListcontentModel } from "../_models/listcontent.model";
import { EnvService } from '../_services/env/env.service';


@Component({
  selector: 'app-instuList',
  templateUrl: './userprofilelist.html',
})
export class UserProfileListComponent implements OnInit {
  user: User;
  form: FormGroup;
  userprofileList = [];
  loading = false;
  submitted = false;
  isSave = false;
  customerId: string;
  type: string = "D";
  countries: Country[];
  profilePermission: ProfileReadOnly;
  hasAddAccess: boolean = false;
  hasDeleteAccess: boolean = false;
  showGrid: boolean = true;
  IsCustomerView: boolean;
  IsDistributorView: boolean;
  IsEngineerView: boolean;
  hasReadAccess: boolean = false;
  list: ListcontentModel;

  constructor(
    private router: Router,
    private accountService: AccountService,
    private profileService: ProfileService,
    private environment: EnvService,
    private userprofileService: UserProfileService,
  ) {

  }

  ngOnInit() {

    this.user = this.accountService.userValue;
    this.profilePermission = this.profileService.userProfileValue;
    if (this.profilePermission != null) {
      let profilePermission = this.profilePermission.permissions.filter(x => x.screenCode == "URPRF");
      if (profilePermission.length > 0) {
        this.hasAddAccess = profilePermission[0].create;
        this.hasDeleteAccess = profilePermission[0].delete;
        this.hasReadAccess = profilePermission[0].read;
      }
    }

    if (this.user.username == "admin") {
      this.hasAddAccess = true;
      this.hasDeleteAccess = true;
    } else {

      let role = JSON.parse(localStorage.getItem('roles'));
      role = role[0]?.itemCode;

      if (role == this.environment.custRoleCode) {
        this.IsCustomerView = true;
        this.IsDistributorView = false;
        this.IsEngineerView = false;
      } else if (role == this.environment.distRoleCode) {
        this.IsCustomerView = false;
        this.IsDistributorView = true;
        this.IsEngineerView = false;
      } else {
        this.IsCustomerView = false;
        this.IsDistributorView = false;
        this.IsEngineerView = true;
      }
    }

    this.userprofileService.getAll().pipe(first())
      .subscribe((data: any) => {
        this.GetList(data.object)
      });
  }

  Add() {
    this.router.navigate(['userprofile']);
  }

  DataFilter(event) {
    this.userprofileList = event;
  }

  ShowData(event) {
    this.showGrid = event
  }

  toggleFilter() {
    this.showGrid = !this.showGrid
  }

  GetList(data: any) {
    data.forEach(x => {
      this.list = new ListcontentModel()
      this.list.id = x.id
      this.list.firstItem = x.username
      this.list.secondItem = x.profileName

      this.list.firstItemLabel = 'Username:'
      this.list.secondItemLabel = 'Profile Name:'

      this.userprofileList.push(this.list)
    })
  }
}
