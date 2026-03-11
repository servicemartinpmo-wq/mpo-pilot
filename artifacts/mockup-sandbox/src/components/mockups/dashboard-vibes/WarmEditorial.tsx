import React, { useState } from 'react';
import './_group.css';
import { LayoutDashboard, FolderKanban, Users, FileBarChart, PenTool, CheckCircle, AlertCircle, Clock, XCircle, ArrowRight, Activity } from 'lucide-react';

const COLORS = {
  bgCream: '#f5f0e8',
  sidebarCharcoal: '#1e1812',
  headingBrown: '#2c2416',
  bodyBrown: '#5a4f3e',
  accentBurgundy: '#8b2e3c',
  goldRule: '#c9a96e',
  cardWhite: '#ffffff',
  cardBorder: '#e8e0d0',
};

const FONTS = {
  serif: "'Playfair Display', serif",
  sans: "'Inter', sans-serif",
};

export function WarmEditorial() {
  const [activeNav, setActiveNav] = useState('Dashboard');

  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard },
    { name: 'Projects', icon: FolderKanban },
    { name: 'People', icon: Users },
    { name: 'Reports', icon: FileBarChart },
    { name: 'Tools', icon: PenTool },
  ];

  const kpis = [
    { label: 'On Track', value: 8 },
    { label: 'At Risk', value: 3 },
    { label: 'Blocked', value: 2 },
    { label: 'Total Initiatives', value: 12 },
  ];

  const initiatives = [
    { name: 'Product Launch', progress: 78 },
    { name: 'Brand Refresh', progress: 45 },
    { name: 'Digital Ops', progress: 91 },
    { name: 'Team Scale', progress: 23 },
  ];

  const actionItems = [
    { name: 'Review Q2 budget variance', status: 'overdue', date: 'Overdue', icon: AlertCircle },
    { name: 'Approve new hire — Product', status: 'today', date: 'Today', icon: CheckCircle },
    { name: 'Sign off campaign brief', status: 'tomorrow', date: 'Tomorrow', icon: Clock },
  ];

  const departments = [
    { name: 'Engineering', health: 82 },
    { name: 'Marketing', health: 64 },
    { name: 'Operations', health: 78 },
    { name: 'Finance', health: 71 },
  ];

  const SectionTitle = ({ title }: { title: string }) => (
    <div className="flex items-center gap-4 mb-6">
      <h3 
        style={{ color: COLORS.headingBrown, fontFamily: FONTS.sans, letterSpacing: '0.05em' }} 
        className="text-xs uppercase font-semibold m-0 whitespace-nowrap"
      >
        {title}
      </h3>
      <div className="flex-1 h-px" style={{ backgroundColor: COLORS.goldRule, opacity: 0.5 }}></div>
    </div>
  );

  return (
    <div className="min-h-screen flex w-full" style={{ backgroundColor: COLORS.bgCream, fontFamily: FONTS.sans }}>
      
      {/* Sidebar */}
      <div 
        className="w-[240px] flex-shrink-0 flex flex-col justify-between py-10"
        style={{ backgroundColor: COLORS.sidebarCharcoal }}
      >
        <div>
          <div className="px-8 mb-16">
            <h1 
              style={{ fontFamily: FONTS.serif, color: COLORS.bgCream }} 
              className="text-2xl font-bold tracking-wide leading-tight"
            >
              Nexus<br/>Operations
            </h1>
          </div>
          
          <nav className="flex flex-col gap-2">
            {navItems.map((item) => {
              const isActive = activeNav === item.name;
              const Icon = item.icon;
              return (
                <button
                  key={item.name}
                  onClick={() => setActiveNav(item.name)}
                  className="flex items-center gap-4 px-8 py-3 text-sm transition-colors duration-300 w-full text-left"
                  style={{
                    color: isActive ? COLORS.accentBurgundy : COLORS.bgCream,
                    borderLeft: `3px solid ${isActive ? COLORS.accentBurgundy : 'transparent'}`,
                    fontFamily: FONTS.sans,
                    letterSpacing: '0.05em',
                    opacity: isActive ? 1 : 0.6,
                    backgroundColor: isActive ? 'rgba(139, 46, 60, 0.05)' : 'transparent'
                  }}
                >
                  <Icon size={16} strokeWidth={isActive ? 2.5 : 2} />
                  <span className="uppercase text-xs font-semibold">{item.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="px-8 mt-12">
          <div className="flex items-center gap-4">
            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: COLORS.bgCream }}
            >
              <span style={{ fontFamily: FONTS.serif, color: COLORS.accentBurgundy }} className="text-xl font-bold">
                72
              </span>
            </div>
            <div style={{ color: COLORS.bgCream, opacity: 0.8 }} className="text-xs uppercase tracking-widest leading-relaxed">
              Org<br/>Health
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto px-12 py-16">
          
          {/* Hero Strip */}
          <div className="flex justify-between items-end mb-16 border-b pb-8" style={{ borderColor: `${COLORS.goldRule}40` }}>
            <div>
              <h2 
                style={{ fontFamily: FONTS.serif, color: COLORS.headingBrown }} 
                className="text-5xl font-medium mb-3"
              >
                Good morning, Martin.
              </h2>
              <p style={{ color: COLORS.bodyBrown, fontFamily: FONTS.serif, fontStyle: 'italic' }} className="text-lg">
                Your command center is ready.
              </p>
            </div>
            <div className="text-right">
              <div style={{ color: COLORS.headingBrown, fontFamily: FONTS.sans }} className="text-sm font-medium uppercase tracking-widest mb-1">
                Thursday
              </div>
              <div style={{ fontFamily: FONTS.serif, color: COLORS.accentBurgundy }} className="text-xl italic">
                October 24th
              </div>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-4 gap-6 mb-16">
            {kpis.map((kpi, index) => (
              <div 
                key={index} 
                className="p-8 flex flex-col justify-between"
                style={{ 
                  backgroundColor: COLORS.cardWhite, 
                  border: `1px solid ${COLORS.cardBorder}`,
                  borderTop: `3px solid ${COLORS.goldRule}`
                }}
              >
                <div 
                  style={{ fontFamily: FONTS.serif, color: COLORS.headingBrown }} 
                  className="text-5xl font-semibold mb-6"
                >
                  {kpi.value}
                </div>
                <div 
                  style={{ color: COLORS.bodyBrown, fontFamily: FONTS.sans, letterSpacing: '0.05em' }} 
                  className="text-xs uppercase font-medium"
                >
                  {kpi.label}
                </div>
              </div>
            ))}
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-12 gap-12">
            
            {/* Left Column: Initiatives */}
            <div className="col-span-7">
              <SectionTitle title="Active Initiatives" />
              
              <div 
                className="p-8"
                style={{ 
                  backgroundColor: COLORS.cardWhite, 
                  border: `1px solid ${COLORS.cardBorder}`,
                }}
              >
                <div className="flex flex-col gap-8">
                  {initiatives.map((init, i) => (
                    <div key={i}>
                      <div className="flex justify-between items-center mb-3">
                        <span style={{ color: COLORS.headingBrown, fontFamily: FONTS.serif }} className="text-lg font-medium">
                          {init.name}
                        </span>
                        <span style={{ color: COLORS.accentBurgundy, fontFamily: FONTS.serif }} className="text-sm italic font-medium">
                          {init.progress}%
                        </span>
                      </div>
                      <div 
                        className="h-1.5 w-full rounded-full overflow-hidden" 
                        style={{ backgroundColor: COLORS.cardBorder }}
                      >
                        <div 
                          className="h-full rounded-full transition-all duration-1000 ease-out"
                          style={{ 
                            width: `${init.progress}%`, 
                            backgroundColor: COLORS.accentBurgundy 
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Actions & Departments */}
            <div className="col-span-5 flex flex-col gap-12">
              
              {/* Action Items */}
              <div>
                <SectionTitle title="Required Actions" />
                <div 
                  className="p-8"
                  style={{ 
                    backgroundColor: COLORS.cardWhite, 
                    border: `1px solid ${COLORS.cardBorder}`,
                  }}
                >
                  <div className="flex flex-col gap-5">
                    {actionItems.map((action, i) => {
                      const Icon = action.icon;
                      const isOverdue = action.status === 'overdue';
                      return (
                        <div key={i} className="flex gap-4 items-start pb-5 border-b last:border-0 last:pb-0" style={{ borderColor: `${COLORS.cardBorder}80` }}>
                          <Icon 
                            size={18} 
                            className="mt-1 flex-shrink-0" 
                            style={{ color: isOverdue ? COLORS.accentBurgundy : COLORS.goldRule }} 
                          />
                          <div className="flex-1">
                            <div style={{ color: COLORS.headingBrown, fontFamily: FONTS.sans }} className="text-sm font-medium mb-1">
                              {action.name}
                            </div>
                            <div style={{ color: isOverdue ? COLORS.accentBurgundy : COLORS.bodyBrown, fontFamily: FONTS.serif }} className="text-xs italic">
                              {action.date}
                            </div>
                          </div>
                          <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1">
                            <ArrowRight size={16} style={{ color: COLORS.goldRule }} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Department Health */}
              <div>
                <SectionTitle title="Department Health" />
                <div 
                  className="p-8"
                  style={{ 
                    backgroundColor: COLORS.cardWhite, 
                    border: `1px solid ${COLORS.cardBorder}`,
                  }}
                >
                  <div className="flex flex-col gap-6">
                    {departments.map((dept, i) => (
                      <div key={i}>
                        <div className="flex justify-between items-center mb-2">
                          <span style={{ color: COLORS.headingBrown, fontFamily: FONTS.sans }} className="text-sm font-medium">
                            {dept.name}
                          </span>
                          <span style={{ color: COLORS.bodyBrown, fontFamily: FONTS.serif }} className="text-sm italic">
                            {dept.health}/100
                          </span>
                        </div>
                        <div 
                          className="h-1 w-full rounded-none overflow-hidden" 
                          style={{ backgroundColor: COLORS.cardBorder }}
                        >
                          <div 
                            className="h-full rounded-none transition-all duration-1000 ease-out"
                            style={{ 
                              width: `${dept.health}%`, 
                              backgroundColor: COLORS.headingBrown 
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default WarmEditorial;
