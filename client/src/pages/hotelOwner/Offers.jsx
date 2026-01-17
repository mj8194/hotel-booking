import React, { useEffect } from 'react';
import ExclusiveOffers from "../components/ExclusiveOffers";

const OffersPage = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="min-h-screen bg-white pt-20">
            {/* Shows full array of offers, no "View All Offers" */}
            <ExclusiveOffers limit={null} />
        </div>
    );
};

export default OffersPage;
