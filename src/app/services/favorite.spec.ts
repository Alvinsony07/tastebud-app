import { TestBed } from '@angular/core/testing';

import { Favorite } from './favorite.service';

describe('Favorite', () => {
  let service: Favorite;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Favorite);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
