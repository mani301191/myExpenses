import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'inrFormat',
  standalone: true
})
export class InrFormatPipe implements PipeTransform {
  transform(value: number | string): string {
    if (value == null) return '';

    let num = value.toString().replace(/,/g, '');

    // Split integer + decimal parts
    let [integer, fraction] = num.split('.');

    // First group (hundreds)
    let lastThree = integer.substring(integer.length - 3);
    let otherNumbers = integer.substring(0, integer.length - 3);

    if (otherNumbers !== '') {
      lastThree = ',' + lastThree;
    }

    // Apply Indian comma format
    let formatted =
      otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;

    // Add decimals if present
    if (fraction) {
      formatted += '.' + fraction;
    }

    return '₹' + formatted;
  }
}
