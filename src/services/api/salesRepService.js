import salesRepData from "@/services/mockData/salesReps.json";

let salesReps = [...salesRepData];

export const getSalesReps = async () => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  return [...salesReps];
};

export const getSalesRepById = async (id) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 200));
  
  const rep = salesReps.find(r => r.Id === id);
  if (!rep) {
    throw new Error("Sales rep not found");
  }
  
  return { ...rep };
};

export const createSalesRep = async (repData) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const maxId = Math.max(...salesReps.map(r => r.Id));
  const newRep = {
    ...repData,
    Id: maxId + 1,
    leadsContacted: 0,
    meetingsBooked: 0,
    dealsClosed: 0,
    totalRevenue: 0
  };
  
  salesReps.push(newRep);
  return { ...newRep };
};

export const updateSalesRep = async (id, updates) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const index = salesReps.findIndex(r => r.Id === id);
  if (index === -1) {
    throw new Error("Sales rep not found");
  }
  
  salesReps[index] = { ...salesReps[index], ...updates };
  return { ...salesReps[index] };
};

export const deleteSalesRep = async (id) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const index = salesReps.findIndex(r => r.Id === id);
  if (index === -1) {
    throw new Error("Sales rep not found");
  }
  
  salesReps.splice(index, 1);
  return { success: true };
};