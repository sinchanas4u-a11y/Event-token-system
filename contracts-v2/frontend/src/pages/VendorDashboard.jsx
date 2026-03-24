import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';

const VendorDashboard = () => {
  const navigate = useNavigate();
  const socket = useSocket();
  const token = localStorage.getItem('token');
  
  const [srn, setSrn] = useState('');
  const [points, setPoints] = useState('');
  const [reason, setReason] = useState('');
  
  const [status, setStatus] = useState('');
  const [activeRequest, setActiveRequest] = useState(null);
  const [history, setHistory] = useState([]);

  const fetchHistory = async () => {
    try {
      const res = await fetch('http://localhost:3001/vendor/session-requests', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setHistory(Array.isArray(data) ? data : []);
    } catch (err) { console.error('Failed to fetch vendor history'); }
  };

  useEffect(() => {
    fetchHistory();
    if (!socket) return;

    socket.on('request_approved', (data) => {
      setStatus(`Success! Transaction approved. Student new balance: ${data.newBalance}`);
      setActiveRequest(null);
      fetchHistory();
    });

    socket.on('request_rejected', (data) => {
      setStatus(`Rejected: ${data.reason || 'Student declined the request.'}`);
      setActiveRequest(null);
      fetchHistory();
    });

    return () => {
      socket.off('request_approved');
      socket.off('request_rejected');
    };
  }, [socket, token]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/vendor/login');
  };

  const handleDeduct = async (e) => {
    e.preventDefault();
    setStatus('');
    
    try {
      const res = await fetch('http://localhost:3001/vendor/deduct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ srn, points: parseInt(points), reason })
      });
      const data = await res.json();
      
      if (res.ok) {
        setStatus('Waiting for student approval...');
        setActiveRequest(data.requestId);
        setSrn('');
        setPoints('');
        setReason('');
        fetchHistory();
      } else {
        setStatus(`Error: ${data.error}`);
      }
    } catch (err) {
      setStatus('Failed to connect to server.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex justify-between items-center bg-white p-6 rounded-lg shadow border-b-4 border-green-500">
          <h1 className="text-3xl font-extrabold text-green-800">Vendor Terminal</h1>
          <button onClick={handleLogout} className="bg-red-50 text-red-600 hover:bg-red-100 px-4 py-2 rounded-md font-medium transition">Logout</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Form */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Charge Student</h2>
            <form onSubmit={handleDeduct} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Student SRN</label>
                <input type="text" required value={srn} onChange={e => setSrn(e.target.value)} disabled={!!activeRequest} placeholder="e.g. SRN001" className="mt-1 block w-full border border-gray-300 rounded shadow-sm p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Points to Deduct</label>
                <input type="number" required min="1" value={points} onChange={e => setPoints(e.target.value)} disabled={!!activeRequest} className="mt-1 block w-full border border-gray-300 rounded shadow-sm p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Reason / Item</label>
                <input type="text" required value={reason} onChange={e => setReason(e.target.value)} disabled={!!activeRequest} placeholder="e.g. Coffee purchase" className="mt-1 block w-full border border-gray-300 rounded shadow-sm p-2" />
              </div>
              <button type="submit" disabled={!!activeRequest} className={`w-full font-bold py-3 rounded shadow transition text-white ${activeRequest ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'}`}>
                {activeRequest ? 'Request Pending...' : 'Send Request to Student'}
              </button>
            </form>
            
            {status && (
              <div className={`mt-6 p-4 rounded-md border font-medium text-center ${status.includes('Success') ? 'bg-green-50 text-green-800 border-green-200' : status.includes('Waiting') ? 'bg-blue-50 text-blue-800 border-blue-200 animate-pulse' : 'bg-red-50 text-red-800 border-red-200'}`}>
                {status}
              </div>
            )}
          </div>

          {/* History */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Recent Session Activity</h2>
            <div className="h-[400px] overflow-y-auto pr-2">
              {history.length === 0 ? <p className="text-sm text-gray-500">No requests processed in this session.</p> : (
                <ul className="space-y-4">
                  {history.map(tx => (
                    <li key={tx.requestId} className="border p-4 rounded-lg flex items-center justify-between bg-gray-50">
                      <div>
                        <p className="font-bold text-gray-800">Student: <span className="text-blue-600">{tx.srn}</span></p>
                        <p className="text-gray-600 text-sm">Item: {tx.reason || 'N/A'}</p>
                        <p className="text-xs text-gray-500 mt-1">{new Date(tx.createdAt).toLocaleTimeString()}</p>
                      </div>
                      <div className="text-right flex flex-col items-end">
                        <p className="font-black text-xl text-gray-900 mb-2">{tx.points} pts</p>
                        <span className={`font-bold px-3 py-1 text-[10px] uppercase tracking-wider rounded-full ${
                          tx.status === 'approved' ? 'bg-green-100 text-green-800' : 
                          tx.status === 'rejected' ? 'bg-red-100 text-red-800' : 
                          tx.status === 'expired' ? 'bg-gray-200 text-gray-700' : 
                          'bg-blue-100 text-blue-800 animate-pulse'}`}>
                          {tx.status}
                        </span>
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

export default VendorDashboard;
