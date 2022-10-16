import { Component, Input, OnInit } from '@angular/core';

import { ConfigTypeValue, User } from '../_models';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';
import { ColDef, ColumnApi, GridApi } from 'ag-grid-community';

import {
  AccountService,
  ConfigTypeValueService,
  NotificationService
} from '../_services';
import { MRenderComponent } from './rendercomponent';
import { BsModalService } from 'ngx-bootstrap/modal';


@Component({
  selector: 'app-modelcomponent',
  templateUrl: './modelcontent.html',
})
export class ModelContentComponent implements OnInit {
  user: User;
  listvalue: FormGroup;
  configVal: ConfigTypeValue;
  configList: ConfigTypeValue[];
  submitted = false;
  id: string;
  listid: string;
  public columnDefs: ColDef[];
  private columnApi: ColumnApi;
  private api: GridApi;
  closeResult: string;
  @Input() public itemId;

  constructor(
    private formBuilder: FormBuilder,
    private accountService: AccountService,
    private configTypeService: ConfigTypeValueService,
    private notificationService: NotificationService,
    public activeModal: BsModalService
  ) { }


  ngOnInit() {
    this.user = this.accountService.userValue;

    this.listvalue = this.formBuilder.group({
      configValue: ['', Validators.required],
      id: ['']
    });

    this.configTypeService.getById(this.itemId)
      .pipe(first()).subscribe((data: any) => this.configList = data.object);

    this.columnDefs = this.createColumnDefs();
  }

  onRowClicked(e): void {
    if (e.event.target !== undefined) {
      let data = e.data;
      let actionType = e.event.target.getAttribute("data-action-type");

      switch (actionType) {
        case "edit":
          this.listvalue.get("id").setValue(data.id);
          this.listvalue.get("configValue").setValue(data.configValue);//itemCode  
          this.id = data.id;
      }
    }
  };

  close() {
    this.activeModal.hide();
  }

  onValueSubmit() {
    this.submitted = true;
    if (this.listvalue.invalid) {
      return;
    }
    this.configVal = this.listvalue.value;
    this.configVal.listTypeItemId = this.itemId;
    if (this.id == null) {
      this.configTypeService.save(this.configVal)
        .pipe(first())
        .subscribe({
          next: (data: any) => {
            if (data.result) {
              this.notificationService.showSuccess(data.resultMessage, "Success");
              this.configList = data.object;
              this.listvalue.get("configValue").setValue("");
            }
          },
        });
    }
    else {
      this.configTypeService.update(this.id, this.configVal)
        .pipe(first())
        .subscribe({
          next: (data: any) => {
            if (data.result) {
              this.notificationService.showSuccess(data.resultMessage, "Success");
              this.configList = data.object;
              this.listvalue.get("configValue").setValue("");
              this.id = null;
            }
          }
        });
    }
  }

  private createColumnDefs() {
    return [
      {
        headerName: 'Action',
        field: 'id',
        filter: false,
        enableSorting: false,
        editable: false,
        sortable: false,
        width: 100,
        cellRendererFramework: MRenderComponent,
        cellRendererParams: {
          deleteLink: 'CNG',
          deleteaccess: true,
          addAccess: false,
          hasUpdateAccess: true,
        },
      },
      {
        headerName: 'Config Value',
        field: 'configValue',
        filter: true,
        enableSorting: true,
        editable: false,
        sortable: true,
        tooltipField: 'configValue',
      }
    ]
  }

  onGridReady(params): void {
    this.api = params.api;
    this.columnApi = params.columnApi;
    this.api.sizeColumnsToFit();
  }

}
