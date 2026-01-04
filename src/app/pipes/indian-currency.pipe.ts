import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'inrFormat',
  standalone: true
})
export class InrFormatPipe implements PipeTransform {
  transform(value: number | string): string {
    if (value == null || value === '') return '';

    // Convert to number and round to 2 decimals
    const roundedValue = Number(Number(value).toFixed(2));

    let num = roundedValue.toString();

    // Split integer + decimal parts
    let [integer, fraction] = num.split('.');

    // First group (last 3 digits)
    let lastThree = integer.slice(-3);
    let otherNumbers = integer.slice(0, -3);

    if (otherNumbers !== '') {
      lastThree = ',' + lastThree;
    }

    // Apply Indian comma format
    let formatted =
      otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;

    // Always show 2 decimals
    formatted += '.' + (fraction ?? '00').padEnd(2, '0');

    return '₹' + formatted;
  }
}
