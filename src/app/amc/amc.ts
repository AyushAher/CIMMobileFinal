import { DatePipe } from "@angular/common";
import { HttpEventType } from "@angular/common/http";
import { Component, EventEmitter, OnInit, Output, ViewChild } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { ColDef, ColumnApi, GridApi } from "ag-grid-community";
import { Guid } from "guid-typescript";
import { first } from "rxjs/operators";

import { FilerendercomponentComponent } from "../Offerrequest/filerendercomponent.component";
import { Amc, Currency, Customer, ListTypeItem, ResultMsg, User } from "../_models";
import { AmcInstrument } from "../_models/Amcinstrument";
import {
  AccountService,
  AlertService,
  AmcService,
  ContactService,
  CurrencyService,
  CustomerService,
  FileshareService,
  ListTypeService,
  NotificationService,
  ProfileService
} from "../_services";
import { AmcinstrumentService } from "../_services/amcinstrument.service";
import { AmcstagesService } from "../_services/amcstages.service";
import { EnvService } from "../_services/env/env.service";
import { AmcInstrumentRendererComponent } from "./amc-instrument-renderer.component";

@Component({
  selector: "app-Amc",
  templateUrl: "./Amc.html",
})
export class AmcComponent implements OnInit {
  form: FormGroup;
  model: any;
  submitted = false;
  isSave = false;
  type: string;
  id: any;
  user: User;

  hasReadAccess: boolean = false;
  hasUpdateAccess: boolean = false;
  hasDeleteAccess: boolean = false;
  hasAddAccess: boolean = false;
  hasInternalAccess: boolean = false;
  hasCommercial: boolean = false;
  profilePermission: any;

  customersList: Customer[];
  currencyList: Currency[];
  serviceType: ListTypeItem[];
  instrumentserialno: any;
  instrumentAutoComplete: any[];
  instrumentList: AmcInstrument[] = []
  supplierList: ListTypeItem[];
  custSiteList: any;

  public columnDefs: any;
  private columnApi: ColumnApi;
  private api: GridApi;
  hasId: boolean = false;

