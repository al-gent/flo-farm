import React, { useState } from 'react';

export default function DashboardHelp() {
  const [haveQuestions, setHaveQuestions] = useState(false);
  const [viewNew, setViewNew] = useState(false);
  const [viewCompleted, setViewCompleted] = useState(false);
  const [viewEdit, setViewEdit] = useState(false);
  const [viewTH, setViewTH] = useState(false);
  const [viewUpdate, setViewUpdate] = useState(false);

  return (
    <div style={{ marginTop: 'var(--spacing-2xl)', textAlign: 'center' }}>
      <button 
        className="btn btn-secondary"
        onClick={(e) => setHaveQuestions(!haveQuestions)}
      >
        {haveQuestions ? 'Hide Help' : 'Need Help?'}
      </button>

      {haveQuestions && (
        <div className="card" style={{ marginTop: 'var(--spacing-lg)', textAlign: 'left' }}>
          <h3 className="text-center" style={{ marginBottom: 'var(--spacing-lg)' }}>
            Dashboard Guide
          </h3>
          <p className="text-secondary text-center" style={{ marginBottom: 'var(--spacing-lg)' }}>
            Click any section below to learn more
          </p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
            <div>
              <button 
                className={viewNew ? "btn btn-primary btn-sm" : "btn btn-ghost btn-sm"}
                onClick={(e) => setViewNew(!viewNew)}
              >
                New Orders {viewNew ? '−' : '+'}
              </button>
              {viewNew && (
                <div style={{ 
                  padding: 'var(--spacing-md)', 
                  marginTop: 'var(--spacing-sm)',
                  background: 'var(--color-bg-secondary)',
                  borderRadius: 'var(--radius-md)'
                }}>
                  <p><strong>View and manage incoming orders:</strong></p>
                  <ul style={{ marginLeft: 'var(--spacing-lg)' }}>
                    <li>All pending orders appear here in real-time</li>
                    <li>Click "Edit Order" to adjust quantities before confirming</li>
                    <li>Mark as "Confirmed" to automatically email the customer</li>
                    <li>Mark as "Completed" when the order is delivered</li>
                  </ul>
                </div>
              )}
            </div>

            <div>
              <button 
                className={viewEdit ? "btn btn-primary btn-sm" : "btn btn-ghost btn-sm"}
                onClick={(e) => setViewEdit(!viewEdit)}
              >
                Edit Wholesale {viewEdit ? '−' : '+'}
              </button>
              {viewEdit && (
                <div style={{ 
                  padding: 'var(--spacing-md)', 
                  marginTop: 'var(--spacing-sm)',
                  background: 'var(--color-bg-secondary)',
                  borderRadius: 'var(--radius-md)'
                }}>
                  <p><strong>Manage your product catalog:</strong></p>
                  <ul style={{ marginLeft: 'var(--spacing-lg)' }}>
                    <li>Add new products or remove old ones</li>
                    <li>Update quantities as you harvest</li>
                    <li>Adjust prices anytime</li>
                    <li>Add a farmer's note that customers will see</li>
                    <li>Set dual pricing (e.g., $2/bunch OR $8/pound)</li>
                  </ul>
                  <p className="text-secondary" style={{ marginTop: 'var(--spacing-sm)', fontStyle: 'italic' }}>
                    Tip: Quantities are always tracked in your primary unit
                  </p>
                </div>
              )}
            </div>

            <div>
              <button 
                className={viewCompleted ? "btn btn-primary btn-sm" : "btn btn-ghost btn-sm"}
                onClick={(e) => setViewCompleted(!viewCompleted)}
              >
                Completed Orders {viewCompleted ? '−' : '+'}
              </button>
              {viewCompleted && (
                <div style={{ 
                  padding: 'var(--spacing-md)', 
                  marginTop: 'var(--spacing-sm)',
                  background: 'var(--color-bg-secondary)',
                  borderRadius: 'var(--radius-md)'
                }}>
                  <p><strong>Order history and records:</strong></p>
                  <ul style={{ marginLeft: 'var(--spacing-lg)' }}>
                    <li>View all past orders for your records</li>
                    <li>Generate invoices for any order</li>
                    <li>Change order status if needed</li>
                  </ul>
                </div>
              )}
            </div>

            <div>
              <button 
                className={viewTH ? "btn btn-primary btn-sm" : "btn btn-ghost btn-sm"}
                onClick={(e) => setViewTH(!viewTH)}
              >
                Today's Harvest {viewTH ? '−' : '+'}
              </button>
              {viewTH && (
                <div style={{ 
                  padding: 'var(--spacing-md)', 
                  marginTop: 'var(--spacing-sm)',
                  background: 'var(--color-bg-secondary)',
                  borderRadius: 'var(--radius-md)'
                }}>
                  <p><strong>Simplified harvest list:</strong></p>
                  <ul style={{ marginLeft: 'var(--spacing-lg)' }}>
                    <li>See all items from pending orders in one place</li>
                    <li>Items are totaled across all orders</li>
                    <li>Shows today's potential revenue</li>
                  </ul>
                  <p className="text-secondary" style={{ marginTop: 'var(--spacing-sm)', fontStyle: 'italic' }}>
                    Perfect for printing and taking to the field!
                  </p>
                </div>
              )}
            </div>

            <div>
              <button 
                className={viewUpdate ? "btn btn-primary btn-sm" : "btn btn-ghost btn-sm"}
                onClick={(e) => setViewUpdate(!viewUpdate)}
              >
                Update Buyers {viewUpdate ? '−' : '+'}
              </button>
              {viewUpdate && (
                <div style={{ 
                  padding: 'var(--spacing-md)', 
                  marginTop: 'var(--spacing-sm)',
                  background: 'var(--color-bg-secondary)',
                  borderRadius: 'var(--radius-md)'
                }}>
                  <p><strong>Email your customer list:</strong></p>
                  <ul style={{ marginLeft: 'var(--spacing-lg)' }}>
                    <li>Send availability updates to your email list</li>
                    <li>Customize the subject line and message</li>
                    <li>Include your current product list automatically</li>
                    <li>Add or remove email addresses anytime</li>
                    <li>Select which customers to notify</li>
                  </ul>
                  <p className="text-secondary" style={{ marginTop: 'var(--spacing-sm)', fontStyle: 'italic' }}>
                    Great for weekly availability announcements!
                  </p>
                </div>
              )}
            </div>
          </div>

          <div style={{ 
            marginTop: 'var(--spacing-xl)', 
            paddingTop: 'var(--spacing-lg)',
            borderTop: '1px solid var(--color-border-light)',
            textAlign: 'center'
          }}>
            <p className="text-secondary">Still need help?</p>
            <a href="mailto:94gent@gmail.com?subject=flo.farm Help Request">
              <button className="btn btn-primary">Contact Support</button>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}