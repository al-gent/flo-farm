import React, { useState, useEffect } from 'react';

export default function EditRow({
  productName,
  setProductName,
  quantity,
  setQuantity,
  unit,
  setUnit,
  unit2,
  setUnit2,
  price,
  setPrice,
  price2,
  setPrice2,
  unitRatio,
  setUnitRatio,
  invalidQuant,
}) {
  return (
    <>
      <tr>
        <td>
          <input
            className="form-input"
            style={{ width: '150px' }}
            type="text"
            value={productName}
            placeholder="Product Name"
            onChange={(e) => {
              setProductName(e.target.value);
            }}
          />
        </td>
        <td>
          <input
            className="form-input"
            style={{ width: '80px' }}
            type="number"
            value={quantity}
            placeholder="Quant"
            onChange={(e) => {
              setQuantity(e.target.value);
            }}
          />
        </td>
        <td>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              className="form-input"
              style={{ width: '80px' }}
              type="number"
              step="0.01"
              placeholder="price"
              value={price}
              onChange={(e) => {
                setPrice(e.target.value);
              }}
            />
            <input
              className="form-input"
              style={{ width: '80px' }}
              type="text"
              placeholder="unit"
              value={unit}
              onChange={(e) => {
                setUnit(e.target.value);
              }}
            />
          </div>
        </td>
        <td>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              className="form-input"
              style={{ width: '80px' }}
              type="number"
              step="0.01"
              placeholder="price"
              value={price2}
              onChange={(e) => {
                setPrice2(e.target.value);
              }}
            />
            <input
              className="form-input"
              style={{ width: '80px' }}
              type="text"
              placeholder="unit"
              value={unit2}
              onChange={(e) => {
                setUnit2(e.target.value);
              }}
            />
          </div>
        </td>
      </tr>
      {invalidQuant && (
        <tr>
          <td colSpan={4}>
            <p style={{ color: 'var(--color-error)', margin: '0.5rem 0' }}>
              This quantity is invalid
            </p>
          </td>
        </tr>
      )}
      {unit2 && (
        <tr>
          <td colSpan={2}></td>
          <td colSpan={2}>
            <input
              className="form-input"
              type="text"
              placeholder="unit ratio"
              value={unitRatio}
              onChange={(e) => {
                setUnitRatio(e.target.value);
              }}
            />
          </td>
        </tr>
      )}
    </>
  );
}