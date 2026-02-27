import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  private apiUrl = 'https://api.hoi-versicherung.ch/api/Location/filterLocation';

  constructor(private http: HttpClient) {
  }

  fetchDataByPlz(searchTerm: string): Observable<any> {
    const url = `${this.apiUrl}?searchTerm=${searchTerm}`;
    return this.http.get(url);
  }

  extractAutocompleteData(data: any): string[] {
    return data
      .map((place: any) => {
        return `${place.ZipCode} ${place.City} [${place.Community}]`;
      });
  }
}
