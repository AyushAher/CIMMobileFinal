import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { first } from 'rxjs/operators';
import { ListcontentModel } from 'src/app/_models/listcontent.model';
import { EnvService } from 'src/app/_services/env/env.service';
import { ProfileReadOnly, User } from '../../_models';
import {
  AccountService,
  CustomersatisfactionsurveyService,
  DistributorService,
  ListTypeService,
  NotificationService,
  ProfileService
} from '../../_services';

@Component({
  selector: 'app-customersatisfactionsurveylist',
  templateUrl: './customersatisfactionsurveylist.component.html',
})
export class CustomersatisfactionsurveylistComponent implements OnInit {
  List: any[] = [];
  list: ListcontentModel;
  profilePermission: ProfileReadOnly;
  hasReadAccess: boolean = false;
  hasUpdateAccess: boolean = false;
  hasDeleteAccess: boolean = false;
  hasAddAccess: boolean = false;
  user: User;


  constructor(
    private router: Router,
    private accountService: AccountService,
    private Service: CustomersatisfactionsurveyService,
    private profileService: ProfileService,
    private distributorService: DistributorService,
    private listTypeService: ListTypeService,
    private environment: EnvService
  ) { }

  ngOnInit() {
    this.user = this.accountService.userValue;
    this.listTypeService.getItemById(this.user.roleId).pipe(first()).subscribe();
    let role = JSON.parse(localStorage.getItem('roles'));

    this.profilePermission = this.profileService.userProfileValue;
    if (this.profilePermission != null) {
      let profilePermission = this.profilePermission.permissions.filter(
        (x) => x.screenCode == "CTSS"
      );
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
    } else {
      role = role[0]?.itemCode;
    }

    this.Service.getAll()
      .pipe(first())
      .subscribe({
        next: (data: any) => {
          if (this.user.username != "admin") {
            this.distributorService.getByConId(this.user.contactId)
              .pipe(first())
              .subscribe({
                next: (data1: any) => {
                  if (role == this.environment.distRoleCode)
                    data.object = data.object.filter(x => x.distId == data1.object[0].id)

                  else if (role == this.environment.engRoleCode)
                    data.object = data.object.filter(x => x.engineerId == this.user.contactId)

                  else
                    data.object = data.object

                  this.GetData(data)
                }

              })
          }
          else this.GetData(data)
        }
      });
  }
  GetData(data) {
    this.List = []
    data.object.forEach(x => {
      this.list = new ListcontentModel()
      this.list.id = x.id
      this.list.firstItem = x.engineerName
      this.list.secondItem = x.serviceRequestNo


      this.list.firstItemLabel = 'Engineer:'
      this.list.secondItemLabel = 'Service Request No.:'
      this.List.push(this.list);
    });
  }
}
