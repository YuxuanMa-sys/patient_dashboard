export interface Service {
    id?: string; // Firestore document ID
    name: string;
    description: string;
    price?: string; // Storing as string as per example data
    discount?: string;
    discountedPrice?: string;
    tag?: 'Popular' | 'Free Consultation' | string; // Allow specific tags or others
    // Add any other relevant fields, e.g., duration, category, isActive
    isActive?: boolean; // Good practice to include for soft deletes or visibility
}
