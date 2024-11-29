# Research Publications Fetcher

## Overview
The **Research Publications Fetcher** is a web-based solution that allows users to easily retrieve and display research publications from two major sources:
1. **DBLP** - A computer science bibliography website.
2. **Google Scholar** - A free web search engine that indexes scholarly articles.

This project provides a backend service (`server.js`) to connect with these APIs and a frontend library (`library.js`) that can be used by any department, research scholar, or private service to integrate publication data into their websites or applications.

## Features
- Fetch publications by **Author Name** from DBLP.
- Fetch publications by **Google Scholar ID**.
- Fetch publications by **DBLP ID**.
- Returns JSON objects that contain publication details, which can be displayed on any website.
- Designed to be easily integrated into any existing website or service.

## Tech Stack
- **Backend:** Node.js with Express.js
- **Frontend:** JavaScript (for use in browser)
- **APIs Used:** DBLP API, Google Scholar API

## Installation

### Prerequisites
- Node.js installed on your machine.
- npm or yarn for managing dependencies.

### Backend Setup (`server.js`)

1. Clone the repository to your local machine:
    ```bash
    git clone https://github.com/SaicharanThammi/Sai_Publication_Genaration/
    cd research-publications-fetcher
    ```
    ///\\\\

2. Install dependencies:
    ```bash
    npm install
    ```

3. Start the backend server:
    ```bash
    node server.js
    ```

   This will start a local server at `http://localhost:5501`.

### Frontend Usage (`library.js`)

1. Download or copy the `library.js` file into your project.

2. Add the following script tag to your HTML file:
    ```html
    <script src="path/to/library.js"></script>
    ```

3. Use the library functions to fetch publications:

    ```javascript
    // Example: Fetch publications by Author Name
    fetchAuthorsByName('John Doe').then(publications => {
        console.log(publications);
    });

    // Example: Fetch Google Scholar Data
    fetchGoogleScholarData('googleScholarId').then(data => {
        console.log(data);
    });

    // Example: Fetch publications by DBLP ID
    fetchPublicationsByDblpId('dblpId').then(publications => {
        console.log(publications);
    });
    ```

4. The library functions return a `Promise` that resolves to a JSON object with the publication data. The JSON structure will contain information such as the title of the publication, authors, year, and more.

## API Endpoints (Backend)

The backend exposes the following API endpoints:

- **GET `/fetch_dblp_by_name?authorName=<authorName>`**  
  Fetches publications from DBLP by author's name.

- **GET `/fetch_google_scholar?googleScholarId=<googleScholarId>`**  
  Fetches Google Scholar data by Google Scholar ID.

- **GET `/fetch_dblp_publications?dblpId=<dblpId>`**  
  Fetches publications from DBLP by DBLP ID.

Each endpoint returns a JSON response containing the publication data. If no publications are found or if there is an error, the response will indicate this accordingly.

## Example Response

The response from each of the API endpoints will look something like this:

```json
{
    "author": "John Doe",
    "publications": [
        {
            "title": "Research Paper Title 1",
            "journal": "Journal Name",
            "year": 2020,
            "authors": ["John Doe", "Jane Smith"]
        },
        {
            "title": "Research Paper Title 2",
            "journal": "Another Journal",
            "year": 2021,
            "authors": ["John Doe"]
        }
    ]
}
