import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { first } from "rxjs/operators";
import { EnvService } from "src/app/_services/env/env.service";
import {
  Customersatisfactionsurvey,
  DistributorRegionContacts,
  ListTypeItem,
  ProfileReadOnly,
  ResultMsg,
  ServiceRequest,
  User,
} from "../../_models";
import {
  AccountService,
  AlertService,
  CustomersatisfactionsurveyService,
  DistributorService,
  ListTypeService,
  NotificationService,
  ProfileService,
  ServiceReportService,
  ServiceRequestService,
} from "../../_services";

@Component({
  selector: "app-customersatisfactionsurvey",
  templateUrl: "./customersatisfactionsurvey.component.html",
})
export class CustomersatisfactionsurveyComponent implements OnInit {
  form: FormGroup;
  customersatisfactionsurvey: any;
  loading = false;
  submitted = false;
  isSave = false;
  type: string;
  id: string;
  travelDetailmodel: Customersatisfactionsurvey;
  profilePermission: ProfileReadOnly;

  hasReadAccess: boolean = false;
  hasUpdateAccess: boolean = false;
  hasDeleteAccess: boolean = false;
  hasAddAccess: boolean = false;

  user: User;
  code = "ACCOM";

  accomodationtype: ListTypeItem[];
  engineer: DistributorRegionContacts[] = [];
  servicerequest: ServiceRequest[] = [];
  travelrequesttype: ListTypeItem[];

  valid: boolean;
  DistributorList: any;
  eng: boolean = false;
  isEng: boolean = false;
  isDist: boolean = false;
  distId: string;

