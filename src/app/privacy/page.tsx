import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy policy for attooli - learn how we collect, use, and protect your personal information.",
  alternates: {
    canonical: "/privacy",
  },
};

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold text-[var(--foreground)] mb-8">Privacy Policy</h1>
      
      <div className="prose prose-lg max-w-none text-[var(--muted)]">
        <p className="text-sm text-[var(--muted)] mb-8">Last updated: March 8, 2026</p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-[var(--foreground)] mb-4">1. Introduction</h2>
          <p>
            At attooli (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;), we respect your privacy and are committed to protecting 
            your personal information. This Privacy Policy explains how we collect, use, disclose, 
            and safeguard your information when you visit our website 
            <a href="https://attooli.com" className="text-[var(--accent)]">attooli.com</a> 
            (&quot;the Service&quot;).
          </p>
          <p className="mt-4">
            By using the Service, you agree to the collection and use of information in accordance 
            with this Privacy Policy. If you do not agree with this policy, please do not use our Service.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-[var(--foreground)] mb-4">2. Information We Collect</h2>
          
          <h3 className="text-xl font-semibold text-[var(--foreground)] mt-6 mb-3">2.1 Personal Information</h3>
          <p>We may collect personal information that you voluntarily provide to us, including:</p>
          <ul className="list-none space-y-2 mt-4">
            <li>• Name and email address (when you create an account or subscribe to our newsletter)</li>
            <li>• Profile information (such as avatar and bio)</li>
            <li>• User-generated content (reviews, comments, ratings)</li>
            <li>• Communication data (when you contact us)</li>
          </ul>

          <h3 className="text-xl font-semibold text-[var(--foreground)] mt-6 mb-3">2.2 Usage Data</h3>
          <p>We automatically collect certain information when you visit our Service:</p>
          <ul className="list-none space-y-2 mt-4">
            <li>• IP address and browser type</li>
            <li>• Device information (operating system, device type)</li>
            <li>• Pages visited and time spent on each page</li>
            <li>• Referring website and exit pages</li>
            <li>• Search queries and tool interactions</li>
          </ul>

          <h3 className="text-xl font-semibold text-[var(--foreground)] mt-6 mb-3">2.3 Cookies and Similar Technologies</h3>
          <p>
            We use cookies and similar tracking technologies to track activity on our Service and 
            hold certain information. Cookies are files with a small amount of data that may include 
            an anonymous unique identifier.
          </p>
          <p className="mt-4">You can instruct your browser to refuse all cookies or to indicate when a cookie is 
          being sent. However, if you do not accept cookies, you may not be able to use some portions 
          of our Service.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-[var(--foreground)] mb-4">3. How We Use Your Information</h2>
          <p>We use the collected information for various purposes:</p>
          <ul className="list-none space-y-2 mt-4">
            <li>• To provide and maintain our Service</li>
            <li>• To personalize your experience and deliver relevant content</li>
            <li>• To improve our Service and develop new features</li>
            <li>• To communicate with you about updates, promotions, and news</li>
            <li>• To analyze usage patterns and trends</li>
            <li>• To detect, prevent, and address technical issues and fraud</li>
            <li>• To comply with legal obligations</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-[var(--foreground)] mb-4">4. How We Share Your Information</h2>
          <p>We do not sell, trade, or rent your personal information to third parties. We may share 
          information in the following circumstances:</p>
          
          <ul className="list-none space-y-2 mt-4">
            <li>• <strong>Service Providers:</strong> We may share information with third-party vendors who 
            provide services on our behalf (e.g., hosting, analytics, email delivery).</li>
            <li>• <strong>Legal Requirements:</strong> We may disclose information if required by law or 
            in response to valid legal requests.</li>
            <li>• <strong>Business Transfers:</strong> If we are involved in a merger, acquisition, or 
            asset sale, your information may be transferred.</li>
            <li>• <strong>With Your Consent:</strong> We may share information with your explicit consent.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-[var(--foreground)] mb-4">5. Data Security</h2>
          <p>
            We implement appropriate technical and organizational measures to protect your personal 
            information against unauthorized access, alteration, disclosure, or destruction. However, 
            no method of transmission over the Internet or electronic storage is 100% secure, and we 
            cannot guarantee absolute security.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-[var(--foreground)] mb-4">6. Third-Party Services</h2>
          <p>
            Our Service contains links to third-party websites and AI tools. We are not responsible 
            for the privacy practices of these third parties. We encourage you to review the privacy 
            policies of any third-party sites you visit.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-[var(--foreground)] mb-4">7. Your Data Protection Rights</h2>
          <p>Depending on your location, you may have the following rights:</p>
          
          <ul className="list-none space-y-2 mt-4">
            <li>• <strong>Access:</strong> Request copies of your personal information</li>
            <li>• <strong>Rectification:</strong> Request correction of inaccurate information</li>
            <li>• <strong>Erasure:</strong> Request deletion of your personal information</li>
            <li>• <strong>Restrict Processing:</strong> Request limitation of processing</li>
            <li>• <strong>Data Portability:</strong> Request transfer of your data</li>
            <li>• <strong>Object:</strong> Object to processing of your personal information</li>
          </ul>
          
          <p className="mt-4">To exercise these rights, please contact us at 
          <a href="mailto:privacy@attooli.com" className="text-[var(--accent)]">privacy@attooli.com</a>.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-[var(--foreground)] mb-4">8. Children&apos;s Privacy</h2>
          <p>
            Our Service is not intended for children under 13 years of age. We do not knowingly 
            collect personal information from children under 13. If we become aware that we have 
            collected personal information from a child under 13, we will take steps to delete that 
            information.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-[var(--foreground)] mb-4">9. Changes to This Privacy Policy</h2>
          <p>
            We may update our Privacy Policy from time to time. We will notify you of any changes 
            by posting the new Privacy Policy on this page and updating the &quot;Last updated&quot; date. 
            You are advised to review this Privacy Policy periodically for any changes.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-[var(--foreground)] mb-4">10. Contact Us</h2>
          <p>If you have any questions about this Privacy Policy, please contact us:</p>
          <p className="mt-4">
            Email: <a href="mailto:privacy@attooli.com" className="text-[var(--accent)]">privacy@attooli.com</a>
          </p>
        </section>
      </div>
    </div>
  );
}
