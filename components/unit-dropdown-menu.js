export default function UnitDropdown({
  product,
  setUnitSelected,
  setInvalidQuant,
  setQuantityDesired,
  productMultiplier,
}) {
  if (product.unit.length > 1) {
    return (
      <td>
        <select
          className="form-select"
          style={{ 
            width: 'auto',
            maxWidth: '150px',
            padding: '0.25rem 0.5rem',
            fontSize: '0.875rem'
          }}
          onChange={(e) => {
            setInvalidQuant(false);
            setUnitSelected(e.target.selectedIndex);
            setQuantityDesired('');
          }}
        >
          {product.unit.map((unit, index) => {
            const value = index
              ? Math.round(productMultiplier * product.quantity)
              : Math.round(product.quantity);
            return (
              <option key={unit + index} value={value}>
                {value} {unit}
              </option>
            );
          })}
        </select>
      </td>
    );
  } else {
    return (
      <td>
        {product.quantity} {product.unit}
      </td>
    );
  }
}