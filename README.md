
# LMS Backend

This is the backend repository for the Learning Management System (LMS) project.

[Visit live site here](https://lms-frontend-eight-gules.vercel.app/)

## Project Description

The LMS Backend provides the server-side logic and APIs for the Learning Management System (LMS) project. It handles user authentication, database operations, and serves data to the frontend application.

## Features

- User authentication and authorization
- CRUD operations for courses, users, lectures, etc.
- Integration with Cloudinary for file storage
- Integration with Razorpay for payment processing

## Related

For the frontend repository of the LMS project, please refer to the corresponding frontend repository named "LMS Frontend."

[LMS Frontend](https://github.com/varunsavaliya/LMS-Frontend.git)


## Installation

Install LMS Frontend with npm in your local system

- Clone the project

```
    git clone https://github.com/varunsavaliya/LMS-Backend.git

    cd LMS-Backend
```

- Install node packages

```
    npm install
```

- Create environment file

    Create a `.env` file and provide necessary environment variables (necessary variables are provided in `.env.example`).
    
    **Note:** You must have some basic api keys and api secrets, i.e cloudinary, razorpay, etc. to run backend in your local server.

- Run project

```
    npm run dev
```
## Usage

Once the development server is running, you can try CRUDs or authentication flow of the LMS backend.
## Tech Stack

- Node.js
- Express.js
- MongoDB
- Mongoose
- Cloudinary
- Razorpay