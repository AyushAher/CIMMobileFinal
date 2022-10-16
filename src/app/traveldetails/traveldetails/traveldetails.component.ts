import { DatePipe } from "@angular/common";
import { Component, EventEmitter, OnInit, Output } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { first } from "rxjs/operators";

import {
  Currency,
  DistributorRegionContacts,
  ListTypeItem,
  ProfileReadOnly,
  ResultMsg,
  ServiceRequest,
  travelDetails,
  User
} from "../../_models";
import {
  AccountService,
  AlertService,
  CurrencyService,
  DistributorService,
  FileshareService,
  ListTypeService,
  NotificationService,
  ProfileService,
  ServiceRequestService,
  TravelDetailService
} from "../../_services";
import { FilerendercomponentComponent } from "../../Offerrequest/filerendercomponent.component";
import { HttpEventType } from "@angular/common/http";
import { ColDef, ColumnApi, GridApi } from "ag-grid-community";
import { environment } from "../../../environments/environment";
import { EnvService } from "src/app/_services/env/env.service";

@Component({
  selector: "app-traveldetails",
  templateUrl: "./traveldetails.component.html",
})
export class TraveldetailsComponent implements OnInit {
  Form: FormGroup;
  Model: travelDetails;
  loading = false;
  submitted = false;
  id: string;
  profilePermission: ProfileReadOnly;
  hasReadAccess: boolean = false;
  hasUpdateAccess: boolean = false;
  hasDeleteAccess: boolean = false;
  hasAddAccess: boolean = false;
  user: User;

  engineer: DistributorRegionContacts[] = [];
  servicerequest: ServiceRequest[] = [];
  classoftravel: ListTypeItem[];
  travelrequesttype: ListTypeItem[];
  Triptype: ListTypeItem[];

  code = ["CLTRA", "TRPTY", "TRRQT"];
  dateValid: boolean;
  cityValid: boolean;
  DistributorList: any;


  public columnDefs: ColDef[];
  public columnDefsAttachments: ColDef[];
  private columnApi: ColumnApi;
  private api: GridApi;
  isEng = false
  isDist = false
  flightdetails = false
  file: any;
  attachments: any;
  fileList: [] = [];
  transaction: number;
  hastransaction: boolean;
  public progress: number;
  public message: string;
  currencyList: Currency[];

