
import { CommonModule } from '@angular/common';
import { Component, Inject, ChangeDetectionStrategy } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { EventData } from '../reminders/event-data';

@Component({
    selector: 'app-alerts-dialog',
    imports: [MatDialogModule, CommonModule, MatIconModule, MatToolbarModule, MatTooltipModule],
    templateUrl: './alerts-dialog.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
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
    const type = notificationType?.toLowerCase() ?? '';
    if (type.includes('birthday')) return 'cake';
    if (type.includes('holiday')) return 'beach_access';
    if (type.includes('meeting')) return 'event';
    if (type.includes('payment')) return 'payment';
    if (type.includes('festival')) return 'celebration';
    if (type.includes('travel')) return 'flight_takeoff';
    return 'notifications';
  }

  getIconColor(eventType: string): string {
    const type = eventType?.toLowerCase() ?? '';
    if (type.includes('birthday')) return 'birthday';
    if (type.includes('holiday')) return 'holiday';
    if (type.includes('meeting')) return 'meeting';
    if (type.includes('payment')) return 'paymentdue';
    if (type.includes('festival')) return 'celebration';
    if (type.includes('travel')) return 'travel';
    return 'default';
  }
}

