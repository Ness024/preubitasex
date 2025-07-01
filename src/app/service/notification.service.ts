import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Notification {
  id: number;
  title: string;
  message: string;
  duration: number; // duración en milisegundos
  type: 'success' | 'error' | 'warning';
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private successMessagesSubject = new BehaviorSubject<Notification[]>([]);
  private errorMessagesSubject = new BehaviorSubject<Notification[]>([]);
  private warningMessagesSubject = new BehaviorSubject<Notification[]>([]);
  successMessages$ = this.successMessagesSubject.asObservable();
  errorMessages$ = this.errorMessagesSubject.asObservable();
  warningMessages$ = this.warningMessagesSubject.asObservable();

  private nextId = 0;

  showSuccess(message: string, title: string, duration: number = 5000) {
    const notification: Notification = {
      id: this.nextId++,
      title,
      message,
      duration,
      type: 'success'
    };
    this.successMessagesSubject.next([...this.successMessagesSubject.value, notification]);
    
    setTimeout(() => this.removeSuccess(notification.id), duration);
  }

  showWarning(message: string, title: string, duration: number = 5000) {

    const notification: Notification = {
      id: this.nextId++,
      title,
      message,
      duration,
      type: 'warning'
    };
    this.warningMessagesSubject.next([...this.warningMessagesSubject.value, notification]);

    setTimeout(() => this.removeWarning(notification.id), duration);
  }

  showError(message: string, title: string, duration: number = 5000) {
    const notification: Notification = {
      id: this.nextId++,
      title,
      message,
      duration,
      type: 'error'
    };
    this.errorMessagesSubject.next([...this.errorMessagesSubject.value, notification]);

    setTimeout(() => this.removeError(notification.id), duration);
  }

  removeSuccess(id: number) {
    this.successMessagesSubject.next(
      this.successMessagesSubject.value.filter(n => n.id !== id)
    );
  }

  removeWarning(id: number) {
    this.warningMessagesSubject.next(
      this.warningMessagesSubject.value.filter(n => n.id !== id)
    );
  }

  removeError(id: number) {
    this.errorMessagesSubject.next(
      this.errorMessagesSubject.value.filter(n => n.id !== id)
    );
  }

  clearAll() {
    this.successMessagesSubject.next([]);
    this.errorMessagesSubject.next([]);
    this.warningMessagesSubject.next([]);
  }
}
