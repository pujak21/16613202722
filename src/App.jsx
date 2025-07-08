import React, { useState } from 'react';
import { Link2, Copy, ExternalLink, BarChart3 } from 'lucide-react';
import './App.css';


const URLShortener = () => {
  const [urls, setUrls] = useState([]);
  const [page, setPage] = useState('shortener');
  const [form, setForm] = useState({ url: '', code: '', validity: 30 });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  };

  const isUnique = (code) => !urls.find(u => u.code === code);

  const handleSubmit = () => {
    setLoading(true);
    setMsg('');

    try {
      if (!form.url.trim()) throw new Error('URL required');
      if (!form.url.match(/^https?:\/\/.+/)) throw new Error('Invalid URL format');

      let code = form.code.trim();
      if (code && !isUnique(code)) {
        code = generateCode();
        while (!isUnique(code)) code = generateCode();
      } else if (!code) {
        code = generateCode();
        while (!isUnique(code)) code = generateCode();
      }

      const now = new Date();
      const newUrl = {
        id: Date.now(),
        originalUrl: form.url,
        code,
        shortUrl: `http://localhost:3000/${code}`,
        createdAt: now,
        expiryDate: new Date(now.getTime() + form.validity * 60000),
        clicks: 0,
        clickData: []
      };

      setUrls(prev => [...prev, newUrl]);
      setForm({ url: '', code: '', validity: 30 });
      setMsg('URL shortened successfully!');
    } catch (error) {
      setMsg(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClick = (url) => {
    if (new Date() > new Date(url.expiryDate)) {
      setMsg('URL expired');
      return;
    }

    setUrls(prev => prev.map(u =>
      u.id === url.id
        ? { ...u, clicks: u.clicks + 1, clickData: [...u.clickData, { timestamp: new Date() }] }
        : u
    ));
    setMsg(`Redirecting to: ${url.originalUrl}`);
  };

  const copy = (text) => {
    navigator.clipboard.writeText(text);
    setMsg('Copied!');
  };

  return (
    <div className="app-container">
      {/* Header */}
      <div className="header">
        <div className="header-title">
          <Link2 />
          <h1>URL Shortener</h1>
        </div>
        <div className="header-buttons">
          <button
            onClick={() => setPage('shortener')}
            className={`nav ${page === 'shortener' ? 'active' : ''}`}
          >
            Shortener
          </button>
          <button
            onClick={() => setPage('stats')}
            className={`nav ${page === 'stats' ? 'active' : ''}`}
          >
            Stats
          </button>
        </div>
      </div>

      {}
      {msg && (
        <div className={`message ${msg.includes('success') || msg.includes('Copied') ? 'success' : 'error'}`}>
          {msg}
        </div>
      )}

      {}
      {page === 'shortener' && (
        <div>
          <div className="form-box">
            <h2>Shorten URL</h2>
            <div>
              <input
                type="url"
                value={form.url}
                onChange={(e) => setForm(prev => ({ ...prev, url: e.target.value }))}
                placeholder="https://example.com/long-url"
              />
              <div className="form-row">
                <input
                  type="text"
                  value={form.code}
                  onChange={(e) => setForm(prev => ({ ...prev, code: e.target.value }))}
                  placeholder="Custom code (optional)"
                />
                <input
                  type="number"
                  value={form.validity}
                  onChange={(e) => setForm(prev => ({ ...prev, validity: parseInt(e.target.value) || 30 }))}
                  placeholder="30"
                  min="1"
                />
              </div>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="submit"
              >
                {loading ? 'Shortening...' : 'Shorten URL'}
              </button>
            </div>
          </div>

          {}
          {urls.length > 0 && (
            <div className="form-box">
              <h3>Recent URLs</h3>
              {urls.slice(-3).reverse().map((url) => (
                <div key={url.id} className="url-card">
                  <div className="url-info">
                    <div>
                      <p>{url.originalUrl}</p>
                      <div className="short-url">
                        {url.shortUrl}
                        <button onClick={() => copy(url.shortUrl)} title="Copy">
                          <Copy />
                        </button>
                      </div>
                    </div>
                    <div>
                      <p>{url.clicks} clicks</p>
                      <button onClick={() => handleClick(url)} title="Visit">
                        <ExternalLink />
                      </button>
                    </div>
                  </div>
                  <div className="meta">Expires: {new Date(url.expiryDate).toLocaleString()}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {}
      {page === 'stats' && (
        <div className="form-box">
          <h2>
            <BarChart3 style={{ marginRight: '0.5rem' }} />
            Statistics
          </h2>
          {urls.length === 0 ? (
            <p>No URLs shortened yet.</p>
          ) : (
            urls.map((url) => (
              <div key={url.id} className="url-card">
                <div className="url-info">
                  <div>
                    <h3>{url.originalUrl}</h3>
                    <p className="short-url">{url.shortUrl}</p>
                  </div>
                  <div>
                    <div>{url.clicks}</div>
                    <div className="meta">Clicks</div>
                  </div>
                </div>
                <div className="meta">
                  Created: {new Date(url.createdAt).toLocaleString()}<br />
                  Expires: {new Date(url.expiryDate).toLocaleString()}
                </div>
                <div style={{ marginTop: '0.5rem' }}>
                  <span className={`status ${new Date() <= new Date(url.expiryDate) ? 'active' : 'expired'}`}>
                    {new Date() <= new Date(url.expiryDate) ? 'Active' : 'Expired'}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default URLShortener;
