import React, { useState } from 'react';
import { useCookies } from 'react-cookie';
import Dash from '../components/dash';
import DashboardHelp from '../components/dashboard-help';

export default function SignUp() {
  const [isLoading, setIsLoading] = useState(true);
  const [farmCode, setFarmCode] = useState('');
  const [pin, setPin] = useState('');
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [farmName, setFarmName] = useState('');
  const [favVeg, setFavVeg] = useState('');
  const [phone, setPhone] = useState('');
  const [isCred, setIsCred] = useState(false);
  const [farmerAdded, setFarmerAdded] = useState(false);
  const [farmCodeTaken, setFarmCodeTaken] = useState(false);
  const [cookie, setCookie] = useCookies(['user']);

  const isFarmCodeTaken = (e) => {
    e.preventDefault();
    fetch('/api/is-farmcode-taken', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(farmCode),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data) => {
        setFarmCodeTaken(data.exists);
      });
  };

  const addFarmer = (e) => {
    e.preventDefault();
    fetch('/api/add-farmer', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        farmName,
        farmCode,
        pin,
        firstName,
        email,
        phone,
        favVeg,
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data) => {
        console.log('data from .then', data);
        setFarmerAdded(data.farmerAdded);
        setCookie(
          'user',
          JSON.stringify({
            exists: true,
            farmcode: data.props.farmCode,
            pin: data.props.pin,
          }),
          {
            path: '/',
            expires: new Date(Date.now() + 31536000000), // 1 year in the future
            sameSite: true,
          },
        );
      });
  };

  return (
    <div className="container" style={{ marginTop: 'var(--spacing-2xl)' }}>
      {farmerAdded ? (
        <div>
          <div className="card text-center" style={{ marginBottom: 'var(--spacing-2xl)' }}>
            <h3 className="text-primary">Nice work, {firstName}! Your account has been created.</h3>
            <p className="text-secondary" style={{ fontSize: 'var(--font-size-lg)' }}>
              The first thing you should do is click 'Edit Wholesale' and add the
              produce you have available.
            </p>
          </div>
          <Dash
            client={farmCode}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
          />
          <DashboardHelp />
        </div>
      ) : (
        <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h1 className="text-center" style={{ marginBottom: 'var(--spacing-2xl)' }}>
            Farmer Sign Up
          </h1>
          <form onSubmit={addFarmer}>
            <div className="form-group">
              <label className="form-label">Farm Name</label>
              <input
                className="form-input"
                type="text"
                value={farmName}
                onChange={(e) => setFarmName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Farmcode</label>
              <input
                className="form-input"
                onBlur={isFarmCodeTaken}
                type="text"
                value={farmCode}
                onChange={(e) => setFarmCode(e.target.value.toLowerCase())}
                required
                style={{ textTransform: 'lowercase' }}
              />
              <small className="text-secondary" style={{ display: 'block', marginTop: '0.5rem' }}>
                Your farmcode should be a short sequence of letters. Buyers will
                access your produce list by entering the farmcode after the
                website name. eg: flo.farm/yourfarmcode
              </small>
              <small className="text-secondary" style={{ display: 'block', marginTop: '0.25rem' }}>
                For example, if your farm name is Greenbush Growing Cooperative,
                your farmcode could be ggc or greenbush
              </small>
              {farmCodeTaken && (
                <p style={{ color: 'var(--color-error)', marginTop: '0.5rem' }}>
                  This farmcode is already taken! Please select a different one
                </p>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">PIN</label>
              <input
                className="form-input"
                type="text"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                required
                maxLength="6"
              />
              <small className="text-secondary" style={{ display: 'block', marginTop: '0.5rem' }}>
                Your pin should be a short sequence of numbers. You'll use this to
                view your orders and update what produce is available.
              </small>
            </div>

            <div className="form-group">
              <label className="form-label">First name</label>
              <input
                className="form-input"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                className="form-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <small className="text-secondary" style={{ display: 'block', marginTop: '0.5rem' }}>
                Notifications go here when orders are placed.
              </small>
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                className="form-input"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Your favorite vegetable</label>
              <input
                className="form-input"
                type="text"
                value={favVeg}
                onChange={(e) => setFavVeg(e.target.value)}
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary btn-lg" 
              style={{ width: '100%', marginTop: 'var(--spacing-lg)' }}
            >
              Sign Up
            </button>
          </form>
        </div>
      )}
    </div>
  );
}