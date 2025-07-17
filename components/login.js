import React, { useState } from 'react';
import { useCookies } from 'react-cookie';

export default function Login({
  farmCode,
  setFarmCode,
  pin,
  setPin,
  isCred,
  setIsCred,
}) {
  const [cookie, setCookie, removeCookie] = useCookies(['user']);
  const [staySignedIn, setStaySignedIn] = useState(true);

  const logout = (e) => {
    removeCookie('user', { path: '/' });
    location.reload();
  };

  const checkCredential = (e) => {
    e.preventDefault();
    fetch('/api/check-credentials', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ farmCode, pin }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data) => {
        setIsCred(data.exists);
        if (data.exists && staySignedIn) {
          console.log('setting Cookie');
          setCookie('user', JSON.stringify(data), {
            path: '/',
            expires: new Date(Date.now() + 31536000000), // 1 year in the future
            sameSite: true,
          });
        }
      });
  };

  return (
    <div className="container-sm" style={{ marginTop: 'var(--spacing-3xl)' }}>
      <div className="card text-center" style={{ maxWidth: '400px', margin: '0 auto' }}>
        {isCred === false && (
          <div style={{ marginBottom: 'var(--spacing-lg)' }}>
            <h2 style={{ color: 'var(--color-error)', marginBottom: 'var(--spacing-md)' }}>
              Farmcode / pin incorrect.
            </h2>
            <p className="text-secondary">
              Please try again or{' '}
              <a href="/signup" className="text-primary font-semibold">
                signup
              </a>
            </p>
          </div>
        )}
        
        {isCred ? (
          <button className="btn btn-secondary" onClick={logout}>
            Logout
          </button>
        ) : (
          <form onSubmit={checkCredential}>
            <h2 style={{ marginBottom: 'var(--spacing-xl)' }}>Farmer Login</h2>
            
            <div className="form-group">
              <label className="form-label">Farmcode:</label>
              <input
                className="form-input"
                type="text"
                value={farmCode}
                onChange={(e) => setFarmCode(e.target.value)}
                required
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">PIN:</label>
              <input
                className="form-input"
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                required
              />
            </div>
            
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 'var(--spacing-sm)',
              marginBottom: 'var(--spacing-lg)'
            }}>
              <input
                type="checkbox"
                id="staySignedIn"
                name="staySignedIn"
                checked={staySignedIn}
                onChange={(e) => setStaySignedIn(e.target.checked)}
                style={{ width: 'auto', margin: 0 }}
              />
              <label htmlFor="staySignedIn" style={{ margin: 0 }}>
                Stay signed in
              </label>
            </div>
            
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
              Login
            </button>
          </form>
        )}
      </div>
    </div>
  );
}