"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Pill, Package, ShoppingCart, Users, FileText,
  Truck, CreditCard, Tag, MessageSquare, BarChart3, Settings,
  ChevronDown, ChevronRight, Menu, X, LogOut, Bell, Search,
  Boxes, Calendar, Heart, ClipboardList, Building2, Warehouse,
  Megaphone, FileEdit, Globe, Shield, Activity, ExternalLink
} from "lucide-react";

interface SidebarProps {
  user: { name: string; role: string; email: string } | null;
  unreadNotifications?: number;
}

interface NavItem {
  label: string;
  href?: string;
  icon: any;
  children?: { label: string; href: string }[];
}

const NAV_ITEMS: NavItem[] = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    label: "Pharmacy",
    icon: Pill,
    children: [
      { label: "Prescription Queue", href: "/admin/prescriptions" },
      { label: "Prescription History", href: "/admin/prescriptions?filter=ALL" },
      { label: "Refill Management", href: "/admin/refills" },
    ],
  },
  {
    label: "Catalog",
    icon: Package,
    children: [
      { label: "Products", href: "/admin/products" },
      { label: "Categories", href: "/admin/categories" },
      { label: "Brands", href: "/admin/brands" },
    ],
  },
  {
    label: "Inventory",
    icon: Warehouse,
    children: [
      { label: "Stock Overview", href: "/admin/inventory" },
      { label: "Batches & Expiry", href: "/admin/batches" },
      { label: "Suppliers", href: "/admin/suppliers" },
      { label: "Purchase Orders", href: "/admin/purchase-orders" },
    ],
  },
  {
    label: "Orders",
    href: "/admin/orders",
    icon: ShoppingCart,
  },
  {
    label: "Customers",
    href: "/admin/users",
    icon: Users,
  },
  {
    label: "Deliveries",
    href: "/admin/deliveries",
    icon: Truck,
  },
  {
    label: "Payments",
    href: "/admin/payments",
    icon: CreditCard,
  },
  {
    label: "Promotions",
    href: "/admin/promotions",
    icon: Tag,
  },
  {
    label: "Reviews",
    href: "/admin/reviews",
    icon: Heart,
  },
  {
    label: "Support",
    href: "/admin/support",
    icon: MessageSquare,
  },
  {
    label: "Reports",
    href: "/admin/reports",
    icon: BarChart3,
  },
  {
    label: "Settings",
    href: "/admin/site-settings",
    icon: Settings,
  },
];

export function AdminSidebar({ user, unreadNotifications = 0 }: SidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>([]);

  const toggleSection = (label: string) => {
    setExpandedSections((prev) =>
      prev.includes(label) ? prev.filter((s) => s !== label) : [...prev, label]
    );
  };

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "?");
  const isSectionActive = (item: NavItem) =>
    item.href ? isActive(item.href) : item.children?.some((c) => isActive(c.href));

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-4 border-b border-slate-200">
        <Link href="/admin" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center">
            <Pill className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-sm font-extrabold text-slate-900 block leading-none">AD CARE</span>
            <span className="text-[9px] font-bold text-teal-700 uppercase tracking-wider">Admin Panel</span>
          </div>
        </Link>
      </div>

      {/* Search */}
      <div className="px-3 py-3">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input type="text" placeholder="Search..." className="w-full pl-8 pr-3 py-1.5 bg-slate-100 border-0 rounded-lg text-xs" />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-0.5">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = isSectionActive(item);
          const expanded = expandedSections.includes(item.label);

          if (item.children) {
            return (
              <div key={item.label}>
                <button
                  onClick={() => toggleSection(item.label)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition ${
                    active ? "bg-teal-50 text-teal-800" : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <span className="flex items-center space-x-2">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </span>
                  {expanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                </button>
                {expanded && (
                  <div className="ml-4 mt-0.5 space-y-0.5 border-l-2 border-slate-200 pl-3">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        onClick={() => setMobileOpen(false)}
                        className={`block px-3 py-1.5 rounded-lg text-[11px] font-medium transition ${
                          isActive(child.href) ? "bg-teal-100 text-teal-800 font-bold" : "text-slate-500 hover:bg-slate-50"
                        }`}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          return (
            <Link
              key={item.label}
              href={item.href!}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-semibold transition ${
                active ? "bg-teal-50 text-teal-800" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Quick Actions */}
      <div className="px-3 py-2 border-t border-slate-200 space-y-1">
        <Link
          href="/"
          target="_blank"
          className="flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
        >
          <ExternalLink className="w-4 h-4" />
          <span>Visit Website</span>
        </Link>
        <form action="/api/auth/logout" method="post">
          <button
            type="submit"
            className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-50 transition"
          >
            <LogOut className="w-4 h-4" />
            <span>Log Out</span>
          </button>
        </form>
      </div>

      {/* User */}
      {user && (
        <div className="p-3 border-t border-slate-200">
          <div className="flex items-center space-x-2 px-2 py-1.5 bg-slate-50 rounded-lg">
            <div className="w-7 h-7 bg-teal-600 rounded-full flex items-center justify-center text-white text-[10px] font-bold">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[11px] font-bold text-slate-900 truncate">{user.name}</div>
              <div className="text-[9px] text-slate-500 truncate">{user.role}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white border border-slate-200 rounded-xl shadow-lg"
      >
        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/30 z-40" onClick={() => setMobileOpen(false)} />
      )}

      {/* Mobile sidebar */}
      <aside className={`lg:hidden fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200 transform transition-transform ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
        {sidebarContent}
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden lg:block fixed inset-y-0 left-0 w-64 bg-white border-r border-slate-200 z-30">
        {sidebarContent}
      </aside>
    </>
  );
}
