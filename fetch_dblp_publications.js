const axios = require('axios');
const { parseStringPromise } = require('xml2js');

async function fetchDblpData(dblpAuthorId) {
    try {
        const response = await axios.get(`https://dblp.org/pid/${dblpAuthorId}.xml`);
        const json = await parseStringPromise(response.data, { explicitArray: false });
        return extractDblpPublications(json.dblpperson, dblpAuthorId);
    } catch (error) {
        console.error('Error fetching DBLP data:', error);
        return null;
    }
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

async function main() {
    const dblpAuthorId = process.argv[2];
    if (!dblpAuthorId) {
        console.log("Please provide a DBLP author ID as an argument.");
        return;
    }

    const publications = await fetchDblpData(dblpAuthorId);
    if (publications && publications.length > 0) {
        console.log("Publications:");
        publications.forEach((pub, index) => {
            console.log(`${index + 1}. ${pub.title} (${pub.year})`);
            console.log(`   Venue: ${pub.venue}`);
            console.log(`   URL: ${pub.url || 'N/A'}`);
            console.log("-------------------------------------------");
        });
    } else {
        console.log("No publications found.");
    }
}

main();
