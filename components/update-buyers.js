import { renderToString } from 'react-dom/server';
import WholesaleTable from './wholesale-table';
import React, { useState, useEffect } from 'react';
import sendEmail from './send-update-email';

export default function UpdateBuyers({ client }) {
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [farm, setFarm] = useState({});
  const [emails, setEmails] = useState([]);
  const [enterEmail, setEnterEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [emailText, setEmailText] = useState('');
  const [emailsSent, setEmailsSent] = useState([]);
  const [playByPlay, setPlayByPlay] = useState('');

  useEffect(() => {
    setIsLoading(true);
    fetch(`/api/data?client=${encodeURIComponent(client)}`)
      .then((response) => response.json())
      .then((data) => {
        setProducts(data);
      })
      .catch((error) => console.error('Error:', error));

    fetch(`/api/get-farmer-info?client=${encodeURIComponent(client)}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.text();
      })
      .then((data) => {
        setFarm(JSON.parse(data));
        setIsLoading(false);
      })
      .catch((error) => {
        console.error('Error', error);
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    fetch(`/api/get-emails?client=${encodeURIComponent(client)}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.text();
      })
      .then((data) => {
        setEmails(JSON.parse(data));
        setIsLoading(false);
      })
      .catch((error) => {
        console.error('Error', error);
        setIsLoading(false);
      });
  }, [emails]);

  useEffect(() => {
    if (farm) {
      setSubject(`Produce Available from ${farm.farmname}`);
    }
  }, [farm]);

  function addEmail(e, email) {
    e.preventDefault();
    fetch(`/api/add-email?client=${encodeURIComponent(client)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((response) => {
        console.log(response);
      })
      .then((response) => setIsLoading(false))
      .catch((error) => console.error('Error:', error));
  }

  function deleteEmail(e, email) {
    e.preventDefault();
    fetch(`/api/remove-email?client=${encodeURIComponent(client)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((response) => {
        console.log(response);
      })
      .then((response) => setIsLoading(false))
      .catch((error) => console.error('Error:', error));
  }

  function emailCheckBox(email, index) {
    if (!email) return;
    else
      return (
        <div key={index} style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 'var(--spacing-sm)',
          marginBottom: 'var(--spacing-sm)'
        }}>
          <input
            type="checkbox"
            id={email}
            name="email"
            value={email}
            defaultChecked
          />
          <label htmlFor={email} style={{ flex: 1 }}>{email}</label>
          <button
            className="btn btn-ghost btn-sm"
            onClick={(e) => {
              deleteEmail(e, email);
              setEmails([...emails, email]);
            }}
          >
            Remove
          </button>
        </div>
      );
  }

  const emailBodyHTML = renderToString(
    <div>
      <p>{emailText}</p>
      <WholesaleTable products={products} farmName={farm.farmname} />
      <p>
        <a href={`http://www.adamlgent.com/${farm.farmcode}`}>Order now </a>
      </p>
    </div>,
  );

  async function handleEmailSending(e) {
    e.preventDefault();
    const form = e.target;
    const checkboxes = form.elements.email;
    const checkedEmails = [];

    for (let i = 0; i < checkboxes.length; i++) {
      if (checkboxes[i].checked) {
        checkedEmails.push(checkboxes[i].value);
      }
    }

    console.log('sending emails to', checkedEmails);
    for (const email of checkedEmails) {
      setPlayByPlay(`sending email to ${email}`);
      const templateParams = {
        subject: subject,
        toEmail: email,
        fromEmail: farm.email,
        fromName: farm.farmname,
        emailBody: emailBodyHTML,
      };
      try {
        await sendEmail(templateParams);
        setEmailsSent((currentEmailsSent) => [...currentEmailsSent, email]);
      } catch (error) {
        console.error('Failed to send email to', email, error);
        setPlayByPlay(`Failed to send email to ${email}`);
      }
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
    setPlayByPlay('');
  }

  return (
    <div className="card">
      {emailsSent.length > 0 ? (
        <div className="text-center">
          {playByPlay ? (
            <h3 className="text-primary">{playByPlay}</h3>
          ) : (
            <h1 className="text-success">Emails successfully sent</h1>
          )}
          <ul style={{ listStyle: 'none', padding: 0, marginTop: 'var(--spacing-lg)' }}>
            {emailsSent.map((email, index) => (
              <li key={index} className="badge badge-success" style={{ margin: '0.25rem' }}>
                {email}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div>
          <h2 style={{ marginBottom: 'var(--spacing-xl)' }}>Update Buyers</h2>
          
          <div className="form-group">
            <label className="form-label">Subject line</label>
            <input
              className="form-input"
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Message</label>
            <textarea
              className="form-textarea"
              value={emailText}
              onChange={(e) => setEmailText(e.target.value)}
              rows="3"
            />
          </div>
          
          <div style={{ 
            background: 'var(--color-bg-secondary)', 
            padding: 'var(--spacing-lg)', 
            borderRadius: 'var(--radius-md)',
            marginBottom: 'var(--spacing-xl)'
          }}>
            <h4 style={{ marginBottom: 'var(--spacing-md)' }}>Preview:</h4>
            <WholesaleTable products={products} farmName={farm.farmname} />
          </div>
          
          <h3 style={{ marginBottom: 'var(--spacing-lg)' }}>Which buyers?</h3>
          
          <form onSubmit={(e) => handleEmailSending(e)}>
            <div style={{ 
              background: 'var(--color-bg-secondary)', 
              padding: 'var(--spacing-lg)', 
              borderRadius: 'var(--radius-md)',
              marginBottom: 'var(--spacing-lg)'
            }}>
              {emails.map((email, index) => emailCheckBox(email, index))}
              
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 'var(--spacing-sm)',
                marginTop: 'var(--spacing-md)',
                paddingTop: 'var(--spacing-md)',
                borderTop: '1px solid var(--color-border-light)'
              }}>
                <input
                  type="checkbox"
                  value={enterEmail}
                  name="email"
                  checked={enterEmail !== ''}
                  readOnly
                />
                <input
                  className="form-input"
                  type="email"
                  value={enterEmail}
                  onChange={(e) => setEnterEmail(e.target.value)}
                  placeholder="Add new email"
                  style={{ flex: 1 }}
                />
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={(e) => {
                    setEmails([...emails, enterEmail]);
                    addEmail(e, enterEmail);
                    setEnterEmail('');
                  }}
                  disabled={!enterEmail}
                >
                  Add Email
                </button>
              </div>
            </div>
            
            <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }}>
              Send Update to Selected Buyers
            </button>
          </form>
        </div>
      )}
    </div>
  );
}