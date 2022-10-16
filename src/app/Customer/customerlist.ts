import { Component, OnInit } from '@angular/core';
import { ProfileReadOnly, User } from '../_models';
import { ActivatedRoute, Router } from '@angular/router';
import { first } from 'rxjs/operators';
import { AccountService, CustomerService, NotificationService, ProfileService } from '../_services';
import { ListcontentModel } from "../_models/listcontent.model";
import { EnvService } from '../_services/env/env.service';


@Component({
  selector: 'app-distributorRgList',
  templateUrl: './customerlist.html',
})
export class CustomerListComponent implements OnInit {
  user: User;
  customerList: any = [];
  loading = false;
  submitted = false;
  profilePermission: ProfileReadOnly;
  hasAddAccess: boolean = false;
  hasDeleteAccess: boolean = false;
  hasReadAccess: boolean = false;
  list: ListcontentModel;
  IsDist: boolean;
  showGrid: boolean = true;


  constructor(
    private router: Router,
    private accountService: AccountService,
    private customerService: CustomerService,
    private profileService: ProfileService,
    private environment: EnvService

  ) {

  }

  ngOnInit() {
    let role = JSON.parse(localStorage.getItem('roles'));
    this.user = this.accountService.userValue;
    this.profilePermission = this.profileService.userProfileValue;
    if (this.profilePermission != null) {
      let profilePermission = this.profilePermission.permissions.filter(x => x.screenCode == "SCUST");
      if (profilePermission.length > 0) {
        this.hasAddAccess = profilePermission[0].create;
        this.hasDeleteAccess = profilePermission[0].delete;
        this.hasReadAccess = profilePermission[0].read;
      }
    }
    if (this.user.username == "admin") {
      this.hasAddAccess = true;
      this.hasReadAccess = true;
      this.hasDeleteAccess = true;
      this.showGrid = true;
      this.IsDist = false
      this.customerService.getAll()
        .pipe(first()).subscribe((data: any) => this.GetData(data.object));
    }
    else {
      role = role[0]?.itemCode;

      this.IsDist = role == this.environment.distRoleCode

      this.customerService.getAllByConId(this.user.contactId).pipe(first())
        .subscribe((data: any) => this.GetData(data.object));
    }

  }

  GetData(data: any) {
    this.customerList = []
    data.forEach(x => {
      this.list = new ListcontentModel()
      this.list.id = x.id
      this.list.firstItem = x.custname
      this.list.secondItem = x.defdist
      this.list.thirdItem = x.defDistRegion

      this.list.firstItemLabel = 'Customer Name:'
      this.list.secondItemLabel = 'Default Distributor:'
      this.list.thirdItemLabel = 'Region Name:'

      this.customerList.push(this.list)
    })
  }

  DataFilter(event) {
    this.GetData(event)
  }

  ShowData(event) {
    this.showGrid = event
  }

  toggleFilter() {
    this.showGrid = !this.showGrid
  }

}