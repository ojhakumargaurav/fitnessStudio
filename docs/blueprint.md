# **App Name**: Fitness Hub

## Core Features:

- User Authentication: User authentication with registration, login, and logout functionality.
- Class Booking: Display a calendar view of available classes, filter by category, and allow booking/cancellation.
- Trainer Profiles: Display trainer profiles with information, schedules, and specializations.

## Style Guidelines:

- Primary color: Use a vibrant green (#4CAF50) to represent health and vitality.
- Secondary color: A light gray (#F0F0F0) for backgrounds and subtle contrast.
- Accent: A bright blue (#2196F3) for interactive elements and call-to-actions.
- Use a clean, modern layout with clear sections and intuitive navigation.
- Use a set of consistent, modern icons for easy identification of different actions and categories.

## Original User Request:
You are an expert full-stack developer specializing in creating web applications. Your task is to generate the code for a comprehensive Gym and Fitness application.

**Application Description:**

The application will allow users to manage their fitness journey, book classes, interact with trainers, and handle billing. It should have a robust architecture with clear separation of concerns between the frontend and backend.

**Frontend Specifications:**

* **Framework:** Use either Angular or Vue.js for the frontend. Choose the framework that you believe will result in the most maintainable and performant application for this use case.
* **Authorization:** Implement a secure user authentication system.
    * Users should be able to register, log in, and log out.
    * Implement role-based access control (RBAC) with at least two roles: "User" and "Trainer".
    * Store authentication tokens securely (e.g., using HttpOnly cookies or secure local storage with appropriate security measures).
* **User Interface:**
    * Create a responsive and user-friendly interface.
    * Design a dashboard that displays the user's upcoming classes, membership status, and available offers.
    * Implement a class booking system:
        * Display a calendar view of available classes for the next day.
        * Users should be able to filter classes by category (e.g., Yoga, Strength Training, Cardio).
        * Users should be able to book and cancel classes.
        * Show class details, including trainer information, time, and location.
    * Trainer profiles:
        * Display trainer information (name, specialization, experience).
        * Allow users to view trainer schedules.
    * Membership management:
        * Display the user's current membership type and expiration date.
    * Offers:
        * Display available offers and promotions.
    * User profile:
        * Allow users to view and edit their profile information (name, contact details).
* **State Management:** Use a suitable state management solution (e.g., NgRx for Angular, Vuex for Vue.js) to manage application state effectively.
* **Communication:** Implement communication with the backend API.

**Backend Specifications:**

* **Framework:** Use a Python web framework. Choose from:
    * Django
    * Flask
    * FastAPI
* **Database:** Use PostgreSQL.
* **Authorization:**
    * Implement JWT-based authentication.
    * Enforce RBAC to protect API endpoints. Only authenticated users should be able to access certain routes. Only trainers should be able to create classes.
* **API Endpoints:**
    * **User Management:**
        * `POST /api/users/register`: Register a new user.
        * `POST /api/users/login`: Log in a user and return a JWT token.
        * `GET /api/users/profile`: Get the user's profile information (requires authentication).
        * `PUT /api/users/profile`: Update the user's profile (requires authentication).
    * **Trainer Management:**
        * `POST /api/trainers`: Create a new trainer (requires Trainer role).
        * `GET /api/trainers`: Get a list of all trainers.
        * `GET /api/trainers/{trainerId}`: Get a single trainer.
    * **Class Management:**
        * `POST /api/classes`: Create a new class (requires Trainer role).
        * `GET /api/classes`: Get a list of all classes for the next day.
        * `GET /api/classes/{classId}`: Get details for a specific class.
        * `POST /api/classes/{classId}/book`: Book a class (requires User role).
        * `POST /api/classes/{classId}/cancel`: Cancel a booked class (requires User role).
    * **Offer Management:**
        * `GET /api/offers`: Get a list of available offers.
    * **Scheduling:**
        * Classes should be scheduled for a specific date and time.
        * The system should prevent double-booking of classes.
* **Data Models:** Define appropriate data models for Users, Trainers, Classes, Bookings, and Offers.
* **Error Handling:** Implement proper error handling for all API endpoints.
* **Database Migrations:** Use a database migration tool (e.g., Django Migrations, Alembic) to manage database schema changes.

**Specific Details and Constraints:**

* The application should be designed to be scalable and maintainable.
* Prioritize security best practices throughout the development process.
* The class schedule should be dynamic, allowing trainers to add classes for the next day.
* Users should receive confirmation emails upon successful registration and class booking. (You can simulate email sending).
* Include seed data for at least 3 trainers and 5 classes for the next day.
* Assume the next day starts at 00:00 and ends at 23:59.
* When a trainer creates a class, they should specify the date, start time, end time, and capacity.
* Users should be able to see the number of available slots in a class before booking.
* The system should prevent users from booking classes that are already full or that overlap with their existing bookings.

**Output:**

Generate the complete code for the Gym and Fitness application, including:

* Frontend code (Angular or Vue.js)
* Backend code (Python framework)
* Database schema definition
* Instructions on how to set up and run the application.

Provide clear and well-commented code, following best practices for each technology.
  