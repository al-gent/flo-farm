import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import EditWholesale from '../components/edit-wholesale';
import ReviewOrders from '../components/review-orders';
import CompletedOrders from './completed-orders';
import TodaysHarvest from './todays-harvest';
import FarmerInfo from './farmerinfo';
import UpdateBuyers from './update-buyers';
import DashboardHelp from './dashboard-help';
import styles from '../styles/dashboard.module.css';
// import AnalyzeSales from './analytics';

export default function Dash({ client, isLoading, setIsLoading }) {
  const [viewEditWholesale, setViewEditWholesale] = useState(false);
  const [viewNewOrders, setViewNewOrders] = useState(false);
  const [viewTodaysHarvest, setViewTodaysHarvest] = useState(false);
  const [viewCompleted, setViewCompleted] = useState(false);
  const [newOrderCount, setNewOrderCount] = useState('');
  const [viewUpdateBuyers, setViewUpdateBuyers] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [farmInfo, setFarmInfo] = useState(null);
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

  useEffect(() => {
    // Fetch farm info to get the farm name
    fetch(`/api/get-farmer-info?client=${encodeURIComponent(client)}`)
      .then((response) => response.json())
      .then((data) => {
        setFarmInfo(data);
      })
      .catch((error) => console.error('Error fetching farm info:', error));
  }, [client]);

  return (
    <div className={styles.dashboardContainer}>
      <FarmerInfo client={client} setIsLoading={setIsLoading} />
      <div className={styles.buttonGrid}>
        <div
          className={`${styles.dashboardCard} ${styles.newOrders} ${viewNewOrders ? styles.active : ''}`}
          onClick={() => setViewNewOrders(!viewNewOrders)}
        >
          <div className={styles.cardIcon}>📦</div>
          <h3 className={styles.cardTitle}>
            New Orders
            {newOrderCount > 0 && (
              <span className={styles.orderCount}>{newOrderCount}</span>
            )}
          </h3>
          <p className={styles.cardDescription}>View and manage incoming orders</p>
        </div>

        <div
          className={`${styles.dashboardCard} ${styles.editWholesale} ${viewEditWholesale ? styles.active : ''}`}
          onClick={() => setViewEditWholesale(!viewEditWholesale)}
        >
          <div className={styles.cardIcon}>🌾</div>
          <h3 className={styles.cardTitle}>Edit Wholesale</h3>
          <p className={styles.cardDescription}>Update products and prices</p>
        </div>

        <div
          className={`${styles.dashboardCard} ${styles.completedOrders} ${viewCompleted ? styles.active : ''}`}
          onClick={() => setViewCompleted(!viewCompleted)}
        >
          <div className={styles.cardIcon}>✅</div>
          <h3 className={styles.cardTitle}>Completed Orders</h3>
          <p className={styles.cardDescription}>View order history</p>
        </div>

        <div
          className={`${styles.dashboardCard} ${styles.todaysHarvest} ${viewTodaysHarvest ? styles.active : ''}`}
          onClick={() => setViewTodaysHarvest(!viewTodaysHarvest)}
        >
          <div className={styles.cardIcon}>🌱</div>
          <h3 className={styles.cardTitle}>Today's Harvest</h3>
          <p className={styles.cardDescription}>Aggregated harvest list</p>
        </div>

        <div
          className={`${styles.dashboardCard} ${styles.updateBuyers} ${viewUpdateBuyers ? styles.active : ''}`}
          onClick={() => setViewUpdateBuyers(!viewUpdateBuyers)}
        >
          <div className={styles.cardIcon}>📧</div>
          <h3 className={styles.cardTitle}>Update Buyers</h3>
          <p className={styles.cardDescription}>Send availability emails</p>
        </div>
      </div>

      {viewNewOrders && (
        <div className={styles.contentSection}>
          <ReviewOrders
            client={client}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
          />
        </div>
      )}
      
      {viewEditWholesale && (
        <div className={styles.contentSection}>
          <EditWholesale
            client={client}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
          />
        </div>
      )}

      {viewTodaysHarvest && (
        <div className={styles.contentSection}>
          <TodaysHarvest client={client} setIsLoading={setIsLoading} />
        </div>
      )}
      
      {viewCompleted && (
        <div className={styles.contentSection}>
          <CompletedOrders client={client} setIsLoading={setIsLoading} />
        </div>
      )}

      {viewUpdateBuyers && (
        <div className={styles.contentSection}>
          <UpdateBuyers client={client} />
        </div>
      )}

      {/* {viewAnalytics && <AnalyzeSales client={client} />} */}

      {showHelp && (
        <div className={styles.contentSection}>
          <DashboardHelp />
        </div>
      )}
    </div>
  );
}