export interface User {
  id: string
  email: string
  full_name: string
  location_country?: string
  location_state?: string
  location_city?: string
}

export interface PolicyInterest {
  id: string
  name: string
  description: string
}

export interface Bill {
  id: string
  bill_number: string
  title: string
  summary: string
  full_text_url?: string
  level: "federal" | "state" | "municipal"
  jurisdiction: string
  status: string
  introduced_date: string
  policy_area: string
}

export interface Legislator {
  id: string
  name: string
  title: string
  level: "federal" | "state" | "municipal"
  jurisdiction: string
  contact_email?: string
  contact_phone?: string
  office_address?: string
  website_url?: string
}

export interface Vote {
  id: string
  user_id: string
  bill_id: string
  vote_type: "upvote" | "downvote"
}

export interface Comment {
  id: string
  user_id: string
  bill_id: string
  content: string
  created_at: string
}

export interface BillLegislator {
  bill_id: string
  legislator_id: string
  role: "sponsor" | "cosponsor"
}

// Mock data storage
export const mockUsers: User[] = [
  {
    id: "user-1",
    email: "demo@example.com",
    full_name: "Demo User",
    location_country: "United States",
    location_state: "California",
    location_city: "San Francisco",
  },
]

export const mockPolicyInterests: PolicyInterest[] = [
  { id: "1", name: "Healthcare", description: "Bills related to healthcare, medical services, and health insurance" },
  { id: "2", name: "Education", description: "Bills related to schools, universities, and educational policy" },
  { id: "3", name: "Human Rights", description: "Bills related to civil rights, equality, and social justice" },
  {
    id: "4",
    name: "Environment",
    description: "Bills related to climate change, conservation, and environmental protection",
  },
  { id: "5", name: "Economy", description: "Bills related to taxation, business regulation, and economic policy" },
  {
    id: "6",
    name: "Transportation",
    description: "Bills related to infrastructure, public transit, and transportation",
  },
  { id: "7", name: "Housing", description: "Bills related to housing policy, rent control, and homelessness" },
  { id: "8", name: "Criminal Justice", description: "Bills related to law enforcement, courts, and corrections" },
  { id: "9", name: "Technology", description: "Bills related to data privacy, cybersecurity, and tech regulation" },
  { id: "10", name: "Immigration", description: "Bills related to immigration policy and border security" },
]

export const mockUserPolicyInterests: Record<string, string[]> = {
  "user-1": ["1", "2", "4"], // Healthcare, Education, Environment
}

export const mockBills: Bill[] = [
  {
    id: "bill-1",
    bill_number: "H.R. 1234",
    title: "Universal Healthcare Access Act",
    summary:
      "This bill establishes a federal program to provide universal healthcare coverage to all U.S. citizens and legal residents, funded through progressive taxation.",
    level: "federal",
    jurisdiction: "United States",
    status: "In Committee",
    policy_area: "Healthcare",
    introduced_date: "2024-01-15",
  },
  {
    id: "bill-2",
    bill_number: "S.B. 567",
    title: "Clean Energy Investment Act",
    summary:
      "Allocates $50 billion in state funding for renewable energy infrastructure, including solar and wind projects, with tax incentives for green businesses.",
    level: "state",
    jurisdiction: "California",
    status: "Passed Senate",
    policy_area: "Environment",
    introduced_date: "2024-02-20",
  },
  {
    id: "bill-3",
    bill_number: "Ord. 89-2024",
    title: "Affordable Housing Development Initiative",
    summary:
      "Requires developers to include 20% affordable housing units in new residential projects and provides city subsidies for low-income housing construction.",
    level: "municipal",
    jurisdiction: "San Francisco, CA",
    status: "Under Review",
    policy_area: "Housing",
    introduced_date: "2024-03-10",
  },
  {
    id: "bill-4",
    bill_number: "H.R. 2345",
    title: "Student Loan Forgiveness Act",
    summary:
      "Provides up to $20,000 in federal student loan forgiveness for borrowers earning under $125,000 annually, with additional relief for Pell Grant recipients.",
    level: "federal",
    jurisdiction: "United States",
    status: "In Committee",
    policy_area: "Education",
    introduced_date: "2024-01-22",
  },
  {
    id: "bill-5",
    bill_number: "S.B. 890",
    title: "Criminal Justice Reform Act",
    summary:
      "Eliminates mandatory minimum sentences for non-violent drug offenses and expands rehabilitation programs for incarcerated individuals.",
    level: "state",
    jurisdiction: "New York",
    status: "Passed Assembly",
    policy_area: "Criminal Justice",
    introduced_date: "2024-02-05",
  },
  {
    id: "bill-6",
    bill_number: "Ord. 45-2024",
    title: "Public Transit Expansion Plan",
    summary:
      "Approves $200 million in municipal bonds to expand bus routes and improve accessibility for underserved neighborhoods.",
    level: "municipal",
    jurisdiction: "Austin, TX",
    status: "Approved",
    policy_area: "Transportation",
    introduced_date: "2024-03-01",
  },
]