  IsCustomerView: boolean = false;
  IsDistributorView: boolean = false;
  IsEngineerView: boolean = false;
  @ViewChild('instrumentSearch') instrumentSearch
  role: any;
  datepipe = new DatePipe('en-US')
  rowData: any;
  stagesList: any;
  processFile: any;
  isPaymentTerms: boolean = false;
  attachments: any;
  file: any;
  fileList: [] = [];
  transaction: number;
  hastransaction: boolean;
  public progress: number;
  public message: string;
  @ViewChild('stageFiles') stageFiles;
  @Output() public onUploadFinished = new EventEmitter();
  vScroll: boolean = true;
  paymentTypes: any;
  payTypes: any;
  isPaymentAmt: boolean = false;
  isCompleted: boolean = false;
  isNewMode: any;
  isEditMode: any;
  isDisableSite: any;
  defaultSiteId: any;
  defaultCustomerId: any;
  baseCurrId: any;
  @ViewChild('baseAmt') baseAmt


  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private accountService: AccountService,
    private alertService: AlertService,
    private notificationService: NotificationService,
    private listTypeService: ListTypeService,
    private Service: AmcService,
    private profileService: ProfileService,
    private customerService: CustomerService,
    private currencyService: CurrencyService,
    private AmcInstrumentService: AmcinstrumentService,
    private contactService: ContactService,
    private amcStagesService: AmcstagesService,
    private FileShareService: FileshareService,
    private environment: EnvService

  ) {

    this.notificationService.listen().subscribe((m: any) => {
      if (this.id != null) {
        this.AmcInstrumentService.getAmcInstrumentsByAmcId(this.id)
          .pipe(first())
          .subscribe((data: any) => {
            this.instrumentList = data.object;
          });


        this.amcStagesService.getAll(this.id).pipe(first())
          .subscribe((stageData: any) => {
            stageData.object.forEach(element => {
              element.createdOn = this.datepipe.transform(element.createdOn, 'MM/dd/yyyy')
            });

            this.rowData = stageData.object;
            this.form.get('stageName').reset()
            this.form.get('stageComments').reset()
            this.form.get('payterms').reset()
            this.form.get('payAmt').reset()
            this.isPaymentAmt = false;
            this.stageFiles.nativeElement.value = "";
            var selectedfiles = document.getElementById("stageFilesList");
            selectedfiles.innerHTML = '';
          })
      }
    });
  }

  ngOnInit() {
    this.user = this.accountService.userValue;
    this.profilePermission = this.profileService.userProfileValue;
    if (this.profilePermission != null) {
      let profilePermission = this.profilePermission.permissions.filter(x => x.screenCode == "SAMC");
      if (profilePermission.length > 0) {
        this.hasReadAccess = profilePermission[0].read;
        this.hasAddAccess = profilePermission[0].create;
        this.hasDeleteAccess = profilePermission[0].delete;
        this.hasUpdateAccess = profilePermission[0].update;
        this.hasCommercial = profilePermission[0].commercial;
      }
    }

    if (this.user.username == "admin") {
      this.hasAddAccess = true;
      this.hasDeleteAccess = true;
      this.hasUpdateAccess = true;
      this.hasReadAccess = true;
      this.hasCommercial = true;
    } else {
      let role = JSON.parse(localStorage.getItem('roles'));
      this.role = role[0]?.itemCode;
    }



    let role = this.role;
    this.listTypeService.getItemById(this.user.roleId).pipe(first()).subscribe();

    if (role == this.environment.custRoleCode) {
      this.IsCustomerView = true;
      this.IsDistributorView = false;
      this.IsEngineerView = false;
    } else if (role == this.environment.distRoleCode) {
      this.IsCustomerView = false;
      this.IsDistributorView = true;
      this.IsEngineerView = false;
    } else {
      this.IsCustomerView = false;
      this.IsDistributorView = false;
      this.IsEngineerView = true;
    }

    this.form = this.formBuilder.group({
      isactive: [true],
      isdeleted: [false],
      billtoid: ["", Validators.required],
      servicequote: ["", Validators.required],
      sqdate: ["", Validators.required],
      sdate: ["", Validators.required],
      edate: ["", Validators.required],
      project: ["", Validators.required],
      servicetype: ["", Validators.required],
      brand: ["", Validators.required],
      currency: [""],
      zerorate: [0],
      tnc: ["", Validators.required],
      custSite: ["", Validators.required],

      payterms: [''],
      paymentTerms: [""],
      stageName: [''],
      stageComments: [''],
      stagePaymentType: [],
      baseCurrencyAmt: [1.00, Validators.required],
      baseCurrencyId: ["", Validators.required],
      payAmt: [0],
      payAmtCurrencyId: [''],
      secondVisitDateFrom: ['', [Validators.required]],
      secondVisitDateTo: ['', [Validators.required]],
      firstVisitDateFrom: ['', [Validators.required]],
      firstVisitDateTo: ['', [Validators.required]],
    })

    this.id = this.route.snapshot.paramMap.get("id");

    this.listTypeService.getById("AMCSG").pipe(first())
      .subscribe((data: any) => {
        this.stagesList = data
      })
    this.contactService.getCustomerSiteByContact(this.user.contactId)
      .pipe(first())
      .subscribe({
        next: (data: any) => {
          if (this.IsCustomerView) {
            this.form.get('billtoid').setValue(data.object?.id)
            this.defaultCustomerId = data.object.id
            this.custSiteList = [];
            let siteLst = this.user.custSites?.split(",")
            data.object?.sites.forEach(element => {
              if (siteLst?.length > 0 && this.user.userType?.toLocaleLowerCase() == "customer" && siteLst?.find(x => x == element.id) == null) return;
              this.custSiteList.push(element);
              element?.contacts.forEach(con => {
                if (con?.id == this.user.contactId) {
                  this.isDisableSite = true
                  if (this.id == null) this.form.get('custSite').disable()
                  this.form.get('custSite').setValue(element?.id)
                  this.defaultSiteId = element.id
                }
              });
            });
          }
        },
      });

    this.customerService.getAll()
      .pipe(first())
      .subscribe({
        next: (data: any) => {
          this.customersList = data.object
        },
      })

    this.currencyService.getAll()
      .pipe(first())
      .subscribe({
        next: (data: any) => {
          this.currencyList = data.object

          this.baseCurrId = data.object.find(x => x.code == this.environment.baseCurrencyCode)?.id
          this.form.get("baseCurrencyId").setValue(this.baseCurrId)
        },
      })


    this.listTypeService.getById("SERTY")
      .pipe(first()).subscribe((data: ListTypeItem[]) => {
        this.serviceType = data;
      });

    this.listTypeService.getById("SUPPL")
      .pipe(first()).subscribe((data: any) => {
        this.supplierList = data;
      });


    this.form.get('baseCurrencyAmt').valueChanges
      .subscribe(value => {
        if (value >= 1000) this.form.get('baseCurrencyAmt').setValue(1.0)
      });

    this.form.get('currency').valueChanges
      .subscribe(value => {
        if (value == this.form.get('baseCurrencyId').value) {
          this.form.get('baseCurrencyAmt').setValue(1.00)
          this.baseAmt.nativeElement.disabled = true
        }
        else this.baseAmt.nativeElement.disabled = false
      });

    if (this.id != null) {
      this.Service.getById(this.id)
        .pipe(first())
        .subscribe((data: any) => {

          this.listTypeService.getById("ORQPT")
            .pipe(first())
            .subscribe((mstData: any) => {
              this.isCompleted = data.object?.isCompleted

              if (this.isCompleted) {
                setInterval(() => this.form.disable(), 10);
              }

              data.object.paymentTerms = data.object.paymentTerms?.split(',').filter(x => x != "");
              this.paymentTypes = []
              this.payTypes = mstData;

              if (data.object.firstVisitDate) {
                var dateRange = data.object.firstVisitDate.split("-")
                this.form.get('firstVisitDateFrom').setValue(dateRange[0])
                this.form.get('firstVisitDateTo').setValue(dateRange[1])
              }

              if (data.object.secondVisitDate) {
                var dateRange = data.object.secondVisitDate.split("-")
                this.form.get('secondVisitDateFrom').setValue(dateRange[0])
                this.form.get('secondVisitDateTo').setValue(dateRange[1])
              }

              data.object.paymentTerms?.forEach(y => {
                mstData.forEach(x => {
                  if (y == x.listTypeItemId) {
                    this.paymentTypes.push(x)
                  }
                });
              });

              this.amcStagesService.getAll(this.id).pipe(first())
                .subscribe((stageData: any) => {
                  stageData.object?.forEach(element => {
                    element.createdOn = this.datepipe.transform(element.createdOn, 'MM/dd/yyyy')
                  });

                  this.rowData = stageData.object;
                  this.GetSites(data.object.billtoid);
                  this.form.get('stageName').reset()
                  setTimeout(() => {
                    this.form.patchValue(data.object);
                  }, 500);
                })
            })
        });

      this.AmcInstrumentService.getAmcInstrumentsByAmcId(this.id)
        .pipe(first())
        .subscribe((data: any) => {
          this.instrumentList = data.object;
        });

      this.hasId = true;
      this.form.disable()
      this.columnDefs = this.createColumnDefsRO();
    }
    else {
      this.isNewMode = true;
      this.columnDefs = this.createColumnDefs();
      this.hasId = false;
      this.id = Guid.create();
      this.id = this.id.value;
      setTimeout(() => this.FormControlDisable(), 1000);
    }
  }

  EditMode() {
    if (confirm("Are you sure you want to edit the record?")) {
      this.isEditMode = true;
      this.form.enable();
      this.FormControlDisable()
      this.columnDefs = this.createColumnDefs();

      let curr = this.form.get('currency')
      curr.setValue(curr.value)
    }
  }

  FormControlDisable() {
    this.form.get('baseCurrencyId').disable()
    if (this.isDisableSite) {
      this.form.get('custSite').disable()
    }
    if (this.IsCustomerView) {
      this.form.get('billtoid').disable()
    }
  }

  Back() {

    if ((this.isEditMode || this.isNewMode)) {
      if (confirm("Are you sure want to go back? All unsaved changes will be lost!"))
        this.router.navigate(["amclist"]);
    }

    else this.router.navigate(["amclist"]);

  }

  CancelEdit() {
    this.form.disable()
    this.columnDefs = this.createColumnDefsRO();
    this.isEditMode = false;
    this.isNewMode = false;
  }

  DeleteRecord() {
    if (confirm("Are you sure you want to edit the record?")) {
      this.Service.delete(this.id).pipe(first())
        .subscribe((data: any) => {
          if (data.result)
            this.router.navigate(["distributorlist"]);
        })
    }
  }

  get f() {
    return this.form.controls;
  }

  DisableChoseFile(className) {
    let ofer = <HTMLInputElement>document.querySelector(`input[type="file"].` + className)
    ofer.disabled = !ofer.disabled
  }


  submitStageData() {

    if (this.isPaymentTerms && !this.f.payterms.value) return this.notificationService.showInfo("Payterms is required", "Info")
    if (this.isPaymentAmt && !this.f.payAmt.value && !this.f.payAmtCurrencyId.value) return this.notificationService.showInfo("Payment Amount cannot be empty", "Info")
    if (!this.f.stageName.value) return this.notificationService.showInfo("Stage Name cannot be empty", "Info")

    if (!this.f.stageComments.value) return this.notificationService.showInfo("Comments cannot be empty", "Info")


    let hasNoAttachment = false;

    let Attachment = <HTMLInputElement>document.getElementById("stageFilesList_Attachment")
    hasNoAttachment = Attachment?.checked


    let comments = this.form.get('stageComments').value;

    if (!hasNoAttachment && this.processFile == null) {
      this.notificationService.showInfo("No Attachments Selected.", "Error")
      return;
    }

    let stage = this.form.get('stageName').value
    let index = 0;
    let paymentTerms = this.form.get('payterms').value
    let payAmt = this.form.get('payAmt').value
    let payAmtCurrencyId = this.form.get('payAmtCurrencyId').value

    let offerProcess = {
      isactive: false,
      comments,
      IsCompleted: true,
      parentId: this.id,
      stage,
      index,
      payAmt,
      paymentTypeId: paymentTerms,
      payAmtCurrencyId,
    }

    this.amcStagesService.save(offerProcess).pipe(first())
      .subscribe((data: any) => {
        if (offerProcess.stage == this.stagesList.find(x => x.itemCode == "AMPFI")?.listTypeItemId)
          this.notificationService.showInfo('Please select payment terms for Customer', "");

        if (this.processFile != null && !hasNoAttachment)
          this.uploadFile(this.processFile, data.extraObject);

        this.processFile = null;
        this.notificationService.filter("itemadded");

        data.object.forEach(element => {
          element.createdOn = this.datepipe.transform(element.createdOn, 'MM/dd/yyyy')
        });

        this.rowData = data.object
        this.form.get("stageName").reset()
        this.form.get("stageComments").reset()
        this.form.get("stagePaymentType").reset()
      })
  }


  onstageNameChanged(stage) {
    stage = this.stagesList.find(x => x.listTypeItemId == stage)?.itemCode
    this.isPaymentTerms = stage == "PYTMS";
    this.isPaymentAmt = stage == "PYRCT";
  }

  deleteProcess(id) {
    this.amcStagesService.delete(id).pipe(first())
      .subscribe((data: any) => {
        data.object.forEach(element => {
          element.createdOn = this.datepipe.transform(element.createdOn, 'MM/dd/yyyy')
        });

        this.rowData = data.object
      })
  }

  GetSites(customerId) {
    this.customerService.getById(customerId)
      .pipe(first())
      .subscribe((data: any) => {
        this.custSiteList = [];
        let siteLst = this.user.custSites?.split(",")
        data.object?.sites.forEach(element => {
          if (siteLst?.length > 0 && this.user.userType?.toLocaleLowerCase() == "customer" && siteLst?.find(x => x == element.id) == null) return;
          this.custSiteList.push(element);
        })
      });
  }

  getfil(x, isParentAttachment = false) {
    isParentAttachment ? this.file = x : this.processFile = x;
  }

  listfile = (x, lstId = "selectedfiles") => {
    document.getElementById(lstId).style.display = "block";

    var selectedfiles = document.getElementById(lstId);
    var ulist = document.createElement("ul");
    ulist.id = "demo";
    ulist.style.width = "max-content"
    selectedfiles.appendChild(ulist);

    this.transaction++;
    this.hastransaction = true;

    for (let i = 0; i < x.length; i++) {
      var name = x[i]?.name;
      ulist.style.marginTop = "5px"
      var node = document.createElement("li");
      node.style.wordBreak = "break-word";
      node.style.width = "300px"
      node.appendChild(document.createTextNode(name));
      ulist.appendChild(node);
    }
  };

  uploadFile = (files, id, code = "AMC") => {
    if (files.length === 0) {
      return;
    }

    let filesToUpload: File[] = files;
    const formData = new FormData();

    Array.from(filesToUpload).map((file, index) => {
      return formData.append("file" + index, file, file.name);
    });

    this.FileShareService.upload(formData, id, code).subscribe((event) => {
      if (event.type === HttpEventType.UploadProgress) {
        this.progress = Math.round((100 * event.loaded) / event.total);
        if (this.progress == 100)
          this.notificationService.filter("itemadded");
      }
      else if (event.type === HttpEventType.Response) {
        this.message = "Upload success.";
        this.onUploadFinished.emit(event.body);
      }
      this.notificationService.filter("itemadded");
    });
  }

  GetFileList(id: string) {
    this.FileShareService.list(id)
      .pipe(first())
      .subscribe({
        next: (data: any) => {
          this.attachments = data.object;
        },
      });
  }

  RemoveInnstrument(event) {
    var cellValue = event.value;
    var rowData = event.data;
    if (this.hasDeleteAccess) {

      if (cellValue == rowData.id) {
        var indexOfSelectedRow = this.instrumentList.indexOf(rowData);
        this.instrumentList.splice(indexOfSelectedRow, 1)
        if (rowData.amcId == null && cellValue == rowData.id) {
          this.api.setRowData(this.instrumentList)
        }
        else {
          this.AmcInstrumentService
            .delete(cellValue)
            .pipe(first())
            .subscribe({
              next: (data: any) => {
                if (data.result) {
                  this.notificationService.showSuccess(data.resultMessage, "Success");
                  const selectedData = event.api.getSelectedRows();
                  event.api.applyTransaction({ remove: selectedData });
                }
              },
            });
        }
      }

    }
  }

  InstrumentSearch = (searchtext) => {
    this.instrumentserialno = searchtext;
    if (this.instrumentserialno != "" && this.instrumentserialno != null) {

      this.Service.searchByKeyword(this.instrumentserialno, this.form.get("custSite").value)
        .pipe(first()).subscribe({
          next: (data: any) => this.instrumentAutoComplete = data.object
        });
    }
  }


  AddInstrument(instrument: any) {
    this.Service.searchByKeyword(instrument, this.form.get("custSite").value)
      .pipe(first()).subscribe({
        next: (data: any) => {
          this.instrumentList = this.instrumentList || [];
          var data = data.object[0];
          data.id = Guid.create();
          data.id = data.id.value;

          if (this.instrumentList.filter(x => x.serialnos == data.serialnos).length == 0) {
            this.instrumentList.push(data);
            this.api.setRowData(this.instrumentList)
          }
          else this.notificationService.showInfo("Instrument already exists", "Error")

          this.instrumentSearch.nativeElement.value = ""
        },
      });

  }

  private createColumnDefs() {
    return [{
      headerName: 'Action',
      field: 'id',
      lockPosition: "left",
      hide: this.isCompleted,
      cellRendererFramework: AmcInstrumentRendererComponent,
      cellRendererParams: {
        deleteaccess: this.hasDeleteAccess,
        list: this.instrumentList
      },

    }, {
      headerName: 'Instrument',
      field: 'insType',
      filter: true,
      enableSorting: true,
      editable: false,
      sortable: true,
      tooltipField: 'instrument',
    }, {
      headerName: 'Serial No.',
      field: 'serialnos',
      filter: true,
      editable: true,
      sortable: true
    },
    {
      headerName: 'Version',
      field: 'insversion',
      filter: true,
      editable: false,
      sortable: true
    },
    {
      headerName: 'Qty',
      field: 'qty',
      filter: true,
      editable: true,
      sortable: true,
      defaultValue: 0
    },
    {
      headerName: 'Rate',
      field: 'rate',
      filter: true,
      editable: true,
      hide: !this.hasCommercial,
      sortable: true,
      default: 0
    },
    {
      headerName: 'Amount',
      field: 'amount',
      hide: !this.hasCommercial,
      filter: true,
      editable: false,
      sortable: true
    }
    ]
  }

  private createColumnDefsRO() {
    return [{
      headerName: 'Instrument',
      field: 'insType',
      filter: true,
      enableSorting: true,
      editable: false,
      sortable: true,
      tooltipField: 'instrument',
    }, {
      headerName: 'Serial No.',
      field: 'serialnos',
      filter: true,
      editable: true,
      sortable: true
    },
    {
      headerName: 'Version',
      field: 'insversion',
      filter: true,
      editable: false,
      sortable: true
    },
    {
      headerName: 'Qty',
      field: 'qty',
      filter: true,
      editable: true,
      sortable: true,
      defaultValue: 0
    },
    {
      headerName: 'Rate',
      field: 'rate',
      filter: true,
      editable: true,
      hide: !this.hasCommercial,
      sortable: true,
      default: 0
    },
    {
      headerName: 'Amount',
      field: 'amount',
      hide: !this.hasCommercial,
      filter: true,
      editable: false,
      sortable: true
    }
    ]
  }

  onGridReady(params): void {
    this.api = params.api;
    this.columnApi = params.columnApi;
  }

  onCellValueChanged(event) {
    var data = event.data;
    event.data.modified = true;

    if (this.instrumentList.filter(x => x.id == data.id).length > 0) {
      var d = this.instrumentList.filter(x => x.id == data.id);
      var rowAmount = (Number(data.qty) * Number(data.rate));
      d[0].amount = rowAmount;
      d[0].rate = Number(data.rate)
      d[0].qty = Number(data.qty)
      this.api.setRowData(this.instrumentList)
    }
  }

  DateDiff(date1, date2) {
    let dateSent = new Date(date1);//early
    let currentDate = new Date(date2);//later
    return Math.floor(
      (Date.UTC(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        currentDate.getDate()
      ) - Date.UTC(
        dateSent.getFullYear(),
        dateSent.getMonth(),
        dateSent.getDate()
      )) /
      (1000 * 60 * 60 * 24)
    );

  }

  onSubmit() {

    this.submitted = true;
    this.alertService.clear();

    if (this.instrumentList != null && this.instrumentList.length > 0) {
      this.instrumentList.forEach(instrument => {
        instrument.amcId = this.id;
      })
    }

    if (this.form.invalid) return;

    this.form.get('billtoid').enable()
    this.model = this.form.value;
    this.form.get('billtoid').disable()
    if (this.IsCustomerView) {
      this.model.billtoid == this.defaultCustomerId
      if (!this.model.custSite) {
        this.model.custSite = this.defaultSiteId
      }
    }
    if (this.form.get('paymentTerms').value.length > 0) {
      var selectarray = this.form.get('paymentTerms').value;
      this.model.paymentTerms = selectarray.toString();
    }

    else if (this.form.get('paymentTerms').value.length == 0) {
      this.model.paymentTerms = ""
    }

    const datepipie = new DatePipe("en-US");

    if (this.form.get('firstVisitDateFrom').value || this.form.get('firstVisitDateTo').value) {
      let FirstFromToDiff = this.DateDiff(this.form.get('firstVisitDateFrom').value, this.form.get('firstVisitDateTo').value)
      if (FirstFromToDiff <= 0) {
        this.notificationService.showInfo("To Date Should not be greater than From Date in First Visit Date", "Info");
        return;
      }
    }

    if (this.form.get('secondVisitDateFrom').value || this.form.get('secondVisitDateTo').value) {
      let SecondFromToDiff = this.DateDiff(this.form.get('secondVisitDateFrom').value, this.form.get('secondVisitDateTo').value)
      if (SecondFromToDiff <= 0) {
        this.notificationService.showInfo("To Date Should not be greater than From Date in Second Visit Date", "Info");
        return;
      }
    }


    let calc = this.DateDiff(this.model.sdate, this.model.edate)

    if (calc <= 0) {
      this.notificationService.showInfo("End Date should not be greater than Start Date", "Info");
      return;
    }

    let ffsDate = this.DateDiff(this.model.sdate, this.model.firstVisitDateFrom)
    let ftsDate = this.DateDiff(this.model.sdate, this.model.firstVisitDateTo)

    let ffeDate = this.DateDiff(this.model.firstVisitDateFrom, this.model.edate)
    let fteDate = this.DateDiff(this.model.firstVisitDateTo, this.model.edate)

    let stsDate = this.DateDiff(this.model.sdate, this.model.secondVisitDateTo)
    let sfsDate = this.DateDiff(this.model.sdate, this.model.secondVisitDateFrom)

    let sfeDate = this.DateDiff(this.model.secondVisitDateFrom, this.model.edate)
    let steDate = this.DateDiff(this.model.secondVisitDateTo, this.model.edate)

    if (ffsDate < 0) {
      return this.notificationService.showInfo("First Visit From Date should not be greater than Start Date", "Invalid Date")
    }
    if (ftsDate < 0) {
      return this.notificationService.showInfo("First Visit To Date should not be greater than Start Date", "Invalid Date")
    }
    if (fteDate < 0) {
      return this.notificationService.showInfo("First Visit To Date should not be greater than End Date", "Invalid Date")
    }
    if (ffeDate < 0) {
      return this.notificationService.showInfo("First Visit From Date should not be greater than End Date", "Invalid Date")
    }

    if (sfsDate < 0) {
      return this.notificationService.showInfo("Second Visit From Date should not be greater than Start Date", "Invalid Date")
    }
    if (stsDate < 0) {
      return this.notificationService.showInfo("Second Visit To Date should not be greater than Start Date", "Invalid Date")
    }
    if (steDate < 0) {
      return this.notificationService.showInfo("Second Visit To Date should not be greater than End Date", "Invalid Date")
    }
    if (sfeDate < 0) {
      return this.notificationService.showInfo("Second Visit From Date should not be greater than End Date", "Invalid Date")
    }

    this.model.firstVisitDateFrom = datepipie.transform(this.model.firstVisitDateFrom, "MM/dd/yyyy");
    this.model.secondVisitDateFrom = datepipie.transform(this.model.secondVisitDateFrom, "MM/dd/yyyy");

    this.model.firstVisitDateTo = datepipie.transform(this.model.firstVisitDateTo, "MM/dd/yyyy");
    this.model.secondVisitDateTo = datepipie.transform(this.model.secondVisitDateTo, "MM/dd/yyyy");

    if (this.form.get('secondVisitDateFrom').value || this.form.get('secondVisitDateTo').value)
      this.model.secondVisitDate = this.model.secondVisitDateFrom + "-" + this.model.secondVisitDateTo;

    if (this.form.get('firstVisitDateFrom').value || this.form.get('firstVisitDateTo').value)
      this.model.firstVisitDate = this.model.firstVisitDateFrom + "-" + this.model.firstVisitDateTo


    this.model.sqdate = datepipie.transform(this.model.sqdate, "MM/dd/yyyy");
    this.model.sdate = datepipie.transform(this.model.sdate, "MM/dd/yyyy");
    this.model.edate = datepipie.transform(this.model.edate, "MM/dd/yyyy");
    this.model.baseCurrencyId = this.baseCurrId

    if (!this.hasId && this.hasAddAccess) {
      this.model.id = this.id;

      this.Service.save(this.model)
        .pipe(first())
        .subscribe((data: any) => {
          this.notificationService.showSuccess(data.resultMessage,"Success");

          if (this.instrumentList == null || this.instrumentList.length <= 0) {
            this.router.navigate(["amclist"]);
          }
        });

      if (this.instrumentList != null && this.instrumentList.length > 0) {
        this.AmcInstrumentService.SaveAmcInstruments(this.instrumentList)
          .pipe(first())
          .subscribe((data: ResultMsg) => {
              this.router.navigate(["amclist"]);
          });
      }
    }
    else if (this.hasUpdateAccess) {
      this.model.id = this.id;

      this.Service.update(this.id, this.model)
        .pipe(first())
        .subscribe((data: ResultMsg) => {
            this.notificationService.showSuccess(data.resultMessage,"Success");
            if (this.instrumentList == null || this.instrumentList.length <= 0) {
              this.router.navigate(["amclist"]);
            }
        });
      if (this.instrumentList != null && this.instrumentList.length > 0) {
        this.AmcInstrumentService.SaveAmcInstruments(this.instrumentList)
          .pipe(first())
          .subscribe((data: ResultMsg) => {
              this.router.navigate(["amclist"]);
          });
      }
    }
  }
}
