export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  phoneNumber?: string;
}

export async function getUsers(): Promise<User[]> {
  // TODO: Implement this by calling an API.

  return [
    {id: '1', name: 'John Doe', email: 'john@example.com', role: 'user', phoneNumber: '123-456-7890'},
    {id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'user', phoneNumber: '987-654-3210'},
    {id: '3', name: 'Admin User', email: 'admin@example.com', role: 'user', phoneNumber: '555-123-4567'},
  ];
}
