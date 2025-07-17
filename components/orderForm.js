import React, { useState, useEffect } from 'react';
import FarmerNote from './farmer-note';
import styles from '../styles/orderForm.module.css';
import EmailGB from '../components/mailer';
import OrderSummary from './order-summary';
import UnitDropdown from './unit-dropdown-menu';
import CartTable from './cart-table';

function ProductRow({ product, addToCart }) {
  const productMultiplier = product.unitratio
    ? product.unitratio
    : (product.price[0] / product.price[1]).toFixed(2);
  const [unitSelected, setUnitSelected] = useState(0);
  const [invalidQuant, setInvalidQuant] = useState(false);
  const [quantityDesired, setQuantityDesired] = useState('');
  const qAvailable = unitSelected
    ? Math.round(productMultiplier * product.quantity * 2) / 2
    : product.quantity;
  const [quantity, setQuantity] = useState(product.quantity);
  
  let perUnit = product.unit[unitSelected];
  if (perUnit.endsWith('es')) {
    perUnit = perUnit.slice(0, -2);
  } else if (perUnit.endsWith('s')) {
    perUnit = perUnit.slice(0, -1);
  }
  
  return (
    <tr>
      <td>{product.name}</td>
      <UnitDropdown
        product={product}
        unitSelected={unitSelected}
        setUnitSelected={setUnitSelected}
        setInvalidQuant={setInvalidQuant}
        setQuantityDesired={setQuantityDesired}
        productMultiplier={productMultiplier}
      />
      <td>${product.price[unitSelected]}/{perUnit}</td>
      <td>
        {invalidQuant && (
          <span className={styles.errorMessage}>
            Sorry, only {qAvailable} {product.unit[unitSelected]} available
          </span>
        )}
      </td>
      <td>
        <div className={styles.quantityInput}>
          <input
            type="number"
            onSelect={(e) => setInvalidQuant(false)}
            value={quantityDesired}
            placeholder="0"
            onChange={(e) => setQuantityDesired(e.target.value)}
          />
          <button
            className={styles.addButton}
            onClick={(e) => {
              e.preventDefault();
              addToCart({
                product,
                quantityDesired,
                unitSelected,
                quantity,
                setQuantity,
                setQuantityDesired,
                setInvalidQuant,
                qAvailable,
                productMultiplier,
              });
            }}
          >
            Add
          </button>
        </div>
      </td>
    </tr>
  );
}

function ListTable({ products, addToCart }) {
  const rows = products
    .filter((product) => product.quantity > 0)
    .map((product) => (
      <ProductRow key={product.id} product={product} addToCart={addToCart} />
    ));
    
  return (
    <div className={styles.tableWrapper}>
      <table className="table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Quantity Available</th>
            <th>Price</th>
            <th style={{ width: '150px' }}></th>
            <th style={{ width: '150px' }}>Add to Cart</th>
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </table>
    </div>
  );
}

