import React, { useState } from 'react';

export default function Contact() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    let formErrors = {};
    if (!name) formErrors.name = 'Name is required';
    if (!email) formErrors.email = 'Email is required';
    if (!message) formErrors.message = 'Message is required';
    setErrors(formErrors);
    return Object.keys(formErrors).length === 0;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (validateForm()) {
      // handle form submission here
      console.log({ name, email, message });
    }
  };

  return (
    <div className="container-sm section">
      <form className="card" onSubmit={handleSubmit}>
        <h2 className="text-center" style={{ marginBottom: '2rem' }}>Contact Us</h2>
        
        <div className="form-group">
          <label className="form-label">Name:</label>
          <input
            type="text"
            className="form-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          {errors.name && <p style={{ color: 'var(--color-error)', fontSize: '0.875rem', marginTop: '0.25rem' }}>{errors.name}</p>}
        </div>
        
        <div className="form-group">
          <label className="form-label">Email:</label>
          <input
            type="email"
            className="form-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {errors.email && <p style={{ color: 'var(--color-error)', fontSize: '0.875rem', marginTop: '0.25rem' }}>{errors.email}</p>}
        </div>
        
        <div className="form-group">
          <label className="form-label">Message:</label>
          <textarea
            className="form-textarea"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows="5"
          />
          {errors.message && <p style={{ color: 'var(--color-error)', fontSize: '0.875rem', marginTop: '0.25rem' }}>{errors.message}</p>}
        </div>
        
        <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
          Submit
        </button>
      </form>
    </div>
  );}