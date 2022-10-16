import { Component, OnInit } from '@angular/core';

import { ProfileReadOnly, User } from '../_models';
import { FormGroup } from '@angular/forms';
import { first } from 'rxjs/operators';

import {
  AccountService,
  ListTypeService,
  MasterListService,
  ProfileService
} from '../_services';
import { EnvService } from '../_services/env/env.service';
import { ListcontentModel } from "../_models/listcontent.model";


@Component({
  selector: 'app-masterList',
  templateUrl: './masterlist.html',
})
export class MasterListComponent implements OnInit {
  user: User;
  form: FormGroup;
  masterList = [];
  submitted = false;
  profilePermission: ProfileReadOnly;
  hasReadAccess: boolean = false;
  hasUpdateAccess: boolean = false;
  hasDeleteAccess: boolean = false;
  hasAddAccess: boolean = false;
  list: ListcontentModel;

  constructor(
    private accountService: AccountService,
    private masterlistService: MasterListService,
    private profileService: ProfileService,
    private listTypeService: ListTypeService,
    private environment: EnvService
  ) {

  }

  ngOnInit() {
    //debugger;
    this.user = this.accountService.userValue;
    this.profilePermission = this.profileService.userProfileValue;
    if (this.profilePermission != null) {
      let profilePermission = this.profilePermission.permissions.filter(x => x.screenCode == "MAST");
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
    this.masterlistService.getAll()
      .pipe(first())
      .subscribe({
        next: (data: any) => {
          this.GetList(data.object)
          let obj = data.object.filter(x => x.code == this.environment.configTypeCode || x.code == this.environment.location)

          obj.forEach((value1) => {
            this.listTypeService.getByListId(value1.id)
              .pipe(first())
              .subscribe((data1: any) => {
                data1.object.forEach(value => localStorage.setItem(value.listTypeId, JSON.stringify(data1.object)))
              })
          })
        },
      });
  }

  GetList(data: any) {
    data.forEach(x => {
      this.list = new ListcontentModel()
      this.list.id = x.id
      this.list.firstItem = x.listname

      this.list.firstItemLabel = 'List Name:'

      this.masterList.push(this.list)
    })
  }
}
