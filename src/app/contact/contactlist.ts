import { Component, OnInit } from '@angular/core';

import { Contact, Country, ProfileReadOnly, User } from '../_models';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { first } from 'rxjs/operators';
import { ColDef, ColumnApi, GridApi } from 'ag-grid-community';

import {
  AccountService,
  AlertService,
  ContactService,
  CountryService,
  CustomerService,
  CustomerSiteService,
  DistributorRegionService,
  DistributorService,
  NotificationService,
  ProfileService
} from '../_services';
import { ListcontentModel } from "../_models/listcontent.model";


@Component({
  selector: 'app-contactlist',
  templateUrl: './contactlist.html',
})
export class ContactListComponent implements OnInit {
  user: User;
  form: FormGroup;
  contactList: any = [];
  list: ListcontentModel;
  submitted = false;
  isSave = false;
  customerId: string;
  type: string = "D";
  masterId: string;
  detailId: string;
  countries: Country[];
  profilePermission: ProfileReadOnly;
  hasReadAccess: boolean = false;
  hasUpdateAccess: boolean = false;
  hasDeleteAccess: boolean = false;
  hasAddAccess: boolean = false;
  screnLink: string;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private accountService: AccountService,
    private alertService: AlertService,
    private contactService: ContactService,
    private countryService: CountryService,
    private distributorService: DistributorService,
    private customerService: CustomerService,
    private distRegionService: DistributorRegionService,
    private customerSiteService: CustomerSiteService,
    private notificationService: NotificationService,
    private profileService: ProfileService
  ) {

  }

  ngOnInit() {
    this.masterId = this.route.snapshot.paramMap.get('id');
    this.detailId = this.route.snapshot.paramMap.get('cid');
    this.type = this.route.snapshot.paramMap.get('type');

    if (this.type == "DR" || this.type == "CS") this.screnLink = `/contact/${this.type}/${this.masterId}/${this.detailId}`
    else this.screnLink = `/contact/${this.type}/${this.masterId}`

    this.user = this.accountService.userValue;
    this.profilePermission = this.profileService.userProfileValue;
    if (this.profilePermission != null) {
      if (this.type == "DR" || this.type == "D") {
        let profilePermission = this.profilePermission.permissions.filter(x => x.screenCode == "SDIST");
        if (profilePermission.length > 0) {
          this.hasReadAccess = profilePermission[0].read;
          this.hasAddAccess = profilePermission[0].create;
          this.hasDeleteAccess = profilePermission[0].delete;
          this.hasUpdateAccess = profilePermission[0].update;
        }
      }

      if (this.type == "C" || this.type == "CS") {
        let profilePermission = this.profilePermission.permissions.filter(x => x.screenCode == "SCUST");
        if (profilePermission.length > 0) {
          this.hasReadAccess = profilePermission[0].read;
          this.hasAddAccess = profilePermission[0].create;
          this.hasDeleteAccess = profilePermission[0].delete;
          this.hasUpdateAccess = profilePermission[0].update;
        }
      }
    }

    if (this.user.username == "admin") {
      this.hasAddAccess = true;
      this.hasDeleteAccess = true;
      this.hasUpdateAccess = true;
      this.hasReadAccess = true;
    }

    if (this.type == "D") {
      this.distributorService.getById(this.masterId)
        .pipe(first())
        .subscribe({
          next: (data: any) => {
            data.object.contacts.forEach(contact => {

              this.list = new ListcontentModel();
              this.list.id = contact.id;

              this.list.firstItemLabel = "Name:"
              this.list.firstItem = contact.fname + " " + contact.mname + " " + contact.lname

              this.list.secondItemLabel = "Email:";
              this.list.secondItem = contact.pemail

              this.list.thirdItemLabel = "Designation"
              this.list.thirdItem = contact.designation

              this.contactList.push(this.list);
            });
          }
        });
    }
    else if (this.type == "DR") {
      this.distRegionService.getById(this.detailId)
        .pipe(first())
        .subscribe({
          next: (data: any) => {
            data.object.contacts.forEach(contact => {

              this.list = new ListcontentModel();
              this.list.id = contact.id;

              this.list.firstItemLabel = "Name:"
              this.list.firstItem = contact.fname + " " + contact.mname + " " + contact.lname

              this.list.secondItemLabel = "Email:";
              this.list.secondItem = contact.pemail

              this.list.thirdItemLabel = "Designation"
              this.list.thirdItem = contact.designation

              this.contactList.push(this.list);
            });
          },
        });
    }
    else if (this.type == "C") {
      this.customerService.getById(this.masterId)
        .pipe(first())
        .subscribe({
          next: (data: any) => {
            data.object.contacts.forEach(contact => {

              this.list = new ListcontentModel();
              this.list.id = contact.id;

              this.list.firstItemLabel = "Name:"
              this.list.firstItem = contact.fname + " " + contact.mname + " " + contact.lname

              this.list.secondItemLabel = "Email:";
              this.list.secondItem = contact.pemail

              this.list.thirdItemLabel = "Designation"
              this.list.thirdItem = contact.designation

              this.contactList.push(this.list);
            });
          },
        });
    }
    else if (this.type == "CS") {
      this.customerSiteService.getById(this.detailId)
        .pipe(first())
        .subscribe({
          next: (data: any) => {
            data.object.contacts.forEach(contact => {

              this.list = new ListcontentModel();
              this.list.id = contact.id;

              this.list.firstItemLabel = "Name:"
              this.list.firstItem = contact.fname + " " + contact.mname + " " + contact.lname

              this.list.secondItemLabel = "Email:";
              this.list.secondItem = contact.pemail

              this.list.thirdItemLabel = "Designation"
              this.list.thirdItem = contact.designation

              this.contactList.push(this.list);
            });
          },
        });
    }

  }

}
