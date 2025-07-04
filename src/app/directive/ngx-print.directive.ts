import { Directive, HostListener, Input } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';

@Directive({
  selector: 'button[ngxPrint]',
  standalone: true
})
export class NgxPrintDirective {

  constructor() { }



  /**
   *
   *
   * @memberof NgxPrintDirective
   */
  @Input() printSectionId: string;

  @Input() optionalPrintSectionId: string;

  @Input() matTableDataSource: MatTableDataSource<any>;

  @Input() paginator: MatPaginator;

  @Input() paginatorId: string;

  @Input() hidePaginator: boolean;

  /**
   *
   *
   * @memberof NgxPrintDirective
   */
  @Input() printTitle: string;
  /**
   *
   *
   * @memberof NgxPrintDirective
   */
  @Input() useExistingCss = false;
  /**
   * A delay in milliseconds to force the print dialog to wait before opened. Default: 0
   *
   * @memberof NgxPrintDirective
   */
  @Input() printDelay = 0;

  public _printStyle = [];

  /**
   *
   *
   * @memberof NgxPrintDirective
   */
  @Input()
  set printStyle(values: { [key: string]: { [key: string]: string } }) {
    for (let key in values) {
      if (values.hasOwnProperty(key)) {
        this._printStyle.push((key + JSON.stringify(values[key])).replace(/['"]+/g, ''));
      }
    }
    this.returnStyleValues();
  }

  /**
   *
   *
   * @returns html for the given tag
   *
   * @memberof NgxPrintDirective
   */
  private _styleSheetFile = '';

  /**
   * @memberof NgxPrintDirective
   * @param cssList
   */
  @Input()
  set styleSheetFile(cssList: string) {
    let linkTagFn = cssFileName =>
      `<link rel="stylesheet" type="text/css" href="${cssFileName}">`;
    if (cssList.indexOf(',') !== -1) {
      const valueArr = cssList.split(',');
      for (let val of valueArr) {
        this._styleSheetFile = this._styleSheetFile + linkTagFn(val);
      }
    }
    else {
      this._styleSheetFile = linkTagFn(cssList);
    }
  }

  /**
   *
   *
   * @returns the string that create the stylesheet which will be injected
   * later within <style></style> tag.
   *
   * -join/replace to transform an array objects to css-styled string
   *
   * @memberof NgxPrintDirective
   */
  public returnStyleValues() {
    return `<style> ${this._printStyle.join(' ').replace(/,/g, ';')} </style>`;
  }

  /**
   *
   *
   * @memberof NgxPrintDirective
   */
  @HostListener('click')
  public print(): void {
    if (this.matTableDataSource.paginator !== undefined && this.matTableDataSource.paginator !== null && this.hidePaginator) {
      this.matTableDataSource.paginator = null;
    }
  
    setTimeout(() => {
      this.hideMatPaginatorBeforePrinting();
  
      // Do something after
      let printContents, popupWin, styles = '', links = '', chart, printIncome, optionalPrintSectionId;
  
      if (this.useExistingCss) {
        styles = this.getElementTag('style');
        links = this.getElementTag('link');
      }
      printContents = document.getElementById(this.printSectionId).innerHTML;
      optionalPrintSectionId = document.getElementById(this.optionalPrintSectionId);
      if (optionalPrintSectionId) {
        printContents = optionalPrintSectionId.innerHTML + printContents;
      }
      printIncome = document.getElementById('print-income');
      if (this.printSectionId != 'print-fitness') {
        chart = document.getElementsByTagName("canvas")[0];
        if (chart) {
          chart = chart.toDataURL("image/jpeg");
          printContents = printContents + '<br><img src="' + chart + '" alt="chart"  />'
        }
        if (printIncome) {
          printContents = printContents + printIncome.innerHTML;
        }
      }
  
      // Get current date in YYYY-MM-DD format
      const currentDate = new Date().toISOString().split('T')[0];
  
      // Append the date to the title
      const fileName = `${this.printTitle ? this.printTitle : 'Document'}_${currentDate}`;
  
      popupWin = window.open('', fileName, 'top=0,left=0,height=auto,width=auto');
      popupWin.document.open();
      popupWin.document.write(`
        <html>
          <head>
            <title>${fileName}</title>
            ${this.returnStyleValues()}
            ${this.returnStyleSheetLinkTags()}
            ${styles}
            ${links}
          </head>
          <body>
            ${printContents}
            <script defer>
              function triggerPrint(event) {
                window.removeEventListener('load', triggerPrint, false);
                setTimeout(() => {
                  window.print();
                  setTimeout(function() { window.close(); }, 0);
                }, ${this.printDelay});
              }
              window.addEventListener('load', triggerPrint, false);
            </script>
            <div> &copy; Manikandan Narasimhan(2024 - 2030)</div>
          </body>
        </html>`);
      popupWin.document.close();
  
      //Revert back the paginator after printing
      this.showMatPaginatorAfterPrinting();
  
    }, 1000); //1 second timeout to hide paginator
    
  }

  //hide Mat Paginator before Printing
  private hideMatPaginatorBeforePrinting() {
    let paginator = document.getElementById(this.paginatorId);
    let expansionPanal = document.getElementById('cdk-accordion-child-0');
    if (paginator) {
      paginator.style.display = 'none';
    }
    if (expansionPanal) {
      expansionPanal.style.visibility = '';
      expansionPanal.style.height = '';
    }
  }

  //Show Mat Paginator after Printing
  private showMatPaginatorAfterPrinting() {
    let paginator = document.getElementById(this.paginatorId);
    let expansionPanal = document.getElementById('cdk-accordion-child-0');
    if (paginator) {
      this.matTableDataSource.paginator = this.paginator;
      paginator.style.display = 'block';
    }
    if (expansionPanal) {
      expansionPanal.style.visibility = 'hidden';
      expansionPanal.style.height = '0px';
    }
  }

  /**
   * @returns string which contains the link tags containing the css which will
   * be injected later within <head></head> tag.
   *
   */
  private returnStyleSheetLinkTags() {
    return this._styleSheetFile;
  }

  private getElementTag(tag: keyof HTMLElementTagNameMap): string {
    const html: string[] = [];
    const elements = document.getElementsByTagName(tag);
    for (let index = 0; index < elements.length; index++) {
      html.push(elements[index].outerHTML);
    }
    return html.join('\r\n');
  }

}
