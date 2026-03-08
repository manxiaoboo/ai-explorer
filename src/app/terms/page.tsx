import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: "Terms and conditions for using attooli - the AI tools discovery platform.",
  alternates: {
    canonical: "/terms",
  },
};

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold text-[var(--foreground)] mb-8">Terms & Conditions</h1>
      
      <div className="prose prose-lg max-w-none text-[var(--muted)]">
        <p className="text-sm text-[var(--muted)] mb-8">Last updated: March 8, 2026</p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-[var(--foreground)] mb-4">1. Introduction</h2>
          <p>
            Welcome to attooli (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;). By accessing or using our website at 
            <a href="https://attooli.com" className="text-[var(--accent)]">attooli.com</a> 
            (&quot;the Service&quot;), you agree to be bound by these Terms & Conditions (&quot;Terms&quot;). 
            If you disagree with any part of these terms, you may not access the Service.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-[var(--foreground)] mb-4">2. Use of Service</h2>
          <p>
            attooli is an AI tools discovery and comparison platform. We provide information, 
            reviews, and comparisons of various AI tools and services. The information provided 
            on our platform is for general informational purposes only.
          </p>
          <h3 className="text-xl font-semibold text-[var(--foreground)] mt-6 mb-3">2.1 Eligibility</h3>
          <p>
            By using our Service, you represent and warrant that you are at least 18 years old 
            and have the legal capacity to enter into these Terms. If you are using the Service 
            on behalf of an organization, you represent and warrant that you have the authority 
            to bind that organization to these Terms.
          </p>
          <h3 className="text-xl font-semibold text-[var(--foreground)] mt-6 mb-3">2.2 Account Registration</h3>
          <p>
            Some features of the Service may require you to create an account. You are responsible 
            for maintaining the confidentiality of your account information and for all activities 
            that occur under your account. You agree to notify us immediately of any unauthorized 
            use of your account.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-[var(--foreground)] mb-4">3. User Content</h2>
          <p>
            Users may submit reviews, comments, and other content (&quot;User Content&quot;) to the platform. 
            By submitting User Content, you grant us a worldwide, non-exclusive, royalty-free license 
            to use, reproduce, modify, and display such content in connection with the Service.
          </p>
          <p className="mt-4">
            You represent and warrant that: (a) you own or have the necessary rights to submit the 
            User Content; (b) the User Content does not violate any third-party rights, including 
            intellectual property rights; and (c) the User Content complies with all applicable laws 
            and regulations.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-[var(--foreground)] mb-4">4. Third-Party Links and Tools</h2>
          <p>
            Our Service contains links to third-party websites and AI tools. We do not endorse, 
            control, or assume responsibility for any third-party content, products, or services. 
            Your use of third-party websites and tools is at your own risk and subject to their 
            respective terms and policies.
          </p>
          <p className="mt-4">
            attooli is not responsible for the accuracy, reliability, or availability of any 
            third-party tools listed on our platform. We recommend that you review the terms and 
            privacy policies of any third-party tools before using them.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-[var(--foreground)] mb-4">5. Intellectual Property</h2>
          <p>
            All content on the Service, including but not limited to text, graphics, logos, icons, 
            images, audio clips, digital downloads, and software, is the property of attooli or its 
            content suppliers and is protected by international copyright laws.
          </p>
          <p className="mt-4">
            You may not reproduce, distribute, modify, create derivative works from, publicly display, 
            or otherwise exploit any content from the Service without our prior written consent.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-[var(--foreground)] mb-4">6. Disclaimer of Warranties</h2>
          <p>
            THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT ANY WARRANTIES OF ANY KIND, 
            EITHER EXPRESS OR IMPLIED. TO THE FULLEST EXTENT PERMITTED BY LAW, WE DISCLAIM ALL 
            WARRANTIES, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS 
            FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
          </p>
          <p className="mt-4">
            We do not warrant that the Service will be uninterrupted, timely, secure, or error-free, 
            or that any defects will be corrected. We do not warrant the accuracy or reliability of 
            any information obtained through the Service.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-[var(--foreground)] mb-4">7. Limitation of Liability</h2>
          <p>
            TO THE FULLEST EXTENT PERMITTED BY LAW, IN NO EVENT SHALL ATTOOLI, ITS DIRECTORS, 
            EMPLOYEES, PARTNERS, AGENTS, SUPPLIERS, OR AFFILIATES BE LIABLE FOR ANY INDIRECT, 
            INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING WITHOUT LIMITATION, 
            LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-[var(--foreground)] mb-4">8. Changes to Terms</h2>
          <p>
            We reserve the right to modify or replace these Terms at any time. If a revision is 
            material, we will provide at least 30 days&apos; notice prior to any new terms taking effect. 
            What constitutes a material change will be determined at our sole discretion.
          </p>
          <p className="mt-4">
            By continuing to access or use our Service after any revisions become effective, you 
            agree to be bound by the revised terms.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-[var(--foreground)] mb-4">9. Contact Us</h2>
          <p>
            If you have any questions about these Terms, please contact us at:
          </p>
          <p className="mt-4">
            Email: <a href="mailto:legal@attooli.com" className="text-[var(--accent)]">legal@attooli.com</a>
          </p>
        </section>
      </div>
    </div>
  );
}
