import { Component, OnInit } from '@angular/core';
import { FormGroup } from "@angular/forms";
import { ProfileReadOnly, User } from "../_models";
import { Router } from "@angular/router";
import { AccountService, ProfileService, SrRecomandService } from "../_services";
import { first } from "rxjs/operators";
import { ListcontentModel } from "../_models/listcontent.model";
import { EnvService } from '../_services/env/env.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-sparepartsrecommended',
  templateUrl: './sparepartsrecommended.component.html'
})

export class SparepartsrecommendedComponent implements OnInit {
  form: FormGroup;
  List: any = [] = [];
  loading = false;
  submitted = false;

  profilePermission: ProfileReadOnly;
  hasReadAccess: boolean = false;
  hasUpdateAccess: boolean = false;
  hasDeleteAccess: boolean = false;
  hasAddAccess: boolean = false;
  user: User;
  showGrid: any = true;
  isDist: boolean;
  list: ListcontentModel

  constructor(
    private accountService: AccountService,
    private Service: SrRecomandService,
    private profileService: ProfileService,
    private environment: EnvService,
  ) { }

  ngOnInit() {
    let role = JSON.parse(localStorage.getItem('roles'));
    this.user = this.accountService.userValue;
    this.profilePermission = this.profileService.userProfileValue;
    if (this.profilePermission != null) {
      let profilePermission = this.profilePermission.permissions.filter((x) => x.screenCode == "SPRCM");
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
    else role = role[0]?.itemCode;
    if (role == this.environment.distRoleCode) this.isDist = true
    this.Service.getByGrid(this.user.contactId).pipe(first())
        .subscribe((data: any) => this.GetList(data.object))
  }

  GetList(data: any) {
    this.List = []
    data.forEach(x => {
      this.list = new ListcontentModel()
      this.list.id = x.sparerecomid
      this.list.firstItem = x.partno
      this.list.secondItem = x.qtyRecommended
      this.list.thirdItem = x.hsccode

      this.list.firstItemLabel = 'Part No:'
      this.list.secondItemLabel = 'Qty. Recommended:'
      this.list.thirdItemLabel = 'Hsc Code  :'

      this.List.push(this.list)
    })
  }

  DataFilter(event) {
    this.List = event;
    const datepipie = new DatePipe("en-US");

    this.List.forEach((value) => {
      value.assignedTofName = value.assignedTofName + " " + value.assignedTolName
      value.serviceReportDate = datepipie.transform(
        value.serviceReportDate,
        "MM/dd/yyyy"
      );
    })
  }

  ShowData(event) {
    this.showGrid = event
  }

  toggleFilter() {
    this.showGrid = !this.showGrid
  }
}
