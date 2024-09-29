// Import Dependencies
const express = require("express");
const app = express();
const mysql = require('mysql2');
const dotenv = require('dotenv');
const { resolveInclude } = require("ejs");

 
// Configure environment variables
dotenv.config();

// Create a connection object
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

// Test connection
db.connect((err) => {
    // If the connection is not successful
    if(err){
        return console.log("Error connecting to the database: ", err);
    }
    // Connection is successful
    console.log("Successfully connected to MySQL: ", db.threadId);
});


app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

// Endpoint to Retrieve all patients
app.get('/patients', (req, res) => {
    const getPatients = "SELECT patient_id, first_name, last_name, date_of_birth FROM patients";
    db.query(getPatients, (err, data) => {
        // If an error occurs
        if(err){
            console.log("Database query error: ", err);
            return res.status(400).send(err);
        }
        res.status(200).render('data', { data });
        console.log("Response sent successfully!");
    });
});

// Endpoint to Retrieve all providers
app.get('/providers', (req, res) => {
    const getProviders = "SELECT first_name, last_name, provider_specialty FROM providers";
    db.query(getProviders, (err, providers) => {
        if(err){
            console.log("Database query error: ", err);
            return res.status(400).send(err);
        }
        res.status(200).render('providers', { providers });
        console.log("Response sent successfully!");
    });
});

// Endpoint to Filter patients by First Name
app.get('/patients/filter', (req, res) => {
    const { first_name } = req.query;
    
    if(!first_name){
        console.log("First name is required!");
        return res.status(400).send("First name is required");
    }
    
    const patients_by_fname = "SELECT * FROM patients WHERE first_name = ?";
    db.query(patients_by_fname, [first_name], (err, results) =>{
        if(err){
            console.log("Database query error: ", err);
            return res.status(500).send("Database query error");
        }
        if(results.length === 0){
            console.log("No patients found with that first name");
            return res.status(404).send('No patients found with that first name');
        }
        res.json(results);
        console.log("Response sent successfully!");
    });
});

// Endpoint to Retrieve all providers by their specialty
app.get('/providers/filter', (req, res) => {
    const { provider_specialty } = req.query;
    const filter_by_specialty = "SELECT * FROM providers where provider_specialty = ?";
    if (!provider_specialty){
        console.log("Provider specialty is required");
        return res.status(400).send("Provider specialty is required");
    }

    db.query(filter_by_specialty, [provider_specialty], (err, results) => {
        if(err){
            console.log("Database query error");
            return res.status(500).send("Database query error");
        }
        if(results.length === 0){
            console.log("No provider found with that specialty");
            return res.status(404).send("No provider found with that specialty");
        }
        res.json(results);
        console.log("Response sent successfully!");
    });
});


// Start and listen to the server
const PORT = 3300;
app.listen(PORT, () => {
    console.log(`server is running on http://localhost:${PORT}`)
});