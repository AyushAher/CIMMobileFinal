import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import {
  AccountService,
  AlertService,
  ConfigTypeValueService,
  InstrumentService,
  ListTypeService,
  NotificationService,
  ProfileService,
  SparePartService
} from "../_services";
import { CustspinventoryService } from "../_services/custspinventory.service";
import { Custspinventory } from "../_models/custspinventory";
import { debounceTime, distinctUntilChanged, first, map } from "rxjs/operators";
import { ConfigTypeValue, ListTypeItem, ResultMsg, SparePart, User } from "../_models";
import { ColDef, ColumnApi, GridApi } from "ag-grid-community";
import { DatePipe } from "@angular/common";
import { Observable, OperatorFunction } from "rxjs";

@Component({
  selector: "app-Custspinventory",
  templateUrl: "./custspinventory.html",
})

export class CustSPInventoryComponent implements OnInit {
  form: FormGroup;
  model: Custspinventory;
  loading = false;
  submitted = false;
  isSave = false;
  type: string;
  id: string;
  user: User;
  profilePermission: any;
  hasReadAccess: boolean = false;
  hasUpdateAccess: boolean = false;
  hasDeleteAccess: boolean = false;
  hasAddAccess: boolean = false;
  hasInternalAccess: boolean = false;


  replacementParts: SparePart[];
  configValueList: ConfigTypeValue[];
  listTypeItems: ListTypeItem[];

