import { fakeAsync, tick } from '@angular/core/testing';
import { NgxPrintDirective } from './ngx-print.directive';

function fakeEl(innerHTML = '', style: any = {}) {
  return {
    innerHTML,
    style,
    getElementsByTagName: (tag: string) =>
      tag === 'canvas'
        ? [{ toDataURL: () => 'data:image/png;base64,ABC' } as any]
        : ([] as any[])
  } as any;
}

describe('NgxPrintDirective', () => {
  let directive: NgxPrintDirective;
  let popupDoc: any;
  let openSpy: jasmine.Spy;

  const originalOpen = window.open.bind(window);
  const originalGetEl = document.getElementById.bind(document);
  const originalGetByTag = document.getElementsByTagName.bind(document);

  beforeEach(() => {
    directive = new NgxPrintDirective();
    popupDoc = {
      open: jasmine.createSpy('docOpen'),
      write: jasmine.createSpy('docWrite'),
      close: jasmine.createSpy('docClose')
    };
  });

  afterEach(() => {
    window.open = originalOpen;
    document.getElementById = originalGetEl;
    document.getElementsByTagName = originalGetByTag;
  });

  function stubDom(elements: any, getByTag?: (tag: string) => any[]) {
    openSpy = jasmine.createSpy('windowOpen').and.returnValue({ document: popupDoc } as any);
    window.open = openSpy as any;
    document.getElementById = ((id: string) => elements[id] || null) as any;
    document.getElementsByTagName = ((tag: string) => (getByTag ? getByTag(tag) : [])) as any;
  }

  it('should create an instance', () => {
    expect(directive).toBeTruthy();
  });

  it('should print the section with charts, income block and paginator handling', fakeAsync(() => {
    const elements: any = {
      'print-section': fakeEl('PRINT_SECTION_CONTENT'),
      'optional-print': fakeEl('OPTIONAL_CONTENT'),
      'print-income': fakeEl('INCOME_CONTENT'),
      'expenseOfChart': fakeEl(''),
      'print-paginator': fakeEl('', { display: 'block' }),
      'cdk-accordion-child-0': fakeEl('', { visibility: 'hidden', height: '0px' })
    };
    stubDom(elements, (tag: string) => {
      if (tag === 'canvas') return [{ toDataURL: () => 'data:image/png;base64,ABC' }] as any;
      if (tag === 'style') return [{ outerHTML: '<style id="t">.a{}</style>' }] as any;
      if (tag === 'link') return [{ outerHTML: '<link rel="x">' }] as any;
      return [] as any;
    });

    const matTableDataSource: any = { paginator: {} };
    directive.printSectionId = 'print-section';
    directive.optionalPrintSectionId = 'optional-print';
    directive.matTableDataSource = matTableDataSource;
    directive.paginatorId = 'print-paginator';
    const fakePaginator = { fakePaginator: true };
    directive.paginator = fakePaginator as any;
    directive.hidePaginator = true;
    directive.useExistingCss = true;
    directive.printTitle = 'ExpenseReport';

    directive.print();
    expect(matTableDataSource.paginator).toBeNull();

    tick(1000);

    expect(openSpy).toHaveBeenCalledWith('', jasmine.stringMatching(/^ExpenseReport_202/), jasmine.any(String));
    expect(popupDoc.write).toHaveBeenCalledWith(jasmine.any(String));
    const html: string = popupDoc.write.calls.mostRecent().args[0];

    expect(html).toContain('OPTIONAL_CONTENTPRINT_SECTION_CONTENT');
    expect(html).toContain('data:image/png;base64,ABC');
    expect(html).toContain('<br><img');
    expect(html).toContain('INCOME_CONTENT');
    expect(html).toContain('<title>ExpenseReport_');
    expect(html).toContain('&copy; Manikandan Narasimhan(2024 - 2030)');
    expect(html).toContain('.a{}');

    expect(popupDoc.open).toHaveBeenCalled();
    expect(popupDoc.close).toHaveBeenCalled();

    expect(elements['print-paginator'].style.display).toBe('block');
    expect(elements['cdk-accordion-child-0'].style.visibility).toBe('hidden');
    expect(matTableDataSource.paginator).toBeTruthy();
  }));

  it('should skip chart and income handling for print-fitness section', fakeAsync(() => {
    const elements: any = { 'print-fitness': fakeEl('FITNESS_CONTENT') };
    stubDom(elements);

    const matTableDataSource: any = { paginator: {} };
    directive.printSectionId = 'print-fitness';
    directive.optionalPrintSectionId = undefined as any;
    directive.matTableDataSource = matTableDataSource;
    directive.hidePaginator = false;
    directive.printTitle = 'FitnessReport';

    directive.print();
    tick(1000);

    const html: string = popupDoc.write.calls.mostRecent().args[0];
    expect(html).toContain('FITNESS_CONTENT');
    expect(html).not.toContain('data:image/png');
    expect(matTableDataSource.paginator).toBeTruthy();
  }));

  it('should print without paginator and optional section', fakeAsync(() => {
    const elements: any = { 'print-section': fakeEl('MAIN_CONTENT') };
    stubDom(elements);

    directive.printSectionId = 'print-section';
    directive.optionalPrintSectionId = undefined as any;
    directive.matTableDataSource = { paginator: undefined } as any;
    directive.printTitle = 'SimplePrint';

    directive.print();
    tick(1000);

    const html: string = popupDoc.write.calls.mostRecent().args[0];
    expect(html).toContain('MAIN_CONTENT');
    expect(html).not.toContain('<img');
    expect(html).toContain('SimplePrint_');
  }));

  it('should set inline styles and return style values', () => {
    expect(directive.returnStyleValues()).toBe('<style>  </style>');
    directive.printStyle = { '.row': { color: 'red', 'font-size': '12px' } };
    expect(directive.returnStyleValues()).toContain('.row');
    expect(directive.returnStyleValues()).toContain('color:red');
  });

  it('should build stylesheet link tags for single and comma separated lists', () => {
    directive.styleSheetFile = 'a.css';
    expect(directive['_styleSheetFile']).toBe('<link rel="stylesheet" type="text/css" href="a.css">');

    directive.styleSheetFile = 'b.css,c.css';
    expect(directive['_styleSheetFile']).toContain('href="a.css"');
    expect(directive['_styleSheetFile']).toContain('href="b.css"');
    expect(directive['_styleSheetFile']).toContain('href="c.css"');
  });
});