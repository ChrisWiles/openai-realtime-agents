import { Suspense } from 'react';
import { EventProvider } from '@/app/contexts/EventContext';
import { TranscriptProvider } from '@/app/contexts/TranscriptContext';
import App from './App';

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TranscriptProvider>
        <EventProvider>
          <App />
        </EventProvider>
      </TranscriptProvider>
    </Suspense>
  );
}
