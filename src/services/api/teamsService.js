import teamMembersData from "@/services/mockData/teams.json";

let teamMembers = [...teamMembersData];

export const getTeamMembers = async () => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  return [...teamMembers];
};
export const getTeamMemberById = async (id) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 200));
  
  const member = teamMembers.find(m => m.Id === id);
  if (!member) {
    throw new Error("Team member not found");
  }
  
  return { ...member };
};
export const inviteTeamMember = async (memberData) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // Validate required fields
  if (!memberData.name || !memberData.name.trim()) {
    throw new Error("Member name is required");
  }
  
  if (!memberData.email || !memberData.email.trim()) {
    throw new Error("Member email is required");
  }
  
  // Check if email already exists
  const existingMember = teamMembers.find(m => m.email.toLowerCase() === memberData.email.toLowerCase());
  if (existingMember) {
    throw new Error("A team member with this email already exists");
  }
  
  const maxId = Math.max(...teamMembers.map(m => m.Id), 0);
  const newMember = {
    Id: maxId + 1,
    name: memberData.name.trim(),
    email: memberData.email.trim().toLowerCase(),
    role: memberData.role || "viewer",
    permissions: memberData.permissions || {
      dashboard: true,
      leads: false,
      hotlist: false,
      pipeline: false,
      calendar: false,
      analytics: false,
      leaderboard: false,
      contacts: false
    },
    status: "pending",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastLogin: null
  };
  
  teamMembers.push(newMember);
  return { ...newMember };
};
export const updateTeamMember = async (id, updates) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const index = teamMembers.findIndex(m => m.Id === id);
  if (index === -1) {
    throw new Error("Team member not found");
  }
  
  // If email is being updated, check for duplicates
  if (updates.email && updates.email.toLowerCase() !== teamMembers[index].email.toLowerCase()) {
    const existingMember = teamMembers.find(m => m.email.toLowerCase() === updates.email.toLowerCase());
    if (existingMember) {
      throw new Error("A team member with this email already exists");
    }
  }
  
  teamMembers[index] = { 
    ...teamMembers[index], 
    ...updates,
    updatedAt: new Date().toISOString()
  };
  
  return { ...teamMembers[index] };
};
export const removeTeamMember = async (id) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const index = teamMembers.findIndex(m => m.Id === id);
  if (index === -1) {
    throw new Error("Team member not found");
  }
  
  teamMembers.splice(index, 1);
  return { success: true };
};
export const getTeamMemberPerformance = async (id) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 250));
  
  const member = teamMembers.find(m => m.Id === id);
  if (!member) {
    throw new Error("Team member not found");
  }
  
  // Mock performance data for team members
  const mockPerformance = {
    totalLeads: Math.floor(Math.random() * 50) + 20,
    totalDeals: Math.floor(Math.random() * 10) + 5,
    totalRevenue: Math.floor(Math.random() * 50000) + 10000,
    totalMeetings: Math.floor(Math.random() * 20) + 10,
    conversionRate: Math.floor(Math.random() * 15) + 5,
    avgDealSize: 0
  };
  
  mockPerformance.avgDealSize = mockPerformance.totalDeals > 0 ? 
    Math.round(mockPerformance.totalRevenue / mockPerformance.totalDeals) : 0;
  
  return mockPerformance;
};
export const activateTeamMember = async (id) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 200));
  
  const index = teamMembers.findIndex(m => m.Id === id);
  if (index === -1) {
    throw new Error("Team member not found");
  }
  
  teamMembers[index].status = "active";
  teamMembers[index].updatedAt = new Date().toISOString();
  
  return { ...teamMembers[index] };
};

export const deactivateTeamMember = async (id) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 200));
  
  const index = teamMembers.findIndex(m => m.Id === id);
  if (index === -1) {
    throw new Error("Team member not found");
  }
  
  teamMembers[index].status = "inactive";
  teamMembers[index].updatedAt = new Date().toISOString();
  
  return { ...teamMembers[index] };
};