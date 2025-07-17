import CartRow from './cart-row-orderSummary';

export default function CartTable({
  products,
  removeFromCart,
  onSubmit,
  custname,
  email,
  notes,
  setCustname,
  setEmail,
  setNotes,
}) {
  if (typeof products[0] == 'string') {
    products = products.map((product) => JSON.parse(product));
  }

  function productMultiplier(product) {
    return product.unitSelected ? product.unitratio : 1;
  }

  let total = products
    .filter((product) => product.cart)
    .reduce((total, product) => {
      return (
        total +
        product.cart *
        productMultiplier(product) *
        product.price[product.unitSelected]
      );
    }, 0)
    .toFixed(2);

  const rows = products
    .filter((product) => product.cart > 0)
    .map((product) => (
      <CartRow
        key={product.id}
        product={product}
        removeFromCart={removeFromCart}
      />
    ));

  return (
    <div className="container-sm">
      <div style={{ overflowX: 'auto', marginBottom: '2rem' }}>
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Quantity Selected</th>
              <th>Price</th>
              <th>Total Price</th>
            </tr>
          </thead>
          <tbody>
            {rows}
          </tbody>
        </table>
      </div>

      <div className="card" style={{ marginBottom: '2rem', textAlign: 'right' }}>
        <p style={{ fontSize: '1.125rem', margin: 0 }}>
          Checkout total: <span className="text-primary font-bold" style={{ fontSize: '1.5rem', marginLeft: '0.5rem' }}>${total}</span>
        </p>
      </div>

      {setCustname && (
        <form className="card">
          <div className="form-group">
            <input
              type="text"
              className="form-input"
              value={custname}
              onChange={(e) => setCustname(e.target.value)}
              required
              placeholder="Name / Organization"
            />
          </div>
          
          <div className="form-group">
            <input
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Email"
            />
          </div>
          
          <div className="form-group">
            <textarea
              className="form-textarea"
              value={notes}
              placeholder="Notes (optional)"
              onChange={(e) => setNotes(e.target.value)}
              rows="3"
            />
          </div>
          
          <button
            className="btn btn-primary btn-lg"
            onClick={(e) => {
              e.preventDefault();
              onSubmit(e);
            }}
            type="submit"
            style={{ width: '100%' }}
          >
            Submit Order
          </button>
        </form>
      )}
    </div>
  );
}