import React from 'react';
import { motion } from 'framer-motion';
import StatRow from './deep/StatRow';
import BarChartComp from './deep/BarChart';
import ComparisonTable from './deep/ComparisonTable';
import Timeline from './deep/Timeline';
import QuoteBlock from './deep/QuoteBlock';
import ProCon from './deep/ProCon';

export type DeepComponent = {
  type: string;
  data: any;
};

export type ResearchSection = {
  title: string;
  body: string;
};

interface DeepModeRendererProps {
  summary?: string;
  components?: DeepComponent[];
  research_sections?: ResearchSection[];
  loading?: boolean;
}

export default function DeepModeRenderer({
  summary,
  components = [],
  research_sections = [],
  loading = false
}: DeepModeRendererProps) {

  const validComponents = components.filter((c) => c && c.type && c.data).slice(0, 5);
  const validSections = research_sections.filter((s) => s && s.title && s.body);

  const renderWidget = (c: DeepComponent, i: number) => {
    const key = `widget-${c.type}-${i}`;
    switch (c.type) {
      case 'stat_row': return <StatRow key={key} {...c.data} />;
      case 'bar_chart': return <BarChartComp key={key} {...c.data} />;
      case 'comparison_table': return <ComparisonTable key={key} {...c.data} />;
      case 'timeline': return <Timeline key={key} {...c.data} />;
      case 'quote_block': return <QuoteBlock key={key} {...c.data} />;
      case 'pro_con': return <ProCon key={key} {...c.data} />;
      default: return null;
    }
  };

  const renderResearchSection = (s: ResearchSection, i: number) => {
    return (
      <motion.div
        key={`research-${i}`}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ stiffness: 280, damping: 28, delay: 0.1 }}
        style={{
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 16,
          padding: '24px 28px',
          margin: '16px 0'
        }}
      >
        <div style={{
          fontSize: '10px',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: 'rgba(245,166,35,0.7)',
          marginBottom: 16,
          fontWeight: 400
        }}>
          {s.title}
        </div>
        <div style={{
          fontSize: '14px',
          lineHeight: '1.85',
          color: 'rgba(255,255,255,0.72)',
          fontWeight: 300
        }}>
          {s.body.split('\n').filter(p => p.trim()).map((para, idx) => (
            <p key={idx} style={{ marginBottom: 16 }}>{para}</p>
          ))}
        </div>
      </motion.div>
    );
  };

  // Interleaved rendering logic
  const elements: React.ReactNode[] = [];

  // 1. Intelligence Core (Summary)
  if (summary) {
    elements.push(
      <motion.div
        key="summary"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ stiffness: 280, damping: 28 }}
        style={{
          background: 'transparent',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 16,
          padding: '16px 20px',
          marginBottom: 12
        }}
      >
        <div style={{
          fontSize: '9px',
          letterSpacing: '0.2em',
          color: '#F5A623',
          textTransform: 'uppercase',
          marginBottom: 8,
          fontWeight: 400
        }}>
          Intelligence Core
        </div>
        <p style={{
          marginTop: 0,
          marginBottom: 0,
          color: 'rgba(255,255,255,0.7)',
          fontSize: '14px',
          fontWeight: 300,
          lineHeight: 1.75
        }}>
          {summary}
        </p>
      </motion.div>
    );
  }

  // Interleaving
  const maxLoops = Math.max(validComponents.length, validSections.length);
  for (let i = 0; i < maxLoops; i++) {
    if (validComponents[i]) {
      elements.push(
        <motion.div key={`comp-wrap-${i}`} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * i }}>
          {renderWidget(validComponents[i], i)}
        </motion.div>
      );
    }
    if (validSections[i]) {
      elements.push(renderResearchSection(validSections[i], i));
    }
  }

  return (
    <div style={{ color: '#fff', fontFamily: 'inherit', padding: '0 4px', width: '100%' }}>
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} style={{ height: 120, background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)', borderRadius: 16 }} />
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} style={{ height: 300, background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)', borderRadius: 16 }} />
        </div>
      ) : elements}
    </div>
  );
}

export { StatRow, BarChartComp as BarChart, ComparisonTable, Timeline, QuoteBlock, ProCon };
