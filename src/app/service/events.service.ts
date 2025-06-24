import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class EventsService {
  private statusChangedSource = new Subject<void>();
  statusChanged$ = this.statusChangedSource.asObservable();

  notifyStatusChanged() {
    this.statusChangedSource.next();
  }
}
