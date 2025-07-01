import { Component } from '@angular/core';
import { NotificationService, Notification } from '../../../service/notification.service';
import { animate, keyframes, state, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-warning',
  templateUrl: './warning.component.html',
  styleUrls: ['./warning.component.css'],
  animations: [
    trigger('fade', [
      transition(':enter', [
        animate('200ms ease-in', keyframes([
          style({ opacity: 0, transform: 'translateX(100px) scale(0.9)', offset: 0 }),
          style({ opacity: 1, transform: 'translateX(0px) scale(1)', offset: 1 })
        ]))
      ]),
      transition(':leave', [
        animate('400ms ease-in', keyframes([
          style({ opacity: 1, transform: 'translateX(0) scale(1)', offset: 0 }),
          style({ opacity: 0, transform: 'translate(100px, -30px) scale(0.8)', offset: 1 })
        ]))
      ])
    ])
  ]
})
export class WarningComponent {
  messages: Notification[] = [];

  constructor(private notificationService: NotificationService) { }

  ngOnInit(): void {
    this.notificationService.warningMessages$.subscribe((msgs) => {
      this.messages = msgs;
    });
  }

  closeMessage(id: number) {
    this.notificationService.removeWarning(id);
  }
}