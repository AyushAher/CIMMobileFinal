import { Component, OnInit } from "@angular/core";
import { first } from "rxjs/operators";
import { ProfileReadOnly, User } from "../_models";
import { ListcontentModel } from "../_models/listcontent.model";
import { AccountService, ProfileService } from "../_services";
import { TravelinvoiceService } from "../_services/travelinvoice.service";

@Component({
    selector: 'app-travelexpense',
    templateUrl: './travelinvoicelist.component.html',
})

export class TravelInvoiceListComponent implements OnInit {
    profilePermission: ProfileReadOnly;
    hasReadAccess: boolean = false;
    hasUpdateAccess: boolean = false;
    hasDeleteAccess: boolean = false;
    hasAddAccess: boolean = false;
    user: User;
    List: ListcontentModel
    dataList: any[] = [];

    constructor(
        private accountService: AccountService,
        private Service: TravelinvoiceService,
        private profileService: ProfileService,
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
                data.object.forEach(x => {
                    this.List = new ListcontentModel()
                    this.List.id = x.id
                    this.List.firstItem = x.engineerName
                    this.List.secondItem = x.serviceRequestNo
                    this.List.thirdItem = x.amountBuild

                    this.List.firstItemLabel = 'Engineer:'
                    this.List.secondItemLabel = 'Service Request No.:'
                    this.List.thirdItemLabel = 'Amt. Build:'

                    this.dataList.push(this.List)
                })
            })
    }

}