import React, { useState, useEffect } from 'react';
import axiosClient from '../../axios-client';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { solidIconMap } from '../../utils/solidIcons';

export default function TransactionList() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({ total: 0, count: 0 });

  useEffect(() => {
    fetchTodayTransactions();
  }, []);

  const fetchTodayTransactions = async () => {
    try {
      setLoading(true);
      const response = await axiosClient.get('/cashier/transactions/today');
      const transactionData = response.data.transactions || [];
      setTransactions(transactionData);
      
      // Calculate summary
      const total = transactionData.reduce((sum, transaction) => sum + parseFloat(transaction.total || 0), 0);
      setSummary({ total, count: transactionData.length });
    } catch (err) {
      console.error('Error fetching transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12">
          <div className="card">
                         <div className="card-header" style={{ backgroundColor: '#059669', color: 'white' }}>
              <div className="d-flex justify-content-between align-items-start">
                                 <div className="flex-grow-1">
                   <h2 className="mb-1" style={{ color: 'white', fontWeight: 600 }}>
                     <FontAwesomeIcon icon={solidIconMap.list} className="me-2" />
                     Transaction Management
                   </h2>
                   <p className="text-white-50 mb-0" style={{ fontSize: '0.9rem' }}>
                     View and manage today's cashier transactions
                   </p>
                 </div>
                <div className="d-flex align-items-center gap-2">
                                     <span className="badge bg-white fs-6 px-3 py-2" style={{ color: '#059669' }}>
                     <FontAwesomeIcon icon={solidIconMap.calendar} className="me-1" />
                     {new Date().toLocaleDateString('en-US', { 
                       weekday: 'long', 
                       year: 'numeric', 
                       month: 'long', 
                       day: 'numeric' 
                     })}
                   </span>
                                     <button 
                     className="btn btn-sm" 
                     onClick={fetchTodayTransactions}
                     disabled={loading}
                     style={{ backgroundColor: '#059669', color: 'white', border: '1px solid white' }}
                   >
                    <FontAwesomeIcon icon={solidIconMap.rotateLeft} className="me-1" />
                    {loading ? 'Refreshing...' : 'Refresh'}
                  </button>
                </div>
              </div>
            </div>
            <div className="card-body">
              {/* Summary Section */}
              {transactions.length > 0 && (
                <div className="row mb-4">
                  <div className="col-md-6">
                    <div className="card bg-primary text-white">
                      <div className="card-body text-center">
                        <h5 className="card-title">Total Transactions</h5>
                        <h3 className="mb-0">{summary.count}</h3>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="card bg-success text-white">
                      <div className="card-body text-center">
                        <h5 className="card-title">Total Amount</h5>
                        <h3 className="mb-0">₱{summary.total.toFixed(2)}</h3>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {transactions.length === 0 ? (
                <div className="text-center py-5">
                  <h5 className="text-muted">No transactions today</h5>
                  <p className="text-muted">Transactions will appear here once you start processing tickets.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Time</th>
                        <th>Rate</th>
                        <th>Qty</th>
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((transaction) => (
                        <tr key={transaction.id}>
                          <td>#{transaction.id}</td>
                          <td>{new Date(transaction.created_at).toLocaleTimeString()}</td>
                          <td>{transaction.rate?.name}</td>
                          <td>{transaction.quantity}</td>
                          <td>₱{parseFloat(transaction.total).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
