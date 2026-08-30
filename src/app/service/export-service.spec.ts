import * as XLSX from 'xlsx';

import { ExcelServicesService } from './export-service';

describe('ExcelServicesService', () => {
  let service: ExcelServicesService;

  beforeEach(() => {
    service = new ExcelServicesService();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('exportAsExcelFile should build a worksheet and call saveAsExcelFile with an ArrayBuffer', () => {
    const saveSpy = spyOn<any>(service, 'saveAsExcelFile');
    const json = [{ name: 'Food', amount: 100 }];

    service.exportAsExcelFile(json, 'expenses');

    expect(saveSpy).toHaveBeenCalledWith(jasmine.any(ArrayBuffer), 'expenses');
  });

  it('should produce a workbook that parses back to the same data', () => {
    const saveSpy = spyOn<any>(service, 'saveAsExcelFile');
    const json = [
      { name: 'Food', amount: 100, date: '05/4/2024' },
      { name: 'Travel', amount: 250.5, date: '20/4/2024' }
    ];

    service.exportAsExcelFile(json, 'expenses');

    const buffer = saveSpy.calls.mostRecent().args[0];
    const workbook = XLSX.read(buffer, { type: 'array' });
    expect(workbook.SheetNames).toEqual(['data']);

    const sheet = workbook.Sheets['data'];
    const parsed = XLSX.utils.sheet_to_json(sheet);
    expect(parsed).toEqual(json);
  });
});