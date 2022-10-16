import { Component, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

declare function DataTable(): any;
@Component({
  selector: 'app-listcontent',
  templateUrl: './listcontent.component.html'
})

export class ListcontentComponent implements OnChanges {
  @Input() hasDeleteAccess: boolean = false;
  @Input() hasCreateAccess: boolean = false;
  @Input() hasReadAccess: boolean = false;
  @Input() hasUpdateAccess: boolean = false;

  @ViewChild('click') click: any;
  @Input() list: any[] = [];
  @Input() screenLink: any;
  @Input() deleteParam: any;

  constructor(
    private router: Router,
  ) { }

  ngOnChanges(changes: SimpleChanges): void {
    console.log(changes);
    
    setTimeout(() => {
      DataTable()
      this.list = [...new Map(this.list.map((item) => [item["id"], item])).values()];
      this.list?.forEach(element => {
        element.firstItem?.length > 20 ? element.firstItem = element?.firstItem.substr(0, 20) + `<br />` + element?.firstItem.substr(20) : element
        element.secondItem?.length > 20 ? element.secondItem = element?.secondItem.substr(0, 20) + `<br />` + element?.secondItem.substr(20) : element
        element.thirdItem?.length > 20 ? element.thirdItem = element?.thirdItem.substr(0, 20) + `<br />` + element?.thirdItem.substr(20) : element
      });
    }, 1000);

  }


  Navigate = (id) => this.router.navigate([this.screenLink, id])
}


