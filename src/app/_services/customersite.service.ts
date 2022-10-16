import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CustomerSite } from '../_models';
import { EnvService } from './env/env.service';

@Injectable({ providedIn: 'root' })
export class CustomerSiteService {
  private distrubutorSubject: BehaviorSubject<CustomerSite>;
  public distributor: Observable<CustomerSite>;

  constructor(
    private router: Router,
    private http: HttpClient,
    private environment: EnvService,
  ) {
  }



  save(customerSite: CustomerSite) {
    return this.http.post(`${this.environment.apiUrl}/Site`, customerSite);
  }

  getAll() {
    return this.http.get<CustomerSite[]>(`${this.environment.apiUrl}/Site`);
  }
  getAllCustomerSites() {
    return this.http.get<CustomerSite[]>(`${this.environment.apiUrl}/Site/GetAllCustomerSites`);
  }
  
  GetCustomerSiteContacts() {
    return this.http.get(`${this.environment.apiUrl}/Customer/GetCustomerSiteContacts/`);
  }
  getById(id: string) {
    return this.http.get<CustomerSite>(`${this.environment.apiUrl}/Site/${id}`);
  }


  update(id, params) {
    return this.http.put(`${this.environment.apiUrl}/Site/`, params)
      .pipe(map(x => {
        // update stored user if the logged in user updated their own record
        //if (id == this.distributor.id) {
        //      // update local storage
        //      const user = { ...this.userValue, ...params };
        //      localStorage.setItem('user', JSON.stringify(user));

        //      // publish updated user to subscribers
        //      this.userSubject.next(user);
        //  }
        return x;
      }));
  }

  delete(id: string) {
    return this.http.delete(`${this.environment.apiUrl}/Site/${id}`)
      .pipe(map(x => {
        //// auto logout if the logged in user deleted their own record
        //if (id == this.userValue.id) {
        //    this.logout();
        //}
        return x;
      }));
  }
}
