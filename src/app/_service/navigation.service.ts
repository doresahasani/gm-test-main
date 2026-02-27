import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class NavigationService {
    weiterTick = signal(0);

    requestWeiter() {
        this.weiterTick.update(v => v + 1);
    }
}
