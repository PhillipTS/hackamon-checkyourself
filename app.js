// Import Node express
const express = require('express')
// Create app
const app = express()

// Imports the Google Cloud client library
const language = require('@google-cloud/language');
// Instantiates a client
const client = new language.LanguageServiceClient();


function analyze(text) {
    // Function to call Google Cloud Sentiment API
    const document = {
        content: text,
        type: 'PLAIN_TEXT',
    };

    console.log("Analyzing...");
    // Detects the sentiment of the text. Returns a Promise
    return client.analyzeSentiment({document: document})
}

function getVerdict(score) {
    // Abstraction. Conversion between the Google Sentiment API score and what this API will return
    if (score < -0.2) {
        return "Bad"
    }
    else if (score > 0.2) {
        return "Good"
    }
    else {
        return "Neutral"
    }
}

// How to handle a POST request from any URL(/)
app.post('/', (req, res) => {

    // Get the body from the request
    let body = '';
    req.on('data', chunk => {
        body += chunk.toString(); // convert buffer to string
    });
    req.on('end', () => {
        console.log("Body: ", body);

        analyze(body).then(results => {
            console.log("Analyzed.\n Results:", JSON.stringify(results));
            const sentiment = results[0].documentSentiment;
        
            const output = {
                text: body,
                score: sentiment.score,
                magnitude: sentiment.magnitude
            };

            const safe = getVerdict(sentiment.score);

            const responseBody = JSON.stringify({output, safe});

            // Set response headers and status code
            res.writeHead(200, {
                'Content-Length': responseBody.length,
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*' 
            });
            // Send response with the created body
            res.end(responseBody);
        })
        .catch(err => {
            console.error('ERROR ANALYZING:', err);
        });
    });
})

// Run server
const server = app.listen(8080, () => {
    const host = server.address().address;
    const port = server.address().port;
  
    console.log(`App listening at http://${host}:${port}`);
  });