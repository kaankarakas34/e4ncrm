import { Search, Bell } from 'lucide-react';

export default function Header() {
  return (
    <header className="header">
      {/* Search */}
      <div className="header-search">
        <Search size={15} color="var(--gray-600)" />
        <input
          id="global-search"
          type="text"
          placeholder="Search contacts, deals, companies..."
          autoComplete="off"
        />
        <span style={{
          fontSize: '11px',
          color: 'var(--gray-700)',
          background: 'var(--bg-subtle)',
          border: '1px solid var(--border)',
          borderRadius: '4px',
          padding: '2px 6px',
          flexShrink: 0
        }}>
          ⌘K
        </span>
      </div>

      {/* Actions */}
      <div className="header-actions">
        <button className="header-icon-btn" aria-label="Notifications">
          <Bell size={16} />
        </button>

        <div className="header-user">
          <div className="header-avatar">MC</div>
          <div className="header-user-info">
            <div className="header-user-name">Murat Can</div>
            <div className="header-user-role">Admin</div>
          </div>
        </div>
      </div>
    </header>
  );
}
