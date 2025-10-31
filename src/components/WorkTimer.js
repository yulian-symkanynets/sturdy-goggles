import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

function WorkTimer() {
  const [workSession, setWorkSession] = useState({
    isActive: false,
    startTime: null,
    elapsedSeconds: 0
  });

  // Load work session from localStorage on mount
  useEffect(() => {
    const savedSession = localStorage.getItem('workSession');
    if (savedSession) {
      try {
        const session = JSON.parse(savedSession);
        if (session.isActive && session.startTime) {
          // Calculate elapsed time if session was active
          const now = Date.now();
          const elapsed = Math.floor((now - session.startTime) / 1000);
          setWorkSession({
            isActive: true,
            startTime: session.startTime,
            elapsedSeconds: elapsed
          });
        }
      } catch (error) {
        console.error('Failed to parse saved session:', error);
        localStorage.removeItem('workSession');
      }
    }
  }, []);

  // Save work session to localStorage when isActive or startTime changes
  useEffect(() => {
    const sessionToSave = {
      isActive: workSession.isActive,
      startTime: workSession.startTime
    };
    localStorage.setItem('workSession', JSON.stringify(sessionToSave));
  }, [workSession.isActive, workSession.startTime]);

  // Timer effect - updates every second when active
  useEffect(() => {
    let interval = null;
    if (workSession.isActive && workSession.startTime) {
      interval = setInterval(() => {
        setWorkSession(prev => ({
          ...prev,
          elapsedSeconds: Math.floor((Date.now() - prev.startTime) / 1000)
        }));
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
    // We intentionally use prev.startTime inside the callback to avoid recreating interval
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workSession.isActive]);

  const handleStartWorkSession = () => {
    const startTime = Date.now();
    setWorkSession({
      isActive: true,
      startTime: startTime,
      elapsedSeconds: 0
    });
  };

  const handleStopWorkSession = () => {
    setWorkSession({
      isActive: false,
      startTime: null,
      elapsedSeconds: 0
    });
  };

  // Format seconds to HH:MM:SS
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div
      className="work-session-section"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.15 }}
    >
      <h2>⏱️ Work Session Timer</h2>
      <div className="timer-container">
        <div className={`timer-display ${workSession.isActive ? 'active' : ''}`}>
          {formatTime(workSession.elapsedSeconds)}
        </div>
        <div className="timer-controls">
          {!workSession.isActive ? (
            <motion.button
              className="start-btn"
              onClick={handleStartWorkSession}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Start Work Session
            </motion.button>
          ) : (
            <motion.button
              className="stop-btn"
              onClick={handleStopWorkSession}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Stop Work Session
            </motion.button>
          )}
        </div>
        {workSession.isActive && (
          <motion.div
            className="session-status"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            🟢 Session in progress
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

export default WorkTimer;
