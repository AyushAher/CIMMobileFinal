import { Component, OnInit } from '@angular/core';

import { Country, ProfileReadOnly, User } from '../_models';
import { FormGroup } from '@angular/forms';
import { first } from 'rxjs/operators';

import {
  AccountService,
  DistributorService,
  NotificationService,
  ProfileService
} from '../_services';
import { ListcontentModel } from "../_models/listcontent.model";
import { Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ImportDistributorComponent } from './importdistributor.component';


@Component({
  selector: 'app-distributorList',
  templateUrl: './distributorlist.html',
})
export class DistributorListComponent implements OnInit {
  user: User;
  form: FormGroup;
  distributorModel = [];
  loading = false;
  submitted = false;
  isSave = false;
  distributorId: string;
  type: string = "D";
  countries: Country[];
  profilePermission: ProfileReadOnly;
  hasAddAccess: boolean = false;
  hasDeleteAccess: boolean = false;
  hasReadAccess: boolean = false;
  list: ListcontentModel;

  bsModalRef: BsModalRef;

  constructor(
    private modalService: BsModalService,
    private router: Router,
    private accountService: AccountService,
    private distributorService: DistributorService,
    private profileService: ProfileService,
    private notificationService: NotificationService,
  ) {
    this.notificationService.listen().subscribe((m: any) => {
      this.distributorService.getAll()
        .pipe(first()).subscribe((data: any) => this.distributorModel = data.object);
    })
  }

  ngOnInit() {
    this.user = this.accountService.userValue;
    this.profilePermission = this.profileService.userProfileValue;
    if (this.profilePermission != null) {
      let profilePermission = this.profilePermission.permissions.filter(x => x.screenCode == "SDIST");
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
    this.distributorService.getAll()
      .pipe(first())
      .subscribe({
        next: (data: any) => {
          //debugger;
          this.GetList(data.object)
        },
        error: () => {

          //this.alertService.error(error);
          this.loading = false;
        }
      });
  }


  GetList(data: any) {
    data.forEach(x => {
      this.list = new ListcontentModel()
      this.list.id = x.id
      this.list.firstItem = x.regions.length
      this.list.secondItem = x.distname
      this.list.thirdItem = x.payterms

      this.list.firstItemLabel = 'No. of Regions:'
      this.list.secondItemLabel = 'Distributor Name:'
      this.list.thirdItemLabel = 'Pay Term:'

      this.distributorModel.push(this.list)
    })
  }

  ImportData() {

    const config: any = {
      backdrop: 'static',
      keyboard: false,
      animated: true,
      ignoreBackdropClick: true,
    };
    this.bsModalRef = this.modalService.show(ImportDistributorComponent, config);
  }
}
