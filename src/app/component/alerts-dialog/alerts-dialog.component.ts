
import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { EventData } from '../reminders/event-data';

@Component({
  selector: 'app-alerts-dialog',
  standalone: true,
  imports: [MatDialogModule,CommonModule,MatIconModule,MatToolbarModule,MatTooltipModule],
  templateUrl: './alerts-dialog.component.html',
  styleUrl: './alerts-dialog.component.css'
})
export class AlertsDialogComponent {

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { notifications: EventData[] },
    private dialogRef: MatDialogRef<AlertsDialogComponent>
  ) {}

  close() {
    this.dialogRef.close();
  }

  getIcon(notificationType: string): string {
    switch (notificationType?.toLowerCase()) {
      case 'birthday': return 'cake';
      case 'meetings': return 'event';
      case 'holiday': return 'beach_access';
      case 'paymentdue': return 'payment';
      case 'festival': return 'celebration';
      case 'travel': return 'flight_takeoff';
      default: return 'notifications';
    }
  }

  getIconColor(eventType: string): string {
    switch (eventType.toLowerCase()) {
      case 'birthday': return 'birthday';
      case 'meetings': return 'meeting';
      case 'holiday': return 'holiday';
      case 'paymentdue': return 'paymentdue';
      case 'festival': return 'celebration';
      case 'travel': return 'travel';
      default: return 'default';
    }
  }
}

