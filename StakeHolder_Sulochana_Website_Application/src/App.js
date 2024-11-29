import React from 'react';
import { PublicationProvider } from './components/PublicationContext';
import ScholarDetails from './components/ScholarDetails';
import PublicationList from './components/PublicationList';


const App = () => {
    return (
        <PublicationProvider>
            <div style={{ display: 'flex', height: '100vh' }}>
                <ScholarDetails />
                <PublicationList />
            </div>
        </PublicationProvider>
    );
};

export default App;
