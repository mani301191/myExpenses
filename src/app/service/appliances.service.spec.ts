import { TestBed } from '@angular/core/testing';

import { AppliancesService } from './appliances.service';

describe('AppliancesService', () => {
  let service: AppliancesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AppliancesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
