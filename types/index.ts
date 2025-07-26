export interface User {
  id: number
  email: string
  password: string
  fullName: string
  phone?: string
  userType: 'vendor' | 'ngo' | 'volunteer' | 'admin'
  status: 'pending' | 'approved' | 'rejected' | 'suspended'
  profileImage?: string
  address?: string
  latitude?: number
  longitude?: number
  emailVerified: boolean
  createdAt: Date
  updatedAt: Date
}

export interface VendorProfile {
  id: number
  userId: number
  businessName: string
  businessType: 'restaurant' | 'hotel' | 'bakery' | 'grocery' | 'catering' | 'street_vendor' | 'other'
  businessLicense?: string
  operatingHours?: Record<string, any>
  description?: string
  website?: string
  socialMedia?: Record<string, any>
  averageDailyAvailable: number
  createdAt: Date
}

export interface NGOProfile {
  id: number
  userId: number
  organizationName: string
  registrationNumber?: string
  registrationCertificate?: string
  focusArea: 'homeless' | 'children' | 'elderly' | 'animals' | 'general'
  capacity: number
  description?: string
  website?: string
  socialMedia?: Record<string, any>
  serviceAreaRadius: number
  createdAt: Date
}

export interface VolunteerProfile {
  id: number
  userId: number
  availability?: Record<string, any>
  vehicleType: 'car' | 'bike' | 'bicycle' | 'walking' | 'public_transport'
  maxDistance: number
  skills?: Record<string, any>
  emergencyContactName?: string
  emergencyContactPhone?: string
  backgroundCheckStatus: 'pending' | 'approved' | 'rejected'
  createdAt: Date
}

export interface FoodListing {
  id: number
  vendorId: number
  title: string
  description?: string
  foodType: 'cooked' | 'raw' | 'packaged' | 'dairy' | 'bakery' | 'fruits' | 'vegetables' | 'other'
  quantity: number
  unit: 'kg' | 'pieces' | 'servings' | 'liters' | 'boxes' | 'bags'
  expiryDate: Date
  pickupStartTime: Date
  pickupEndTime: Date
  status: 'available' | 'reserved' | 'collected' | 'expired' | 'cancelled'
  images?: string[]
  dietaryInfo?: Record<string, any>
  storageRequirements?: string
  specialInstructions?: string
  createdAt: Date
  updatedAt: Date
  vendor?: User
  vendorProfile?: VendorProfile
}

export interface Pickup {
  id: number
  foodListingId: number
  requesterId: number
  volunteerId?: number
  pickupDate: Date
  estimatedPickupTime?: Date
  actualPickupTime?: Date
  status: 'requested' | 'approved' | 'assigned' | 'in_progress' | 'completed' | 'cancelled' | 'failed'
  quantityRequested: number
  quantityCollected?: number
  notes?: string
  pickupCode?: string
  ratingVendor?: number
  ratingRequester?: number
  feedbackVendor?: string
  feedbackRequester?: string
  createdAt: Date
  updatedAt: Date
  foodListing?: FoodListing
  requester?: User
  volunteer?: User
}

export interface Notification {
  id: number
  userId: number
  type: 'food_available' | 'pickup_request' | 'pickup_approved' | 'pickup_assigned' | 'pickup_reminder' | 'pickup_completed' | 'system' | 'admin'
  title: string
  message: string
  data?: Record<string, any>
  isRead: boolean
  isSent: boolean
  sendEmail: boolean
  sendSms: boolean
  scheduledFor?: Date
  createdAt: Date
}

export interface Certificate {
  id: number
  userId: number
  type: 'volunteer_appreciation' | 'top_donor' | 'community_hero' | 'monthly_contributor' | 'year_end_impact'
  title: string
  description?: string
  criteriaMet?: Record<string, any>
  certificateUrl?: string
  issuedAt: Date
}

export interface AnalyticsEvent {
  id: number
  eventType: 'user_registration' | 'food_listed' | 'pickup_requested' | 'pickup_completed' | 'food_shared' | 'login' | 'logout'
  userId?: number
  entityId?: number
  entityType?: 'food_listing' | 'pickup' | 'user' | 'other'
  data?: Record<string, any>
  createdAt: Date
}

// Dashboard types
export interface DashboardStats {
  totalDonations: number
  totalPickups: number
  mealsRescued: number
  co2Saved: number
  activeUsers: number
  pendingRequests: number
}

export interface VendorStats extends DashboardStats {
  totalListings: number
  averageRating: number
  completionRate: number
}

export interface NGOStats extends DashboardStats {
  totalRequests: number
  successfulPickups: number
  averageResponseTime: number
}

// Form types
export interface LoginForm {
  email: string
  password: string
}

export interface RegisterForm {
  email: string
  password: string
  confirmPassword: string
  fullName: string
  phone: string
  userType: 'vendor' | 'ngo' | 'volunteer'
  address: string
  // Additional fields based on user type
  businessName?: string
  businessType?: string
  organizationName?: string
  focusArea?: string
}

export interface FoodListingForm {
  title: string
  description: string
  foodType: string
  quantity: number
  unit: string
  expiryDate: string
  pickupStartTime: string
  pickupEndTime: string
  dietaryInfo: string[]
  storageRequirements: string
  specialInstructions: string
  images: File[]
}

export interface PickupRequestForm {
  foodListingId: number
  quantityRequested: number
  notes: string
  pickupDate: string
  estimatedPickupTime: string
}
