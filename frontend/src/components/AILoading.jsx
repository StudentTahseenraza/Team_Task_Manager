import React from 'react';
import { motion } from 'framer-motion';

const AILoading = ({ type = 'suggestions' }) => {
  const messages = {
    suggestions: [
      '🤖 Analyzing your project requirements...',
      '🧠 Generating intelligent task suggestions...',
      '⚡ Applying AI algorithms...',
      '📊 Creating optimized task list...',
      '✨ Almost there! Crafting smart recommendations...'
    ],
    summary: [
      '📝 Reading project data...',
      '🔍 Analyzing task patterns...',
      '📊 Generating insights...',
      '✍️ Writing comprehensive summary...',
      '🎯 Finalizing AI analysis...'
    ],
    analyze: [
      '🔬 Examining task complexity...',
      '📐 Calculating effort estimates...',
      '⚠️ Identifying potential risks...',
      '💡 Suggesting optimizations...',
      '✅ Completing analysis...'
    ]
  };

  const currentMessages = messages[type] || messages.suggestions;
  const [messageIndex, setMessageIndex] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % currentMessages.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [currentMessages.length]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      style={{
        textAlign: 'center',
        padding: '40px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '20px',
        color: 'white'
      }}
    >
      {/* Animated Brain Icon */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 10, -10, 0]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          repeatType: 'reverse'
        }}
        style={{
          fontSize: '60px',
          marginBottom: '20px'
        }}
      >
        🧠
      </motion.div>

      {/* Loading Spinner */}
      <div style={{
        width: '60px',
        height: '60px',
        margin: '0 auto 20px',
        border: '4px solid rgba(255,255,255,0.2)',
        borderTop: '4px solid white',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }} />

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>

      {/* Animated Message */}
      <motion.div
        key={messageIndex}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        style={{
          fontSize: '18px',
          fontWeight: '500',
          marginBottom: '10px'
        }}
      >
        {currentMessages[messageIndex]}
      </motion.div>

      {/* Progress Bar */}
      <div style={{
        width: '80%',
        height: '4px',
        background: 'rgba(255,255,255,0.2)',
        borderRadius: '2px',
        margin: '20px auto 0',
        overflow: 'hidden'
      }}>
        <motion.div
          animate={{
            x: ['-100%', '100%']
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'linear'
          }}
          style={{
            width: '50%',
            height: '100%',
            background: 'white',
            borderRadius: '2px'
          }}
        />
      </div>

      <p style={{
        fontSize: '14px',
        opacity: 0.8,
        marginTop: '20px'
      }}>
        Using GPT-3.5 Turbo • Please wait...
      </p>
    </motion.div>
  );
};

export default AILoading;