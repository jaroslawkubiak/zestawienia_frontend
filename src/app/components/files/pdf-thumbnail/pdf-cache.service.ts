import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class PdfCacheService {
  private cache = new Map<number, string>();

  get(id: number): string | undefined {
    return this.cache.get(id);
  }

  set(id: number, thumbnail: string): void {
    this.cache.set(id, thumbnail);
  }

  has(id: number): boolean {
    return this.cache.has(id);
  }
}
