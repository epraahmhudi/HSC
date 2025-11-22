import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient'; // hubi pathka
import './Inventory.css';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Title
} from 'chart.js';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend, Title);

const Inventory = () => {
  const navigate = useNavigate();
  const [inventory, setInventory] = useState([]);
  const [products, setProducts] = useState([]);
  const [newEntry, setNewEntry] = useState({ product_id: '', quantity: '', restock_level: '' });
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch stock
  const fetchInventory = async () => {
    const { data, error } = await supabase
      .from('stock')
      .select('*, products(name)')
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Fetch error:', error);
    } else {
      setInventory(data);
    }
  };

  // Fetch products
  const fetchProducts = async () => {
    const { data, error } = await supabase.from('products').select('*');
    if (!error) setProducts(data);
  };

  useEffect(() => {
    fetchInventory();
    fetchProducts();
  }, []);

  // Add new stock
  const addStock = async () => {
    const { product_id, quantity, restock_level } = newEntry;
    if (!product_id || !quantity || !restock_level) return;

    const { error } = await supabase.from('stock').insert([
      {
        product_id: parseInt(product_id),
        quantity: parseInt(quantity),
        restock_level: parseInt(restock_level),
      },
    ]);

    if (error) {
      console.error('Insert error:', error);
    } else {
      setNewEntry({ product_id: '', quantity: '', restock_level: '' });
      fetchInventory();
    }
  };

  // Update stock quantity
  const updateStock = async (id, amount) => {
    const item = inventory.find((inv) => inv.id === id);
    if (!item) return;

    const newQty = Math.max(0, item.quantity + amount);
    const { error } = await supabase.from('stock').update({
      quantity: newQty,
      updated_at: new Date(),
    }).eq('id', id);

    if (!error) {
      fetchInventory();
    }
  };

  // Filtered inventory
  const filteredInventory = inventory.filter((item) =>
    item.products?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const lowStockItems = inventory.filter(
    (item) => item.quantity <= item.restock_level
  );

  // Calculate stats
  const totalProducts = inventory.length;
  const totalStock = inventory.reduce((sum, item) => sum + (item.quantity || 0), 0);
  const lowStockCount = lowStockItems.length;
  const inStockCount = totalProducts - lowStockCount;

  return (
    <div className="inventory-container">
      <div className="inventory-header">
        <div>
          <h1>📦 Inventory Management</h1>
          <p className="subtitle">Monitor and manage your stock levels in real-time</p>
        </div>
        <button className="back-button" onClick={() => navigate('/adminpanel')}>
          ← Back to Admin Panel
        </button>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <h3>Total Products</h3>
            <p className="stat-value">{totalProducts}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-content">
            <h3>Total Stock</h3>
            <p className="stat-value">{totalStock}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>In Stock</h3>
            <p className="stat-value">{inStockCount}</p>
          </div>
        </div>
        <div className="stat-card warning">
          <div className="stat-icon">⚠️</div>
          <div className="stat-content">
            <h3>Low Stock</h3>
            <p className="stat-value">{lowStockCount}</p>
          </div>
        </div>
      </div>

      {/* Search and Add Section */}
      <div className="inventory-actions">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {/* Add Stock Form Card */}
      <div className="form-card">
        <h3>➕ Add Stock Entry</h3>
        <div className="form-grid">
          <div className="form-group">
            <label>Product</label>
            <select
              value={newEntry.product_id}
              onChange={(e) => setNewEntry({ ...newEntry, product_id: e.target.value })}
              className="form-select"
            >
              <option value="">-- Select Product --</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Quantity</label>
            <input
              type="number"
              placeholder="Enter quantity"
              value={newEntry.quantity}
              onChange={(e) => setNewEntry({ ...newEntry, quantity: e.target.value })}
              className="form-input"
              min="0"
            />
          </div>
          <div className="form-group">
            <label>Restock Level</label>
            <input
              type="number"
              placeholder="Enter restock level"
              value={newEntry.restock_level}
              onChange={(e) => setNewEntry({ ...newEntry, restock_level: e.target.value })}
              className="form-input"
              min="0"
            />
          </div>
          <div className="form-group">
            <label>&nbsp;</label>
            <button onClick={addStock} className="add-button">
              ➕ Add Stock
            </button>
          </div>
        </div>
      </div>

      {/* Inventory Table Card */}
      <div className="table-card">
        <div className="table-header">
          <h3>📋 Inventory List</h3>
          <span className="table-count">{filteredInventory.length} items</span>
        </div>
        <div className="table-wrapper">
          <table className="inventory-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Current Stock</th>
                <th>Restock Level</th>
                <th>Status</th>
                <th>Last Updated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInventory.length > 0 ? (
                filteredInventory.map((item) => (
                  <tr key={item.id}>
                    <td className="product-name">{item.products?.name || 'Unknown'}</td>
                    <td className="stock-quantity">
                      <span className="quantity-badge">{item.quantity}</span>
                    </td>
                    <td>{item.restock_level}</td>
                    <td>
                      <span className={`status-badge ${item.quantity <= item.restock_level ? 'status-low' : 'status-in-stock'}`}>
                        {item.quantity <= item.restock_level ? '⚠️ Restock Needed' : '✅ In Stock'}
                      </span>
                    </td>
                    <td className="updated-date">
                      {new Date(item.updated_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                    <td className="action-buttons">
                      <button 
                        onClick={() => updateStock(item.id, 1)} 
                        className="action-btn increment"
                        title="Increase stock"
                      >
                        ➕
                      </button>
                      <button 
                        onClick={() => updateStock(item.id, -1)} 
                        disabled={item.quantity <= 0}
                        className="action-btn decrement"
                        title="Decrease stock"
                      >
                        ➖
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="no-data">
                    <div className="empty-state">
                      <span className="empty-icon">📭</span>
                      <p>No inventory items found</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Low Stock Chart */}
      {lowStockItems.length > 0 && (
        <div className="chart-card">
          <div className="chart-wrapper">
            <Bar
              key={Date.now()}
              data={{
                labels: lowStockItems.map((item) => item.products?.name || 'Unknown'),
                datasets: [
                  {
                    label: 'Current Stock',
                    data: lowStockItems.map((item) => item.quantity),
                    backgroundColor: [
                      "rgba(239, 68, 68, 0.8)",
                      "rgba(245, 158, 11, 0.8)",
                      "rgba(251, 191, 36, 0.8)",
                      "rgba(59, 130, 246, 0.8)",
                      "rgba(139, 92, 246, 0.8)",
                    ],
                    borderColor: [
                      "rgb(239, 68, 68)",
                      "rgb(245, 158, 11)",
                      "rgb(251, 191, 36)",
                      "rgb(59, 130, 246)",
                      "rgb(139, 92, 246)",
                    ],
                    borderWidth: 2,
                    borderRadius: 8,
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false,
                  },
                  title: {
                    display: true,
                    text: `⚠️ Products Needing Restock (${lowStockItems.length} items)`,
                    font: {
                      size: 16,
                      weight: "bold",
                    },
                  },
                  tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    titleFont: {
                      size: 14,
                      weight: 'bold',
                    },
                    bodyFont: {
                      size: 13,
                    },
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      stepSize: 1,
                    },
                    grid: {
                      color: 'rgba(0, 0, 0, 0.05)',
                    },
                  },
                  x: {
                    grid: {
                      display: false,
                    },
                  },
                },
              }}
              height={300}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
