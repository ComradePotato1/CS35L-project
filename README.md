# FitAI
FitAI is an innovative client/server app designed to track, analyze, personalize, and share workouts for users with all levels of knowledge about fitness. 

## How to run FitAI locally

This app requires [Node.js](https://nodejs.org/en). Make sure that [Node.js](https://nodejs.org/en) is installed and npm commands can be run in your terminal/shell. 

### Get the code

Clone the repository and install all dependencies both in the root directory and in the subdirectories. 
```
git clone https://github.com/ComradePotato1/CS35L-project.git
cd ./CS35L-project
npm install
cd ./react
npm install
cd ../express
npm install
cd ..
```
This sets up dependencies and returns to the project root folder. 

### Connect to database
The app uses MySQL Server. To run the server locally, first install [MySQL Community Server](https://dev.mysql.com/downloads/mysql/8.4.html). 

Following the setup installer, execute and start the server. 

Then, edit the `.env` file in the express folder if necessary, so that it matches your MySQL server environment. An example `.env` has been provided in the express folder
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=password
DB_NAME=project
PORT=5001
```
Where `DB_HOST=localhost` specifies that the project is running locally, `DB_USER` and `DB_PASSWORD` corresponds to the user and password that you used to setup MySQL Server, `DB_NAME` is an arbitrary name for the database, `PORT` is the port that the front end uses to fetch data from the backend and should not be changed. 

### Run the app
In the root directory, run:
```
npm start
```

This starts both the front end and the backend, and creates the necessary database in the MySQL Server. Once the deployment server starts, the app should open on your browser. You need to create an account to use the app. 

## Technologies
- React
- Express
- MySQL
- Google Gemini API

## Authors
This app was developed as a final project UCLA CS35L in Spring 2025 by: Andrew Zhang, Herman Guo, and Jonathan Pearson
