const axios = require('axios');
const { parseStringPromise } = require('xml2js');

async function fetchDblpDataByName(authorName) {
    try {
        const query = encodeURIComponent(authorName);
        const response = await axios.get(`https://dblp.org/search/author/api?q=${query}&format=xml`);
        const json = await parseStringPromise(response.data, { explicitArray: false });
        return extractAuthors(json.result);
    } catch (error) {
        console.error('Error fetching DBLP data by name:', error);
        return null;
    }
}

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

async function fetchDblpPublications(dblpAuthorId) {
    try {
        const response = await axios.get(`https://dblp.org/pid/${dblpAuthorId}.xml`);
        const json = await parseStringPromise(response.data, { explicitArray: false });
        return extractDblpPublications(json.dblpperson, dblpAuthorId);
    } catch (error) {
        console.error('Error fetching DBLP publications:', error);
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
    const authorName = process.argv.slice(2).join(" ");
    if (!authorName) {
        console.log("Please provide an author name as an argument.");
        return;
    }

    const authors = await fetchDblpDataByName(authorName);
    if (authors && authors.length > 0) {
        console.log("Authors Found:");
        for (const [index, author] of authors.entries()) {
            console.log(`${index + 1}. ${author.name}`);
            console.log(`   DBLP ID: ${author.dblpId || 'N/A'}`);
            console.log(`   URL: ${author.url}`);
            console.log("-------------------------------------------");

            if (author.dblpId) {
                const publications = await fetchDblpPublications(author.dblpId);
                if (publications && publications.length > 0) {
                    console.log(`Publications for ${author.name}:`);
                    publications.forEach((pub, pubIndex) => {
                        console.log(`   ${pubIndex + 1}. ${pub.title} (${pub.year})`);
                        console.log(`      Venue: ${pub.venue}`);
                        console.log(`      URL: ${pub.url || 'N/A'}`);
                        console.log("   -------------------------------------------");
                    });
                } else {
                    console.log(`No publications found for ${author.name}.`);
                }
                console.log("===========================================");
            }
        }
    } else {
        console.log("No authors found.");
    }
}

main();