  @Output() public onUploadFinished = new EventEmitter();
  distId: string;


  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private FileShareService: FileshareService,
    private accountService: AccountService,
    private Service: TravelDetailService,
    private alertService: AlertService,
    private notificationService: NotificationService,
    private profileService: ProfileService,
    private distributorservice: DistributorService,
    private listTypeService: ListTypeService,
    private servicerequestservice: ServiceRequestService,
    private currencyService: CurrencyService,
    private environment: EnvService,
  ) { }

  ngOnInit() {
    this.transaction = 0;

    this.user = this.accountService.userValue;
    this.listTypeService.getItemById(this.user.roleId).pipe(first()).subscribe();
    let role = JSON.parse(localStorage.getItem('roles'));
    this.id = this.route.snapshot.paramMap.get("id");

    this.profilePermission = this.profileService.userProfileValue;
    if (this.profilePermission != null) {
      let profilePermission = this.profilePermission.permissions.filter(
        (x) => x.screenCode == "TRDET"
      );
      if (profilePermission.length > 0) {
        this.hasReadAccess = profilePermission[0].read;
        this.hasAddAccess = profilePermission[0].create;
        this.hasDeleteAccess = profilePermission[0].delete;
        this.hasUpdateAccess = profilePermission[0].update;
      }
    }
    this.Form = this.formBuilder.group({
      engineerid: ["", [Validators.required]],
      servicerequestid: ["", [Validators.required]],
      distId: ["", [Validators.required]],
      triptype: ["", [Validators.required]],
      travelclass: ["", [Validators.required]],
      fromcity: ["", [Validators.required]],
      tocity: ["", [Validators.required]],
      departuredate: ["", [Validators.required]],
      returndate: ["", [Validators.required]],
      amount: ["", [Validators.required]],
      combined: [false],
      isactive: [true],
      isdeleted: [false],
      requesttype: ["", [Validators.required]],
      flightdetails: this.formBuilder.group({
        airline: [""],
        flightno: [""],
        flightdate: [""],
        currencyId: [""],
        flightcost: 0,
      }),
    });

    if (this.user.username == "admin") {
      this.hasAddAccess = true;
      this.hasDeleteAccess = true;
      this.hasUpdateAccess = true;
      this.hasReadAccess = true;
    } else {
      role = role[0]?.itemCode;
    }
    if (role == this.environment.engRoleCode) {
      this.isEng = true;
      this.Form.get('flightdetails').get('currencyId').disable();
      this.Form.get('engineerid').disable();
      this.Form.get('distId').disable();
    } else if (role == this.environment.distRoleCode) {
      this.isDist = true;
      this.Form.get('distId').disable();
      if (this.id != null) {
        this.Form.get('flightdetails').get('airline').setValidators([Validators.required])
        this.Form.get('flightdetails').get('airline').updateValueAndValidity()

        this.Form.get('flightdetails').get('flightdate').setValidators([Validators.required])
        this.Form.get('flightdetails').get('flightdate').updateValueAndValidity()

        this.Form.get('flightdetails').get('flightno').setValidators([Validators.required])
        this.Form.get('flightdetails').get('flightno').updateValueAndValidity()

        this.Form.get('flightdetails').get('currencyId').setValidators([Validators.required])
        this.Form.get('flightdetails').get('currencyId').updateValueAndValidity()

        this.Form.get('flightdetails').get('flightcost').setValidators([Validators.required])
        this.Form.get('flightdetails').get('flightcost').updateValueAndValidity()
      }
    }

    this.currencyService.getAll()
      .pipe(first())
      .subscribe({
        next: (data: any) => {
          this.currencyList = data.object
        },
        error: (error) => {

          this.loading = false;
        }
      })
    this.distributorservice.getAll()
      .pipe(first())
      .subscribe({
        next: (data: any) => {
          this.DistributorList = data.object;
        },
        error: (error) => {

          this.loading = false;
        },
      })


    this.distributorservice.getByConId(this.user.contactId)
      .pipe(first())
      .subscribe({
        next: (data: any) => {
          if (this.user.username != "admin") {
            this.Form.get('distId').setValue(data.object[0].id);
            this.getengineers(data.object[0].id)
            this.getservicerequest(data.object[0].id, this.user.contactId)
          }
        }
      })
    if (role == this.environment.engRoleCode) {
      this.Form.get('engineerid').setValue(this.user.contactId)
    }
    this.listTypeService
      .getById(this.code[0])
      .pipe(first())
      .subscribe({
        next: (data: ListTypeItem[]) => {
          this.classoftravel = data;
        },
        error: (error) => {

          this.loading = false;
        },
      });

    this.listTypeService
      .getById(this.code[1])
      .pipe(first())
      .subscribe({
        next: (data: ListTypeItem[]) => {
          this.Triptype = data;
        },
        error: (error) => {

          this.loading = false;
        },
      });

    this.listTypeService
      .getById(this.code[2])
      .pipe(first())
      .subscribe({
        next: (data: ListTypeItem[]) => {
          this.travelrequesttype = data;
        },
        error: (error) => {

          this.loading = false;
        },
      });



    if (this.id != null) {
      this.hasAddAccess = false;

      if (this.user.username == "admin") {
        this.hasAddAccess = true;
      }

      this.Service
        .getById(this.id)
        .pipe(first())
        .subscribe({
          next: (data: any) => {

            this.flightdetails = true;
            this.distributorservice.getDistributorRegionContacts(data.object.distId)
              .pipe(first())
              .subscribe((Engdata: any) => {
                this.distId = data.object.distId
                this.engineer = Engdata.object;

                this.servicerequestservice
                  .GetServiceRequestByDist(data.object.distId)
                  .pipe(first())
                  .subscribe((Srqdata: any) => {
                    this.servicerequest = Srqdata.object.filter(x => x.assignedto == data.object.engineerid && !x.isReportGenerated)
                    this.GetFileList(data.object.id)
                    data.object.servicerequestid = data.object.servicerequestid?.split(',').filter(x => x != "");
                    this.Form.patchValue(data.object)
                  });
              });
          }
        });
    }

    this.columnDefsAttachments = this.createColumnDefsAttachments();

  }

  get t() {
    return this.Form.controls;
  }
  get f() {
    return this.Form.controls.flightdetails;
  }

  getservicerequest(id: string, engId = null) {
    this.servicerequestservice
      .GetServiceRequestByDist(id)
      .pipe(first())
      .subscribe((Srqdata: any) => {
        this.servicerequest = Srqdata.object.filter(x => x.assignedto == engId && !x.isReportGenerated)
      });
  }

  getengineers(id: string) {
    this.distributorservice.getDistributorRegionContacts(id)
      .pipe(first())
      .subscribe((Engdata: any) => {
        this.distId = id
        this.engineer = Engdata.object;
      });
  }



  getfil(x) {
    this.file = x;
  }

  listfile = (x) => {
    document.getElementById("selectedfiles").style.display = "block";

    var selectedfiles = document.getElementById("selectedfiles");
    var ulist = document.createElement("ul");
    ulist.id = "demo";
    selectedfiles.appendChild(ulist);

    if (this.transaction != 0) {
      document.getElementById("demo").remove();
    }

    this.transaction++;
    this.hastransaction = true;

    for (let i = 0; i <= x.length; i++) {
      var name = x[i].name;
      var ul = document.getElementById("demo");
      var node = document.createElement("li");
      node.appendChild(document.createTextNode(name));
      ul.appendChild(node);
    }
  };

  createColumnDefsAttachments() {
    return [
      {
        headerName: "Action",
        field: "id",
        filter: false,
        editable: false,
        width: 100,
        sortable: false,
        cellRendererFramework: FilerendercomponentComponent,
        cellRendererParams: {
          deleteaccess: this.hasDeleteAccess,
          id: this.id
        },
      },
      {
        headerName: "File Name",
        field: "displayName",
        filter: true,
        tooltipField: "File Name",
        enableSorting: true,
        editable: false,
        sortable: true,
      },
    ]
  }

  public uploadFile = (files, id) => {
    if (files.length === 0) {
      return;
    }
    let filesToUpload: File[] = files;
    const formData = new FormData();

    Array.from(filesToUpload).map((file, index) => {
      return formData.append("file" + index, file, file.name);
    });
    this.FileShareService.upload(formData, id, "TRREQ", null).subscribe((event) => {
      if (event.type === HttpEventType.UploadProgress)
        this.progress = Math.round((100 * event.loaded) / event.total);
      else if (event.type === HttpEventType.Response) {
        this.message = "Upload success.";
        this.onUploadFinished.emit(event.body);
      }
    });
  };

  GetFileList(id: string) {
    this.FileShareService.list(id)
      .pipe(first())
      .subscribe({
        next: (data: any) => {
          this.attachments = data.object;
        },
      });
  }

  onGridReadyAttachments(params): void {
    this.api = params.api;
    this.columnApi = params.columnApi;
    this.api.sizeColumnsToFit();
  }

  onSubmit() {
    this.submitted = true;
    // reset alerts on submit
    this.alertService.clear();

    // stop here if form is invalid
    if (this.Form.invalid) {
      return;
    }

    this.loading = true;
    this.Model = this.Form.value;

    let currentDate = new Date(this.Form.value.departuredate);
    let dateSent = new Date(this.Form.value.returndate);
    let flightdate = new Date(
      this.Form.value.flightdetails.flightdate
    );

    let calc = Math.floor(
      (Date.UTC(
        dateSent.getFullYear(),
        dateSent.getMonth(),
        dateSent.getDate()
      ) -
        Date.UTC(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          currentDate.getDate()
        )) /
      (1000 * 60 * 60 * 24)
    );

    const datepipie = new DatePipe("en-US");
    this.Form.value.departuredate = datepipie.transform(
      currentDate,
      "MM/dd/yyyy"
    );

    this.Form.value.returndate = datepipie.transform(
      dateSent,
      "MM/dd/yyyy"
    );
    if (this.isDist && this.id != null) {
      this.Form.value.flightdetails.flightdate = datepipie.transform(
        flightdate,
        "MM/dd/yyyy"
      );
    }

    let fcity = this.Form.value.fromcity.toLowerCase();
    let city = this.Form.value.tocity;
    let tcity = this.Form.value.tocity.toLowerCase();
    if (fcity != tcity) {
      this.cityValid = true;
    } else {
      this.notificationService.showError(
        "From City and To City cannot be same",
        "Error"
      );
      this.cityValid = false;
      this.loading = false;
    }

    if (calc > 1) this.dateValid = true;
    else {
      this.notificationService.showError(
        "The difference between Departure Date and Return Date should be more than 1 day !",
        "Error"
      );
      this.dateValid = false;
    }

    this.Model.distId = this.distId
    if (this.isEng) this.Model.engineerid = this.user.contactId;

    if (this.Form.get('servicerequestid').value.length > 0) {
      var selectarray = this.Form.get('servicerequestid').value;
      this.Model.servicerequestid = selectarray.toString();
    }

    else if (this.Form.get('servicerequestid').value.length == 0) {
      this.Model.servicerequestid = ""
    }


    if (this.dateValid && this.cityValid) {
      if (this.id == null) {
        this.Service
          .save(this.Model)
          .pipe(first())
          .subscribe((data: any) => {

            if (this.file != null) this.uploadFile(this.file, data.object.id);

            if (data.result) {
              this.notificationService.showSuccess(
                data.resultMessage,
                "Success"
              );

              this.router.navigate(["traveldetailslist"]);
            }
            this.loading = false;
          });
      }
      else {
        this.Model = this.Form.value;
        this.Model.id = this.id;
        this.Model.distId = this.distId
        if (this.isEng) this.Model.engineerid = this.user.contactId;

        this.Service
          .update(this.id, this.Model)
          .pipe(first())
          .subscribe({
            next: (data: ResultMsg) => {

              if (this.file != null) {
                this.uploadFile(this.file, this.id);
              }

              if (data.result) {
                this.notificationService.showSuccess(
                  data.resultMessage,
                  "Success"
                );
                this.router.navigate(["traveldetailslist"]);
              } else {

              }
              this.loading = false;
            },
            error: (error) => {


              this.loading = false;
            },
          });
      }
    }
  }
}
