import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import LogoImage from '../assets/Logo.png';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  PhoneCall,
  ClipboardList,
  IndianRupee,
  BellRing,
  LogOut,
  Menu,
  X,
  User,
  Plane,
  ChevronDown,
  ChevronRight,
  Mail,
  Settings,
  UploadCloud,
  Megaphone,
  Plug,
  Headset
} from 'lucide-react';

const DashboardLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  // Accordion submenus states for sidebar
  const [registrationsOpen, setRegistrationsOpen] = useState(false);
  const [admissionsOpen, setAdmissionsOpen] = useState(false);
  const [downloadOpen, setDownloadOpen] = useState(false);
  const [uploadsOpen, setUploadsOpen] = useState(false);

  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Auto-expand accordions if active path is loaded
  useEffect(() => {
    if (location.pathname.startsWith('/dashboard/registrations')) {
      setRegistrationsOpen(true);
    }
    if (location.pathname.startsWith('/dashboard/admissions')) {
      setAdmissionsOpen(true);
    }
    if (location.pathname.startsWith('/dashboard/settings')) {
      setDownloadOpen(true);
    }
    if (location.pathname === '/dashboard/exams') {
      setUploadsOpen(true);
    }
  }, [location.pathname]);

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin': return 'bg-rose-500/10 text-rose-500 border border-rose-500/20';
      case 'manager': return 'bg-violet-500/10 text-violet-500 border border-violet-500/20';
      case 'counsellor': return 'bg-cyan-500/10 text-cyan-500 border border-cyan-500/20';
      case 'teacher': return 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20';
      case 'accountant': return 'bg-amber-500/10 text-amber-500 border border-amber-500/20';
      case 'student': return 'bg-blue-500/10 text-blue-500 border border-blue-500/20';
      default: return 'bg-slate-500/10 text-slate-500';
    }
  };

  const isStaff = ['admin', 'manager', 'counsellor', 'accountant', 'teacher'].includes(user?.role);
  const isManager = ['admin', 'manager'].includes(user?.role);
  const canSeeLeads = ['admin', 'manager', 'counsellor'].includes(user?.role);
  const canSeeExams = ['admin', 'manager', 'teacher'].includes(user?.role);

  return (
    <div className="h-screen overflow-hidden bg-slate-50 flex">
      {/* Sidebar - Desktop */}
      <aside className={`hidden md:flex flex-col bg-white text-slate-700 h-full shrink-0 border-r border-slate-200 transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}>
        <div className={`h-16 flex items-center gap-3 border-b border-slate-100 bg-slate-50/50 ${isCollapsed ? 'justify-center px-2' : 'px-6'}`}>
          <div className="w-10 h-10 flex items-center justify-center shrink-0">
            <img 
              src={LogoImage} 
              alt="Innovbit Logo" 
              className="w-full h-full object-contain"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.parentNode.innerHTML = '<div class="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="rotate-45"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21 4.5 19.5 3c-1.5-1.5-3-1.5-4.5.5L11.5 7 3.3 5.2c-.9-.2-1.8.3-2 1.2V7c0 .4.2.8.5 1.1L9 12l-1.5 5.5c-.2.9.3 1.8 1.2 2h.2c.4 0 .8-.2 1.1-.5l4-4h.5l3.5 3.5c.3.3.7.5 1.1.5.8 0 1.5-.7 1.5-1.5 0-.4-.2-.8-.5-1.1Z"/></svg></div>';
              }}
            />
          </div>
          {!isCollapsed && (
            <div className="overflow-hidden">
              <h1 className="font-bold text-sm leading-tight text-slate-900 truncate">Innovbit New Delhi</h1>
              <p className="text-[9px] text-blue-600 font-bold tracking-wider uppercase">CRM Hub</p>
            </div>
          )}
        </div>

        {/* User profile section */}
        <div className={`p-4 border-b border-slate-100 bg-slate-50/30 ${isCollapsed ? 'flex justify-center' : ''}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center font-bold text-blue-600 text-sm shadow-sm shrink-0">
              {user?.name ? user.name.split(' ').map(n=>n[0]).join('').toUpperCase() : 'U'}
            </div>
            {!isCollapsed && (
              <div className="overflow-hidden">
                <h2 className="text-xs font-bold truncate text-slate-800 leading-tight">{user?.name}</h2>
                <span className={`text-[9px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full inline-block mt-1 ${getRoleBadgeColor(user?.role)}`}>
                  {user?.role}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Nav Links */}
        <nav className={`flex-1 py-4 space-y-1.5 overflow-y-auto custom-scrollbar ${isCollapsed ? 'px-2' : 'px-4'}`}>
          {user && isStaff && (
            <>
              {/* Dashboard */}
              <Link
                to="/dashboard/stats"
                className={`flex items-center rounded-xl text-xs font-semibold transition-all ${
                  location.pathname === '/dashboard/stats'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/10 border-l-4 border-amber-500 rounded-l-none'
                    : 'text-slate-600 hover:text-blue-600 hover:bg-blue-50/50'
                } ${isCollapsed ? 'justify-center p-2.5' : 'justify-between px-3 py-2.5'}`}
              >
                <div className="flex items-center gap-3">
                  <LayoutDashboard className="w-4 h-4" />
                  {!isCollapsed && <span>Dashboard Stats</span>}
                </div>
                {!isCollapsed && location.pathname === '/dashboard/stats' && <ChevronRight className="w-3.5 h-3.5 text-white" />}
              </Link>

              {/* Registrations Accordion Dropdown */}
              {['admin', 'manager', 'counsellor'].includes(user.role) && (
                <div>
                  <button
                    onClick={() => {
                      if (isCollapsed) setIsCollapsed(false);
                      setRegistrationsOpen(!registrationsOpen);
                    }}
                    className={`w-full flex items-center justify-between rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      location.pathname.startsWith('/dashboard/registrations')
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-slate-600 hover:text-blue-600 hover:bg-blue-50/50'
                    } ${isCollapsed ? 'justify-center p-2.5' : 'px-3 py-2.5'}`}
                  >
                    <div className="flex items-center gap-3">
                      <ClipboardList className="w-4 h-4" />
                      {!isCollapsed && <span>Registrations</span>}
                    </div>
                    {!isCollapsed && (
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-250 ${registrationsOpen ? 'rotate-180' : ''}`} />
                    )}
                  </button>
                  {!isCollapsed && registrationsOpen && (
                    <div className="pl-9 pr-2 py-1 space-y-1">
                      <Link
                        to="/dashboard/registrations/paid"
                        className={`block p-2 text-[11px] font-bold rounded-lg transition-colors ${
                          location.pathname === '/dashboard/registrations/paid'
                            ? 'text-blue-600 bg-blue-50/40'
                            : 'text-slate-500 hover:text-blue-600'
                        }`}
                      >
                        Paid Registrations
                      </Link>
                      <Link
                        to="/dashboard/registrations/unpaid"
                        className={`block p-2 text-[11px] font-bold rounded-lg transition-colors ${
                          location.pathname === '/dashboard/registrations/unpaid'
                            ? 'text-blue-600 bg-blue-50/40'
                            : 'text-slate-500 hover:text-blue-600'
                        }`}
                      >
                        Unpaid Registrations
                      </Link>
                      {user.role === 'admin' && (
                        <Link
                          to="/dashboard/registrations/form"
                          className={`block p-2 text-[11px] font-bold rounded-lg transition-colors ${
                            location.pathname === '/dashboard/registrations/form'
                              ? 'text-blue-600 bg-blue-50/40'
                              : 'text-slate-500 hover:text-blue-600'
                          }`}
                        >
                          Registration Form
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Admissions Accordion Dropdown */}
              {['admin', 'manager'].includes(user.role) && (
                <div>
                  <button
                    onClick={() => {
                      if (isCollapsed) setIsCollapsed(false);
                      setAdmissionsOpen(!admissionsOpen);
                    }}
                    className={`w-full flex items-center justify-between rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      location.pathname.startsWith('/dashboard/admissions')
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-slate-600 hover:text-blue-600 hover:bg-blue-50/50'
                    } ${isCollapsed ? 'justify-center p-2.5' : 'px-3 py-2.5'}`}
                  >
                    <div className="flex items-center gap-3">
                      <GraduationCap className="w-4 h-4" />
                      {!isCollapsed && <span>Admissions</span>}
                    </div>
                    {!isCollapsed && (
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-250 ${admissionsOpen ? 'rotate-180' : ''}`} />
                    )}
                  </button>
                  {!isCollapsed && admissionsOpen && (
                    <div className="pl-9 pr-2 py-1 space-y-1">
                      <Link
                        to="/dashboard/admissions/list"
                        className={`block p-2 text-[11px] font-bold rounded-lg transition-colors ${
                          location.pathname === '/dashboard/admissions/list'
                            ? 'text-blue-600 bg-blue-50/40'
                            : 'text-slate-500 hover:text-blue-600'
                        }`}
                      >
                        Admission List
                      </Link>
                      <Link
                        to="/dashboard/admissions/add"
                        className={`block p-2 text-[11px] font-bold rounded-lg transition-colors ${
                          location.pathname === '/dashboard/admissions/add'
                            ? 'text-blue-600 bg-blue-50/40'
                            : 'text-slate-500 hover:text-blue-600'
                        }`}
                      >
                        Add Admissions
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {/* Counsellors */}
              {['admin', 'manager'].includes(user.role) && (
                <Link
                  to="/dashboard/counsellors"
                  className={`flex items-center rounded-xl text-xs font-semibold transition-all ${
                    location.pathname === '/dashboard/counsellors'
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/10 border-l-4 border-amber-500 rounded-l-none'
                      : 'text-slate-600 hover:text-blue-600 hover:bg-blue-50/50'
                  } ${isCollapsed ? 'justify-center p-2.5' : 'justify-between px-3 py-2.5'}`}
                >
                  <div className="flex items-center gap-3">
                    <Users className="w-4 h-4" />
                    {!isCollapsed && <span>Counsellors</span>}
                  </div>
                  {!isCollapsed && location.pathname === '/dashboard/counsellors' && <ChevronRight className="w-3.5 h-3.5 text-white" />}
                </Link>
              )}

              {/* Queries / Leads */}
              {['admin', 'manager', 'counsellor'].includes(user.role) && (
                <Link
                  to="/dashboard/leads"
                  className={`flex items-center rounded-xl text-xs font-semibold transition-all ${
                    location.pathname === '/dashboard/leads'
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/10 border-l-4 border-amber-500 rounded-l-none'
                      : 'text-slate-600 hover:text-blue-600 hover:bg-blue-50/50'
                  } ${isCollapsed ? 'justify-center p-2.5' : 'justify-between px-3 py-2.5'}`}
                >
                  <div className="flex items-center gap-3">
                    <PhoneCall className="w-4 h-4" />
                    {!isCollapsed && <span>Queries</span>}
                  </div>
                  {!isCollapsed && location.pathname === '/dashboard/leads' && <ChevronRight className="w-3.5 h-3.5 text-white" />}
                </Link>
              )}

              {/* Telecaller's own Meta leads */}
              {user.role === 'counsellor' && (
                <Link
                  to="/dashboard/my-leads"
                  className={`flex items-center rounded-xl text-xs font-semibold transition-all ${
                    location.pathname === '/dashboard/my-leads'
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/10 border-l-4 border-amber-500 rounded-l-none'
                      : 'text-slate-600 hover:text-blue-600 hover:bg-blue-50/50'
                  } ${isCollapsed ? 'justify-center p-2.5' : 'justify-between px-3 py-2.5'}`}
                >
                  <div className="flex items-center gap-3">
                    <Headset className="w-4 h-4" />
                    {!isCollapsed && <span>My Leads</span>}
                  </div>
                  {!isCollapsed && location.pathname === '/dashboard/my-leads' && <ChevronRight className="w-3.5 h-3.5 text-white" />}
                </Link>
              )}

              {/* Meta Leads */}
              {['admin', 'manager'].includes(user.role) && (
                <Link
                  to="/dashboard/meta-leads"
                  className={`flex items-center rounded-xl text-xs font-semibold transition-all ${
                    location.pathname.startsWith('/dashboard/meta-leads')
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/10 border-l-4 border-amber-500 rounded-l-none'
                      : 'text-slate-600 hover:text-blue-600 hover:bg-blue-50/50'
                  } ${isCollapsed ? 'justify-center p-2.5' : 'justify-between px-3 py-2.5'}`}
                >
                  <div className="flex items-center gap-3">
                    <Megaphone className="w-4 h-4" />
                    {!isCollapsed && <span>Meta Leads</span>}
                  </div>
                  {!isCollapsed && location.pathname.startsWith('/dashboard/meta-leads') && <ChevronRight className="w-3.5 h-3.5 text-white" />}
                </Link>
              )}

              {/* Newsletters */}
              {['admin', 'manager'].includes(user.role) && (
                <Link
                  to="/dashboard/newsletters"
                  className={`flex items-center rounded-xl text-xs font-semibold transition-all ${
                    location.pathname === '/dashboard/newsletters'
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/10 border-l-4 border-amber-500 rounded-l-none'
                      : 'text-slate-600 hover:text-blue-600 hover:bg-blue-50/50'
                  } ${isCollapsed ? 'justify-center p-2.5' : 'justify-between px-3 py-2.5'}`}
                >
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4" />
                    {!isCollapsed && <span>Newsletters</span>}
                  </div>
                  {!isCollapsed && location.pathname === '/dashboard/newsletters' && <ChevronRight className="w-3.5 h-3.5 text-white" />}
                </Link>
              )}

              {/* Integrations */}
              {['admin', 'manager'].includes(user.role) && (
                <Link
                  to="/dashboard/integrations/meta"
                  className={`flex items-center rounded-xl text-xs font-semibold transition-all ${
                    location.pathname.startsWith('/dashboard/integrations')
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/10 border-l-4 border-amber-500 rounded-l-none'
                      : 'text-slate-600 hover:text-blue-600 hover:bg-blue-50/50'
                  } ${isCollapsed ? 'justify-center p-2.5' : 'justify-between px-3 py-2.5'}`}
                >
                  <div className="flex items-center gap-3">
                    <Plug className="w-4 h-4" />
                    {!isCollapsed && <span>Integrations</span>}
                  </div>
                  {!isCollapsed && location.pathname.startsWith('/dashboard/integrations') && <ChevronRight className="w-3.5 h-3.5 text-white" />}
                </Link>
              )}

              {/* Download Settings Toggles Accordion */}
              {['admin', 'manager'].includes(user.role) && (
                <div>
                  <button
                    onClick={() => {
                      if (isCollapsed) setIsCollapsed(false);
                      setDownloadOpen(!downloadOpen);
                    }}
                    className={`w-full flex items-center justify-between rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      location.pathname.startsWith('/dashboard/settings')
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-slate-600 hover:text-blue-600 hover:bg-blue-50/50'
                    } ${isCollapsed ? 'justify-center p-2.5' : 'px-3 py-2.5'}`}
                  >
                    <div className="flex items-center gap-3">
                      <Settings className="w-4 h-4" />
                      {!isCollapsed && <span>Download Settings</span>}
                    </div>
                    {!isCollapsed && (
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-250 ${downloadOpen ? 'rotate-180' : ''}`} />
                    )}
                  </button>
                  {!isCollapsed && downloadOpen && (
                    <div className="pl-9 pr-2 py-1 space-y-1">
                      <Link
                        to="/dashboard/settings/downloads"
                        className={`block p-2 text-[11px] font-bold rounded-lg transition-colors ${
                          location.pathname === '/dashboard/settings/downloads'
                            ? 'text-blue-600 bg-blue-50/40'
                            : 'text-slate-500 hover:text-blue-600'
                        }`}
                      >
                        Admit Card On/Off
                      </Link>
                      <Link
                        to="/dashboard/settings/downloads"
                        className={`block p-2 text-[11px] font-bold rounded-lg transition-colors ${
                          location.pathname === '/dashboard/settings/downloads'
                            ? 'text-blue-600 bg-blue-50/40'
                            : 'text-slate-500 hover:text-blue-600'
                        }`}
                      >
                        Result On/Off
                      </Link>
                      <Link
                        to="/dashboard/settings/downloads"
                        className={`block p-2 text-[11px] font-bold rounded-lg transition-colors ${
                          location.pathname === '/dashboard/settings/downloads'
                            ? 'text-blue-600 bg-blue-50/40'
                            : 'text-slate-500 hover:text-blue-600'
                        }`}
                      >
                        Counselling Letter On/Off
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {/* Uploads Accordion */}
              {['admin', 'manager', 'teacher'].includes(user.role) && (
                <div>
                  <button
                    onClick={() => {
                      if (isCollapsed) setIsCollapsed(false);
                      setUploadsOpen(!uploadsOpen);
                    }}
                    className={`w-full flex items-center justify-between rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      location.pathname === '/dashboard/exams'
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-slate-600 hover:text-blue-600 hover:bg-blue-50/50'
                    } ${isCollapsed ? 'justify-center p-2.5' : 'px-3 py-2.5'}`}
                  >
                    <div className="flex items-center gap-3">
                      <UploadCloud className="w-4 h-4" />
                      {!isCollapsed && <span>Uploads</span>}
                    </div>
                    {!isCollapsed && (
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-250 ${uploadsOpen ? 'rotate-180' : ''}`} />
                    )}
                  </button>
                  {!isCollapsed && uploadsOpen && (
                    <div className="pl-9 pr-2 py-1 space-y-1">
                      <Link
                        to="/dashboard/exams"
                        className={`block p-2 text-[11px] font-bold rounded-lg transition-colors ${
                          location.pathname === '/dashboard/exams'
                            ? 'text-blue-600 bg-blue-50/40'
                            : 'text-slate-500 hover:text-blue-600'
                        }`}
                      >
                        Results
                      </Link>
                      <Link
                        to="/dashboard/exams"
                        className={`block p-2 text-[11px] font-bold rounded-lg transition-colors ${
                          location.pathname === '/dashboard/exams'
                            ? 'text-blue-600 bg-blue-50/40'
                            : 'text-slate-500 hover:text-blue-600'
                        }`}
                      >
                        Exam Dates
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {/* User Admin specific details */}
              {user.role === 'admin' && (
                <Link
                  to="/dashboard/users"
                  className={`flex items-center rounded-xl text-xs font-semibold transition-all ${
                    location.pathname === '/dashboard/users'
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/10 border-l-4 border-amber-500 rounded-l-none'
                      : 'text-slate-600 hover:text-blue-600 hover:bg-blue-50/50'
                  } ${isCollapsed ? 'justify-center p-2.5' : 'justify-between px-3 py-2.5'}`}
                >
                  <div className="flex items-center gap-3">
                    <Users className="w-4 h-4" />
                    {!isCollapsed && <span>User Management</span>}
                  </div>
                  {!isCollapsed && location.pathname === '/dashboard/users' && <ChevronRight className="w-3.5 h-3.5 text-white" />}
                </Link>
              )}

              {/* Course Catalog */}
              {['admin', 'manager'].includes(user.role) && (
                <Link
                  to="/dashboard/courses"
                  className={`flex items-center rounded-xl text-xs font-semibold transition-all ${
                    location.pathname === '/dashboard/courses'
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/10 border-l-4 border-amber-500 rounded-l-none'
                      : 'text-slate-600 hover:text-blue-600 hover:bg-blue-50/50'
                  } ${isCollapsed ? 'justify-center p-2.5' : 'justify-between px-3 py-2.5'}`}
                >
                  <div className="flex items-center gap-3">
                    <BookOpen className="w-4 h-4" />
                    {!isCollapsed && <span>Course Catalog</span>}
                  </div>
                  {!isCollapsed && location.pathname === '/dashboard/courses' && <ChevronRight className="w-3.5 h-3.5 text-white" />}
                </Link>
              )}

              {/* Batches Allocation */}
              {['admin', 'manager'].includes(user.role) && (
                <Link
                  to="/dashboard/batches"
                  className={`flex items-center rounded-xl text-xs font-semibold transition-all ${
                    location.pathname === '/dashboard/batches'
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/10 border-l-4 border-amber-500 rounded-l-none'
                      : 'text-slate-600 hover:text-blue-600 hover:bg-blue-50/50'
                  } ${isCollapsed ? 'justify-center p-2.5' : 'justify-between px-3 py-2.5'}`}
                >
                  <div className="flex items-center gap-3">
                    <GraduationCap className="w-4 h-4" />
                    {!isCollapsed && <span>Batch Allocation</span>}
                  </div>
                  {!isCollapsed && location.pathname === '/dashboard/batches' && <ChevronRight className="w-3.5 h-3.5 text-white" />}
                </Link>
              )}

              {/* Fee collection */}
              {['admin', 'accountant'].includes(user.role) && (
                <Link
                  to="/dashboard/payments"
                  className={`flex items-center rounded-xl text-xs font-semibold transition-all ${
                    location.pathname === '/dashboard/payments'
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/10 border-l-4 border-amber-500 rounded-l-none'
                      : 'text-slate-600 hover:text-blue-600 hover:bg-blue-50/50'
                  } ${isCollapsed ? 'justify-center p-2.5' : 'justify-between px-3 py-2.5'}`}
                >
                  <div className="flex items-center gap-3">
                    <IndianRupee className="w-4 h-4" />
                    {!isCollapsed && <span>Fees & Payments</span>}
                  </div>
                  {!isCollapsed && location.pathname === '/dashboard/payments' && <ChevronRight className="w-3.5 h-3.5 text-white" />}
                </Link>
              )}

              {/* Announcements notices */}
              <Link
                to="/dashboard/announcements"
                className={`flex items-center rounded-xl text-xs font-semibold transition-all ${
                  location.pathname === '/dashboard/announcements'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/10 border-l-4 border-amber-500 rounded-l-none'
                    : 'text-slate-600 hover:text-blue-600 hover:bg-blue-50/50'
                } ${isCollapsed ? 'justify-center p-2.5' : 'justify-between px-3 py-2.5'}`}
              >
                <div className="flex items-center gap-3">
                  <BellRing className="w-4 h-4" />
                  {!isCollapsed && <span>Announcements</span>}
                </div>
                {!isCollapsed && location.pathname === '/dashboard/announcements' && <ChevronRight className="w-3.5 h-3.5 text-white" />}
              </Link>
            </>
          )}

          {/* Student Panel exclusive links */}
          {user && user.role === 'student' && (
            <>
              <Link
                to="/dashboard/student/status"
                className={`flex items-center rounded-xl text-xs font-semibold transition-all ${
                  location.pathname === '/dashboard/student/status'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/10 border-l-4 border-amber-500 rounded-l-none'
                    : 'text-slate-600 hover:text-blue-600 hover:bg-blue-50/50'
                } ${isCollapsed ? 'justify-center p-2.5' : 'justify-between px-3 py-2.5'}`}
              >
                <div className="flex items-center gap-3">
                  <Plane className="w-4 h-4" />
                  {!isCollapsed && <span>Admission Status</span>}
                </div>
                {!isCollapsed && location.pathname === '/dashboard/student/status' && <ChevronRight className="w-3.5 h-3.5 text-white" />}
              </Link>
              <Link
                to="/dashboard/student/admit-card"
                className={`flex items-center rounded-xl text-xs font-semibold transition-all ${
                  location.pathname === '/dashboard/student/admit-card'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/10 border-l-4 border-amber-500 rounded-l-none'
                    : 'text-slate-600 hover:text-blue-600 hover:bg-blue-50/50'
                } ${isCollapsed ? 'justify-center p-2.5' : 'justify-between px-3 py-2.5'}`}
              >
                <div className="flex items-center gap-3">
                  <ClipboardList className="w-4 h-4" />
                  {!isCollapsed && <span>Entrance Admit Card</span>}
                </div>
                {!isCollapsed && location.pathname === '/dashboard/student/admit-card' && <ChevronRight className="w-3.5 h-3.5 text-white" />}
              </Link>
              <Link
                to="/dashboard/student/results"
                className={`flex items-center rounded-xl text-xs font-semibold transition-all ${
                  location.pathname === '/dashboard/student/results'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/10 border-l-4 border-amber-500 rounded-l-none'
                    : 'text-slate-600 hover:text-blue-600 hover:bg-blue-50/50'
                } ${isCollapsed ? 'justify-center p-2.5' : 'justify-between px-3 py-2.5'}`}
              >
                <div className="flex items-center gap-3">
                  <BookOpen className="w-4 h-4" />
                  {!isCollapsed && <span>Exam Results</span>}
                </div>
                {!isCollapsed && location.pathname === '/dashboard/student/results' && <ChevronRight className="w-3.5 h-3.5 text-white" />}
              </Link>
              <Link
                to="/dashboard/student/ledger"
                className={`flex items-center rounded-xl text-xs font-semibold transition-all ${
                  location.pathname === '/dashboard/student/ledger'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/10 border-l-4 border-amber-500 rounded-l-none'
                    : 'text-slate-600 hover:text-blue-600 hover:bg-blue-50/50'
                } ${isCollapsed ? 'justify-center p-2.5' : 'justify-between px-3 py-2.5'}`}
              >
                <div className="flex items-center gap-3">
                  <IndianRupee className="w-4 h-4" />
                  {!isCollapsed && <span>Fee Ledger</span>}
                </div>
                {!isCollapsed && location.pathname === '/dashboard/student/ledger' && <ChevronRight className="w-3.5 h-3.5 text-white" />}
              </Link>
              <Link
                to="/dashboard/announcements"
                className={`flex items-center rounded-xl text-xs font-semibold transition-all ${
                  location.pathname === '/dashboard/announcements'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/10 border-l-4 border-amber-500 rounded-l-none'
                    : 'text-slate-600 hover:text-blue-600 hover:bg-blue-50/50'
                } ${isCollapsed ? 'justify-center p-2.5' : 'justify-between px-3 py-2.5'}`}
              >
                <div className="flex items-center gap-3">
                  <BellRing className="w-4 h-4" />
                  {!isCollapsed && <span>Announcements</span>}
                </div>
                {!isCollapsed && location.pathname === '/dashboard/announcements' && <ChevronRight className="w-3.5 h-3.5 text-white" />}
              </Link>
            </>
          )}
        </nav>

        {/* Footer Logout & Collapse Toggle */}
        <div className="p-4 border-t border-slate-100 space-y-2 shrink-0">
          <button
            onClick={handleLogout}
            className={`flex items-center gap-3 rounded-xl text-xs font-semibold text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer w-full ${isCollapsed ? 'justify-center p-2.5' : 'px-3 py-2.5'}`}
            title={isCollapsed ? 'Sign Out' : ''}
          >
            <LogOut className="w-4 h-4" />
            {!isCollapsed && <span>Sign Out</span>}
          </button>
          
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)} 
            className="flex items-center justify-center p-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-500 cursor-pointer w-full"
            title={isCollapsed ? 'Expand Menu' : 'Collapse Menu'}
          >
            <ChevronRight className={`w-4 h-4 transition-transform duration-300 ${isCollapsed ? '' : 'rotate-180'}`} />
          </button>
        </div>
      </aside>

      {/* Mobile Drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden bg-slate-950/40 backdrop-blur-sm">
          <div className="w-64 bg-white text-slate-800 flex flex-col h-full animate-slide-in border-r border-slate-200">
            <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 flex items-center justify-center shrink-0">
                  <img 
                    src={LogoImage} 
                    alt="Innovbit Logo" 
                    className="w-full h-full object-contain"
                  />
                </div>
                <span className="font-extrabold text-sm text-slate-900">Innovbit CRM</span>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="text-slate-500 hover:text-slate-800">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 border-b border-slate-100 bg-slate-50/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center font-bold text-blue-600">
                  {user?.name ? user.name.split(' ').map(n=>n[0]).join('').toUpperCase() : 'U'}
                </div>
                <div>
                  <h2 className="text-xs font-bold text-slate-800">{user?.name}</h2>
                  <span className={`text-[9px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full inline-block mt-1 ${getRoleBadgeColor(user?.role)}`}>
                    {user?.role}
                  </span>
                </div>
              </div>
            </div>

            <nav className="flex-1 px-4 py-4 space-y-1.5 overflow-y-auto">
              {user && isStaff && (
                <>
                  <Link
                    to="/dashboard/stats"
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold ${
                      location.pathname === '/dashboard/stats' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <LayoutDashboard className="w-4 h-4 text-slate-400" />
                    <span>Dashboard Stats</span>
                  </Link>

                  {isManager && (
                  <>
                  {/* Registrations */}
                  <div>
                    <button
                      onClick={() => setRegistrationsOpen(!registrationsOpen)}
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <ClipboardList className="w-4 h-4 text-slate-400" />
                        <span>Registrations</span>
                      </div>
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform ${registrationsOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {registrationsOpen && (
                      <div className="pl-9 space-y-1 py-1">
                        <Link to="/dashboard/registrations/paid" onClick={() => setSidebarOpen(false)} className="block p-2 text-[11px] font-bold text-slate-500 hover:text-blue-600">
                          Paid Registrations
                        </Link>
                        <Link to="/dashboard/registrations/unpaid" onClick={() => setSidebarOpen(false)} className="block p-2 text-[11px] font-bold text-slate-500 hover:text-blue-600">
                          Unpaid Registrations
                        </Link>
                        {user.role === 'admin' && (
                          <Link to="/dashboard/registrations/form" onClick={() => setSidebarOpen(false)} className="block p-2 text-[11px] font-bold text-slate-500 hover:text-blue-600">
                            Registration Form
                          </Link>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Admissions */}
                  <div>
                    <button
                      onClick={() => setAdmissionsOpen(!admissionsOpen)}
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <GraduationCap className="w-4 h-4 text-slate-400" />
                        <span>Admissions</span>
                      </div>
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform ${admissionsOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {admissionsOpen && (
                      <div className="pl-9 space-y-1 py-1">
                        <Link to="/dashboard/admissions/list" onClick={() => setSidebarOpen(false)} className="block p-2 text-[11px] font-bold text-slate-500 hover:text-blue-600">
                          Admission List
                        </Link>
                        <Link to="/dashboard/admissions/add" onClick={() => setSidebarOpen(false)} className="block p-2 text-[11px] font-bold text-slate-500 hover:text-blue-600">
                          Add Admissions
                        </Link>
                      </div>
                    )}
                  </div>

                  {/* Counsellors */}
                  <Link
                    to="/dashboard/counsellors"
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold ${
                      location.pathname === '/dashboard/counsellors' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Users className="w-4 h-4 text-slate-400" />
                    <span>Counsellors</span>
                  </Link>
                  </>
                  )}

                  {canSeeLeads && (
                  <Link
                    to="/dashboard/leads"
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold ${
                      location.pathname === '/dashboard/leads' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <PhoneCall className="w-4 h-4 text-slate-400" />
                    <span>Queries</span>
                  </Link>
                  )}

                  {/* Counsellor's own Meta leads */}
                  {user.role === 'counsellor' && (
                    <>
                    <Link
                      to="/dashboard/registrations/unpaid"
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold ${
                        location.pathname.startsWith('/dashboard/registrations') ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <ClipboardList className="w-4 h-4 text-slate-400" />
                      <span>Registrations</span>
                    </Link>
                    <Link
                      to="/dashboard/my-leads"
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold ${
                        location.pathname === '/dashboard/my-leads' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <Headset className="w-4 h-4 text-slate-400" />
                      <span>My Leads</span>
                    </Link>
                    </>
                  )}

                  {/* Meta Leads */}
                  {['admin', 'manager'].includes(user.role) && (
                    <Link
                      to="/dashboard/meta-leads"
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold ${
                        location.pathname.startsWith('/dashboard/meta-leads') ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <Megaphone className="w-4 h-4 text-slate-400" />
                      <span>Meta Leads</span>
                    </Link>
                  )}

                  {isManager && (
                  <Link
                    to="/dashboard/newsletters"
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold ${
                      location.pathname === '/dashboard/newsletters' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Mail className="w-4 h-4 text-slate-400" />
                    <span>Newsletters</span>
                  </Link>
                  )}

                  {/* Integrations */}
                  {['admin', 'manager'].includes(user.role) && (
                    <Link
                      to="/dashboard/integrations/meta"
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold ${
                        location.pathname.startsWith('/dashboard/integrations') ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <Plug className="w-4 h-4 text-slate-400" />
                      <span>Integrations</span>
                    </Link>
                  )}

                  {isManager && (
                  <div>
                    <button
                      onClick={() => setDownloadOpen(!downloadOpen)}
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <Settings className="w-4 h-4 text-slate-400" />
                        <span>Download Switch</span>
                      </div>
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform ${downloadOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {downloadOpen && (
                      <div className="pl-9 space-y-1 py-1">
                        <Link to="/dashboard/settings/downloads" onClick={() => setSidebarOpen(false)} className="block p-2 text-[11px] font-bold text-slate-500 hover:text-blue-600">
                          Admit Card On/Off
                        </Link>
                        <Link to="/dashboard/settings/downloads" onClick={() => setSidebarOpen(false)} className="block p-2 text-[11px] font-bold text-slate-500 hover:text-blue-600">
                          Result On/Off
                        </Link>
                        <Link to="/dashboard/settings/downloads" onClick={() => setSidebarOpen(false)} className="block p-2 text-[11px] font-bold text-slate-500 hover:text-blue-600">
                          Counselling Letter On/Off
                        </Link>
                      </div>
                    )}
                  </div>
                  )}

                  {canSeeExams && (
                  <div>
                    <button
                      onClick={() => setUploadsOpen(!uploadsOpen)}
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <UploadCloud className="w-4 h-4 text-slate-400" />
                        <span>Uploads</span>
                      </div>
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform ${uploadsOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {uploadsOpen && (
                      <div className="pl-9 space-y-1 py-1">
                        <Link to="/dashboard/exams" onClick={() => setSidebarOpen(false)} className="block p-2 text-[11px] font-bold text-slate-500 hover:text-blue-600">
                          Results
                        </Link>
                        <Link to="/dashboard/exams" onClick={() => setSidebarOpen(false)} className="block p-2 text-[11px] font-bold text-slate-500 hover:text-blue-600">
                          Exam Dates
                        </Link>
                      </div>
                    )}
                  </div>
                  )}

                  {/* Announcements */}
                  <Link
                    to="/dashboard/announcements"
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold ${
                      location.pathname === '/dashboard/announcements' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <BellRing className="w-4 h-4 text-slate-400" />
                    <span>Announcements</span>
                  </Link>
                </>
              )}

              {/* Student links mobile */}
              {user && user.role === 'student' && (
                <>
                  <Link to="/dashboard/student/status" onClick={() => setSidebarOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50">
                    <Plane className="w-4 h-4 text-slate-400" /> Admission Status
                  </Link>
                  <Link to="/dashboard/student/admit-card" onClick={() => setSidebarOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50">
                    <ClipboardList className="w-4 h-4 text-slate-400" /> Entrance Admit Card
                  </Link>
                  <Link to="/dashboard/student/results" onClick={() => setSidebarOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50">
                    <BookOpen className="w-4 h-4 text-slate-400" /> Exam Results
                  </Link>
                  <Link to="/dashboard/student/ledger" onClick={() => setSidebarOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50">
                    <IndianRupee className="w-4 h-4 text-slate-400" /> Fee Ledger
                  </Link>
                  <Link to="/dashboard/announcements" onClick={() => setSidebarOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50">
                    <BellRing className="w-4 h-4 text-slate-400" /> Announcements
                  </Link>
                </>
              )}
            </nav>

            <div className="p-4 border-t border-slate-100">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-500 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
          <div className="flex-1" onClick={() => setSidebarOpen(false)}></div>
        </div>
      )}

      {/* Main Body */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 z-10 shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden md:block">
              <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Department Portal</p>
              <h1 className="text-sm font-bold text-slate-800 capitalize">{user?.role} dashboard</h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-slate-800">{user?.name}</p>
              <p className="text-[10px] font-medium text-slate-400">{user?.email}</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center font-bold text-blue-600 text-xs">
              {user?.name ? user.name.split(' ').map(n=>n[0]).join('').toUpperCase() : 'U'}
            </div>
          </div>
        </header>

        {/* Content Viewport */}
        <main className="flex-1 overflow-y-auto p-6 bg-slate-50">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
