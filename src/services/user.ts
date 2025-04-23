export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export async function getUsers(): Promise<User[]> {
  // TODO: Implement this by calling an API.

  return [
    {id: '1', name: 'John Doe', email: 'john@example.com', role: 'user'},
    {id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'trainer'},
    {id: '3', name: 'Admin User', email: 'admin@example.com', role: 'admin'},
  ];
}
