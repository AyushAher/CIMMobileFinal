import { Component, OnInit } from '@angular/core';
import { ProfileReadOnly, User } from "../_models";
import { ActivatedRoute, Router } from "@angular/router";
import { AccountService, ProfileService } from "../_services";
import { AudittrailService } from "../_services/audittrail.service";
import { first } from "rxjs/operators";
import { ListcontentModel } from "../_models/listcontent.model";

@Component({
  selector: 'app-audittrail',
  templateUrl: './audittrail.component.html',
})
export class AudittrailComponent implements OnInit {

  List: any = [];
  user: User;

  hasReadAccess: boolean = false
  hasAddAccess: boolean = false;
  hasUpdateAccess: boolean = false;
  hasDeleteAccess: boolean = false;
  profilePermission: ProfileReadOnly;

  listContent: ListcontentModel;

  constructor(
    private router: Router,
    private accountService: AccountService,
    private Service: AudittrailService,
    private route: ActivatedRoute,
    private profileService: ProfileService,
  ) {
  }

  ngOnInit(): void {
    this.user = this.accountService.userValue;

    this.profilePermission = this.profileService.userProfileValue;

    if (this.profilePermission != null) {
      let profilePermission = this.profilePermission.permissions.filter(x => x.screenCode == "AUDIT");
      if (profilePermission.length > 0) {
        this.hasAddAccess = profilePermission[0].create;
        this.hasDeleteAccess = profilePermission[0].delete;
        this.hasUpdateAccess = profilePermission[0].update;
        this.hasReadAccess = profilePermission[0].read;
      }
    }
    if (this.user.username == "admin") {
      this.hasReadAccess = true;
      this.hasDeleteAccess = true;
      this.hasUpdateAccess = true;
      this.hasAddAccess = true;
    }

    if (this.user.username == "admin" || this.hasReadAccess) {
      this.Service.getAll()
        .pipe(first())
        .subscribe({
          next: (data: any) => {
            data.object.forEach(x => {
              this.listContent = new ListcontentModel()
              this.listContent.id = x.id;

              this.listContent.firstItemLabel = "Screen"
              this.listContent.firstItem = x.screen

              this.listContent.secondItemLabel = "User"
              this.listContent.secondItem = x.user

              this.listContent.thirdItemLabel = "Action"
              this.listContent.thirdItem = x.action

              this.List.push(this.listContent)
            })
          },
        })
    }
  }
}
