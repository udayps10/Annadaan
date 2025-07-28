export interface ImpactPhoto {
  id: number
  userId: number
  title: string
  description: string
  location: string
  photoUrl: string
  photoFilename: string
  peopleHelped?: number
  organizationName?: string
  dateShared: Date
  isApproved: boolean
  isPublic: boolean
  createdAt: Date
  updatedAt: Date
  // User and org info for display
  userFullName?: string
  userType?: 'vendor' | 'ngo' | 'volunteer'
  likes?: number
  tags?: string[]
}

export interface GalleryUploadForm {
  title: string
  description: string
  location: string
  peopleHelped: number
  tags: string[]
  photo: File
}
