import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useMotionValueEvent } from 'framer-motion';
import { FileText, Users, Calendar, Lightbulb, Rocket, Trophy } from 'lucide-react';

// Updated hackathon milestones
const timelineData = [
  {
    id: 1,
    date: 'February 18, 2026',
    title: 'Registration Opens',
    description: 'Participants register individually or in teams. Get ready to innovate and collaborate.',
    icon: FileText,
  },
  {
    id: 2,
    date: 'February 28, 2026',
    title: 'Team Shortlisting',
    description: 'Selected teams are notified. Prepare for mentoring and idea finalization.',
    icon: Users,
  },
  {
    id: 3,
    date: 'March 6, 2026',
    title: 'Hackathon Kick-off & Event Day',
    description: 'The main coding marathon begins. Teams implement, test, and polish their projects.',
    icon: Rocket,
  },
  {
    id: 4,
    date: 'March 6, 2026 - 3 PM',
    title: 'Mentoring Round 1',
    description: 'Teams get guidance from mentors to refine their ideas and project approach.',
    icon: Lightbulb,
  },
  {
    id: 5,
    date: 'March 7, 2026 - 8 AM',
    title: 'Mentoring Round 2',
    description: 'Mentors provide last-minute tips and help solve blockers for teams.',
    icon: Lightbulb,
  },
  {
    id: 6,
    date: 'March 7, 2026 - 12.30 PM',
    title: 'Final Round',
    description: 'Teams submit their final projects for judging. Creativity and functionality are evaluated.',
    icon: Calendar,
  },
  {
    id: 7,
    date: 'March 7, 2026',
    title: 'Results & Awards',
    description: 'Winners are announced! Celebrate the top projects and innovative solutions.',
    icon: Trophy,
  },
];

// Glass node
const GlassNode = ({ isActive, Icon }) => (
  <div className="timeline-node-wrapper">
    <div className={`timeline-glass-node ${isActive ? 'timeline-glass-node--active' : ''}`}>
      <Icon className="timeline-node-icon" strokeWidth={1.5} />
      <div className="timeline-node-highlight" />
      <div className="timeline-node-rim" />
    </div>
  </div>
);

// Timeline row
const TimelineRow = ({ data, index }) => {
  const isEven = index % 2 === 0;
  const rowRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: rowRef,
    offset: ['start end', 'end start'],
  });

  const [isActive, setIsActive] = React.useState(false);
  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    setIsActive(v >= 0.35 && v <= 0.65);
  });

  return (
    <div ref={rowRef} className="timeline-section" id='schedule'>
      <div className={`timeline-row ${isEven ? 'timeline-row--even' : 'timeline-row--odd'}`}>
        <div className="timeline-spacer" />
        <div className="timeline-node-col">
          <GlassNode isActive={isActive} Icon={data.icon} />
        </div>
        <div className={`timeline-card-wrapper ${isEven ? 'md:text-right' : 'md:text-left'}`}>
          <motion.div
            initial={{ opacity: 0, scale: 0.1 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: '-15% 0px' }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className={`timeline-card ${isActive ? 'timeline-card--active' : ''}`}
          >
            <h3 className="mb-1 font-bold text-white text-xl">{data.title}</h3>
            <p className="mb-2 text-sm text-purple-200 font-semibold">{data.date}</p>
            <p className="text-sm leading-snug text-gray-200">{data.description}</p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

// Main timeline
const Timeline = () => {
  const containerRef = useRef(null);
  const [beamMetrics, setBeamMetrics] = React.useState({ top: 0, height: 0, endProgress: 0.8 });

  React.useEffect(() => {
    const updateMetrics = () => {
      if (!containerRef.current) return;
      const sections = containerRef.current.querySelectorAll('.timeline-section');
      if (sections.length < 2) return;

      const nodeRadius = 28;
      const firstSection = sections[0];
      const lastSection = sections[sections.length - 1];
      const isDesktop = window.innerWidth >= 768;

      let firstY, lastY;

      if (isDesktop) {
        firstY = firstSection.offsetTop;
        lastY = lastSection.offsetTop + (lastSection.offsetHeight - lastSection.offsetHeight * 0.25);
      } else {
        firstY = firstSection.offsetTop + nodeRadius;
        lastY = lastSection.offsetTop + nodeRadius;
      }
      
      const beamHeightVal = lastY - firstY;
      const containerHeight = containerRef.current.scrollHeight;
      const endProg = containerHeight > 0 ? lastY / containerHeight : 1;

      setBeamMetrics({
        top: firstY,
        height: beamHeightVal,
        endProgress: Math.min(Math.max(endProg, 0.1), 0.99),
      });
    };

    updateMetrics();
    window.addEventListener('resize', updateMetrics);
    const timer = setTimeout(updateMetrics, 500);
    return () => {
      window.removeEventListener('resize', updateMetrics);
      clearTimeout(timer);
    };
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start center', 'end center'],
  });

  const beamHeight = useTransform(
    scrollYProgress,
    [0, beamMetrics.endProgress, 1],
    [0, beamMetrics.height, beamMetrics.height]
  );

  return (
    <div className="container mx-auto w-full py-24 px-4 bg-transparent relative">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="text-center mb-28"
      >
        <h2 className="text-4xl md:text-6xl font-extrabold mb-6">
          <span className="text-white">Event </span>
          <span className="text-transparent bg-clip-text bg-linear-to-r from-purple-400 to-blue-400">
            Timeline
          </span>
        </h2>
        <div className="flex items-center justify-center gap-4 mb-8">
          <div className="h-px w-16 bg-linear-to-r from-transparent to-purple-500/50" />
          <div className="w-2 h-2 rounded-full bg-purple-400 shadow-[0_0_10px_#a78bfa]" />
          <div className="h-px w-16 bg-linear-to-l from-transparent to-purple-500/50" />
        </div>
        <p className="max-w-xl mx-auto text-gray-300 text-lg leading-relaxed">
          Follow the journey from registration to results.
        </p>
      </motion.div>

      <div ref={containerRef} className="relative">
        <div className="timeline-track" style={{ top: beamMetrics.top, height: beamMetrics.height }} />
        <motion.div className="timeline-beam" style={{ top: beamMetrics.top, height: beamHeight }} />
        {timelineData.map((item, index) => (
          <TimelineRow key={item.id} data={item} index={index} />
        ))}
      </div>
    </div>
  );
};

export default Timeline;
