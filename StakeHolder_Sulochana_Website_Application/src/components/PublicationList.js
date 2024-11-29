import React from 'react';
import { usePublication } from './PublicationContext';

const PublicationList = () => {
    const { publications, loading } = usePublication();

    if (loading) return <p>Loading publications...</p>;
    if (publications.length === 0) return <p>No publications available.</p>;

    const groupedByYear = publications.reduce((acc, pub) => {
        const year = pub.year || 'Unknown Year';
        if (!acc[year]) acc[year] = [];
        acc[year].push(pub);
        return acc;
    }, {});

    return (
        <div style={{ width: '70%', padding: '10px' }}>
            <h2>Publications</h2>
            {Object.keys(groupedByYear)
                .sort((a, b) => b - a) // Sort years in descending order
                .map((year) => (
                    <div key={year}>
                        <h3>{year}</h3>
                        <ul>
                            {groupedByYear[year].map((pub, index) => (
                                <li key={index}>
                                    <strong>{pub.title}</strong><br />
                                    Venue: {pub.venue || 'N/A'}<br />
                                    <a href={pub.url} target="_blank" rel="noopener noreferrer">Read More</a>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
        </div>
    );
};

export default PublicationList;
