export default function EditOrderTableRow({ product, setQuantity }) {
  const unitSelected = product.unitSelected;
  let productMultiplier;
  product.unitSelected
    ? (productMultiplier = product.unitratio)
    : (productMultiplier = 1);
  const cart = product.editedCart
    ? product.editedCart * productMultiplier
    : product.cart * productMultiplier;
  console.log(cart);
  const total_price = Math.round(product.cart * product.price[0]).toFixed(2);
  
  return (
    <tr>
      <td>{product.name}</td>
      <td>
        {cart.toFixed(0)} {product.unit[unitSelected]}
      </td>
      <td>
        <input
          className="form-input"
          style={{ width: '80px' }}
          type="number"
          placeholder={cart}
          value={product.editedCart || ''}
          onChange={(e) => {
            setQuantity(e.target.value, product.id);
          }}
        />
      </td>
      <td>${product.price[unitSelected]}</td>
      <td className="font-semibold">${total_price}</td>
    </tr>
  );
}