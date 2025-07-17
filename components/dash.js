import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import EditWholesale from '../components/edit-wholesale';
import ReviewOrders from '../components/review-orders';
import CompletedOrders from './completed-orders';
import TodaysHarvest from './todays-harvest';
import FarmerInfo from './farmerinfo';
import UpdateBuyers from './update-buyers';
// import AnalyzeSales from './analytics';

export default function Dash({ client, isLoading, setIsLoading }) {
  const [viewEditWholesale, setViewEditWholesale] = useState(false);
  const [viewNewOrders, setViewNewOrders] = useState(false);
  const [viewTodaysHarvest, setViewTodaysHarvest] = useState(false);
  const [viewCompleted, setViewCompleted] = useState(false);
  const [newOrderCount, setNewOrderCount] = useState('');
  const [viewUpdateBuyers, setViewUpdateBuyers] = useState(false);
  // const [viewAnalytics, setViewAnalytics] = useState(false);

  useEffect(() => {
    const url = `/api/count-new-orders?client=${encodeURIComponent(client)}`;
    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        setNewOrderCount(data);
      })
      .catch((error) => console.error('Error:', error));
  }, [viewNewOrders, viewCompleted]);

  return (
    <div className="container" style={{ marginTop: '2rem' }}>
      <FarmerInfo client={client} setIsLoading={setIsLoading} />
      
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
        <button
          className={viewNewOrders ? "btn btn-primary" : "btn btn-secondary"}
          onClick={() => setViewNewOrders(!viewNewOrders)}
        >
          {viewNewOrders
            ? `Hide New Orders`
            : `${newOrderCount} New Order${newOrderCount == 1 ? '' : 's'}`}
        </button>
        <button
          className={viewEditWholesale ? "btn btn-primary" : "btn btn-secondary"}
          onClick={() => setViewEditWholesale(!viewEditWholesale)}
        >
          {viewEditWholesale ? `Hide Edit Wholesale` : `Edit Wholesale`}
        </button>
      </div>

      {viewNewOrders && (
        <ReviewOrders
          client={client}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
        />
      )}
      
      {viewEditWholesale && (
        <EditWholesale
          client={client}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
        />
      )}

      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
        <button
          className={viewCompleted ? "btn btn-primary" : "btn btn-secondary"}
          onClick={() => setViewCompleted(!viewCompleted)}
        >
          {viewCompleted ? `Hide Completed Orders` : `Completed Orders`}
        </button>
        <button
          className={viewTodaysHarvest ? "btn btn-primary" : "btn btn-secondary"}
          onClick={() => setViewTodaysHarvest(!viewTodaysHarvest)}
        >
          {viewTodaysHarvest ? `Hide Today's Harvest` : `Today's Harvest`}
        </button>
      </div>

      {viewTodaysHarvest && (
        <TodaysHarvest client={client} setIsLoading={setIsLoading} />
      )}
      
      {viewCompleted && (
        <CompletedOrders client={client} setIsLoading={setIsLoading} />
      )}

      {/* <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
        <button 
          className={viewAnalytics ? "btn btn-primary" : "btn btn-secondary"}
          onClick={() => setViewAnalytics(!viewAnalytics)}
        >
          {viewAnalytics ? `Hide Analytics` : `Analytics`}
        </button>
      </div> */}

      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
        <button
          className={viewUpdateBuyers ? "btn btn-primary" : "btn btn-secondary"}
          onClick={() => setViewUpdateBuyers(!viewUpdateBuyers)}
        >
          {viewUpdateBuyers ? `Hide Update Buyers` : `Update Buyers`}
        </button>
      </div>

      {viewUpdateBuyers && <UpdateBuyers client={client} />}
      {/* {viewAnalytics && <AnalyzeSales client={client} />} */}
    </div>
  );
}