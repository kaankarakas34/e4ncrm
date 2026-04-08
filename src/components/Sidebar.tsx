'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Briefcase,
  Settings,
  LogOut,
  AlertOctagon
} from 'lucide-react';

const navItems = [
  { name: 'Dashboard', icon: LayoutDashboard, href: '/' },
  { name: 'Leads',     icon: Briefcase,       href: '/leads' },
  { name: 'Deals (Kanban)', icon: Briefcase,    href: '/deals' },
  { name: 'İşlevsiz Data', icon: AlertOctagon, href: '/unqualified' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <Briefcase size={16} color="#fff" />
        </div>
        <span className="sidebar-logo-text">
          E4N <span>CRM</span>
        </span>
      </div>

      {/* Nav */}
      <nav className="sidebar-nav">
        <span className="sidebar-section-label">Main</span>
        {navItems.map(({ name, icon: Icon, href }) => {
          const active = pathname === href;
          return (
            <Link key={name} href={href} className={`nav-item${active ? ' active' : ''}`}>
              <Icon size={18} className="nav-icon" />
              {name}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <Link href="/settings" className="nav-item">
          <Settings size={18} className="nav-icon" /> Settings
        </Link>
        <button className="nav-item" style={{ width: '100%', border: 'none', background: 'none', color: 'var(--gray-500)' }}>
          <LogOut size={18} className="nav-icon" /> Logout
        </button>
      </div>
    </aside>
  );
}
