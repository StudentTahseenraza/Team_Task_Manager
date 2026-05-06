import React from 'react';
import { motion } from 'framer-motion';

const SkeletonLoader = ({ type = 'card' }) => {
  if (type === 'card') {
    return (
      <div className="card" style={{ padding: '20px' }}>
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <div style={{
            width: '60%',
            height: '20px',
            background: '#e2e8f0',
            borderRadius: '4px',
            marginBottom: '15px'
          }} />
          <div style={{
            width: '90%',
            height: '14px',
            background: '#e2e8f0',
            borderRadius: '4px',
            marginBottom: '10px'
          }} />
          <div style={{
            width: '80%',
            height: '14px',
            background: '#e2e8f0',
            borderRadius: '4px',
            marginBottom: '10px'
          }} />
          <div style={{
            width: '40%',
            height: '14px',
            background: '#e2e8f0',
            borderRadius: '4px'
          }} />
        </motion.div>
      </div>
    );
  }

  if (type === 'suggestions') {
    return (
      <div style={{ maxWidth: '600px', width: '90%' }}>
        {[1, 2, 3].map((i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            style={{
              padding: '20px',
              marginBottom: '15px',
              background: 'white',
              borderRadius: '12px',
              border: '1px solid #e2e8f0'
            }}
          >
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
            >
              <div style={{
                width: '70%',
                height: '20px',
                background: '#e2e8f0',
                borderRadius: '4px',
                marginBottom: '12px'
              }} />
              <div style={{
                width: '90%',
                height: '14px',
                background: '#e2e8f0',
                borderRadius: '4px',
                marginBottom: '8px'
              }} />
              <div style={{
                width: '60%',
                height: '14px',
                background: '#e2e8f0',
                borderRadius: '4px'
              }} />
            </motion.div>
          </motion.div>
        ))}
      </div>
    );
  }

  return null;
};

export default SkeletonLoader;