  public columnDefs: ColDef[];
  private columnApi: ColumnApi;
  private api: GridApi;
  historyModel
  sparepartlist: any[] = []
  instruments: any[] = []
  lstSpareParts: any[] = []
  isEditMode: boolean;
  isNewMode: boolean;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private accountService: AccountService,
    private alertService: AlertService,
    private notificationService: NotificationService,
    private listTypeService: ListTypeService,
    private Service: CustspinventoryService,
    private sparePartService: SparePartService,
    private configService: ConfigTypeValueService,
    private profileService: ProfileService,
    private instrumentService: InstrumentService,
  ) {
  }

  searchpart: OperatorFunction<string, readonly SparePart[]> = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      map(term => term === '' ? []
        : this.lstSpareParts.filter(v => v.partNoDesc.toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 10))
    )
  formatterpart = (x: any) => x.partNoDesc;

  ngOnInit() {
    this.user = this.accountService.userValue;
    this.profilePermission = this.profileService.userProfileValue;
    if (this.profilePermission != null) {
      let profilePermission = this.profilePermission.permissions.filter(x => x.screenCode == "CTSPI");
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

    this.form = this.formBuilder.group({
      partNo: ["", Validators.required],
      hscCode: ["", Validators.required],
      qtyAvailable: [0, Validators.required],
      SearchPartNo: [""],
      sparePartId: [""],
      instrument: [""],
      isactive: [true],
      isdeleted: [false],
    })

    this.id = this.route.snapshot.paramMap.get("id");

    if (this.id != null) {
      this.Service.getById(this.id)
        .pipe(first())
        .subscribe({
          next: (data: any) => {
            this.getSparePartByPartNo(data.object.sparePart.partNo)
            this.configService.getById(data.object.configType)
              .pipe(first())
              .subscribe({
                next: (data: any) => {
                  this.configValueList = data.object;
                }
              });
            // this.form.get("SearchPartNo")
            this.form.patchValue(data.object);
            this.Service.getHistory(this.user.contactId, this.id).pipe(first()).subscribe(
              (data: any) => {
                const datepipie = new DatePipe("en-US");
                data.object.forEach(value => {
                  value.serviceReportDate = datepipie.transform(value.serviceReportDate, "MM/dd/yyyy")
                })
                this.historyModel = data.object;
              })
          },
        });
      this.form.disable()
    }
    else {
      this.isNewMode = true
    }

    this.instrumentService.getAll(this.user.userId).pipe(first())
      .subscribe((data: any) =>
        this.instruments = data.object
      )

    this.listTypeService.getById("CONTY")
      .pipe(first())
      .subscribe({
        next: (data: ListTypeItem[]) => {
          this.listTypeItems = data;
        },
      });

    this.columnDefs = this.createColumnDefs();
  }



  EditMode() {
    if (confirm("Are you sure you want to edit the record?")) {
      this.isEditMode = true;
      this.form.enable();
    }
  }

  Back() {

    if ((this.isEditMode || this.isNewMode)) {
      if (confirm("Are you sure want to go back? All unsaved changes will be lost!"))
        this.router.navigate(["customerspinventorylist"]);
    }

    else this.router.navigate(["customerspinventorylist"]);

  }

  CancelEdit() {
    this.form.disable()
    this.isEditMode = false;
    this.isNewMode = false;
  }

  DeleteRecord() {
    if (confirm("Are you sure you want to edit the record?")) {
      this.Service.delete(this.id).pipe(first())
        .subscribe((data: any) => {
          if (data.result)
            this.router.navigate(["customerspinventorylist"]);
        })
    }
  }



  onInstrumentChange() {
    var insId = this.form.get('instrument').value;
    this.sparePartService.getAll()
      .pipe(first())
      .subscribe({
        next: (data: any) => {
          data.result ? this.sparepartlist = data.object : this.sparepartlist = []
          this.instrumentService.getById(insId).pipe(first())
            .subscribe((data: any) => {
              this.instruments = data.object;
              this.instrumentService.getInstrumentConfif(data.object.id)
                .pipe(first())
                .subscribe((dataa: any) => {
                  this.lstSpareParts = []
                  this.lstSpareParts = dataa;
                })

            })
        }
      })
  }

  onConfigChange(param: string) {
    this.configService.getById(param)
      .pipe(first())
      .subscribe({
        next: (data: any) => {
          this.configValueList = data.object;
        },
      });
  }

  onConfigVChange(configid: string, configval: string) {
    //debugger;
    this.sparePartService.getByConfignValueId(configid, configval)
      .pipe(first())
      .subscribe({
        next: (data: any) => {
          this.replacementParts = data.object;
        },
      });
  }

  onSeearchByPartNo() {
    var partno = this.form.get("SearchPartNo").value
    partno = partno.partNo;
    this.getSparePartByPartNo(partno)
  }

  getSparePartByPartNo(partno: string) {
    this.Service.GetSparePartByNo(partno)
      .pipe(first())
      .subscribe({
        next: (data: any) => {
          if (!data.result || data.object == null) return;

          this.form.get("sparePartId").setValue(data.object.id)
          this.form.get("partNo").setValue(data.object.partno)
          this.form.get("hscCode").setValue(data.object.hscode)
          this.form.get("SearchPartNo").setValue("")
        },
      })
  }

  get f() {
    return this.form.controls;
  }

  private createColumnDefs() {
    return [

      {
        headerName: "Service Request No.",
        field: "serReqNo",
        filter: true,
        tooltipField: "hsccode",
        enableSorting: true,
        editable: false,
        sortable: true,
      },
      {
        headerName: "Service Report Date",
        field: "serviceReportDate",
        filter: true,
        tooltipField: "qtyavailable",
        enableSorting: true,
        editable: false,
        sortable: true,
      },
      {
        headerName: "Qty Consumed",
        field: "qtyConsumed",
        filter: true,
        tooltipField: "partno",
        enableSorting: true,
        editable: false,
        sortable: true,
      },
    ]
  }

  onGridReady(params: any): void {
    this.api = params.api;
    this.columnApi = params.columnApi;

  }

  onSubmit() {
    this.submitted = true;
    // reset alerts on submit
    this.alertService.clear();
    // stop here if form is invalid
    if (this.form.invalid) return
    this.model = this.form.value
    this.model.customerId = this.user.contactId;

    if (this.id == null) {
      this.Service.save(this.model)
        .pipe(first())
        .subscribe({
          next: (data: ResultMsg) => {
            if (data.result) {
              this.notificationService.showSuccess(
                data.resultMessage,
                "Success"
              );
              this.router.navigate(["customerspinventorylist"]);
            }
            this.loading = false;
          },
        });
    }

    else {
      this.model = this.form.value;
      this.model.id = this.id;
      this.Service.update(this.id, this.model)
        .pipe(first())
        .subscribe({
          next: (data: ResultMsg) => {
            if (data.result) {
              this.notificationService.showSuccess(
                data.resultMessage,
                "Success"
              );
              this.router.navigate(["customerspinventorylist"]);
            }
            this.loading = false;
          },
        });
    }
  }
}
