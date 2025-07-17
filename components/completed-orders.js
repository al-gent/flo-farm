import FormattedDate from './formatted-date';
import OrderTable from './order-table';
import { useState, useEffect } from 'react';
import editOrder from './edit-order';
import updateOrder from './update-order';
import deleteOrder from './delete-order';
import updateOrderStatus from './update-order-status';

export default function CompletedOrders({ client, setIsLoading }) {
  const [completedOrders, setCompletedOrders] = useState([]);
  const [reload, setReload] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    const url = `/api/get-completed-orders?client=${encodeURIComponent(
      client,
    )}`;
    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        setCompletedOrders(data);
        setIsLoading(false);
      });
  }, [reload]);

  return (
    <div className="container">
      {completedOrders.length === 0 ? (
        <div className="card text-center" style={{ padding: '3rem' }}>
          <p className="text-secondary">No completed orders yet.</p>
        </div>
      ) : (
        completedOrders.map((order) => (
          <div className="card" key={order.id} style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
              <div>
                <h2 style={{ marginBottom: '0.5rem' }}>
                  {order.name} <span className="text-secondary">Order #{order.id}</span>
                </h2>
                <FormattedDate date={order.date} />
              </div>
              <a
                href={`/invoice-template/${order.id}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <button className="btn btn-secondary btn-sm">
                  Generate Invoice
                </button>
              </a>
            </div>

            <OrderTable
              order={order}
              editOrder={editOrder}
              updateOrder={updateOrder}
              deleteOrder={deleteOrder}
            />

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '1rem' }}>
              <label className="form-label" style={{ margin: 0 }}>
                Order status:
              </label>
              <select
                className="form-select"
                value={order.status}
                onChange={(e) =>
                  updateOrderStatus({
                    orders: completedOrders,
                    setOrders: setCompletedOrders,
                    orderID: order.id,
                    status: e.target.value,
                    client: client,
                    setIsLoading: setIsLoading,
                    setReload: setReload,
                    reload: reload,
                  })
                }
                style={{ width: 'auto' }}
              >
                <option value="pending">Pending</option>
                <option value="edited">Edited</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
              </select>
              <span className={`badge badge-${getStatusBadgeType(order.status)}`}>
                {order.status}
              </span>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

// Helper function for badge colors
function getStatusBadgeType(status) {
  switch (status) {
    case 'completed':
      return 'success';
    case 'confirmed':
      return 'success';
    case 'edited':
      return 'warning';
    case 'pending':
      return 'warning';
    default:
      return 'success';
  }
}