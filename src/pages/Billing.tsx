import { Layout } from "../components/Layout";
import { CreditCard, Check } from "lucide-react";

export function Billing() {
  return (
    <Layout
      title="Billing & Subscriptions"
      icon={<CreditCard className="w-5 h-5 text-blue-500" />}
    >
      <div className="max-w-6xl mx-auto space-y-6 w-full">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold tracking-tight mb-2">
            Pricing Plans for TransLoom
          </h2>
          <p className="text-gray-400">
            Upgrade your translation capabilities with AI-powered features.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Free Plan */}
          <div className="bg-card border border-border rounded-2xl p-8 shadow-sm flex flex-col">
            <h3 className="text-xl font-bold mb-2">Free Plan</h3>
            <p className="text-gray-400 text-sm mb-6">
              Perfect for discovering AI translation.
            </p>
            <div className="text-4xl font-bold mb-6">
              $0<span className="text-lg text-gray-500 font-normal">/mo</span>
            </div>
            <ul className="space-y-3 mb-8 flex-1">
              <li className="flex items-center gap-2 text-sm">
                <Check className="text-green-500 w-4 h-4" /> Up to 5 projects
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Check className="text-green-500 w-4 h-4" /> 10,000 words
                matched /month
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Check className="text-green-500 w-4 h-4" /> Basic Dictionary
                Glossaries
              </li>
            </ul>
            <button
              onClick={() => alert("Currently enrolled in Free Trial.")}
              className="w-full bg-gray-800 text-white font-semibold rounded-lg px-4 py-2 hover:bg-gray-700 transition"
            >
              Current Plan
            </button>
          </div>

          {/* Pro Plan */}
          <div className="bg-card border-2 border-blue-500 rounded-2xl p-8 shadow-lg flex flex-col relative transform lg:scale-105">
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">
              RECOMMENDED
            </div>
            <h3 className="text-xl font-bold mb-2">Pro Plan</h3>
            <p className="text-gray-400 text-sm mb-6">
              For professional freelance translators.
            </p>
            <div className="text-4xl font-bold mb-6">
              $29<span className="text-lg text-gray-500 font-normal">/mo</span>
            </div>
            <ul className="space-y-3 mb-8 flex-1">
              <li className="flex items-center gap-2 text-sm">
                <Check className="text-blue-500 w-4 h-4" /> Unlimited projects
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Check className="text-blue-500 w-4 h-4" /> 1,000,000 words
                matched /month
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Check className="text-blue-500 w-4 h-4" /> Advanced TM Fuzzy
                Matching
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Check className="text-blue-500 w-4 h-4" /> Neural Automated
                Drafts
              </li>
            </ul>
            <button
              onClick={() =>
                alert(
                  "Mock Upgrade Triggered - Handled via Stripe Webhook theoretically.",
                )
              }
              className="w-full bg-white text-black font-semibold rounded-lg px-4 py-2 hover:bg-gray-200 transition"
            >
              Upgrade to Pro
            </button>
          </div>

          {/* Enterprise Plan */}
          <div className="bg-card border border-border rounded-2xl p-8 shadow-sm flex flex-col">
            <h3 className="text-xl font-bold mb-2">Enterprise Plan</h3>
            <p className="text-gray-400 text-sm mb-6">
              Designed for translation agencies.
            </p>
            <div className="text-4xl font-bold mb-6">
              $199<span className="text-lg text-gray-500 font-normal">/mo</span>
            </div>
            <ul className="space-y-3 mb-8 flex-1">
              <li className="flex items-center gap-2 text-sm">
                <Check className="text-green-500 w-4 h-4" /> Everything in Pro
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Check className="text-green-500 w-4 h-4" /> Collaboration
                Workspaces
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Check className="text-green-500 w-4 h-4" /> Unified Global
                Style Profiles
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Check className="text-green-500 w-4 h-4" /> Review Queue
                Management
              </li>
            </ul>
            <button
              onClick={() => alert("Contact Sales to upgrade.")}
              className="w-full bg-gray-800 text-white font-semibold rounded-lg px-4 py-2 hover:bg-gray-700 transition"
            >
              Contact Sales
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
