import { Component, OnInit, ViewChild } from '@angular/core';

import { CustomerSite, Instrument, User } from '../_models';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { first } from 'rxjs/operators';
import { ColDef, ColumnApi, GridApi } from 'ag-grid-community';

import { AccountService, AlertService, CustomerSiteService, InstrumentService, NotificationService } from '../_services';
import { lnkRenderComponent } from './lnkrendercomponent';
import { EnvService } from '../_services/env/env.service';
import { ListcontentModel } from '../_models/listcontent.model';


@Component({
  selector: 'app-search',
  templateUrl: './search.html',
})
export class SearchComponent implements OnInit {

  user: User;
  form: FormGroup;
  instrumentList: Instrument[] = [];
  customersite: CustomerSite[];
  loading = false;
  submitted = false;
  isSave = false;
  customerSiteId: string;
  customerId: string;
  type: string = "D";
  searchKeyword: search;
  visible: boolean = false;

  public columnDefs: ColDef[];
  private columnApi: ColumnApi;
  private api: GridApi;

  showGrid: any;

  @ViewChild('sform') testFormElement;
  isDist: boolean;
  list: ListcontentModel;
  List: any[] = []
  constructor(
    private fb: FormBuilder,
    private accountService: AccountService,
    private instrumentService: InstrumentService,
    private customerSiteService: CustomerSiteService,
    private environment: EnvService,
  ) {

  }
  ngOnInit() {

    let role = JSON.parse(localStorage.getItem('roles'));
    this.user = this.accountService.userValue;
    this.customerSiteService.getAllCustomerSites()
      .pipe(first()).subscribe((data: any) => this.customersite = data.object);

    if (this.user.username != "admin") {
      role = role[0]?.itemCode;
      if (role == this.environment.distRoleCode) this.isDist = true;
    }
    else {
      this.toggleFilter();
    }

    //debugger;
    this.form = this.fb.group({
      search: [''],
      custSiteId: [''],
      isactive: [true],

    });

    if (JSON.parse(localStorage.getItem('search')) != null) {
      this.form.get('search').setValue(JSON.parse(localStorage.getItem('search')).search);
      this.form.get('custSiteId').setValue(JSON.parse(localStorage.getItem('search')).custSiteId);
      this.searchKeyword = new search;
      this.searchKeyword.search = JSON.parse(localStorage.getItem('search')).search;
      this.searchKeyword.custSiteId = JSON.parse(localStorage.getItem('search')).custSiteId;
    }
  }

  public testMethod(): void {
    this.testFormElement.nativeElement.submit();
  }
  get f() { return this.form.controls; }

  DataFilter(event) {    
    this.GetData(event)
  }

  ShowData(event) {
    this.showGrid = event
  }

  toggleFilter() {
    this.showGrid = !this.showGrid
  }

  GetData(data) {
    this.List = []
    data.forEach(x => {
      this.list = new ListcontentModel()
      this.list.id = x.id
      this.list.firstItem = x.serialnos
      this.list.secondItem = x.custSiteName
      this.list.firstItemLabel = 'serial No.'
      this.list.secondItemLabel = 'Site Name'
      this.List.push(this.list);
    });
  }


  onSubmit() {
    //debugger;
    if (this.form.invalid) return;

    this.searchKeyword = this.form.value

    //this.customerId = this.route.snapshot.paramMap.get('id');
    this.instrumentService.searchByKeyword(this.searchKeyword.search, this.searchKeyword.custSiteId)
      .pipe(first())
      .subscribe({
        next: (data: any) => {
          //debugger;
          this.visible = true;
          this.GetData(data.object);
          localStorage.setItem('search', JSON.stringify(this.searchKeyword));
        },
      });
  }

}

export class search {
  search: string;
  custSiteId: string;
}
