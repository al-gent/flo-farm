import Image from 'next/image';
import Head from 'next/head';
import Link from 'next/link';
import styles from '/styles/demo.module.css';
import OrderForm from '../components/orderForm';
import { useState } from 'react';
import Layout from '../components/Layout';
import Dash from '../components/dash';
import DashboardHelp from '../components/dashboard-help';

export default function Homepage() {
  const [isLoading, setIsLoading] = useState(false);
  const [showDemo, setShowDemo] = useState(false);

  return (
    <div className={styles.spreadCards}>
      <Head>
        <title>flo.farm - Wholesale Produce Management for Small Farms</title>
        <meta name="description" content="Streamline your farm's wholesale operations with inventory tracking, order management, and automated invoicing." />
      </Head>
      
      {/* Hero Section */}
      <div className={styles.imAnApp}>
        <h1>Meet Flo 🌱</h1>
        <h2>Your digital farmhand for wholesale produce management</h2>
        
        <div className={styles.heroDescription}>
          <p>Designed specifically for small farms selling wholesale produce, Flo simplifies your operations so you can focus on what you do best - growing great food.</p>
        </div>

        {/* Features Grid */}
        <div className={styles.featuresSection}>
          <h3>What Flo Can Do For Your Farm</h3>
          <div className={styles.featuresGrid}>
            <div className={styles.feature}>
              <h4>📦 Inventory Management</h4>
              <p>Track available quantities in real-time. Updates automatically when orders come in.</p>
            </div>
            <div className={styles.feature}>
              <h4>🛒 Professional Order Forms</h4>
              <p>Give your wholesale customers a clean, mobile-friendly ordering experience.</p>
            </div>
            <div className={styles.feature}>
              <h4>📧 Automated Communications</h4>
              <p>Instant order notifications to farmers. Automatic invoices to customers.</p>
            </div>
            <div className={styles.feature}>
              <h4>🌾 Smart Harvest Lists</h4>
              <p>All orders aggregated into one harvest list. Know exactly what to pick.</p>
            </div>
            <div className={styles.feature}>
              <h4>📊 Sales Analytics</h4>
              <p>Visualize buying trends with graphs and tables to make informed decisions.</p>
            </div>
            <div className={styles.feature}>
              <h4>⚡ Save Time</h4>
              <p>Automate the boring stuff so you can spend more time in the field.</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className={styles.ctaSection}>
          <h3>Ready to streamline your farm's wholesale operation?</h3>
          <div className={styles.ctaButtons}>
            <Link href="./signup">
              <button className={styles.primaryButton}>Get Started</button>
            </Link>
            <a href="mailto:94gent@gmail.com?subject=Tell me more about flo.farm">
              <button className={styles.secondaryButton}>Contact Adam</button>
            </a>
          </div>
          <button 
            onClick={() => setShowDemo(!showDemo)}
            className={styles.demoToggle}
          >
            {showDemo ? 'Hide' : 'Try'} Live Demo ↓
          </button>
        </div>
      </div>

      {/* Demo Section - Collapsible */}
      {showDemo && (
        <>
          <div className={styles.demoSection}>
            <div className={styles.orderFormComments}>
              <h2>Customer Ordering Experience</h2>
              <p>This is what your wholesale buyers will see. Try making an order!</p>
              <ul>
                <li>Inventory updates automatically when orders are placed</li>
                <li>Flexible units - sell by the pound, pint, bunch, or case</li>
                <li>Order notifications sent instantly to farmers</li>
              </ul>
            </div>
            
            <div className={styles.customerInterface}>
              <OrderForm
                client="demo"
                isLoading={isLoading}
                setIsLoading={setIsLoading}
                farmer_email="94gent@gmail.com"
              />
            </div>
          </div>

          <div className={styles.dashboardDemo}>
            <h2>Farmer Dashboard</h2>
            <p>Explore the tools that make managing wholesale orders simple:</p>
            <div className={styles.imAnApp}>
              <Dash client="demo" isLoading={isLoading} setIsLoading={setIsLoading} />
              <DashboardHelp />
            </div>
          </div>
        </>
      )}

      {/* Footer */}
      <footer className={styles.footer}>
        <p>Currently helping one farm with big dreams for many more 🌻</p>
        <p>Built with ❤️ for farmers by <a href="https://adamlgent.com">Adam</a></p>
      </footer>
    </div>
  );
}