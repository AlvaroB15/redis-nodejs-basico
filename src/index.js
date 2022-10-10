const express = require('express');
const app = express();
const axios = require('axios');
const responseTime = require('response-time');
const redis = require('redis');

let client;

(async () => {

    client = redis.createClient({
        host: '127.0.0.1',
        port: 6379
    });

    client.on("error", (error) => console.error(`Error : ${error}`));

    await client.connect();
})();

app.use(responseTime());

app.get('/character', async (req, res) => {

    try {

        let result;
        const cacheResult = await client.get('characters');

        if (cacheResult) {
            result = JSON.parse(cacheResult);
        } else {
            const response = await axios.get('https://rickandmortyapi.com/api/character');
            result = response.data;
            await client.set('characters', JSON.stringify(result));
        }

        res.json(result);

    } catch (error) {
        console.log(error);
    }

});

app.get('/character/:id', async (req, res) => {

    try {

        let result;
        const cacheResult = await client.get(req.originalUrl);

        if (cacheResult) {
            result = JSON.parse(cacheResult);
        } else {
            const response = await axios.get(`https://rickandmortyapi.com/api/character/${req.params.id}`);
            result = response.data;
            await client.set(req.originalUrl, JSON.stringify(result));
        }

        res.json(result);

    } catch (error) {
        res.status(error.response.status).json({ message: error.message })
        console.log(error.message);
        console.log(error.code);
    }

});


app.listen(5001, () => {
    console.log('Listening in port 5001');
});