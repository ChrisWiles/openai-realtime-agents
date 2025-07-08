'use client';

import Link from 'next/link';

export default function HowToUsePage() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 gradient-primary opacity-20"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-purple-400/10 via-pink-500/10 to-red-500/10"></div>

      <div className="relative z-10 max-w-4xl mx-auto p-8">
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-purple-600 hover:text-purple-800 transition-colors mb-4"
          >
            ← Back to App
          </Link>
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            How to Use Realtime Voice Agents
          </h1>
          <p className="text-xl text-gray-900 dark:text-gray-100">
            A comprehensive guide to using this advanced voice agent
            demonstration
          </p>
        </div>

        <div className="space-y-8">
          <section className="glass backdrop-blur-md border border-white/20 rounded-xl p-6 bg-white/80 dark:bg-gray-900/80">
            <h2 className="text-2xl font-semibold mb-4 text-purple-600">
              What is this?
            </h2>
            <p className="text-gray-900 dark:text-gray-100 mb-4">
              This is a demo showcasing advanced voice agent patterns. It uses a
              Realtime API and an Agents SDK to build intelligent voice
              assistants. We highlight two main ways to design these systems:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-900 dark:text-gray-100">
              <li>
                <strong>Chat-Supervisor Pattern:</strong> A quick, responsive
                agent handles simple chats, passing tougher questions to a
                smarter "supervisor" agent.
              </li>
              <li>
                <strong>Sequential Handoff Pattern:</strong> Different
                specialized agents work together, handing off the conversation
                as needed to handle specific user requests.
              </li>
            </ul>
          </section>

          <section className="glass backdrop-blur-md border border-white/20 rounded-xl p-6 bg-white/80 dark:bg-gray-900/80">
            <h2 className="text-2xl font-semibold mb-4 text-purple-600">
              Getting Started
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">
                  1. Choose a Scenario
                </h3>
                <p className="text-gray-900 dark:text-gray-100">
                  Pick a scenario from the "Scenario" dropdown in the top
                  toolbar to try out different agent setups:
                </p>
                <ul className="list-disc list-inside ml-4 space-y-1 text-gray-900 dark:text-gray-100">
                  <li>
                    <strong>chatSupervisor:</strong> A basic chat agent backed
                    by a smart supervisor for tougher questions.
                  </li>
                  <li>
                    <strong>customerServiceRetail:</strong> A multi-agent system
                    for customer service, handling various retail inquiries.
                  </li>
                  <li>
                    <strong>simpleHandoff:</strong> A straightforward example of
                    how agents can pass conversations to each other.
                  </li>
                  <li>
                    <strong>materialOrdering:</strong> An assistant for ordering
                    construction materials.
                  </li>
                  <li>
                    <strong>projectEstimation:</strong> An agent that helps with
                    project planning and estimates.
                  </li>
                  <li>
                    <strong>vendorManagement:</strong> An assistant for managing
                    vendors and procurement.
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-medium mb-2">
                  2. Connect and Begin
                </h3>
                <p className="text-gray-900 dark:text-gray-100">
                  Hit the "Connect" button in the bottom toolbar. It'll turn
                  green once you're linked up to the Realtime API.
                </p>
              </div>
            </div>
          </section>

          <section className="glass backdrop-blur-md border border-white/20 rounded-xl p-6 bg-white/80 dark:bg-gray-900/80">
            <h2 className="text-2xl font-semibold mb-4 text-purple-600">
              How to Interact
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">Voice Interaction</h3>
                <p className="text-gray-900 dark:text-gray-100 mb-2">
                  Once connected, you can speak directly to the agent. The
                  system uses automatic voice activity detection by default.
                </p>
                <p className="text-gray-900 dark:text-gray-100">
                  <strong>Push-to-Talk Mode:</strong> Toggle the "Push to talk"
                  checkbox to manually control when you're speaking using the
                  "Talk" button.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-medium mb-2">Text Interaction</h3>
                <p className="text-gray-900 dark:text-gray-100">
                  You can also type messages using the text input at the bottom
                  of the transcript panel and press Enter or click "Send".
                </p>
              </div>
            </div>
          </section>

          <section className="glass backdrop-blur-md border border-white/20 rounded-xl p-6 bg-white/80 dark:bg-gray-900/80">
            <h2 className="text-2xl font-semibold mb-4 text-purple-600">
              Understanding the Interface
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">
                  Transcript Panel (Left)
                </h3>
                <p className="text-gray-900 dark:text-gray-100">
                  Shows the conversation history including:
                </p>
                <ul className="list-disc list-inside ml-4 space-y-1 text-gray-900 dark:text-gray-100">
                  <li>User messages and agent responses</li>
                  <li>Tool calls and their results (expandable)</li>
                  <li>Agent handoffs and breadcrumbs</li>
                  <li>Guardrail status indicators</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-medium mb-2">
                  Events Panel (Right)
                </h3>
                <p className="text-gray-900 dark:text-gray-100">
                  Displays real-time event logs from both client and server,
                  useful for debugging and understanding the system's behavior.
                </p>
              </div>
            </div>
          </section>

          <section className="glass backdrop-blur-md border border-white/20 rounded-xl p-6 bg-white/80 dark:bg-gray-900/80">
            <h2 className="text-2xl font-semibold mb-4 text-purple-600">
              Audio & Voice Settings
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">Voice Selection</h3>
                <p className="text-gray-900 dark:text-gray-100 mb-2">
                  Choose from 8 different voices in the bottom toolbar:
                </p>
                <ul className="list-disc list-inside ml-4 space-y-1 text-gray-900 dark:text-gray-100">
                  <li>
                    <strong>Alloy:</strong> Neutral, balanced & clear
                  </li>
                  <li>
                    <strong>Echo:</strong> Male, deep & calm
                  </li>
                  <li>
                    <strong>Shimmer:</strong> Female, crisp & pleasant
                  </li>
                  <li>
                    <strong>Ash:</strong> Male, confident & smooth
                  </li>
                  <li>
                    <strong>Ballad:</strong> Male, warm & expressive
                  </li>
                  <li>
                    <strong>Coral:</strong> Female, warm & friendly
                  </li>
                  <li>
                    <strong>Sage:</strong> Female, calm & thoughtful
                  </li>
                  <li>
                    <strong>Verse:</strong> Male, British accent
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-medium mb-2">Audio Codec</h3>
                <p className="text-gray-900 dark:text-gray-100">
                  Switch between high-quality Opus (48 kHz) and
                  telephone-quality PCMU/PCMA (8 kHz) to test different audio
                  conditions.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-medium mb-2">Audio Playback</h3>
                <p className="text-gray-900 dark:text-gray-100">
                  Toggle "Audio playback" to enable/disable hearing the agent's
                  responses.
                </p>
              </div>
            </div>
          </section>

          <section className="glass backdrop-blur-md border border-white/20 rounded-xl p-6 bg-white/80 dark:bg-gray-900/80">
            <h2 className="text-2xl font-semibold mb-4 text-purple-600">
              Example Scenarios
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">
                  Customer Service Flow
                </h3>
                <p className="text-gray-900 dark:text-gray-100 mb-2">
                  Try the "customerServiceRetail" scenario and say:
                </p>
                <p className="bg-gray-200 dark:bg-gray-800 p-3 rounded-lg font-mono text-sm text-gray-900 dark:text-gray-100">
                  "Hi, I'd like to return my snowboard."
                </p>
                <p className="text-gray-900 dark:text-gray-100">
                  The system will guide you through authentication and return
                  processing.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-medium mb-2">
                  Construction Procurement
                </h3>
                <p className="text-gray-900 dark:text-gray-100 mb-2">
                  Try the "materialOrdering" scenario and say:
                </p>
                <p className="bg-gray-200 dark:bg-gray-800 p-3 rounded-lg font-mono text-sm text-gray-900 dark:text-gray-100">
                  "I need to order materials for a residential project."
                </p>
                <p className="text-gray-900 dark:text-gray-100">
                  The agent will help you specify materials and quantities.
                </p>
              </div>
            </div>
          </section>

          <section className="glass backdrop-blur-md border border-white/20 rounded-xl p-6 bg-white/80 dark:bg-gray-900/80">
            <h2 className="text-2xl font-semibold mb-4 text-purple-600">
              Key Features
            </h2>
            <ul className="list-disc list-inside space-y-2 text-gray-900 dark:text-gray-100">
              <li>
                <strong>Real-time voice interaction</strong> with low latency
              </li>
              <li>
                <strong>Intelligent agent handoffs</strong> for specialized
                tasks
              </li>
              <li>
                <strong>Tool calling capabilities</strong> for external
                integrations
              </li>
              <li>
                <strong>Safety guardrails</strong> for content moderation
              </li>
              <li>
                <strong>Multiple voice options</strong> for personalized
                experience
              </li>
              <li>
                <strong>Comprehensive logging</strong> for debugging and
                monitoring
              </li>
              <li>
                <strong>Flexible codec support</strong> for different audio
                conditions
              </li>
            </ul>
          </section>

          <section className="glass backdrop-blur-md border border-white/20 rounded-xl p-6 bg-white/80 dark:bg-gray-900/80">
            <h2 className="text-2xl font-semibold mb-4 text-purple-600">
              Troubleshooting
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">Connection Issues</h3>
                <ul className="list-disc list-inside ml-4 space-y-1 text-gray-900 dark:text-gray-100">
                  <li>Ensure you have a stable internet connection</li>
                  <li>Check that your API key is properly configured</li>
                  <li>Try refreshing the page and reconnecting</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-medium mb-2">Audio Issues</h3>
                <ul className="list-disc list-inside ml-4 space-y-1 text-gray-900 dark:text-gray-100">
                  <li>Grant microphone permissions when prompted</li>
                  <li>Check your browser's audio settings</li>
                  <li>
                    Try different audio codecs if experiencing quality issues
                  </li>
                </ul>
              </div>
            </div>
          </section>

          <section className="glass backdrop-blur-md border border-white/20 rounded-xl p-6 bg-white/80 dark:bg-gray-900/80">
            <h2 className="text-2xl font-semibold mb-4 text-purple-600">
              Technical Architecture
            </h2>
            <p className="text-gray-900 dark:text-gray-100 mb-4">
              This application is built to showcase advanced voice agent
              patterns, leveraging these core technologies:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-900 dark:text-gray-100">
              <li>
                <strong>Realtime API:</strong> Powers low-latency voice
                interactions.
              </li>
              <li>
                <strong>Agents SDK:</strong> Provides the framework for agent
                orchestration and management.
              </li>
              <li>
                <strong>Next.js:</strong> A full-stack React framework for the
                web interface.
              </li>
              <li>
                <strong>WebRTC:</strong> Handles real-time audio streaming
                between your browser and the API.
              </li>
              <li>
                <strong>TypeScript:</strong> Ensures type-safe development with
                modern JavaScript features.
              </li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
