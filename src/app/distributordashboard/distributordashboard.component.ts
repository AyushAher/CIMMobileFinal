import { Component, OnInit, ViewChild } from '@angular/core';
import {
  AccountService,
  CustdashboardsettingsService,
  DistributorService,
  InstrumentService,
  ListTypeService,
  ProfileService,
  ServiceRequestService
} from "../_services";
import { ProfileReadOnly, User } from "../_models";
import { first } from "rxjs/operators";
import { DistributordashboardService } from '../_services/distributordashboard.service';
import { Router } from '@angular/router';

declare function DistributorDashboardCharts(): any;

@Component({
  selector: 'app-distributordashboard',
  templateUrl: './distributordashboard.component.html',
  // styleUrls: ['./distributordashboard.component.css']
})
export class DistributordashboardComponent implements OnInit {
  user: User;
  profilePermission: ProfileReadOnly;
  hasReadAccess: boolean = false;
  hasUpdateAccess: boolean = false;
  hasDeleteAccess: boolean = false;
  hasAddAccess: boolean = false;

  sRRaised: number = 0;
  insHighestSReq: number = 0;
  engHandlingReq: any = []
  instrumnetInstalled: any;
  instrumnetUnderService: any;
  plannedRevenue: any = 0;
  oncallRevenue: any = 0;
  breakdownRevenue: any = 0;
  preventiveRevenue: any = 0;
  amcRevenue: any = 0;
  customerRevenueList: any;
  totalRevenue: any;
  customerRevenueBgColors: any = [
    "#6f42c1",
    "#007bff",
    "#17a2b8",
    "#00cccc",
    "#adb2bd",
  ]
  calenderLst = ["3MNTHS", "6MNTHS", "12MNTHS"]
  currentFilter = this.calenderLst[0];

  @ViewChild('MNTHS3') Mnths3;
  @ViewChild('MNTHS6') Mnths6;
  @ViewChild('MNTHS12') Mnths12;
  criticalSerReq: any;
  isHidden: boolean = true;
  constructor(
    private accountService: AccountService,
    private listTypeService: ListTypeService,
    private SettingsService: CustdashboardsettingsService,
    private profileService: ProfileService,
    private serviceRequestService: ServiceRequestService,
    private distributorService: DistributorService,
    private router: Router,
    private distributorDashboardService: DistributordashboardService,
  ) {
  }

  ngOnInit() {
    this.user = this.accountService.userValue;
    this.profilePermission = this.profileService.userProfileValue;
    if (this.profilePermission != null) {
      let profilePermission = this.profilePermission.permissions.filter(x => x.screenCode == "DISDH");
      if (profilePermission.length > 0) {
        this.hasReadAccess = profilePermission[0].read;
        this.hasAddAccess = profilePermission[0].create;
        this.hasDeleteAccess = profilePermission[0].delete;
        this.hasUpdateAccess = profilePermission[0].update;
      }
    }
    setTimeout(() => this.onCalenderFilter(this.calenderLst[0]), 500);

    this.serviceRequestService.getAll(this.user.userId)
      .pipe(first()).subscribe((data: any) =>
        this.criticalSerReq = data.object.filter(x => x.isCritical).length)

  }

  CriticalSerReq() {
    this.router.navigate(["/servicerequestlist"])
  }

  toggle = () => this.isHidden = !this.isHidden

  onCalenderFilter(date) {
    if (date == this.calenderLst[0]) {
      this.Mnths3.nativeElement.classList.add("active")
      this.Mnths6.nativeElement.classList.remove("active")
      this.Mnths12.nativeElement.classList.remove("active")
    }
    else if (date == this.calenderLst[1]) {
      this.Mnths6.nativeElement.classList.add("active")
      this.Mnths3.nativeElement.classList.remove("active")
      this.Mnths12.nativeElement.classList.remove("active")
    }
    else if (date == this.calenderLst[2]) {
      this.Mnths12.nativeElement.classList.add("active")
      this.Mnths6.nativeElement.classList.remove("active")
      this.Mnths3.nativeElement.classList.remove("active")
    }

    this.GetInstrumentsInstalled(date)
    this.GetRevenuefromCustomer(date)
    this.GetServiceContractRevenue(date)
    this.GetDistDashboardData(date)
    setTimeout(() => DistributorDashboardCharts(), 1000)
  }

  GetInstrumentsInstalled(date = this.calenderLst[0]) {
    this.distributorDashboardService.GetInstrumentInstalled(date)
      .pipe(first()).subscribe((data: any) => {
        this.instrumnetInstalled = data.object.instrumentInstalled
        this.instrumnetUnderService = data.object.instrumentUnderService
        let obj = {
          instrumnetInstalled: data.object.instrumentInstalled,
          instrumnetUnderService: data.object.instrumentUnderService
        }
        localStorage.setItem('instrumentData', JSON.stringify(obj))
      })
  }

  GetRevenuefromCustomer(date = this.calenderLst[0]) {
    this.distributorDashboardService.RevenueFromCustomer(date)
      .pipe(first()).subscribe((data: any) => {
        this.customerRevenueList = data.object
        this.totalRevenue = data.object.map(x => x.total).reduce((a, b) => a + b, 0);
        localStorage.setItem('customerrevenue', JSON.stringify(data.object))
      })
  }

  GetServiceContractRevenue(date = this.calenderLst[0]) {
    this.distributorDashboardService.ServiceContractRevenue(date)
      .pipe(first()).subscribe((data: any) => {
        this.plannedRevenue = data.object.plannedRevenue
        this.oncallRevenue = data.object.oncallRevenue
        this.breakdownRevenue = data.object.breakdownRevenue
        this.preventiveRevenue = data.object.preventiveRevenue
        this.amcRevenue = data.object.amcRevenue
      })
  }

  GetDistDashboardData(date = this.calenderLst[0]) {
    this.distributorService.getByConId(this.user.contactId)
      .pipe(first())
      .subscribe((data: any) => {
        this.serviceRequestService.getDistDashboardData(data.object[0].id, date)
          .pipe(first()).subscribe((sreq: any) => {
            sreq = sreq.object
            let label = []
            let chartData = []
            sreq.instrumentWithHighestServiceRequest.forEach(x => {
              label.push(x.key);
              chartData.push(x.count);
            })

            localStorage.setItem('instrumentWithHighestServiceRequest', JSON.stringify({ label: label, data: chartData }))
            this.sRRaised = sreq.serviceRequestRaised
            this.insHighestSReq = sreq.instrumentWithHighestServiceRequest.length
            this.engHandlingReq = sreq.engHandlingReq
          })
      })
  }
}
