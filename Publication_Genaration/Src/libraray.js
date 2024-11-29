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

// Merge data from DBLP and Google Scholar based on IDs
async function fetchAndMergeData(googleScholarId, dblpId) {
    try {
        // Fetch Google Scholar Data
        const googleScholarData = await fetchGoogleScholarData(googleScholarId);
        if (!googleScholarData) throw new Error('Failed to fetch Google Scholar data');

        // Fetch DBLP Data
        const dblpData = await fetchPublicationsByDblpId(dblpId);
        if (!dblpData) throw new Error('Failed to fetch DBLP data');

        // Merge the publications (assuming both datasets have similar structures)
        const mergedData = [...googleScholarData.publications, ...dblpData.publications];

        // Optionally, combine authors or metadata from both sources (co-authors, etc.)
        mergedData.forEach(publication => {
            publication.authors = [...new Set([...publication.authors, ...(dblpData.authors || []), ...(googleScholarData.authors || [])])];
        });

        return mergedData;
    } catch (error) {
        console.error('Error merging data:', error);
        return null;
    }
}

// Pagination helper
function paginate(publications, page = 1, itemsPerPage = 10) {
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedPublications = publications.slice(startIndex, endIndex);
    return paginatedPublications;
}

// Sort publications by title, year, or venue (ascending/descending)
function sortPublications(publications, sortBy, order = 'asc') {
    return publications.sort((a, b) => {
        let valueA = a[sortBy];
        let valueB = b[sortBy];

        if (typeof valueA === 'string') {
            valueA = valueA.toLowerCase();
            valueB = valueB.toLowerCase();
        }

        if (order === 'asc') {
            return valueA < valueB ? -1 : (valueA > valueB ? 1 : 0);
        } else {
            return valueA > valueB ? -1 : (valueA < valueB ? 1 : 0);
        }
    });
}

export { fetchAuthorsByName, fetchGoogleScholarData, fetchPublicationsByDblpId, fetchAndMergeData, paginate, sortPublications };
