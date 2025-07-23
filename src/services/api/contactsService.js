import contactsData from "@/services/mockData/contacts.json";

let contacts = [...contactsData];

export const getContacts = async () => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 400));
  
  return [...contacts];
};

export const getContactById = async (id) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 200));
  
  const contact = contacts.find(c => c.Id === id);
  if (!contact) {
    throw new Error("Contact not found");
  }
  
  return { ...contact };
};

export const createContact = async (contactData) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const maxId = Math.max(...contacts.map(c => c.Id));
  const newContact = {
    ...contactData,
    Id: maxId + 1,
    createdAt: new Date().toISOString()
  };
  
  contacts.push(newContact);
  return { ...newContact };
};

export const updateContact = async (id, updates) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const index = contacts.findIndex(c => c.Id === id);
  if (index === -1) {
    throw new Error("Contact not found");
  }
  
  contacts[index] = { ...contacts[index], ...updates };
  return { ...contacts[index] };
};

export const deleteContact = async (id) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const index = contacts.findIndex(c => c.Id === id);
  if (index === -1) {
    throw new Error("Contact not found");
  }
  
  contacts.splice(index, 1);
  return { success: true };
};