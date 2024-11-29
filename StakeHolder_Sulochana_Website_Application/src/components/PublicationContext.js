import React, { createContext, useContext, useState } from 'react';

const PublicationContext = createContext();

export const PublicationProvider = ({ children }) => {
    // Updated HOD details
    const [hodDetails] = useState({
        name: 'Dr. Sai Anirudh K',
        dblpId: '166/2399',
        googleScholarId: 'ds5hIzoAAAAJ',
    });

    const [scholars] = useState([
        { name: 'Researcher A', dblpId: 'dblp001', googleScholarId: 'scholar001' },
        { name: 'Researcher B', dblpId: 'dblp002', googleScholarId: 'scholar002' },
        { name: 'Researcher C', dblpId: 'dblp003', googleScholarId: 'scholar003' },
    ]);

    const [publications, setPublications] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchPublications = async (type, identifier) => {
        setLoading(true);
        try {
            let data = [];
            if (type === 'dblpId') {
                data = await fetch(`http://localhost:5501/fetch_dblp_publications?dblpId=${identifier}`).then(res => res.json());
            } else if (type === 'googleScholarId') {
                data = await fetch(`http://localhost:5501/fetch_google_scholar?googleScholarId=${identifier}`).then(res => res.json());
            }
            setPublications(data);
        } catch (error) {
            console.error('Error fetching publications:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <PublicationContext.Provider value={{ hodDetails, scholars, publications, fetchPublications, loading }}>
            {children}
        </PublicationContext.Provider>
    );
};

export const usePublication = () => useContext(PublicationContext);
