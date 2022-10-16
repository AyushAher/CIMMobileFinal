import { Component, OnInit } from '@angular/core';

import { User, Customer, Country, Instrument, ProfileReadOnly } from '../_models';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';
import { ColDef, GridApi, ColumnApi } from 'ag-grid-community';

import { AccountService, AlertService, CountryService, InstrumentService, NotificationService, ProfileService } from '../_services';
import { RenderComponent } from '../distributor/rendercomponent';
import { EnvService } from '../_services/env/env.service';
import { ListcontentModel } from '../_models/listcontent.model';


@Component({
  selector: 'app-instuList',
  templateUrl: './instrumentlist.html',
})
export class InstrumentListComponent implements OnInit {
  user: User;
  form: FormGroup;
  instrumentList = [];
  submitted = false;
  customerId: string;
  type: string = "D";
  countries: Country[];
  profilePermission: ProfileReadOnly;
  hasAddAccess: boolean = false;
  hasDeleteAccess: boolean = false;
  hasReadAccess: boolean = false;
  list: ListcontentModel;

  filterData: any;
  showGrid: boolean = true;

  isDist: boolean = false;
  isEng: boolean = false;
  isCust: boolean = false;

  constructor(
    private accountService: AccountService,
    private profileService: ProfileService,
    private instrumentService: InstrumentService,
    private environment: EnvService
  ) {

  }

  ngOnInit() {
    let role = JSON.parse(localStorage.getItem('roles'));
    this.user = this.accountService.userValue;
    this.profilePermission = this.profileService.userProfileValue;
    if (this.profilePermission != null) {
      let profilePermission = this.profilePermission.permissions.filter(x => x.screenCode == "SINST");
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
    else {
      role = role[0]?.itemCode;
    }

    if (role == this.environment.distRoleCode) this.isDist = true;
    else if (role == this.environment.engRoleCode) this.isEng = true;
    else if (role == this.environment.custRoleCode) this.isCust = true;

    this.instrumentService.getAll(this.user.userId).pipe(first())
      .subscribe((data: any) => this.GetList(data.object));

  }

  GetList(data: any) {
    data.forEach(x => {
      this.list = new ListcontentModel()
      this.list.id = x.id
      this.list.firstItem = x.custSiteName
      this.list.secondItem = x.serialnos
      this.list.thirdItem = x.installby

      this.list.firstItemLabel = 'Site Name:'
      this.list.secondItemLabel = 'Serial No.:'
      this.list.thirdItemLabel = 'Distributor:'

      this.instrumentList.push(this.list)
    })
  }

  DataFilter(event) {
    this.instrumentList = [];
    this.GetList(event);
  }

  ShowData(event) {
    this.showGrid = event
  }

  toggleFilter() {
    this.showGrid = !this.showGrid
  }
}