  engId: string;
  isNewMode: boolean;
  isEditMode: boolean;
  role: string;
  servicereportid: any;
  serviceRequestId: any;
  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private accountService: AccountService,
    private CustomersatisfactionsurveyService: CustomersatisfactionsurveyService,
    private alertService: AlertService,
    private notificationService: NotificationService,
    private profileService: ProfileService,
    private distributorservice: DistributorService,
    private servicerequestservice: ServiceRequestService,
    private listTypeService: ListTypeService,
    private environment: EnvService,
    private serviceReportService: ServiceReportService,

  ) {
  }

  ngOnInit() {
    this.user = this.accountService.userValue;

    let role = JSON.parse(localStorage.getItem('roles'));
    this.listTypeService.getItemById(this.user.roleId).pipe(first()).subscribe();
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
      this.role = role
    }
    if (role == this.environment.engRoleCode) {
      this.isEng = true;
    } else if (role == this.environment.distRoleCode) {
      this.isDist = true;
    }

    this.form = this.formBuilder.group({
      engineerId: [""],
      distId: [""],
      serviceRequestId: ["", [Validators.required]],

      name: ["", [Validators.required]],
      email: ["", [Validators.required]],
      onTime: [false],
      isProfessional: [false],
      isNotified: [false],
      isSatisfied: [false],
      isAreaClean: [false],
      isNote: [false],
      comments: [""],
    });

    this.distributorservice.getAll()
      .pipe(first())
      .subscribe((data: any) => this.DistributorList = data.object)

    if (this.role == this.environment.engRoleCode) {
      this.eng = true
      this.form.get('engineerId').setValue(this.user.contactId)
      this.engId = this.user.contactId;
    }

    this.distributorservice.getByConId(this.user.contactId).pipe(first())
      .subscribe((data: any) => {
        if (this.user.username != "admin" && data.object.length > 0) {
          this.distId = data.object[0].id;
          this.form.get('distId').setValue(data.object[0].id)
          // this.getengineers(data.object[0].id)
          this.distributorservice.getDistributorRegionContacts(data.object[0].id)
            .pipe(first())
            .subscribe((data: any) => {
              this.engineer = data.object
              this.servicerequestservice
                .GetServiceRequestByDist(data.object[0].id)
                .pipe(first())
                .subscribe((data: any) => this.servicerequest = data.object.filter(x => x.assignedto == this.user.contactId && !x.isReportGenerated));

            });


        }
      })



    this.id = this.route.snapshot.paramMap.get("id");
    this.servicereportid = this.route.snapshot.queryParams?.servicereportid

    if (this.id != null) {
      this.CustomersatisfactionsurveyService.getById(this.id)
        .pipe(first())
        .subscribe((data: any) => {
          this.distributorservice.getDistributorRegionContacts(data.object.distId)
            .pipe(first())
            .subscribe((engData: any) => {
              this.engineer = engData.object;

              this.servicerequestservice
                .GetServiceRequestByDist(data.object.distId)
                .pipe(first())
                .subscribe((sreqData: any) => {
                  this.servicerequest = sreqData.object.filter(x => x.assignedto == data.object.engineerId && !x.isReportGenerated)
                  setTimeout(() => this.form.patchValue(data.object), 100);
                });

            });

        });

      this.form.disable()
    }
    else {
      this.isNewMode = true
      this.FormControlsDisable()
    }

    if (this.servicereportid != null) {
      this.serviceReportService.getById(this.servicereportid)
        .pipe().subscribe((data: any) => {
          let serreq = data.object.serviceRequest
          this.distId = serreq.distid
          this.form.get("distId").setValue(serreq.distid)

          this.getengineers(serreq.distid)
          this.form.get("engineerId").setValue(serreq.assignedto)
          this.engId = serreq.assignedto

          this.getservicerequest(serreq.distid, serreq.assignedto)
          this.form.get("serviceRequestId").setValue(serreq.id)
          this.serviceRequestId = serreq.id

          this.form.get('name').setValue(serreq.contactperson)
          this.form.get('email').setValue(serreq.email)
        })
    }
  }

  FormControlsDisable() {
    if (this.role == this.environment.engRoleCode) {
      this.form.get('engineerId').disable()
      this.form.get('distId').disable()
    }
    else if (this.role == this.environment.distRoleCode) {
      this.form.get('distId').disable()
    }

    if (this.servicereportid) {
      this.form.get('serviceRequestId').disable()
      this.form.get('distId').disable()
      this.form.get('engineerId').disable()
    }
  }

  EditMode() {
    if (confirm("Are you sure you want to edit the record?")) {
      this.isEditMode = true;
      this.form.enable();
      this.FormControlsDisable()
    }
  }

  Back() {
    if ((this.isEditMode || this.isNewMode)) {
      if (confirm("Are you sure want to go back? All unsaved changes will be lost!"))
        this.router.navigate(["customersatisfactionsurveylist"]);
    }

    else this.router.navigate(["customersatisfactionsurveylist"]);

  }

  CancelEdit() {
    this.form.disable()
    this.isEditMode = false;
    this.isNewMode = false;
  }

  DeleteRecord() {
    if (confirm("Are you sure you want to edit the record?")) {
      this.CustomersatisfactionsurveyService.delete(this.id).pipe(first())
        .subscribe((data: any) => {
          if (data.result)
            this.router.navigate(["customersatisfactionsurveylist"]);
        })
    }
  }




  get f() {
    return this.form.controls;
  }

  getservicerequest(id: string, engId = null) {
    this.servicerequestservice
      .GetServiceRequestByDist(id)
      .pipe(first())
      .subscribe((data: any) => this.servicerequest = data.object.filter(x => x.assignedto == engId));
  }

  onServiceRequestChange() {
    var sreq = this.form.get('serviceRequestId').value
    var serviceRequest = this.servicerequest.find(x => x.id == sreq)

    this.form.get('name').setValue(serviceRequest.contactperson)
    this.form.get('email').setValue(serviceRequest.email)

  }

  getengineers(id: string) {
    this.distId = id
    this.distributorservice.getDistributorRegionContacts(id)
      .pipe(first())
      .subscribe((data: any) => this.engineer = data.object);
  }

  onSubmit() {
    this.submitted = true;
    // reset alerts on submit
    this.alertService.clear();

    // stop here if form is invalid
    if (this.form.invalid) {
      return;
    }

    this.loading = true;
    this.customersatisfactionsurvey = this.form.value;
    this.customersatisfactionsurvey.engineerId = this.engId
    this.customersatisfactionsurvey.distId = this.distId

    if (this.servicereportid) this.customersatisfactionsurvey.serviceRequestId = this.serviceRequestId

    if (this.id == null) {
      this.CustomersatisfactionsurveyService.save(this.form.value)
        .pipe(first())
        .subscribe({
          next: (data: ResultMsg) => {
            if (data.result) {
              this.notificationService.showSuccess(data.resultMessage, "Success");
              this.router.navigate(["/customersatisfactionsurveylist"]);
            }
            this.loading = false;
          },
        });
    }
    else {
      this.customersatisfactionsurvey.id = this.id;
      this.CustomersatisfactionsurveyService.update(this.id, this.customersatisfactionsurvey)
        .pipe(first())
        .subscribe((data: ResultMsg) => {
          if (data.result) {
            this.notificationService.showSuccess(data.resultMessage, "Success");
            this.router.navigate(["/customersatisfactionsurveylist"]);
          }
          this.loading = false;

        });
    }
  }
}
