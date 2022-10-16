import { Component, OnInit } from '@angular/core';

import { Country, ProfileReadOnly, User } from '../_models';
import { FormGroup } from '@angular/forms';
import { first } from 'rxjs/operators';

import {
  AccountService,
  ProfileService
} from '../_services';
import { ListcontentModel } from "../_models/listcontent.model";


@Component({
  selector: 'app-instuList',
  templateUrl: './profilelist.html',
})
export class ProfileListComponent implements OnInit {
  user: User;
  profileList = [];
  submitted = false;
  profilePermission: ProfileReadOnly;
  hasAddAccess: boolean = false;
  hasDeleteAccess: boolean = false;
  hasReadAccess: boolean = false;
  list: ListcontentModel;

  constructor(
    private accountService: AccountService,
    private profileService: ProfileService,
  ) {

  }

  ngOnInit() {
    this.user = this.accountService.userValue;
    this.profilePermission = this.profileService.userProfileValue;
    if (this.profilePermission != null) {
      let profilePermission = this.profilePermission.permissions.filter(x => x.screenCode == "PROF");
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
    this.profileService.getAll()
      .pipe(first()).subscribe((data: any) => this.GetList(data.object));
  }

  GetList(data: any) {    
    data.forEach(x => {
      this.list = new ListcontentModel()
      this.list.id = x.id
      this.list.firstItem = x.profilename
      this.list.firstItemLabel = 'Profile Name'
      this.profileList.push(this.list)
    })
  }

}
