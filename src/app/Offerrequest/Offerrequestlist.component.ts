import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { ColDef, ColumnApi, GridApi } from 'ag-grid-community';
import { first } from 'rxjs/operators';
import { RenderComponent } from '../distributor/rendercomponent';
import { User } from '../_models';
import { ListcontentModel } from '../_models/listcontent.model';
import { Offerrequest } from '../_models/Offerrequest.model';
import { AccountService, NotificationService, ProfileService } from '../_services';
import { EnvService } from '../_services/env/env.service';
import { OfferrequestService } from '../_services/Offerrequest.service';
import { OfferRequestListRenderer } from './offerrequestlistrenderer';

@Component({
  selector: 'app-Offerrequestlist',
  templateUrl: './Offerrequestlist.component.html',
})

export class OfferrequestlistComponent implements OnInit {
  form: FormGroup;
  model: any[] = [];
  id: string;
  user: User;
  hasReadAccess: boolean = false;
  hasUpdateAccess: boolean = false;
  hasDeleteAccess: boolean = false;
  hasAddAccess: boolean = false;
  hasInternalAccess: boolean = false;
  profilePermission: any;
  role: string;
  showGrid: boolean = true;
  isDist: boolean;
  list: ListcontentModel;

  constructor(
    private router: Router,
    private accountService: AccountService,
    private environment: EnvService,
    private Service: OfferrequestService,
    private profileService: ProfileService,
  ) {
  }

  ngOnInit() {
    this.user = this.accountService.userValue;
    let role = JSON.parse(localStorage.getItem('roles'));
    this.profilePermission = this.profileService.userProfileValue;
    if (this.profilePermission != null) {
      let profilePermission = this.profilePermission.permissions.filter(x => x.screenCode == "OFREQ");
      if (profilePermission.length > 0) {
        this.hasReadAccess = profilePermission[0].read;
        this.hasAddAccess = profilePermission[0].create;
        this.hasDeleteAccess = profilePermission[0].delete;
        this.hasUpdateAccess = profilePermission[0].update;
      }
    }

    if (this.user.username == 'admin') {
      this.hasAddAccess = true;
      this.hasDeleteAccess = true;
      this.hasUpdateAccess = true;
      this.hasReadAccess = true;
    } else {
      this.role = role[0]?.itemCode;
    }
    if (this.role == this.environment.distRoleCode) this.isDist = true;

    this.Service.getAll().pipe(first())
      .subscribe((data: any) =>
        this.GetList(data.object?.filter(x => !x.isCompleted)));

  }

  ShowData(event) {
    this.showGrid = event
  }

  toggleFilter() {
    this.showGrid = !this.showGrid
  }

  DataFilter(event) {
    this.GetList(event?.filter(x => !x.isCompleted))
  }

  GetList(data: any) {
    this.model = []
    data.forEach(x => {
      this.list = new ListcontentModel()
      this.list.id = x.id
      this.list.firstItem = x.distributor
      this.list.secondItem = x.offReqNo
      this.list.thirdItem = x.podate

      this.list.firstItemLabel = 'Distributor'
      this.list.secondItemLabel = 'Offer Request'
      this.list.thirdItemLabel = 'RFQ Date'

      this.model.push(this.list)
    })
  }
}
