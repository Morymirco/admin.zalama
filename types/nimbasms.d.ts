declare module 'nimbasms' {
  export interface ClientConfig {
    SERVICE_ID: string;
    SECRET_TOKEN: string;
  }

  export interface SMSData {
    to: string[];
    message: string;
    sender_name?: string;
  }

  export interface AccountInfo {
    balance: number;
  }

  export class Client {
    constructor(config: ClientConfig);
    messages: {
      create(data: SMSData): Promise<any>;
    };
    accounts: {
      get(): Promise<AccountInfo>;
    };
  }
} 