import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import Link from "next/link";

export const metadata = { title: "Privacy Policy — AD CARE Pharmacy" };

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Header user={null} />
      <main className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 py-12 w-full">
        <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Privacy Policy</h1>
        <p className="text-xs text-slate-400 mb-8">Last updated: August 2026</p>

        <div className="prose prose-sm max-w-none space-y-8 text-sm text-slate-700 leading-relaxed">
          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-3">1. Information We Collect</h2>
            <p>We collect information you provide directly:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li><strong>Account information:</strong> name, email, phone number, password (encrypted)</li>
              <li><strong>Health information:</strong> prescription documents, patient names, physician details</li>
              <li><strong>Transaction data:</strong> order history, payment method (processed securely, never stored in full)</li>
              <li><strong>Communication:</strong> support tickets, messages, reviews</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-3">2. How We Use Your Information</h2>
            <p>We use your information to:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Process and fulfill your pharmacy orders</li>
              <li>Verify prescriptions with licensed pharmacists</li>
              <li>Communicate about order status, recalls, and health alerts</li>
              <li>Improve our platform and services</li>
              <li>Comply with pharmaceutical regulatory requirements</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-3">3. Health Information Protection</h2>
            <p>Prescription and health information is treated with the highest level of confidentiality. We implement administrative, technical, and physical safeguards to protect Protected Health Information (PHI) in compliance with applicable healthcare privacy regulations.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-3">4. Information Sharing</h2>
            <p>We do not sell your personal information. We may share data with:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Licensed pharmacists for prescription verification</li>
              <li>Shipping carriers for order delivery (name, address, phone only)</li>
              <li>Payment processors for transaction completion</li>
              <li>Law enforcement when legally required</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-3">5. Data Retention</h2>
            <p>Account data is retained as long as your account is active. Prescription records are retained for the period required by applicable pharmaceutical regulations. You may request deletion of your account and associated data at any time.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-3">6. Data Security</h2>
            <p>We use industry-standard encryption (TLS/SSL), secure password hashing (bcrypt), and HTTP-only session cookies. While we implement strong security measures, no method of transmission over the Internet is 100% secure.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-3">7. Your Rights</h2>
            <p>You have the right to:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Access and review your personal data</li>
              <li>Correct inaccurate information</li>
              <li>Request deletion of your account and data</li>
              <li>Opt out of non-essential communications</li>
              <li>Download a copy of your data</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-3">8. Cookies</h2>
            <p>We use essential cookies for session management and cart functionality. We do not use advertising or tracking cookies. Session cookies are HTTP-only and expire after 7 days.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-3">9. Children&apos;s Privacy</h2>
            <p>This Service is not intended for children under 13. We do not knowingly collect information from children. If a child&apos;s prescription is processed, the data is associated with the parent or guardian&apos;s account.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-3">10. Changes to This Policy</h2>
            <p>We may update this policy from time to time. Material changes will be communicated via email or prominent notice on the platform.</p>
          </section>
        </div>

        <div className="mt-10 pt-6 border-t border-slate-200 text-xs text-slate-500">
          <p>Questions about privacy? <Link href="/contact" className="text-teal-700 font-bold hover:underline">Contact us</Link>.</p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
