export interface PDFUser {
  name: string;
  email: string;
}

export interface PDFCalculatedService {
  name: string;
  hours: number;
  rate: number;
  totalCost: number;
}

export interface PDFOverheadCost {
  name: string;
  value: number;
}

export interface PDFQuoteData {
  calculationId: string;
  createdAt: string;
  user: PDFUser;
  pricingModel: string;
  experienceMultiplier: {
    designer: string;
    freelance: string;
    value?: number;
  };
  geographyMultiplier: {
    designerCountry: string;
    clientCountry: string;
    value?: number;
  };
  services: PDFCalculatedService[];
  overheadCosts: PDFOverheadCost[];
  finalPrice: number;
}
