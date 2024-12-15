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
  set printStyle(values: { [key: string]: { [key: string]: string } })
  {
    for (let key in values)
    {
      if (values.hasOwnProperty(key))
      {
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
  set styleSheetFile(cssList: string)
  {
    let linkTagFn = cssFileName =>
        `<link rel="stylesheet" type="text/css" href="${cssFileName}">`;
    if (cssList.indexOf(',') !== -1)
    {
      const valueArr = cssList.split(',');
      for (let val of valueArr)
      {
        this._styleSheetFile = this._styleSheetFile + linkTagFn(val);
      }
    }
    else
    {
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
  public returnStyleValues()
  {
    return `<style> ${this._printStyle.join(' ').replace(/,/g, ';')} </style>`;
  }

  /**
   *
   *
   * @memberof NgxPrintDirective
   */
  @HostListener('click')
  public print(): void
  {
    if(this.matTableDataSource.paginator!==undefined && this.matTableDataSource.paginator!==null && this.hidePaginator)
    {
      this.matTableDataSource.paginator=null;
    }

    setTimeout(() =>
    {
      this.hideMatPaginatorBeforePrinting();

      // Do something after
      let printContents, popupWin, styles = '', links = '',chart, printIncome,printUser;

      if (this.useExistingCss)
      {
        styles = this.getElementTag('style');
        links = this.getElementTag('link');
      }
      printContents = document.getElementById(this.printSectionId).innerHTML;
      printIncome= document.getElementById('print-income');
      printUser= document.getElementById('print-user').innerHTML;
      chart= document.getElementsByTagName("canvas")[0];
      if(chart) {
      chart=chart.toDataURL("image/jpeg");
      printContents = printContents+'<br><img src="'+chart+'" alt="chart"  />'
      }
      if(printIncome) {
        printContents = printContents+ printIncome.innerHTML;
      }
      popupWin = window.open('ExpenseTracker', 'ExpenseTracker', 'top=0,left=0,height=auto,width=auto');
      popupWin.document.open();
      popupWin.document.write(`
      <html>
        <head>
          <title>${this.printTitle ? this.printTitle : ''}</title>
          ${this.returnStyleValues()}
          ${this.returnStyleSheetLinkTags()}
          ${styles}
          ${links}
        </head>
        <body>
          ${printUser+printContents}
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
          <footer>
            <div> &copy; Manikandan Narasimhan(2024 - 2030)</div>
          </footer>
        </body>
      </html>`);
      popupWin.document.close();

      //Revert back the paginator after printing
      this.showMatPaginatorAfterPrinting();

    }, 1000); //1 second timeout to hide paginator

  }

  //hide Mat Paginator before Printing
  private hideMatPaginatorBeforePrinting()
  {
    if(document.getElementById(this.paginatorId)){
    document.getElementById(this.paginatorId).style.display='none';
    }
  }

  //Show Mat Paginator after Printing
  private showMatPaginatorAfterPrinting()
  {
    if(document.getElementById(this.paginatorId)){
    this.matTableDataSource.paginator=this.paginator;
    document.getElementById(this.paginatorId).style.display='block';
    }
  }

  /**
   * @returns string which contains the link tags containing the css which will
   * be injected later within <head></head> tag.
   *
   */
  private returnStyleSheetLinkTags()
  {
    return this._styleSheetFile;
  }

  private getElementTag(tag: keyof HTMLElementTagNameMap): string
  {
    const html: string[] = [];
    const elements = document.getElementsByTagName(tag);
    for (let index = 0; index < elements.length; index++)
    {
      html.push(elements[index].outerHTML);
    }
    return html.join('\r\n');
  }

}
