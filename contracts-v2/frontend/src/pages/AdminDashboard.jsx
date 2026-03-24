import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [codes, setCodes] = useState([]);
  
  // New event form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [rewardPoints, setRewardPoints] = useState('');

  // Code generation state
  const [selectedEventId, setSelectedEventId] = useState('');
  const [pointTiersStr, setPointTiersStr] = useState('20, 50');

  const token = localStorage.getItem('token');

  const fetchEvents = async () => {
    try {
      const res = await fetch('http://localhost:3001/events', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setEvents(data);
    } catch (err) { console.error('Failed to fetch events', err); }
  };

  const fetchCodes = async () => {
    try {
      const res = await fetch('http://localhost:3001/codes', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setCodes(data);
    } catch (err) { console.error('Failed to fetch codes', err); }
  };

  useEffect(() => {
    fetchEvents();
    fetchCodes();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/admin/login');
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:3001/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ title, description, date, time, location, rewardPoints })
      });
      if (res.ok) {
        setTitle(''); setDescription(''); setDate(''); setTime(''); setLocation(''); setRewardPoints('');
        fetchEvents();
      }
    } catch (err) { console.error('Failed to create event', err); }
  };

  const handleGenerateCodes = async (e) => {
    e.preventDefault();
    if (!selectedEventId) return alert('Select an event');
    const pointTiers = pointTiersStr.split(',').map(s => parseInt(s.trim()));
    try {
      const res = await fetch('http://localhost:3001/codes/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ eventId: parseInt(selectedEventId), pointTiers })
      });
      if (res.ok) {
        setPointTiersStr('20, 50');
        fetchCodes();
      }
    } catch (err) { console.error('Failed to generate codes', err); }
  };

  const handleCompleteEvent = async (id) => {
    try {
      const res = await fetch(`http://localhost:3001/events/${id}/complete`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) fetchEvents();
    } catch (err) { console.error('Failed to complete event', err); }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex justify-between items-center bg-white p-6 rounded-lg shadow">
          <h1 className="text-3xl font-extrabold text-blue-900">Admin Dashboard</h1>
          <button onClick={handleLogout} className="bg-red-50 text-red-600 hover:bg-red-100 px-4 py-2 rounded-md font-medium transition">Logout</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Create Event Section */}
          <div className="bg-white p-6 rounded-lg shadow border-t-4 border-blue-500">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Create New Event</h2>
            <form onSubmit={handleCreateEvent} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Event Title</label>
                <input type="text" required value={title} onChange={e => setTitle(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded shadow-sm p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea required value={description} onChange={e => setDescription(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded shadow-sm p-2"></textarea>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Date</label>
                  <input type="date" required value={date} onChange={e => setDate(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded shadow-sm p-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Time</label>
                  <input type="time" required value={time} onChange={e => setTime(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded shadow-sm p-2" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Location</label>
                  <input type="text" required value={location} onChange={e => setLocation(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded shadow-sm p-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Reward Points</label>
                  <input type="number" required value={rewardPoints} onChange={e => setRewardPoints(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded shadow-sm p-2" placeholder="e.g. 20 or 50" />
                </div>
              </div>
              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition">Post Event</button>
            </form>
          </div>

          {/* Generate Codes Section */}
          <div className="bg-white p-6 rounded-lg shadow border-t-4 border-green-500">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Generate Redemption Codes</h2>
            <p className="text-sm text-gray-500 mb-4">Select an event to generate unique point codes. E.g., "20, 50" creates two codes holding 20 and 50 points.</p>
            <form onSubmit={handleGenerateCodes} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Target Event</label>
                <select required value={selectedEventId} onChange={e => setSelectedEventId(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded shadow-sm p-2 bg-white">
                  <option value="">-- Select Event --</option>
                  {events.map(ev => (
                    <option key={ev.id} value={ev.id}>{ev.title} ({ev.status})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Point Tiers (comma separated)</label>
                <input type="text" required value={pointTiersStr} onChange={e => setPointTiersStr(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded shadow-sm p-2" placeholder="e.g., 20, 50, 100" />
              </div>
              <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded transition">Generate Codes</button>
            </form>

            <div className="mt-8">
              <h3 className="font-semibold text-gray-700 mb-2">Recent Codes Generated</h3>
              <div className="bg-gray-50 rounded p-4 h-48 overflow-y-auto border border-gray-200">
                {codes.length === 0 ? <p className="text-sm text-gray-400">No codes yet.</p> : (
                  <ul className="space-y-2">
                    {codes.slice().reverse().map(c => (
                      <li key={c.id} className="text-sm flex justify-between items-center bg-white p-2 rounded border shadow-sm">
                        <span className="font-mono font-bold text-blue-600">{c.code}</span>
                        <div className="text-right">
                          <span className="block text-gray-600">Event #{c.eventId}</span>
                          <span className={`text-xs px-2 rounded-full ${c.isUsed ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                            {c.points} pts - {c.isUsed ? 'USED' : 'ACTIVE'}
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

        {/* Events List */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">All Events</h2>
          {events.length === 0 ? <p className="text-gray-500">No events found.</p> : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {events.slice().reverse().map(ev => (
                <div key={ev.id} className="border rounded-lg p-4 bg-gray-50 hover:shadow-md transition">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg text-blue-800">{ev.title}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full font-bold ${ev.status === 'completed' ? 'bg-gray-200 text-gray-700' : 'bg-blue-100 text-blue-800'}`}>
                      {ev.status.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">{ev.description}</p>
                  <div className="text-xs font-semibold text-gray-500 mb-4 space-y-1">
                    <p>📅 {ev.date} at {ev.time} • 📍 {ev.location}</p>
                    <p className="text-green-600">🏆 Reward: {ev.rewardPoints} points</p>
                  </div>
                  {ev.status !== 'completed' && (
                    <button onClick={() => handleCompleteEvent(ev.id)} className="w-full bg-gray-800 hover:bg-black text-white text-sm py-2 rounded transition">
                      Mark as Completed
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
