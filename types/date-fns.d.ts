declare module 'date-fns' {
  export function formatDistanceToNow(date: Date | number, options?: {
    addSuffix?: boolean;
    locale?: Locale;
  }): string;
}

declare module 'date-fns/locale' {
  export interface Locale {
    code: string;
    formatDistance: any;
    formatRelative: any;
    localize: any;
    match: any;
    options: any;
  }
  
  export const fr: Locale;
}
