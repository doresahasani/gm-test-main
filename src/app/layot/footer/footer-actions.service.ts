import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class FooterActionsService {
  private readonly _nextClick$ = new Subject<void>();
  readonly nextClick$ = this._nextClick$.asObservable();

  triggerNext() {
    this._nextClick$.next();
  }
}