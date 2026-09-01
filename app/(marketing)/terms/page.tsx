import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import Link from "next/link";

export const metadata = { title: "Terms of Service — AD CARE Pharmacy" };

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Header user={null} />
      <main className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 py-12 w-full">
        <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Terms of Service</h1>
        <p className="text-xs text-slate-400 mb-8">Last updated: August 2026</p>

        <div className="prose prose-sm max-w-none space-y-8 text-sm text-slate-700 leading-relaxed">
          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-3">1. Acceptance of Terms</h2>
            <p>By accessing or using the AD CARE Pharmacy platform (&quot;Service&quot;), you agree to be bound by these Terms of Service. If you do not agree, do not use the Service. This Service is operated by AD CARE Pharmacy (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;).</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-3">2. Eligibility</h2>
            <p>You must be at least 18 years old to use this Service. By using the Service, you represent that you meet this age requirement and have the legal capacity to enter into a binding agreement.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-3">3. Account Registration</h2>
            <p>To access certain features, you must create an account. You are responsible for maintaining the confidentiality of your credentials and for all activities under your account. You agree to provide accurate, current, and complete information during registration and to update it as necessary.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-3">4. Prescription Medications</h2>
            <p>Prescription medications sold through this platform require a valid prescription from a licensed healthcare provider. By ordering prescription medications, you confirm that:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>You have a valid, current prescription from a licensed physician</li>
              <li>The prescription is for your personal use or the use of the person named on the prescription</li>
              <li>You authorize AD CARE Pharmacy to verify your prescription with the issuing physician</li>
            </ul>
            <p className="mt-2">AD CARE Pharmacy reserves the right to refuse to fill any prescription that cannot be verified or that does not meet legal requirements.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-3">5. Orders and Payment</h2>
            <p>All orders are subject to product availability. We reserve the right to cancel or limit quantities at our discretion. Prices are subject to change without notice. Payment must be received in full before an order is processed, except for Cash on Delivery orders.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-3">6. Shipping and Delivery</h2>
            <p>We aim to deliver orders within the estimated timeframe provided at checkout. Delivery times are estimates and not guaranteed. AD CARE Pharmacy is not responsible for delays caused by shipping carriers, weather, or events beyond our control.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-3">7. Returns and Refunds</h2>
            <p>Due to the nature of pharmaceutical products, opened or used medications cannot be returned. Unopened, undamaged items may be returned within 14 days of delivery. Refunds for cancelled orders will be processed within 5-10 business days.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-3">8. Limitation of Liability</h2>
            <p>To the maximum extent permitted by law, AD CARE Pharmacy shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Service. Our total liability shall not exceed the amount you paid for the specific order giving rise to the claim.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-3">9. Governing Law</h2>
            <p>These Terms are governed by and construed in accordance with applicable pharmaceutical and consumer protection laws. Any disputes shall be resolved through binding arbitration or in courts of competent jurisdiction.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-3">10. Changes to Terms</h2>
            <p>We reserve the right to modify these Terms at any time. Changes will be effective upon posting. Your continued use of the Service constitutes acceptance of the modified Terms.</p>
          </section>
        </div>

        <div className="mt-10 pt-6 border-t border-slate-200 text-xs text-slate-500">
          <p>Questions about these Terms? <Link href="/contact" className="text-teal-700 font-bold hover:underline">Contact us</Link>.</p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
