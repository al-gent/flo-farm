import { useState, useEffect } from 'react';
import emailConfirmed from './emailConfirmed';
import FormattedDate from '../components/formatted-date';
import OrderTable from '../components/order-table';
import updateOrderStatus from './update-order-status';
import { PDFDownloadLink } from '@react-pdf/renderer';
import InvoiceTemplate from '../pages/invoice-template/[slug]';

export default function ReviewOrders({ client, isLoading, setIsLoading }) {
  const [orders, setOrders] = useState([]);
  const [reload, setReload] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const url = `/api/get-orders?client=${encodeURIComponent(client)}`;
    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        setOrders(data);
        setIsLoading(false);
      })
      .catch((error) => console.error('Error:', error));
  }, [reload]);

  return (
    <>
      <div className="container">
        {!isLoading && orders.length === 0 ? (
          <h1>No New Orders</h1>
        ) : (
          <h1>New Orders</h1>
        )}
        {orders.map(
          (order) => (
            console.log(order),
            (
              <div className="card" key={order.id} style={{ marginBottom: '1.5rem' }}>
                <h2>
                  {order.name} Order #{order.id}
                </h2>
                <FormattedDate date={order.date} />
                <a
                  href={`/invoice-template/${order.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <button className="btn btn-secondary btn-sm">Generate Invoice</button>
                </a>
                <OrderTable
                  client={client}
                  orders={orders}
                  setOrders={setOrders}
                  order={order}
                  reload={reload}
                  setReload={setReload}
                  setIsLoading={setIsLoading}
                />
                <p>
                  Order status:
                  <select
                    className="form-select"
                    style={{ width: 'auto', marginLeft: '0.5rem' }}
                    value={order.status}
                    onChange={(e) =>
                      updateOrderStatus({
                        orders: orders,
                        setOrders: setOrders,
                        orderID: order.id,
                        status: e.target.value,
                        client: client,
                        setIsLoading: setIsLoading,
                        setReload: setReload,
                        reload: reload,
                      })
                    }
                  >
                    <option value="pending">Pending</option>
                    <option value="edited">Edited</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="completed">Completed</option>
                  </select>
                </p>
              </div>
            )
          ),
        )}
      </div>
    </>
  );
}