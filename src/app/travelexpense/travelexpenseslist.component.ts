import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { ColDef, ColumnApi, GridApi } from "ag-grid-community";
import { BsModalRef, BsModalService } from "ngx-bootstrap/modal";
import { first } from "rxjs/operators";
import { RenderComponent } from "../distributor/rendercomponent";
import { ImportDataComponent } from "../importdata/import.component";
import { ProfileReadOnly, User } from "../_models";
import { ListcontentModel } from "../_models/listcontent.model";
import { AccountService, TravelDetailService, NotificationService, ProfileService, DistributorService, ListTypeService } from "../_services";
import { TravelExpenseService } from "../_services/travel-expense.service";

@Component({
    selector: 'app-travelexpense',
    templateUrl: './travelexpenselist.compoent.html'
})

export class TravelexpenseListComponent implements OnInit {
    profilePermission: ProfileReadOnly;
    hasReadAccess: boolean = false;
    hasUpdateAccess: boolean = false;
    hasDeleteAccess: boolean = false;
    hasAddAccess: boolean = false;
    user: User;
    bsModalRef: BsModalRef;

    List: ListcontentModel;
    dataList: any = [];
    constructor(
        private accountService: AccountService,
        private Service: TravelExpenseService,
        private profileService: ProfileService,
        private modalService: BsModalService,
    ) { }

    ngOnInit(): void {
        this.user = this.accountService.userValue;
        this.profilePermission = this.profileService.userProfileValue;
        if (this.profilePermission != null) {
            let profilePermission = this.profilePermission.permissions.filter(
                (x) => x.screenCode == "TREXP"
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
        }

        this.Service.getAll().pipe(first())
            .subscribe((data: any) => {
                this.dataList = []

                data.object.forEach(x => {
                    this.List = new ListcontentModel()
                    this.List.id = x.id
                    this.List.firstItem = x.engineerName
                    this.List.secondItem = x.serviceRequestNo
                    this.List.thirdItem = x.totalDays

                    this.List.firstItemLabel = 'Engineer:'
                    this.List.secondItemLabel = 'Service Request No.:'
                    this.List.thirdItemLabel = 'Total Days :'

                    this.dataList.push(this.List)
                })
            })

    }

    ImportData() {
        const config: any = {
            backdrop: 'static',
            keyboard: false,
            animated: true,
            ignoreBackdropClick: true,
        };

        this.bsModalRef = this.modalService.show(ImportDataComponent, config);

    }
}