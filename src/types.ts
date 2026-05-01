export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  department: string;
  rating: number;
  reviewCount: number;
  photoUrl: string;
  schedule: string;
  education: string;
  reviews: { author: string; text: string }[];
}

export interface Review {
  id?: string;
  author: string;
  rating: number;
  text: string;
  date: string;
  source: 'odoctor.kg' | '2GIS' | 'Google' | 'Новый';
  doctorName?: string;
}

export interface ServicePrice {
  id: string;
  name: string;
  price: string;
  category: string;
  department: string;
  description?: string;
  duration?: string;
  doctorIds?: string[];
  badge?: string;
  bookable?: boolean;
}
