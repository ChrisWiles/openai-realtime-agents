import { Suspense } from 'react';
import { EventProvider } from '@/app/contexts/EventContext';
import { TranscriptProvider } from '@/app/contexts/TranscriptContext';
import App from './App';

/**
 * The main page component that sets up the application's context providers.
 * It wraps the `App` component with `TranscriptProvider` and `EventProvider`,
 * and uses `Suspense` for loading states.
 */
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
