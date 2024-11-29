// library.js (connects with backend)
async function fetchAuthorsByName(authorName) {
    try {
        const response = await fetch(`http://localhost:5501/fetch_dblp_by_name?authorName=${encodeURIComponent(authorName)}`);
        if (!response.ok) throw new Error('Network response was not ok');
        return response.json();
    } catch (error) {
        console.error('Error fetching authors by name:', error);
        return null;
    }
}

async function fetchGoogleScholarData(googleScholarId) {
    try {
        const response = await fetch(`http://localhost:5501/fetch_google_scholar?googleScholarId=${googleScholarId}`);
        if (!response.ok) throw new Error('Network response was not ok');
        return response.json();
    } catch (error) {
        console.error('Error fetching Google Scholar data:', error);
        return null;
    }
}

async function fetchPublicationsByDblpId(dblpId) {
    try {
        const response = await fetch(`http://localhost:5501/fetch_dblp_publications?dblpId=${dblpId}`);
        if (!response.ok) throw new Error('Network response was not ok');
        return response.json();
    } catch (error) {
        console.error('Error fetching publications by DBLP ID:', error);
        return null;
    }
}
