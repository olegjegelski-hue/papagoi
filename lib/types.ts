
export interface Parrot {
  id: string;
  name: string;
  species: string;
  speciesEst: string;
  description: string;
  personality: string;
  imageUrl: string;
  category: 'suur' | 'keskmine' | 'väike';
}

export interface BookingData {
  name: string;
  email: string;
  phone: string;
  groupSize: number;
  date?: Date;
  timeSlot?: string;
  groupType?: string;
  message?: string;
  totalPrice: number;
}

export interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  formType: string;
}

export interface NewsletterData {
  email: string;
  name?: string;
}

export interface TimeSlot {
  time: string;
  available: boolean;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  price: number | string;
  duration?: string;
  icon: string;
}
