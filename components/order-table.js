import editOrder from './edit-order';
import updateOrder from './update-order';
import deleteOrder from './delete-order';
import EditOrderTableRow from './edit-order-table-row';
import CartRow from './cart-row';
import { useState, useEffect } from 'react';

export default function OrderTable({
  orders,
  setOrders,
  order,
  reload,
  setReload,
  client,
  setIsLoading,
}) {
  const [edit, setEdit] = useState(false);

  function productMultiplier(product) {
    return product.unitSelected
      ? product.unitratio || (product.price[0] / product.price[1]).toFixed(2)
      : 1;
  }

  let products = order.items;
  let total = products
    .reduce((total, itemString) => {
      let product = JSON.parse(itemString);
      return (
        total +
        (product.editedCart
          ? product.editedCart
          : product.cart * productMultiplier(product)) *
        product.price[product.unitSelected]
      );
    }, 0)
    .toFixed(2);

  const rows = products.map((itemString) => {
    let product = JSON.parse(itemString);
    return edit ? (
      <EditOrderTableRow
        key={product.id}
        product={product}
        setQuantity={(quantity, productID) =>
          editOrder({
            newQuantity: quantity,
            order,
            orders,
            setOrders,
            productID,
          })
        }
      />
    ) : (
      <CartRow key={product.id} product={product} />
    );
  });

  return (
    <div>
      <table className="table">
        <thead>
          <tr>
            <th colSpan={edit ? 5 : 4}>
              {edit ? (
                <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={(e) => {
                      e.preventDefault();
                      updateOrder({ order, orders, setIsLoading, client });
                      setEdit(false);
                    }}
                  >
                    Save Order
                  </button>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={(e) => {
                      e.preventDefault();
                      deleteOrder(order.id, client, reload, setReload);
                      setEdit(false);
                      setReload(true);
                    }}
                  >
                    Delete Order
                  </button>
                </div>
              ) : (
                order.status != 'completed' && (
                  <button 
                    className="btn btn-secondary btn-sm"
                    onClick={() => setEdit(true)}
                  >
                    Edit Order
                  </button>
                )
              )}
            </th>
          </tr>
          <tr>
            <th>Name</th>
            <th>Quantity Desired</th>
            {edit && <th>New Quantity</th>}
            <th>Price</th>
            <th>Total Price</th>
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </table>
      
      <div style={{ 
        background: 'var(--color-bg-secondary)', 
        padding: 'var(--spacing-md)', 
        borderRadius: 'var(--radius-md)',
        marginTop: 'var(--spacing-md)'
      }}>
        <p className="font-bold" style={{ margin: 0 }}>
          Order total: <span className="text-primary">${total}</span>
        </p>
        {order.notes && (
          <p className="text-secondary" style={{ margin: 'var(--spacing-sm) 0 0 0' }}>
            <span className="font-medium">Note:</span> {order.notes}
          </p>
        )}
      </div>
    </div>
  );
}