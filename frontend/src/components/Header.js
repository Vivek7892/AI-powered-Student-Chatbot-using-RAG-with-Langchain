import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, LogOut, Search, Settings, User, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Header.css';

const Header = ({
  onSearch,
  searchResults = [],
  notifications = [],
  onSearchResultSelect
}) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchPanel, setShowSearchPanel] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const searchRef = useRef(null);
  const notificationRef = useRef(null);
  const profileRef = useRef(null);

  const unreadCount = useMemo(
    () => notifications.filter((item) => item.unread).length,
    [notifications]
  );

  useEffect(() => {
    const closeOverlays = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchPanel(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', closeOverlays);
    return () => document.removeEventListener('mousedown', closeOverlays);
  }, []);

  const handleSearchChange = (value) => {
    setSearchQuery(value);
    if (onSearch) {
      onSearch(value);
    }
    if (!showSearchPanel) {
      setShowSearchPanel(true);
    }
  };

  const handleSearchSelect = (result) => {
    setShowSearchPanel(false);
    setSearchQuery('');
    if (onSearchResultSelect) {
      onSearchResultSelect(result);
      return;
    }
    if (result?.route) {
      navigate(result.route);
    }
  };

  return (
    <header className="app-header">
      <div className="app-header__inner">
        <div className="app-brand">
          <div className="app-brand__logo">AI</div>
          <div className="app-brand__text">
            <h1>Student Assistant</h1>
            <p>Smart dashboard for focused learning</p>
          </div>
        </div>

        <div className="app-header__actions">
          <div className="app-search" ref={searchRef}>
            <Search size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={(event) => handleSearchChange(event.target.value)}
              onFocus={() => setShowSearchPanel(true)}
              placeholder="Search notes, tests, activity, and tools"
              aria-label="Search"
            />
            {searchQuery && (
              <button
                type="button"
                className="app-search__clear"
                onClick={() => handleSearchChange('')}
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}

            {showSearchPanel && searchQuery.trim() && (
              <div className="app-search__panel">
                {searchResults.length > 0 ? (
                  searchResults.slice(0, 8).map((result, index) => (
                    <button
                      key={`${result.title}-${index}`}
                      type="button"
                      className="app-search__item"
                      onClick={() => handleSearchSelect(result)}
                    >
                      <span>{result.title}</span>
                      <small>{result.type}</small>
                    </button>
                  ))
                ) : (
                  <div className="app-search__empty">No matching items</div>
                )}
              </div>
            )}
          </div>

          <div className="app-notifications" ref={notificationRef}>
            <button
              type="button"
              className="app-icon-btn"
              onClick={() => setShowNotifications((current) => !current)}
              aria-label="Notifications"
            >
              <Bell size={18} />
              {unreadCount > 0 ? <span className="app-icon-btn__badge">{unreadCount}</span> : null}
            </button>
            {showNotifications && (
              <div className="app-dropdown app-dropdown--notifications">
                <div className="app-dropdown__head">
                  <strong>Notifications</strong>
                  <span>{unreadCount} unread</span>
                </div>
                <div className="app-dropdown__list">
                  {notifications.length > 0 ? (
                    notifications.slice(0, 6).map((item) => (
                      <div key={item.id} className={`app-notification-item${item.unread ? ' is-unread' : ''}`}>
                        <p>{item.title}</p>
                        <small>{item.message}</small>
                        <span>{item.time}</span>
                      </div>
                    ))
                  ) : (
                    <div className="app-notification-item">
                      <p>No notifications</p>
                      <small>You're all caught up.</small>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <button type="button" className="app-icon-btn" aria-label="Settings">
            <Settings size={18} />
          </button>

          <div className="app-profile" ref={profileRef}>
            <button
              type="button"
              className="app-profile__button"
              onClick={() => setShowProfileMenu((current) => !current)}
            >
              <div className="app-profile__avatar">
                {(user?.email || 'U').slice(0, 1).toUpperCase()}
              </div>
              <div className="app-profile__meta">
                <strong>{user?.email?.split('@')[0] || 'Student'}</strong>
                <span>{user?.semester || 'Semester not set'}</span>
              </div>
            </button>

            {showProfileMenu && (
              <div className="app-dropdown app-dropdown--profile">
                <button
                  type="button"
                  onClick={() => {
                    setShowProfileMenu(false);
                    navigate('/profile');
                  }}
                >
                  <User size={16} />
                  <span>View Profile</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowProfileMenu(false);
                    logout();
                  }}
                >
                  <LogOut size={16} />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
