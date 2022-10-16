import { Component, OnInit } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { Router } from "@angular/router";
import { AccountService, NotificationService, ProfileService } from "../_services";
import { CustspinventoryService } from "../_services/custspinventory.service";
import { first } from "rxjs/operators";
import { User } from "../_models";
import { ListcontentModel } from "../_models/listcontent.model";
import { EnvService } from "../_services/env/env.service";

@Component({
  selector: "app-Custspinventorylist",
  templateUrl: "./Custspinventorylist.component.html",
})

export class CustspinventorylistComponent implements OnInit {
  form: FormGroup;
  model = [];
  loading = false;
  submitted = false;
  type: string;
  id: string;
  user: User;
  hasReadAccess: boolean = false;
  hasUpdateAccess: boolean = false;
  hasDeleteAccess: boolean = false;
  hasAddAccess: boolean = false;
  hasInternalAccess: boolean = false;

  profilePermission: any;
  list: ListcontentModel;
  showGrid: boolean = true;
  isDist: boolean;
  constructor(
    private router: Router,
    private accountService: AccountService,
    private Service: CustspinventoryService,
    private profileService: ProfileService,
    private environment: EnvService
  ) {
  }

  ngOnInit() {

    let role = JSON.parse(localStorage.getItem('roles'));
    this.user = this.accountService.userValue;
    this.profilePermission = this.profileService.userProfileValue;
    if (this.profilePermission != null) {
      let profilePermission = this.profilePermission.permissions.filter(x => x.screenCode == "CTSPI");
      if (profilePermission.length > 0) {
        this.hasAddAccess = profilePermission[0].create;
        this.hasDeleteAccess = profilePermission[0].delete;
      }
    }
    if (this.user.username == "admin") {
      this.hasAddAccess = true;
      this.hasDeleteAccess = true;
    } else {
      role = role[0]?.itemCode;
    }

    if (role == this.environment.distRoleCode) this.isDist = true;
    else {
      this.Service.getAll(this.user.contactId, null)
        .pipe(first()).subscribe((data: any) => this.GetList(data.object));
    }

    this.Service.getAll(this.user.contactId, null)
      .pipe(first()).subscribe((data: any) => this.GetList(data.object));
  }

  ShowData(event) {
    this.showGrid = event
  }

  DataFilter(event) {
    this.model = event
  }

  GetList(data: any) {
    this.model = []

    data.forEach(x => {
      this.list = new ListcontentModel()
      this.list.id = x.id
      this.list.firstItem = x.partNo
      this.list.secondItem = x.qtyAvailable
      this.list.thirdItem = x.hscCode

      this.list.firstItemLabel = 'Part No:'
      this.list.secondItemLabel = 'Qty. Available:'
      this.list.thirdItemLabel = 'Hsc Code  :'

      this.model.push(this.list)
    })
  }

  toggleFilter() {
    this.showGrid = !this.showGrid
  }
}
