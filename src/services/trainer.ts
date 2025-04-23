/**
 * Represents a trainer.
 */
export interface Trainer {
  /**
   * The unique identifier of the trainer.
   */
  id: string;
  /**
   * The name of the trainer.
   */
  name: string;
  /**
   * The specialization of the trainer (e.g., Yoga, Strength Training).
   */
  specialization: string;
  /**
   * The trainer's experience in years.
   */
  experience: number;
  /**
   * The trainer's schedule
   */
  schedule: string;
    /**
   * The trainer's email
   */
  email: string;
  /**
   * The trainer's role
   */
  role: string;
}

/**
 * Asynchronously retrieves a list of all trainers.
 *
 * @returns A promise that resolves to an array of Trainer objects.
 */
export async function getTrainers(): Promise<Trainer[]> {
  // TODO: Implement this by calling an API.

  return [
    {
      id: '1',
      name: 'John Doe',
      specialization: 'Strength Training',
      experience: 5,
      schedule: 'Monday, Wednesday, Friday',
      email: 'john.doe@example.com',
      role: 'trainer'
    },
    {
      id: '2',
      name: 'Jane Smith',
      specialization: 'Yoga',
      experience: 3,
      schedule: 'Tuesday, Thursday, Saturday',
      email: 'jane.smith@example.com',
      role: 'admin'
    },
  ];
}

/**
 * Asynchronously retrieves a single trainer by ID.
 *
 * @param trainerId The ID of the trainer to retrieve.
 * @returns A promise that resolves to a Trainer object.
 */
export async function getTrainer(trainerId: string): Promise<Trainer | undefined> {
  // TODO: Implement this by calling an API.

  return {
    id: trainerId,
    name: 'John Doe',
    specialization: 'Strength Training',
    experience: 5,
    schedule: 'Monday, Wednesday, Friday',
    email: 'john.doe@example.com',
    role: 'trainer'
  };
}