export const mockLegislators: Legislator[] = [
  {
    id: "leg-1",
    name: "Senator Jane Smith",
    title: "U.S. Senator",
    level: "federal",
    jurisdiction: "United States",
    contact_email: "senator.smith@senate.gov",
    contact_phone: "(202) 224-1234",
    office_address: "123 Senate Office Building, Washington, DC 20510",
    website_url: "https://www.senate.gov/smith",
  },
  {
    id: "leg-2",
    name: "Representative John Doe",
    title: "U.S. Representative",
    level: "federal",
    jurisdiction: "United States",
    contact_email: "rep.doe@house.gov",
    contact_phone: "(202) 225-5678",
    office_address: "456 House Office Building, Washington, DC 20515",
    website_url: "https://www.house.gov/doe",
  },
  {
    id: "leg-3",
    name: "Senator Maria Garcia",
    title: "State Senator",
    level: "state",
    jurisdiction: "California",
    contact_email: "maria.garcia@senate.ca.gov",
    contact_phone: "(916) 555-0100",
    office_address: "1021 O Street, Sacramento, CA 95814",
    website_url: "https://www.senate.ca.gov/garcia",
  },
  {
    id: "leg-4",
    name: "Assemblymember David Chen",
    title: "State Assemblymember",
    level: "state",
    jurisdiction: "California",
    contact_email: "david.chen@assembly.ca.gov",
    contact_phone: "(916) 555-0200",
    office_address: "1020 N Street, Sacramento, CA 95814",
    website_url: "https://www.assembly.ca.gov/chen",
  },
  {
    id: "leg-5",
    name: "Supervisor Lisa Johnson",
    title: "City Supervisor",
    level: "municipal",
    jurisdiction: "San Francisco, CA",
    contact_email: "lisa.johnson@sfgov.org",
    contact_phone: "(415) 555-0300",
    office_address: "1 Dr Carlton B Goodlett Pl, San Francisco, CA 94102",
    website_url: "https://www.sfgov.org/johnson",
  },
  {
    id: "leg-6",
    name: "Council Member Robert Williams",
    title: "City Council Member",
    level: "municipal",
    jurisdiction: "Austin, TX",
    contact_email: "robert.williams@austintexas.gov",
    contact_phone: "(512) 555-0400",
    office_address: "301 W 2nd St, Austin, TX 78701",
    website_url: "https://www.austintexas.gov/williams",
  },
]

export const mockBillLegislators: BillLegislator[] = [
  { bill_id: "bill-1", legislator_id: "leg-1", role: "sponsor" },
  { bill_id: "bill-1", legislator_id: "leg-2", role: "cosponsor" },
  { bill_id: "bill-2", legislator_id: "leg-3", role: "sponsor" },
  { bill_id: "bill-2", legislator_id: "leg-4", role: "cosponsor" },
  { bill_id: "bill-3", legislator_id: "leg-5", role: "sponsor" },
  { bill_id: "bill-4", legislator_id: "leg-1", role: "cosponsor" },
  { bill_id: "bill-6", legislator_id: "leg-6", role: "sponsor" },
]

export let mockVotes: Vote[] = [
  { id: "vote-1", user_id: "user-1", bill_id: "bill-1", vote_type: "upvote" },
  { id: "vote-2", user_id: "user-1", bill_id: "bill-2", vote_type: "upvote" },
]

export let mockComments: Comment[] = [
  {
    id: "comment-1",
    user_id: "user-1",
    bill_id: "bill-1",
    content: "This is a great step towards universal healthcare!",
    created_at: new Date().toISOString(),
  },
]

// Helper functions to simulate database operations
export function addVote(vote: Omit<Vote, "id">) {
  const newVote = { ...vote, id: `vote-${Date.now()}` }
  mockVotes.push(newVote)
  return newVote
}

export function removeVote(voteId: string) {
  mockVotes = mockVotes.filter((v) => v.id !== voteId)
}

export function updateVote(voteId: string, voteType: "upvote" | "downvote") {
  const vote = mockVotes.find((v) => v.id === voteId)
  if (vote) {
    vote.vote_type = voteType
  }
  return vote
}

export function addComment(comment: Omit<Comment, "id" | "created_at">) {
  const newComment = {
    ...comment,
    id: `comment-${Date.now()}`,
    created_at: new Date().toISOString(),
  }
  mockComments.push(newComment)
  return newComment
}

export function removeComment(commentId: string) {
  mockComments = mockComments.filter((c) => c.id !== commentId)
}
