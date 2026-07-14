export interface TripDetails {
  origin: string;
  destination: string;
  startDate: string;
  endDate: string;
  budget: string | number;
  currency: string;
  preferences: string[];
}

export interface TripRecord {
  id: string;
  destination: string;
  origin: string;
  startDate: string;
  endDate: string;
  budget: number;
  currency: string;
  totalEstimatedCost: number;
  preferences: string;
  itinerary: string;
  status: string;
  createdAt: string;
}
