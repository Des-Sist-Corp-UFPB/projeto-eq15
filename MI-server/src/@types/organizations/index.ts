// src/@types/organizations/index.ts

export interface OrganizationDTO {
  id:          string
  name:        string
  description: string | null
  status:      string
  createdById: string
  createdAt:   Date
  updatedAt:   Date
}

export interface OrgListItemDTO {
  id:          string
  name:        string
  description: string | null
  status:      string
  myRole:      string
  memberCount: number
  createdAt:   Date
}

export interface OrgMemberDTO {
  id:             string
  organizationId: string
  userId:         string
  role:           string
  joinedAt:       Date
  user: {
    name:  string
    email: string
  }
}

export interface OrgInviteDTO {
  id:             string
  organizationId: string
  invitedUserId:  string
  invitedById:    string
  status:         string
  createdAt:      Date
  respondedAt:    Date | null
  organization: {
    name: string
  }
  invitedBy: {
    name: string
  }
}
