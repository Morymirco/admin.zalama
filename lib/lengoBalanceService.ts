interface LengoBalanceResponse {
  status: string;
  balance: string;
  currency: string;
}

export class LengoBalanceService {
  private static readonly BASE_URL = 'https://portal.lengopay.com/api';
  private static readonly SITE_ID = process.env.LENGO_SITE_ID;
  private static readonly API_KEY = process.env.LENGO_API_KEY;

  static async getBalance(): Promise<LengoBalanceResponse> {
    if (!this.SITE_ID || !this.API_KEY) {
      throw new Error('Configuration Lengo Pay manquante: SITE_ID ou API_KEY');
    }

    const url = `${this.BASE_URL}/getbalance/${this.SITE_ID}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${this.API_KEY}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erreur API Lengo Pay (${response.status}): ${errorText}`);
    }

    const data: LengoBalanceResponse = await response.json();
    
    if (data.status !== 'Success') {
      throw new Error(`Erreur de statut Lengo Pay: ${data.status}`);
    }

    return data;
  }

  static formatBalance(balance: string, currency: string): string {
    const numericBalance = parseFloat(balance);
    if (isNaN(numericBalance)) {
      return `${balance} ${currency}`;
    }
    
    return `${numericBalance.toLocaleString('fr-FR')} ${currency}`;
  }
} 