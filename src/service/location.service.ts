import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface LocationItem {
  zipCode?: string | number;
  city?: string;
  ort?: string;
  name?: string;
  [key: string]: any;
}

@Injectable({ providedIn: 'root' })
export class LocationService {
  private APIUrl = 'https://api.hoi-versicherung.ch/api';

  constructor(private http: HttpClient) {}

  filterLocation(zipCode: string): Observable<LocationItem[]> {
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    const endpointUrl = `${this.APIUrl}/Location/locationFilter`;

    let params = new HttpParams();
    if (zipCode && zipCode.trim() !== '') {
      params = params.append('zipCode', zipCode.trim());
    }

    return this.http.get<any>(endpointUrl, { headers, params }).pipe(
      map((res) => (Array.isArray(res) ? res : (res?.data ?? res?.result ?? [])))
    );
  }
}