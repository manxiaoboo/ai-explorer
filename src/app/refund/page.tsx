import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Refund Policy",
  description: "Refund policy for attooli - understand our refund terms and conditions.",
  alternates: {
    canonical: "/refund",
  },
};

export default function RefundPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold text-[var(--foreground)] mb-8">Refund Policy</h1>
      
      <div className="prose prose-lg max-w-none text-[var(--muted)]">
        <p className="text-sm text-[var(--muted)] mb-8">Last updated: March 8, 2026</p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-[var(--foreground)] mb-4">Overview</h2>
          <p>
            Thank you for using attooli. This Refund Policy explains our policies regarding refunds 
            for any paid services or subscriptions offered through our platform. Please read this 
            policy carefully before making any purchases.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-[var(--foreground)] mb-4">Important Notice: Third-Party Tools</h2>
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6 mb-6">
            <p className="font-semibold text-[var(--foreground)] mb-2">⚠️ Please Note</p>
            <p>
              attooli is an AI tools discovery and comparison platform. We do not sell AI tools 
              directly. All tools listed on our platform are provided by third-party vendors. 
              <strong>Any refund requests for specific AI tools must be directed to the respective 
              tool vendors.</strong>
            </p>
          </div>
          <p>
            If you purchased a subscription or service through a third-party tool listed on our 
            platform, please contact that vendor directly for refund inquiries. Each vendor has 
            their own refund policy, which may differ from ours.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-[var(--foreground)] mb-4">1. attooli Premium Subscriptions</h2>
          
          <h3 className="text-xl font-semibold text-[var(--foreground)] mt-6 mb-3">1.1 Free Trial</h3>
          <p>
            Some of our premium features may offer a free trial period. You will not be charged 
            during the trial period. If you do not cancel before the trial ends, your subscription 
            will automatically convert to a paid subscription, and you will be charged the applicable 
            subscription fee.
          </p>

          <h3 className="text-xl font-semibold text-[var(--foreground)] mt-6 mb-3">1.2 Cancellation Policy</h3>
          <p><strong>Monthly Subscriptions:</strong> You may cancel your monthly subscription at any time. 
          Your cancellation will take effect at the end of the current billing period. You will 
          continue to have access to premium features until the end of that period. No partial 
          refunds will be provided for unused days in the current billing period.</p>
          
          <p className="mt-4"><strong>Annual Subscriptions:</strong> You may cancel your annual subscription at any time. 
          Your cancellation will take effect at the end of the current annual billing period. 
          No partial refunds will be provided for unused months.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-[var(--foreground)] mb-4">2. Refund Eligibility</h2>
          <p>We offer refunds under the following circumstances:</p>
          
          <ul className="list-none space-y-3 mt-4">
            <li>
              <strong>7-Day Money-Back Guarantee:</strong> If you are not satisfied with our premium 
              subscription, you may request a full refund within 7 days of your initial purchase 
              or subscription start date. This applies to first-time subscribers only.
            </li>
            <li>
              <strong>Technical Issues:</strong> If you experience persistent technical issues that 
              prevent you from using our premium features, and our support team is unable to 
              resolve them within a reasonable timeframe, you may be eligible for a prorated 
              refund.
            </li>
            <li>
              <strong>Billing Errors:</strong> If you were incorrectly charged or charged multiple times 
              for the same service, you are eligible for a full refund of the erroneous charges.
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-[var(--foreground)] mb-4">3. Non-Refundable Items</h2>
          <p>The following are not eligible for refunds:</p>
          
          <ul className="list-none space-y-2 mt-4">
            <li>• Partial use of subscription period (unless under the 7-day guarantee)</li>
            <li>• Change of mind after the 7-day refund window</li>
            <li>• Failure to use the subscription during the paid period</li>
            <li>• Dissatisfaction with third-party tools discovered through our platform</li>
            <li>• Violation of our Terms of Service resulting in account termination</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-[var(--foreground)] mb-4">4. How to Request a Refund</h2>
          <p>To request a refund, please follow these steps:</p>
          
          <ol className="list-decimal list-inside space-y-3 mt-4">
            <li>
              Contact us at <a href="mailto:support@attooli.com" className="text-[var(--accent)]">support@attooli.com</a> 
              with the subject line &quot;Refund Request.&quot;
            </li>
            <li>Include your account email address and the reason for your refund request.</li>
            <li>For technical issues, please include detailed information about the problem and 
            any troubleshooting steps you have already taken.</li>
            <li>Refund requests are typically processed within 5-10 business days.</li>
          </ol>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-[var(--foreground)] mb-4">5. Refund Processing</h2>
          <p>
            Once your refund request is approved, we will process the refund to your original 
            payment method. Please note:
          </p>
          
          <ul className="list-none space-y-2 mt-4">
            <li>• Refunds may take 5-10 business days to appear on your statement, depending on 
            your payment provider.</li>
            <li>• We are not responsible for any fees charged by your bank or payment provider.</li>
            <li>• If the original payment method is no longer available, we may offer store credit 
            or an alternative refund method.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-[var(--foreground)] mb-4">6. Special Circumstances</h2>
          
          <h3 className="text-xl font-semibold text-[var(--foreground)] mt-6 mb-3">6.1 Force Majeure</h3>
          <p>
            In the event of circumstances beyond our control (including but not limited to natural 
            disasters, war, terrorism, riots, embargoes, acts of civil or military authorities, fire, 
            floods, accidents, or strikes), we may suspend or terminate services without obligation 
            to provide refunds.
          </p>

          <h3 className="text-xl font-semibold text-[var(--foreground)] mt-6 mb-3">6.2 Service Discontinuation</h3>
          <p>
            If we discontinue our premium services, we will provide pro-rata refunds for any 
            unused subscription period to all affected subscribers.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-[var(--foreground)] mb-4">7. Dispute Resolution</h2>
          <p>
            If you are not satisfied with our response to your refund request, you may escalate 
            the matter by contacting our customer support management team at 
            <a href="mailto:escalations@attooli.com" className="text-[var(--accent)]">escalations@attooli.com</a>. 
            We are committed to resolving all disputes fairly and promptly.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-[var(--foreground)] mb-4">8. Changes to This Policy</h2>
          <p>
            We reserve the right to modify this Refund Policy at any time. Changes will be 
            effective immediately upon posting to our website. Your continued use of our services 
            following any changes indicates your acceptance of the new policy.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-[var(--foreground)] mb-4">9. Contact Information</h2>
          <p>For any questions about this Refund Policy, please contact us:</p>
          
          <p className="mt-4">
            Email: <a href="mailto:support@attooli.com" className="text-[var(--accent)]">support@attooli.com</a>
          </p>
          <p className="mt-2">
            Address: [Your Company Address]
          </p>
        </section>
      </div>
    </div>
  );
}
