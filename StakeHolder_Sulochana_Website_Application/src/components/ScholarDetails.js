import React from 'react';
import { usePublication } from './PublicationContext';

const ScholarDetails = () => {
    const { hodDetails, scholars, fetchPublications } = usePublication();

    return (
        <div style={{ width: '30%', padding: '10px', borderRight: '1px solid #ccc' }}>
            <h1>Department of ComputerScience IIITH</h1>
            <h2>Sortware Engineering Research Center</h2> 
            <h2>Department Scholars</h2>
            <p><strong>Name:</strong> {hodDetails.name}</p>
            <p><strong>DBLP ID:</strong> {hodDetails.dblpId}</p>
            <p><strong>Google Scholar ID:</strong> {hodDetails.googleScholarId}</p>
            <button onClick={() => fetchPublications('dblpId', hodDetails.dblpId)}>Refresh Publications</button>

            <h2>Research Scholars</h2>
            <ul>
                {scholars.map((scholar, index) => (
                    <li key={index} style={{ marginBottom: '10px' }}>
                        <p><strong>Name:</strong> {scholar.name}</p>
                        <p><strong>DBLP ID:</strong> {scholar.dblpId}</p>
                        <p><strong>Google Scholar ID:</strong> {scholar.googleScholarId}</p>
                        
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ScholarDetails;
