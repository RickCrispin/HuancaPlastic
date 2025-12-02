import React, { useState } from 'react';
import { useCart } from '../hooks/useCart';

export const ProductCard = ({ product, onViewDetails }) => {
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    addToCart({ ...product, quantity });
    setQuantity(1);
    alert('Producto agregado al carrito!');
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition overflow-hidden">
      <div className="relative overflow-hidden h-48">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover hover:scale-110 transition"
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/300?text=' + product.name;
          }}
        />
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">{product.name}</h3>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
        <div className="flex items-center justify-between mb-4">
          <span className="text-2xl font-bold text-blue-600">S/. {product.price.toFixed(2)}</span>
        </div>
        <div className="flex items-center gap-2 mb-4">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="bg-gray-200 px-3 py-1 rounded text-sm hover:bg-gray-300"
          >
            -
          </button>
          <span className="px-3 py-1">{quantity}</span>
          <button
            onClick={() => setQuantity(quantity + 1)}
            className="bg-gray-200 px-3 py-1 rounded text-sm hover:bg-gray-300"
          >
            +
          </button>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleAddToCart}
            className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition text-sm font-semibold"
          >
            Agregar al Carrito
          </button>
          <button
            onClick={() => onViewDetails(product)}
            className="flex-1 bg-gray-200 text-gray-800 py-2 rounded hover:bg-gray-300 transition text-sm font-semibold"
          >
            Ver Detalles
          </button>
        </div>
      </div>
    </div>
  );
};
