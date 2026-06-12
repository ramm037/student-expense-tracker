# Student Expense Tracker

A full stack web app to track student expenses.

## Tech Stack
- Backend: Node.js, Express.js
- Database: MySQL
- Frontend: HTML, CSS, JavaScript (coming soon)

## Features
- Add expenses
- View all expenses
- Delete expenses
- View total expenses

## Setup
1. Clone the repo
2. Run `npm install`
3. Create a `.env` file with your MySQL credentials
4. Run `npm run dev`

## API Routes
  Method  Route  Description 
  GET  /expenses  Get all expenses 
  POST  /expenses  Add new expense 
  DELETE  /expenses/:id  Delete expense 
  GET  /expenses/total  Get total amount 