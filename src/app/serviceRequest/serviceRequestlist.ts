import { Component, OnInit } from '@angular/core';

import { ProfileReadOnly, User } from '../_models';
import { first } from 'rxjs/operators';
import {
  AccountService,
  ContactService,
  ProfileService,
  ServiceRequestService
} from '../_services';
import { DatePipe } from '@angular/common';
import { EnvService } from '../_services/env/env.service';
import { ListcontentModel } from '../_models/listcontent.model';


@Component({
  selector: 'app-distributorRgList',
  templateUrl: './serviceRequestlist.html',
})
export class ServiceRequestListComponent implements OnInit {
  user: User;
  srList = []
  profilePermission: ProfileReadOnly;
  hasAddAccess: boolean = false;
  hasReadAccess: boolean = false;
  hasDeleteAccess: boolean = false;
  IsCustomerView: boolean = true;
  IsDistributorView: boolean = false;
  IsEngineerView: boolean = false;
  list: ListcontentModel

  datepipe: any = new DatePipe("en-US");
  appendList: any;
  showGrid: boolean = true;

  constructor(
    private accountService: AccountService,
    private profileService: ProfileService,
    private contcactservice: ContactService,
    private serviceRequestService: ServiceRequestService,
    private environment: EnvService,

  ) { }

  ngOnInit() {
    this.user = this.accountService.userValue;
    this.profilePermission = this.profileService.userProfileValue;
    if (this.profilePermission != null) {
      let profilePermission = this.profilePermission.permissions.filter(x => x.screenCode == "SRREQ");
      if (profilePermission.length > 0) {
        this.hasAddAccess = profilePermission[0].create;
        this.hasDeleteAccess = profilePermission[0].delete;
        this.hasReadAccess = profilePermission[0].read;
      }
    }
    if (this.user.username == "admin") {
      this.hasAddAccess = false;
      this.hasDeleteAccess = true;
      this.hasReadAccess = true;
      this.getallrecored();
    }
    else {
      let role = JSON.parse(localStorage.getItem('roles'));
      role = role[0]?.itemCode;

      if (role == this.environment.custRoleCode) {
        this.IsCustomerView = true;
        this.IsDistributorView = false;
        this.IsEngineerView = false;
      }
      else if (role == this.environment.distRoleCode) {
        this.IsCustomerView = false;
        this.IsDistributorView = true;
        this.IsEngineerView = false;
      }
      else {
        this.IsCustomerView = false;
        this.IsDistributorView = false;
        this.IsEngineerView = true;
      }

      this.contcactservice.getDistByContact(this.user.contactId)
        .pipe(first())
        .subscribe({
          next: () => this.getallrecored()
        });
    }


  }

  GetList(data: any) {
    this.srList = []
    data.forEach(x => {
      this.list = new ListcontentModel()
      this.list.id = x.id
      this.list.firstItem = x.serreqno
      this.list.secondItem = x.machineModelName
      this.list.thirdItem = x.sitename

      this.list.firstItemLabel = 'Service Request No.:'
      this.list.secondItemLabel = 'Machine Serial No.:'
      this.list.thirdItemLabel = 'Site Name:'

      this.srList.push(this.list)
    })
  }

  ShowData(event) {
    this.showGrid = event
  }

  toggleFilter() {
    this.showGrid = !this.showGrid
  }

  getallrecored() {
    this.serviceRequestService.getAll(this.user.userId)
      .pipe(first()).subscribe({
        next: (data: any) => {
          console.log(data);
          
          if (!this.IsDistributorView) this.showGrid = true;
          data = data.object?.filter(x => !x.isReportGenerated);
          data?.forEach(ser => {
            ser.accepted ? ser.accepted = "Accepted" : ser.accepted = "Not Accepted"
            ser.createdon = this.datepipe.transform(ser.createdon, "MM/dd/yyyy HH:mm")
            if (ser.scheduledCalls.length > 0) {
              ser.scheduledCalls = ser.scheduledCalls[0]
              let date = new Date(ser.scheduledCalls.endTime)
              let datestr = this.datepipe.transform(date, "MM/dd/yyyy")
              ser.scheduledCalls.endTime = this.datepipe.transform(ser.scheduledCalls.endTime, "shortTime")
              ser.scheduledCalls.startTime = this.datepipe.transform(ser.scheduledCalls.startTime, "shortTime")
              ser.scheduledCalls.Time = ser.scheduledCalls.location + " : " + datestr + " At " + ser.scheduledCalls.startTime + " - " + ser.scheduledCalls.endTime

            }
            if (ser.engComments?.length > 0) {
              let date = this.datepipe.transform(ser.engComments[0]?.nextdate, "MM/dd/yyyy")
              ser.engComments = date + " : " + ser.engComments[0].comments
            }
          });

          this.GetList(data);
        },
      });
  }

}

