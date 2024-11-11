let currentPage = 1;
const itemsPerPage = 5;
let currentPublications = [];

document.getElementById('authorForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    const searchType = document.querySelector('input[name="searchType"]:checked').value;
    const authorInput = document.getElementById('authorInput').value.trim();
    if (!authorInput) {
        alert("Please enter an author name or DBLP ID.");
        return;
    }

    document.getElementById('publications').innerHTML = '<p>Loading...</p>';

    if (searchType === 'id') {
        // Fetch publications directly using DBLP ID
        const publications = await fetchPublicationsByDblpId(authorInput);
        displayPublications(publications, 'Author');
    } else if (searchType === 'name') {
        // Fetch authors by name first
        const authors = await fetchAuthorsByName(authorInput);
        if (authors && authors.length > 0) {
            if (authors.length === 1) {
                const publications = await fetchPublicationsByDblpId(authors[0].dblpId);
                displayPublications(publications, authors[0].name);
            } else {
                displayAuthorOptions(authors);
            }
        } else {
            document.getElementById('publications').innerHTML = '<p>No authors found.</p>';
        }
    }
});

document.getElementById('mergeButton').addEventListener('click', async () => {
    const googleScholarId = document.getElementById('googleScholarId').value.trim();
    const dblpId = document.getElementById('dblpId').value.trim();

    if (!googleScholarId && !dblpId) {
        alert("Please enter at least one of Google Scholar ID or DBLP ID.");
        return;
    }

    document.getElementById('publications').innerHTML = '<p>Loading...</p>';

    try {
        let mergedPublications = [];
        if (googleScholarId && dblpId) {
            // Fetch and merge publications from both Google Scholar and DBLP
            const response = await fetch(`http://localhost:5501/fetch_merged_publications?googleScholarId=${googleScholarId}&dblpId=${dblpId}`);
            if (!response.ok) throw new Error('Network response was not ok');
            mergedPublications = await response.json();
        } else if (googleScholarId) {
            // Fetch only from Google Scholar
            const googleScholarData = await fetchGoogleScholarData(googleScholarId);
            mergedPublications = googleScholarData?.articles || [];
        } else if (dblpId) {
            // Fetch only from DBLP
            mergedPublications = await fetchPublicationsByDblpId(dblpId);
        }
        displayPublications(mergedPublications, 'Publications');
    } catch (error) {
        console.error('Error fetching publications:', error);
        document.getElementById('publications').innerHTML = '<p>Error fetching publications. Please try again.</p>';
    }
});

document.getElementById('sortForm')?.addEventListener('change', (event) => {
    const sortBy = event.target.value;
    if (sortBy === 'yearAsc') {
        currentPublications.sort((a, b) => (a.year || 0) - (b.year || 0));
    } else if (sortBy === 'yearDesc') {
        currentPublications.sort((a, b) => (b.year || 0) - (a.year || 0));
    } else if (sortBy === 'titleAsc') {
        currentPublications.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === 'titleDesc') {
        currentPublications.sort((a, b) => b.title.localeCompare(a.title));
    } else if (sortBy === 'venueAsc') {
        currentPublications.sort((a, b) => (a.venue || '').localeCompare(b.venue || ''));
    } else if (sortBy === 'venueDesc') {
        currentPublications.sort((a, b) => (b.venue || '').localeCompare(a.venue || ''));
    }
    renderPage(currentPage, 'Author');
});

document.getElementById('searchTitleForm')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const keyword = document.getElementById('searchTitleInput').value.trim().toLowerCase();
    if (!keyword) {
        alert("Please enter a keyword to search in titles.");
        return;
    }
    const filteredPublications = currentPublications.filter(pub => pub.title.toLowerCase().includes(keyword));
    displayPublications(filteredPublications, 'Author');
});

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

function displayAuthorOptions(authors) {
    const publicationsDiv = document.getElementById('publications');
    publicationsDiv.innerHTML = '';

    const header = document.createElement('h2');
    header.textContent = 'Multiple authors found. Please select one:';
    publicationsDiv.appendChild(header);

    const list = document.createElement('ul');
    authors.forEach((author, index) => {
        const listItem = document.createElement('li');
        listItem.innerHTML = `
            <strong>${index + 1}. ${author.name}</strong><br>
        `;
        list.appendChild(listItem);
    });
    publicationsDiv.appendChild(list);
}

function selectAuthor(authorName) {
    document.getElementById('authorInput').value = authorName;
    alert(`Author "${authorName}" selected. Please click "Fetch Publications" to continue.`);
}

function displayPublications(publications, authorName) {
    currentPage = 1;
    currentPublications = publications;
    renderPage(currentPage, authorName);
}

function renderPage(page, authorName) {
    const publicationsDiv = document.getElementById('publications');
    publicationsDiv.innerHTML = '';

    if (!currentPublications || currentPublications.length === 0) {
        publicationsDiv.innerHTML = '<p>No publications found.</p>';
        return;
    }

    const header = document.createElement('h2');
    header.textContent = `Publications for ${authorName}:`;
    publicationsDiv.appendChild(header);

    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const items = currentPublications.slice(start, end);

    const list = document.createElement('ul');
    items.forEach((pub, index) => {
        const listItem = document.createElement('li');
        listItem.innerHTML = `
            <strong>${start + index + 1}. ${pub.title}</strong> (${pub.year})<br>
            Venue: ${pub.venue || 'N/A'}<br>
            <a href="${pub.url || '#'}" target="_blank">Link</a>
        `;
        list.appendChild(listItem);
    });
    publicationsDiv.appendChild(list);

    // Add navigation buttons
    const paginationDiv = document.createElement('div');
    paginationDiv.style.marginTop = '20px';
    paginationDiv.style.display = 'flex';
    paginationDiv.style.justifyContent = 'space-between';

    if (currentPage > 1) {
        const prevButton = document.createElement('button');
        prevButton.textContent = 'Previous';
        prevButton.onclick = () => {
            currentPage--;
            renderPage(currentPage, authorName);
        };
        paginationDiv.appendChild(prevButton);
    }

    if (end < currentPublications.length) {
        const nextButton = document.createElement('button');
        nextButton.textContent = 'Next';
        nextButton.onclick = () => {
            currentPage++;
            renderPage(currentPage, authorName);
        };
        paginationDiv.appendChild(nextButton);
    }

    publicationsDiv.appendChild(paginationDiv);
}
