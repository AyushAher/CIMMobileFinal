import { Component, OnInit } from '@angular/core';

import { Amc, Country, ProfileReadOnly, User } from '../_models';
import { Router } from '@angular/router';
import { FormGroup } from '@angular/forms';
import { first } from 'rxjs/operators';
import { ColDef, ColumnApi, GridApi } from 'ag-grid-community';

import {
  AccountService,
  AmcService,
  NotificationService,
  ProfileService
} from '../_services';
import { RenderComponent } from '../distributor/rendercomponent';
import { EnvService } from '../_services/env/env.service';
import { ListcontentModel } from '../_models/listcontent.model';


@Component({
  selector: 'app-distributorRgList',
  templateUrl: './Amclist.html',
})
export class AmcListComponent implements OnInit {
  user: User;
  form: FormGroup;
  AmcList: any = [];
  loading = false;
  submitted = false;
  isSave = false;
  customerId: string;
  type: string = "D";
  countries: Country[];
  profilePermission: ProfileReadOnly;
  hasAddAccess: boolean = false;
  hasReadAccess: boolean = false;
  hasDeleteAccess: boolean = false;
  public columnDefs: ColDef[];
  private columnApi: ColumnApi;
  private api: GridApi;
  showGrid: boolean = true;
  isDist: boolean;
  list: ListcontentModel;
  constructor(
    private router: Router,
    private accountService: AccountService,
    private notificationService: NotificationService,
    private profileService: ProfileService,
    private AmcService: AmcService,
    private environment: EnvService
  ) {

  }

  ngOnInit() {
    let role = JSON.parse(localStorage.getItem('roles'));
    this.user = this.accountService.userValue;
    this.profilePermission = this.profileService.userProfileValue;
    if (this.profilePermission != null) {
      let profilePermission = this.profilePermission.permissions.filter(x => x.screenCode == "SAMC");
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
    else role = role[0]?.itemCode;


    if (role == this.environment.distRoleCode) this.isDist = true;
    
    this.AmcService.getAll()
      .pipe(first())
      .subscribe((data: any) => {
        data.object = data.object?.filter(x => !x.isCompleted)
        data.object.forEach(x => {
          this.list = new ListcontentModel()
          this.list.id = x.id
          this.list.firstItem = x.billto
          this.list.secondItem = x.custSiteName + ' - ' + x.servicequote
          this.list.thirdItem = x.sdate + ' - ' + x.edate

          this.list.firstItemLabel = 'Bill To:'
          this.list.secondItemLabel = 'Site - Service Quote:'
          this.list.thirdItemLabel = 'Start - End Date:'

          this.AmcList.push(this.list)
        })
      });
  }

  ShowData(event) {
    this.showGrid = event
  }

  toggleFilter() {
    this.showGrid = !this.showGrid
  }

  DataFilter(event) {
    this.AmcList = event?.filter(x => !x.isCompleted)
  }


}
