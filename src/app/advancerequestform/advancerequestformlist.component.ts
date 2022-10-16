import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { ColDef, ColumnApi, GridApi } from "ag-grid-community";
import { BsModalRef } from "ngx-bootstrap/modal";
import { first } from "rxjs/operators";
import { RenderComponent } from "../distributor/rendercomponent";
import { ProfileReadOnly, User } from "../_models";
import { ListcontentModel } from "../_models/listcontent.model";
import { AccountService, ProfileService } from "../_services";
import { AdvancerequestformService } from "../_services/advancerequestform.service";

@Component({
    selector: 'app-advancerequestform',
    templateUrl: './advancerequestformlist.component.html',
})
export class AdvancerequestlistformComponent implements OnInit {

    public columnDefs: ColDef[];
    private columnApi: ColumnApi;
    private api: GridApi;
    profilePermission: ProfileReadOnly;
    hasReadAccess: boolean = false;
    hasUpdateAccess: boolean = false;
    hasDeleteAccess: boolean = false;
    hasAddAccess: boolean = false;
    user: User;
    bsModalRef: BsModalRef;
    List: any;
    adReqList: any[] = []

    constructor(
        private router: Router,
        private accountService: AccountService,
        private Service: AdvancerequestformService,
        private profileService: ProfileService,
    ) { }

    ngOnInit(): void {
        this.user = this.accountService.userValue;
        let role;
        this.profilePermission = this.profileService.userProfileValue;
        if (this.profilePermission != null) {
            let profilePermission = this.profilePermission.permissions.filter(
                (x) => x.screenCode == "ADREQ"
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
            role = JSON.parse(localStorage.getItem('roles'));
            role = role[0].itemCode;
        }

        this.Service.getAll().pipe(first())
            .subscribe((data: any) => {
                data.object?.forEach(x => {
                    this.List = new ListcontentModel()
                    this.List.id = x.id
                    this.List.firstItem = x.engineerName
                    this.List.secondItem = x.serviceRequestNo
                    this.List.thirdItem = x.clientNameLocation

                    this.List.firstItemLabel = 'Engineer Name:'
                    this.List.secondItemLabel = 'Ser. Req. No.:'
                    this.List.thirdItemLabel = 'Client Name And Location:'

                    this.adReqList.push(this.List)
                })
            })

    }
}  