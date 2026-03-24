import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const socket = useSocket();
  const srn = localStorage.getItem('srn');
  const token = localStorage.getItem('token');

  const [events, setEvents] = useState([]);
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [redeemCode, setRedeemCode] = useState('');
  const [redeemStatus, setRedeemStatus] = useState(null);

  // Vendor request state
  const [vendorRequests, setVendorRequests] = useState([]);

  useEffect(() => {
    fetchEvents();
    fetchBalance();
    fetchVendorRequests();
  }, []);

  useEffect(() => {
    if (!socket || !srn) return;

    // The backend uses user's explicit SRN room, but since our Socket backend
    // might just use the generic connection, we emit a join room request if needed
    // Assuming backend sets up the join automatically, we just listen:
    socket.emit('join', srn); // Mocking a join if backend supports it

    socket.on('new_event', (event) => {
      setEvents(prev => [...prev, event]);
    });

    socket.on('points_credited', (data) => {
      setBalance(data.newBalance);
      fetchBalance(); // refresh transactions
    });

    socket.on('vendor_request', (reqData) => {
      fetchVendorRequests();
    });

    return () => {
      socket.off('new_event');
      socket.off('points_credited');
      socket.off('vendor_request');
    };
  }, [socket, srn]);

  const fetchEvents = async () => {
    try {
      const res = await fetch('http://localhost:3001/events', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setEvents(data);
    } catch (err) { console.error('Failed to fetch events'); }
  };

  const fetchBalance = async () => {
    try {
      const res = await fetch('http://localhost:3001/points/balance', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setBalance(data.balance);
      setTransactions(data.transactions || []);
    } catch (err) { console.error('Failed to fetch balance'); }
  };

  const fetchVendorRequests = async () => {
    try {
      const res = await fetch('http://localhost:3001/vendor/requests', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setVendorRequests(Array.isArray(data) ? data : []);
    } catch (err) { console.error('Failed to fetch vendor requests'); }
  };

  const handleRegister = async (eventId) => {
    try {
      const res = await fetch(`http://localhost:3001/events/${eventId}/register`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        alert('Successfully registered for the event!');
        fetchEvents();
      }
    } catch (err) { console.error('Failed to register'); }
  };

  const handleRedeem = async (e) => {
    e.preventDefault();
    if (!redeemCode) return;

    try {
      const res = await fetch('http://localhost:3001/codes/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ code: redeemCode.toUpperCase() })
      });
      const data = await res.json();
      if (res.ok) {
        setRedeemStatus({ success: true, message: `Success! Earned ${data.pointsEarned} points.` });
        setBalance(data.newBalance);
        setRedeemCode('');
        fetchBalance();
      } else {
        setRedeemStatus({ success: false, message: data.error });
      }
    } catch (err) {
      setRedeemStatus({ success: false, message: 'Server error during redemption.' });
    }
    setTimeout(() => setRedeemStatus(null), 3000);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/student/login');
  };

  const respondToVendor = async (requestId, approved) => {
    try {
      const res = await fetch('http://localhost:3001/vendor/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ requestId, approved })
      });
      if (res.ok) {
        fetchBalance();
        fetchVendorRequests();
      }
    } catch (err) { console.error('Failed to respond to vendor'); }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8 relative">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex justify-between items-center bg-white p-6 rounded-lg shadow border-b-4 border-blue-500">
          <h1 className="text-3xl font-extrabold text-blue-900">Dashboard: <span className="text-gray-600">{srn}</span></h1>
          <button onClick={handleLogout} className="bg-red-50 text-red-600 hover:bg-red-100 px-4 py-2 rounded-md font-medium transition">Logout</button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Points & Redeem */}
          <div className="lg:col-span-1 space-y-8">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-800 p-6 rounded-lg shadow text-white text-center">
              <h2 className="text-lg font-medium text-blue-100 mb-2">Current Balance</h2>
              <p className="text-6xl font-black">{balance}</p>
              <p className="mt-2 text-sm text-blue-200">Campus Points</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow border-t-4 border-green-400">
              <h2 className="text-xl font-bold mb-4 text-gray-800">Redeem Code</h2>
              <form onSubmit={handleRedeem}>
                <input 
                  type="text" 
                  required 
                  value={redeemCode} 
                  onChange={e => setRedeemCode(e.target.value.toUpperCase())} 
                  placeholder="EX: X7K2PM9Q" 
                  className="w-full border border-gray-300 rounded shadow-sm p-3 font-mono text-center text-lg uppercase tracking-widest mb-4" 
                />
                <button type="submit" className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded shadow transition">Redeem Points</button>
              </form>
              {redeemStatus && (
                <div className={`mt-4 p-3 rounded font-medium text-center ${redeemStatus.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {redeemStatus.message}
                </div>
              )}
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-bold mb-4 text-gray-800">Transaction History</h2>
              <div className="max-h-64 overflow-y-auto pr-2">
                {transactions.length === 0 ? <p className="text-sm text-gray-500">No transactions yet.</p> : (
                  <ul className="space-y-3">
                    {transactions.slice().reverse().map((tx, idx) => (
                      <li key={idx} className="flex justify-between items-center text-sm border-b pb-2">
                        <div>
                          <p className="font-semibold text-gray-800">{tx.type === 'credit' ? `Event Code: ${tx.code}` : `Purchase: ${tx.vendor}`}</p>
                          <p className="text-xs text-gray-500">{new Date(tx.timestamp).toLocaleString()}</p>
                        </div>
                        <span className={`font-bold ${tx.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                          {tx.type === 'credit' ? '+' : '-'}{tx.points}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Events & Vendors */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-6 rounded-lg shadow border-t-4 border-yellow-400">
              <h2 className="text-2xl font-bold mb-6 text-gray-800">Campus Events</h2>
              {events.length === 0 ? <p className="text-gray-500">No upcoming events.</p> : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {events.slice().reverse().map(ev => (
                    <div key={ev.id} className="border rounded-lg p-5 bg-gray-50 hover:shadow-md transition">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-lg text-blue-900">{ev.title}</h3>
                        <span className={`text-xs px-2 py-1 rounded-full font-bold ${ev.status === 'completed' ? 'bg-gray-200 text-gray-700' : 'bg-blue-100 text-blue-800'}`}>
                          {ev.status.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{ev.description}</p>
                      <div className="text-xs font-semibold text-gray-500 space-y-1 mb-3">
                        <p>📅 {ev.date} at {ev.time}</p>
                        <p>📍 {ev.location}</p>
                        <p className="text-green-600">🏆 Reward: {ev.rewardPoints} points</p>
                      </div>
                      {ev.status === 'upcoming' && (
                        <button 
                          onClick={() => handleRegister(ev.id)}
                          disabled={ev.registeredStudents?.includes(srn)}
                          className={`w-full py-2 rounded text-sm font-bold transition ${ev.registeredStudents?.includes(srn) ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
                        >
                          {ev.registeredStudents?.includes(srn) ? 'Registered' : 'Register'}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white p-6 rounded-lg shadow border-t-4 border-red-500">
              <h2 className="text-2xl font-bold mb-6 text-gray-800">Vendor Requests</h2>
              {vendorRequests.length === 0 ? <p className="text-gray-500">No payment requests.</p> : (
                <ul className="space-y-4">
                  {vendorRequests.map(req => (
                    <li key={req.requestId} className="border p-5 rounded-lg flex items-center justify-between bg-gray-50">
                      <div>
                        <p className="font-bold text-lg text-red-600">{req.vendorName}</p>
                        <p className="text-gray-700 text-sm">Reason: {req.reason || 'No specific item listed'}</p>
                        <p className="text-xs text-gray-500 mt-1">{new Date(req.createdAt).toLocaleString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-black text-gray-900 mb-2">{req.points} pts</p>
                        {req.status === 'pending' ? (
                          <div className="flex space-x-2">
                            <button onClick={() => respondToVendor(req.requestId, false)} className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1 rounded font-bold text-sm">Reject</button>
                            <button onClick={() => respondToVendor(req.requestId, true)} className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded font-bold text-sm">Accept</button>
                          </div>
                        ) : (
                          <span className={`font-bold px-3 py-1 rounded-full text-sm ${req.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {req.status.toUpperCase()}
                          </span>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
