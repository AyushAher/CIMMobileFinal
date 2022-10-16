import { Component, OnInit } from '@angular/core';

import { ProfileReadOnly, User } from '../_models';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { first } from 'rxjs/operators';
import { AccountService, AlertService, CurrencyService, NotificationService, ProfileService } from '../_services';
import { ListcontentModel } from "../_models/listcontent.model";


@Component({
  selector: 'app-currList',
  templateUrl: './currencylist.html',
})
export class CurrencyListComponent implements OnInit {
  form: FormGroup;
  currencyList: any = [];
  submitted = false;

  profilePermission: ProfileReadOnly;
  hasReadAccess: boolean = false;
  hasUpdateAccess: boolean = false;
  hasDeleteAccess: boolean = false;
  hasAddAccess: boolean = false;
  user: User;

  list: ListcontentModel

  constructor(
    private router: Router,
    private accountService: AccountService,
    private currencyService: CurrencyService,
    private profileService: ProfileService,
  ) {

  }

  ngOnInit() {
    this.user = this.accountService.userValue;
    this.profilePermission = this.profileService.userProfileValue;
    if (this.profilePermission != null) {
      let profilePermission = this.profilePermission.permissions.filter(x => x.screenCode == "SCURR");
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

    this.currencyService.getAll()
      .pipe(first())
      .subscribe({
        next: (data: any) => {
          data.object.forEach(x => {
            this.list = new ListcontentModel()
            this.list.id = x.id

            this.list.firstItem = x.name
            this.list.secondItem = x.code
            this.list.thirdItem = x.minor_Unit

            this.list.firstItemLabel = 'Currency Name:'
            this.list.secondItemLabel = 'Code:'
            this.list.thirdItemLabel = 'Minor Unit:'

            this.currencyList.push(this.list)
      }
          )
  }
      });
  }

}
