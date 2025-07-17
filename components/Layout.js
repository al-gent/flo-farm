import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';

export default function Layout({ children, isLoading, props, siteTitle }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Head>
        <title>{siteTitle}</title>
      </Head>
      
      <header style={{ 
        background: 'var(--color-bg-secondary)', 
        padding: 'var(--spacing-lg) 0',
        borderBottom: '1px solid var(--color-border-light)'
      }}>
        <div className="container">
          <nav style={{ marginBottom: 'var(--spacing-md)' }}>
            {props}
          </nav>
          <div className="text-center">
            <Image
              priority
              src="/images/Untitled.png"
              height={150}
              width={116}
              alt="Logo"
              style={{ height: 'auto', maxWidth: '150px' }}
            />
          </div>
        </div>
      </header>
      
      <main style={{ flex: 1, padding: 'var(--spacing-2xl) 0' }}>
        <div className="container">
          {children}
        </div>
      </main>
      
      <footer style={{ 
        background: 'var(--color-bg-secondary)', 
        padding: 'var(--spacing-xl) 0',
        borderTop: '1px solid var(--color-border-light)',
        textAlign: 'center'
      }}>
        <div className="container">
          <div style={{ marginBottom: 'var(--spacing-md)' }}>
            <Image
              className={isLoading ? "loading" : ""}
              priority
              src="/images/cabbagelogotransparent.png"
              height={80}
              width={74}
              alt="cabbage logo"
              style={{ 
                height: 'auto', 
                maxWidth: '80px',
                display: isLoading ? 'none' : 'inline-block'
              }}
            />
            {isLoading && <div className="loading" style={{ margin: '0 auto' }}></div>}
          </div>
          <p className="text-secondary">
            Website made with love by{' '}
            <a href="https://github.com/al-gent" className="text-primary">Adam</a>
          </p>
        </div>
      </footer>
    </div>
  );
}