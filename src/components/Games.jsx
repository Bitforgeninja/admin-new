// ✅ Games Admin Page with Reset Result Added
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Games = () => {
  const [markets, setMarkets] = useState([]);
  const [selectedMarketId, setSelectedMarketId] = useState('');
  const [inputOne, setInputOne] = useState('');
  const [inputTwo, setInputTwo] = useState('');
  const [resultDate, setResultDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openResult, setOpenResult] = useState('');

  useEffect(() => {
    const fetchMarkets = async () => {
      try {
        const response = await axios.get('https://backend-pbn5.onrender.com/api/markets');
        setMarkets(response.data);
        setSelectedMarketId(response.data[0]?.marketId);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching markets:', err);
        setError('Failed to load markets');
        setLoading(false);
      }
    };

    fetchMarkets();
  }, []);

  const handleMarketChange = (event) => {
    setSelectedMarketId(event.target.value);
  };

  const handleInputOneChange = (event) => {
    setInputOne(event.target.value);
  };

  const handleInputTwoChange = (event) => {
    setInputTwo(event.target.value);
  };

  const handleDateChange = (event) => {
    setResultDate(event.target.value);
  };

  const handleOpenResultChange = (event) => {
    const value = event.target.value.replace(/\D/g, '').slice(0, 3);
    setOpenResult(value);
  };

  const handlePushOpenResult = async () => {
    if (openResult.length !== 3) {
      window.alert('Please enter exactly 3 digits for the Open Result');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'https://backend-pbn5.onrender.com/api/admin/markets/publish-open',
        {
          marketId: selectedMarket.marketId,
          openResult: openResult,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      window.alert('✅ Open Result pushed successfully!');
      setOpenResult('');
    } catch (err) {
      console.error('Error pushing open result:', err);
      window.alert('❌ Failed to push open result. Please try again!');
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'https://backend-pbn5.onrender.com/api/admin/markets/declare-results',
        {
          marketId: selectedMarket.marketId,
          openResult: inputOne,
          closeResult: inputTwo,
          date: resultDate,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      window.alert('✅ Game results updated successfully!');
    } catch (err) {
      console.error('Error submitting:', err);
      window.alert('❌ Failed to update game results.');
    }
  };

  const handleResetResult = async () => {
    if (!selectedMarketId) {
      alert('❗ Select a valid market.');
      return;
    }

    const confirmReset = window.confirm(
      'Are you sure you want to reset the result to default (xxx-xx-xxx)?'
    );

    if (!confirmReset) return;

    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        'https://backend-pbn5.onrender.com/api/admin/reset-result',
        { marketId: selectedMarketId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert('✅ Result reset to default successfully!');
    } catch (error) {
      console.error('Reset error:', error);
      alert('❌ Failed to reset result. Please try again!');
    }
  };

  const selectedMarket = markets.find((market) => market.marketId === selectedMarketId);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-xl font-bold mb-4">Games Dashboard</h1>

      <div className="mb-4">
        <label htmlFor="market-select" className="block text-gray-700 text-sm font-bold mb-2">
          Select Market:
        </label>
        <select
          id="market-select"
          value={selectedMarketId}
          onChange={handleMarketChange}
          className="shadow border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        >
          {markets.map((market) => (
            <option key={market.marketId} value={market.marketId}>
              {market.name}
            </option>
          ))}
        </select>
      </div>

      <form onSubmit={handleSubmit} className="mb-4">
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label htmlFor="inputOne" className="block text-gray-700 text-sm font-bold mb-2">
              Input One:
            </label>
            <input
              id="inputOne"
              type="text"
              value={inputOne}
              onChange={handleInputOneChange}
              className="shadow border rounded py-2 px-3 text-gray-700 leading-tight"
              placeholder="Enter first value"
            />
          </div>
          <div>
            <label htmlFor="inputTwo" className="block text-gray-700 text-sm font-bold mb-2">
              Input Two:
            </label>
            <input
              id="inputTwo"
              type="text"
              value={inputTwo}
              onChange={handleInputTwoChange}
              className="shadow border rounded py-2 px-3 text-gray-700 leading-tight"
              placeholder="Enter second value"
            />
          </div>
          <div>
            <label htmlFor="datePicker" className="block text-gray-700 text-sm font-bold mb-2">
              Result Date:
            </label>
            <input
              id="datePicker"
              type="date"
              value={resultDate}
              onChange={handleDateChange}
              className="shadow border rounded py-2 px-3 text-gray-700 leading-tight"
            />
          </div>
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Submit
          </button>
        </div>
      </form>

      {selectedMarket && (
        <div>
          <h2 className="text-lg font-bold mb-2">Market Details:</h2>
          <p><strong>Market ID:</strong> {selectedMarket.marketId}</p>
          <p><strong>Name:</strong> {selectedMarket.name}</p>

          <div className="flex items-center mt-4 mb-4">
            <div>
              <label htmlFor="openResult" className="block text-sm font-bold mb-2">
                Open Result:
              </label>
              <input
                id="openResult"
                type="text"
                value={openResult}
                onChange={handleOpenResultChange}
                className="border rounded py-2 px-3 text-gray-700"
                placeholder="3 digits"
              />
            </div>
            <button
              type="button"
              onClick={handlePushOpenResult}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded ml-4 mt-5"
            >
              Push Open Result
            </button>
          </div>

          <div className="mb-4">
            <button
              type="button"
              onClick={handleResetResult}
              className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
            >
              Reset Result to Default (xxx-xx-xxx)
            </button>
          </div>

          <p><strong>Open Time:</strong> {selectedMarket.openTime}</p>
          <p><strong>Close Time:</strong> {selectedMarket.closeTime}</p>
          <p><strong>Betting Status:</strong> {selectedMarket.isBettingOpen ? 'Open' : 'Closed'}</p>

          <h3 className="text-lg font-bold mt-3">Results:</h3>
          <ul>
            {selectedMarket.results &&
              Object.entries(selectedMarket.results).map(([key, value]) => (
                <li key={key}>
                  <strong>{key.replace(/([A-Z])/g, ' $1').trim()}:</strong> {value}
                </li>
              ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Games;
