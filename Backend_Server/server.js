const express = require('express');
const axios = require('axios');
const { parseStringPromise } = require('xml2js');
const cors = require('cors');

const app = express();
const PORT = 5501;

const serpApiKey = '9972e8b6f2847de4227cd23928352530839764d9b2f2249ea8a90aefdddaedb7';

app.use(cors()); // Enable CORS to allow requests from the front-end

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
        const authors = extractAuthors(json.result);
        res.json(publications);
    } catch (error) {
        res.status(500).send('Error fetching publication data.');
    }
});

// Route to fetch Google Scholar publications by ID
app.get('/fetch_google_scholar', async (req, res) => {
    const googleScholarId = req.query.googleScholarId;
    try {
        const response = await axios.get('https://serpapi.com/search.json', {
            params: {
                engine: 'google_scholar_author',
                author_id: googleScholarId,
                api_key: serpApiKey,
            },
        });
        res.json(response.data);
    } catch (error) {
        res.status(500).send('Error fetching Google Scholar data.');
    }
});

// New route to fetch and merge publications from both Google Scholar and DBLP
app.get('/fetch_merged_publications', async (req, res) => {
    const googleScholarId = req.query.googleScholarId;
    const dblpId = req.query.dblpId;

    if (!googleScholarId || !dblpId) {
        res.status(400).send('Both Google Scholar ID and DBLP ID are required.');
        return;
    }

    try {
        // Fetch DBLP publications
        const dblpResponse = await axios.get(`https://dblp.org/pid/${dblpId}.xml`);
        const dblpJson = await parseStringPromise(dblpResponse.data, { explicitArray: false });
        const dblpPublications = extractDblpPublications(dblpJson.dblpperson, dblpId);

        // Fetch Google Scholar publications
        const googleScholarResponse = await axios.get('https://serpapi.com/search.json', {
            params: {
                engine: 'google_scholar_author',
                author_id: googleScholarId,
                api_key: serpApiKey,
            },
        });
        const googleScholarData = googleScholarResponse.data;

        // Merge the publications
        const mergedPublications = mergePublicationsCommonFields(dblpPublications, googleScholarData);
        res.json(mergedPublications);
    } catch (error) {
        console.error('Error fetching or merging publications:', error);
        res.status(500).send('Error fetching or merging publications.');
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
    if (!dblpPerson || !dblpPerson.r) {
        console.error('No publications found or malformed data.');
        return [];
    }

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

        // Extract authors and co-authors
        const authors = pub.author && Array.isArray(pub.author) ? pub.author.map(author => author._ || "Unknown Author") : [];
        const coAuthors = authors.slice(1);  // All except the first author (main author)

        return {
            title: publicationType ? publicationType.title || "No Title" : "No Title",
            year: publicationType ? publicationType.year || 'N/A' : 'N/A',
            venue: publicationType ? publicationType.journal || publicationType.booktitle || 'N/A' : 'N/A',
            url: url,
            type: type,
            coAuthors: coAuthors.join(", ") || "No co-authors"  // Join co-authors as a comma separated string
        };
    });
}

function extractDblpPublications1(dblpPerson, pid) {
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
            authors: authors.join(", "), // List all authors (including co-authors)
            //coAuthors: coAuthors.join(", ") // List co-authors
        };
    });
}

function mergePublicationsCommonFields(dblpPublications, googleScholarData) {
    const dblpPubs = dblpPublications || [];
    const googlePubs = googleScholarData?.articles || [];

    const normalizeTitle = (title) => {
        return title.toLowerCase()
            .replace(/[^\w\s]/g, '')
            .replace(/\s+/g, ' ')
            .trim();
    };

    const mergedPublicationsMap = new Map();

    dblpPubs.forEach(pub => {
        const normalizedTitle = normalizeTitle(pub.title);
        mergedPublicationsMap.set(normalizedTitle, pub);
    });

    googlePubs.forEach(pub => {
        const normalizedTitle = normalizeTitle(pub.title);
        if (!mergedPublicationsMap.has(normalizedTitle)) {
            mergedPublicationsMap.set(normalizedTitle, pub);
        } else {
            const existingPub = mergedPublicationsMap.get(normalizedTitle);
            if (existingPub) {
                existingPub.authors = existingPub.authors || pub.authors;
                existingPub.year = existingPub.year || pub.year;
                existingPub.venue = existingPub.venue || pub.publication;
            }
        }
    });

    return Array.from(mergedPublicationsMap.values());
}

app.listen(PORT, () => {
    console.log(`Routing Service running on http://localhost:${PORT}`);
});
