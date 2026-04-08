'use client';

import { useState } from 'react';

export default function SentryManualTest() {
  const [result, setResult] = useState('');

  const testSentryDirect = async () => {
    setResult('⏳ Testing...');
    
    try {
      // Import Sentry dynamically
      const Sentry = await import('@sentry/nextjs');
      
      // Check if Sentry is initialized
      const client = Sentry.getClient();
      if (!client) {
        setResult('❌ Sentry client not initialized!');
        return;
      }

      const options = client.getOptions();
      setResult(`✅ Sentry initialized!\n\nDSN: ${options.dsn}\nTunnel: ${options.tunnel || 'none'}\n\n⏳ Sending test error...`);

      // Manually send error
      const eventId = Sentry.captureException(
        new Error('🧪 Manual Sentry Test - Direct API Call'),
        {
          tags: { test: 'manual', source: 'sentry-manual-test' },
          level: 'error',
        }
      );

      // Wait a bit
      await new Promise(resolve => setTimeout(resolve, 2000));

      setResult(prev => prev + `\n\n✅ Event sent!\nEvent ID: ${eventId}\n\nCheck Sentry dashboard in 10 seconds.`);

    } catch (error) {
      setResult(`❌ Error: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', fontFamily: 'monospace' }}>
      <h1 style={{ marginBottom: '1rem', fontSize: '1.5rem' }}>🔬 Sentry Manual Test</h1>
      
      <button
        onClick={testSentryDirect}
        style={{
          padding: '1rem 2rem',
          backgroundColor: '#503B64',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '1rem',
          marginBottom: '2rem',
        }}
      >
        Test Sentry Direct API
      </button>

      {result && (
        <pre style={{
          backgroundColor: '#f5f5f5',
          padding: '1rem',
          borderRadius: '8px',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
        }}>
          {result}
        </pre>
      )}

      <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#fff3cd', borderRadius: '8px' }}>
        <strong>📋 Instructions:</strong>
        <ol style={{ marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
          <li>Ouvre DevTools (F12) → Onglet Console</li>
          <li>Clique sur "Test Sentry Direct API"</li>
          <li>Regarde les logs console pour détails</li>
          <li>Si Event ID s'affiche → va sur Sentry dashboard</li>
        </ol>
      </div>
    </div>
  );
}
