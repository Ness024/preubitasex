import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TimeService {
  private readonly DATE_UNITS = {
    year: 31536000,
    month: 2629800,
    day: 86400,
    hour: 3600,
    minute: 60,
    second: 1
  };

  private readonly rtf = new Intl.RelativeTimeFormat('es', { numeric: 'auto' });

  getRelativeTime(timestamp: number | string | Date): string {
    const normalized = typeof timestamp === 'string'
      ? timestamp.replace(' ', 'T')
      : timestamp;

    const from = new Date(normalized).getTime();
    const now = new Date().getTime();
    const elapsed = (from - now) / 1000;

    for (const unit of Object.keys(this.DATE_UNITS) as (keyof typeof this.DATE_UNITS)[]) {
      if (Math.abs(elapsed) >= this.DATE_UNITS[unit]) {
        return this.rtf.format(Math.floor(elapsed / this.DATE_UNITS[unit]), unit);
      }
    }

    return this.rtf.format(0, 'second');
  }

  formatFullDate(date: number | string | Date): string {
    const normalized = typeof date === 'string'
      ? this.normalizeDateString(date)
      : date;

    const d = new Date(normalized);
    if (isNaN(d.getTime())) {
      throw new Error(`Formato de fecha inválido: ${date}`);
    }

    return new Intl.DateTimeFormat('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(d);
  }

  private normalizeDateString(dateString: string): string {
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return `${dateString}T00:00:00`;
    }
    return dateString.replace(' ', 'T');
  }
}