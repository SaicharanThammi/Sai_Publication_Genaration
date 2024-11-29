const express = require('express');
const axios = require('axios');
const { parseStringPromise } = require('xml2js');
const cors = require('cors');  // Import the CORS middleware

const app = express();
const PORT = 5501;

// Use CORS middleware to allow requests from different origins
app.use(cors());

// Route to fetch author data by name
app.get('/fetch_dblp_by_name', async (req, res) => {
    const authorName = req.query.authorName;
    try {
        const query = encodeURIComponent(authorName);
        const response = await axios.get(`https://dblp.org/search/author/api?q=${query}&format=xml`);
        const json = await parseStringPromise(response.data, { explicitArray: false });
        const authors = extractAuthors(json.result);
        res.json(authors);
    } catch (error) {
        res.status(500).send('Error fetching author data.');
    }
});

// Route to fetch publications by DBLP ID
app.get('/fetch_dblp_publications', async (req, res) => {
    const dblpId = req.query.dblpId;
    try {
        const response = await axios.get(`https://dblp.org/pid/${dblpId}.xml`);
        const json = await parseStringPromise(response.data, { explicitArray: false });
        const publications = extractDblpPublications(json.dblpperson, dblpId);
        res.json(publications);
    } catch (error) {
        res.status(500).send('Error fetching publication data.');
    }
});

function extractAuthors(result) {
    if (!result || !result.hits || !result.hits.hit) return [];
    const hits = Array.isArray(result.hits.hit) ? result.hits.hit : [result.hits.hit];
    return hits.map(hit => {
        const url = hit.info?.url || "No URL";
        const dblpId = url !== "No URL" ? url.replace('https://dblp.org/pid/', '') : null;
        return {
            name: hit.info?.author || "Unknown Author",
            url: url,
            dblpId: dblpId
        };
    });
}

function extractDblpPublications(dblpPerson, pid) {
    if (!dblpPerson || !dblpPerson.r) return [];
    const publications = Array.isArray(dblpPerson.r) ? dblpPerson.r : [dblpPerson.r];
    return publications.map(pub => {
        const publicationType = pub.article || pub.inproceedings || pub.book || pub.phdthesis || pub.mastersthesis || pub.www;
        const type = pub.article ? 'article' : pub.inproceedings ? 'inproceedings' : pub.book ? 'book' : pub.phdthesis ? 'phdthesis' : pub.mastersthesis ? 'mastersthesis' : 'www';
        let url;
        if (publicationType && typeof publicationType.ee === 'string') {
            url = publicationType.ee;
        } else if (publicationType && Array.isArray(publicationType.ee)) {
            url = publicationType.ee[0];
        } else {
            url = publicationType ? publicationType.url || null : null;
        }
        return {
            title: publicationType ? publicationType.title || "No Title" : "No Title",
            year: publicationType ? publicationType.year || 'N/A' : 'N/A',
            venue: publicationType ? publicationType.journal || publicationType.booktitle || 'N/A' : 'N/A',
            url: url,
            type: type,
        };
    });
}

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