export default function OrderForm({
  client,
  setIsLoading,
  isLoading,
  farmer_email,
}) {
  const [custname, setCustname] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [products, setProducts] = useState([]);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [farmersNote, setFarmersNote] = useState('');
  const [pbp, setpbp] = useState('');
  const [stockErrors, setStockErrors] = useState([]);

  useEffect(() => {
    if (stockErrors.length > 0) {
      alert(`Uh Oh! Someone ordered the ${stockErrors[0].name} you wanted to order! The page will reload so you can see current availability.`);
      window.location.reload();
    }
  }, [stockErrors]);

  useEffect(() => {
    const url = `/api/data?client=${encodeURIComponent(client)}`;
    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        const productsWithCart = data.map((product) => ({
          ...product,
          cart: 0,
        }));
        setProducts(productsWithCart);
        fetch(`/api/farmers-notes?client=${encodeURIComponent(client)}`)
          .then((response) => response.text())
          .then((note) => {
            if (!note) {
              setFarmersNote(null);
            } else {
              setFarmersNote(JSON.parse(note).note);
              setIsLoading(false);
            }
          })
          .catch((error) => console.error('Error at farmers notes:', error));
      })
      .catch((error) => console.error('Error:', error));
  }, []);

  let order = {
    name: custname,
    email: email,
    notes: notes,
    products: products.filter((product) => product.cart > 0),
  };
  
  let productsToUpdate = products.filter((product) => product.cart > 0);

  async function submitOrder(e) {
    e.preventDefault();
    setIsLoading(true);
    try {
      // First fetch call to update quantities
      setpbp('updating quantities...');
      console.log(JSON.stringify(productsToUpdate))
      const updateQResponse = await fetch(`/api/update-quantities`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productsToUpdate),
      });
      
      const updateQData = await updateQResponse.json();
      if (!updateQData.success && updateQData.errors) {
        console.log(updateQData.errors)
        setStockErrors(updateQData.errors)
        console.log(stockErrors)
        return
      }
      
      // Second fetch call to place order
      setpbp('placing order...');
      const placeOrderResponse = await fetch(
        `/api/place-order?client=${encodeURIComponent(client)}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(order),
        },
      );
      
      if (!placeOrderResponse.ok) {
        throw new Error('Network response was not ok for place order');
      }
      
      const placeOrderData = await placeOrderResponse.json();
      console.log(placeOrderData);
      setpbp('sending email...');
      await EmailGB(order, farmer_email);
      setIsLoading(false);
      setOrderPlaced(true);
    } catch (error) {
      console.error('Error:', error);
      setIsLoading(false);
    }
  }

  function addToCart({
    product,
    quantityDesired,
    setQuantityDesired,
    unitSelected,
    quantity,
    setQuantity,
    setInvalidQuant,
    qAvailable,
    productMultiplier,
  }) {
    unitSelected
      ? (productMultiplier = productMultiplier)
      : (productMultiplier = 1);
    const baseUnitQuantityDesired = unitSelected
      ? parseFloat(quantityDesired / productMultiplier)
      : parseFloat(quantityDesired);
    const parsedQuantityAvail = parseFloat(quantity);
    const newQuantity = parseFloat(
      parsedQuantityAvail - baseUnitQuantityDesired,
    );
    const productToAdd = {
      ...product,
      cart: baseUnitQuantityDesired,
      unitSelected: unitSelected,
      quantity: newQuantity,
    };
    
    if (
      isNaN(baseUnitQuantityDesired) ||
      baseUnitQuantityDesired < 0 ||
      parseFloat(qAvailable) < baseUnitQuantityDesired * productMultiplier
    ) {
      setInvalidQuant(true);
      return;
    } else {
      const nextProducts = products.map((p) => {
        if (p.id === product.id) {
          return productToAdd;
        } else {
          return p;
        }
      });
      setProducts(nextProducts);
      setQuantityDesired('');
    }
  }

  function removeFromCart({ product }) {
    const productMultiplier = product.price[0] / product.price[1];
    const quantityToRestore = parseFloat(product.cart);
    const nextProducts = products.map((p) => {
      if (p.id === product.id) {
        return {
          ...p,
          quantity: parseFloat(p.quantity) + quantityToRestore,
          cart: parseFloat(p.cart) - parseFloat(p.cart),
        };
      } else {
        return p;
      }
    });
    setProducts(nextProducts);
  }

  const CartLen = products.filter((product) => product.cart > 0).length;

  return (
    <div className={styles.container}>
      {orderPlaced ? (
        <div className={styles.orderSuccess}>
          <h1>Order Received</h1>
          <OrderSummary order={order} />
        </div>
      ) : (
        <>
          <div className={styles.header}>
            <h1 className={styles.title}>Wholesale Order Form</h1>
            {farmersNote && <FarmerNote farmersNote={farmersNote} />}
          </div>
          
          <ListTable
            products={products}
            addToCart={addToCart}
            farmersNote={farmersNote}
          />
          
          {CartLen === 0 ? (
            <h2 className={styles.emptyCart}>Cart is empty</h2>
          ) : (
            <div className={styles.cartSection}>
              <h3 className={styles.cartTitle}>Your Cart</h3>
              <CartTable
                products={products}
                removeFromCart={removeFromCart}
                onSubmit={submitOrder}
                custname={custname}
                email={email}
                notes={notes}
                setCustname={setCustname}
                setEmail={setEmail}
                setNotes={setNotes}
              />
              {isLoading && <p className={styles.loadingText}>{pbp}</p>}
            </div>
          )}
        </>
      )}
    </div>
  );
}