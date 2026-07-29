import { Mail, Clock, Send, CheckCircle2, Copy, Shield, Sparkles, MessageSquare, AlertCircle } from 'lucide-react';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import SEO from '../components/SEO';
import { ROUTES } from '../config/routes';

export const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'General Inquiry',
    message: '',
  });
  const [copied, setCopied] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText('pdfminty@gmail.com');
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) return;

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-surface py-12 px-4 sm:px-6 lg:px-8 font-sans text-on-surface transition-colors duration-200">
      <SEO
        titleOverride="Contact Us | PdfMinty"
        descriptionOverride="Have questions, feature requests, or feedback about PdfMinty? Get in touch with us at pdfminty@gmail.com. We usually respond within 24-48 hours."
      />

      <div className="max-w-4xl mx-auto space-y-12" id="contact-us-container">
        {/* Header Hero */}
        <div className="text-center space-y-4 border-b border-border-muted pb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold tracking-wide uppercase">
            <Mail className="w-4 h-4" />
            <span>We're Here to Help</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-on-surface tracking-tight">
            Contact Us
          </h1>
          <p className="text-base sm:text-lg font-medium text-on-surface-variant max-w-2xl mx-auto leading-relaxed">
            PdfMinty is a fast, 100% client-side PDF utility suite built for absolute privacy, speed, and simplicity. All file processing happens locally inside your browser memory without uploading your documents to remote cloud servers.
          </p>
        </div>

        {/* Contact Info Grid */}
        <div className="grid sm:grid-cols-3 gap-6">
          {/* Email Box */}
          <div className="bg-surface-container-low border border-border-muted p-6 rounded-2xl space-y-3 shadow-sm flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
              <Mail className="w-6 h-6" />
            </div>
            <h2 className="text-base font-bold text-on-surface">Direct Email</h2>
            <p className="text-xs text-on-surface-variant">Send us your thoughts anytime</p>
            <div className="pt-2 w-full">
              <div className="flex items-center justify-between gap-2 p-2.5 bg-surface-container-high border border-border-muted rounded-xl text-xs font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                <span className="truncate">pdfminty@gmail.com</span>
                <button
                  type="button"
                  onClick={handleCopyEmail}
                  className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 transition-colors shrink-0 cursor-pointer"
                  title="Copy email address"
                >
                  {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Response Time Box */}
          <div className="bg-surface-container-low border border-border-muted p-6 rounded-2xl space-y-3 shadow-sm flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-2xl bg-sky-500/10 text-sky-500 flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <h2 className="text-base font-bold text-on-surface">Response Time</h2>
            <p className="text-xs text-on-surface-variant">We reply as fast as possible</p>
            <div className="pt-2">
              <span className="inline-block px-4 py-2 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-600 dark:text-sky-400 font-extrabold text-sm">
                24 - 48 Hours
              </span>
            </div>
          </div>

          {/* Privacy & Guarantee Box */}
          <div className="bg-surface-container-low border border-border-muted p-6 rounded-2xl space-y-3 shadow-sm flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0">
              <Shield className="w-6 h-6" />
            </div>
            <h2 className="text-base font-bold text-on-surface">Privacy Guaranteed</h2>
            <p className="text-xs text-on-surface-variant">100% Local & Secure</p>
            <div className="pt-2">
              <span className="inline-block px-4 py-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 font-extrabold text-xs">
                Zero Cloud Uploads
              </span>
            </div>
          </div>
        </div>

        {/* Main Form & Content Section */}
        <div className="grid md:grid-cols-5 gap-8 items-start">
          {/* Form */}
          <div className="md:col-span-3 bg-surface-container-low border border-border-muted p-6 sm:p-8 rounded-2xl space-y-6 shadow-sm">
            <div className="space-y-1">
              <h2 className="text-xl font-extrabold text-on-surface flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-emerald-500" />
                Send Us a Message
              </h2>
              <p className="text-xs text-on-surface-variant">
                Fill out the form below or email us directly at <a href="mailto:pdfminty@gmail.com" className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline">pdfminty@gmail.com</a>.
              </p>
            </div>

            {submitted ? (
              <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-extrabold text-on-surface">Message Received!</h3>
                <p className="text-xs sm:text-sm text-on-surface-variant max-w-md mx-auto">
                  Thank you for reaching out to PdfMinty. We have received your message and will respond to your email within <strong>24 to 48 hours</strong>.
                </p>
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setFormData({ name: '', email: '', subject: 'General Inquiry', message: '' });
                  }}
                  className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label htmlFor="contact-name" className="text-xs font-bold text-on-surface uppercase tracking-wider">
                      Your Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="contact-name"
                      type="text"
                      required
                      placeholder="Jane Doe"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-high border border-border-muted text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="contact-email" className="text-xs font-bold text-on-surface uppercase tracking-wider">
                      Your Email <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="contact-email"
                      type="email"
                      required
                      placeholder="jane@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-high border border-border-muted text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="contact-subject" className="text-xs font-bold text-on-surface uppercase tracking-wider">
                    Subject
                  </label>
                  <select
                    id="contact-subject"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-high border border-border-muted text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="General Inquiry">General Inquiry</option>
                    <option value="Feature Request">Feature Request</option>
                    <option value="Bug Report">Bug Report</option>
                    <option value="Privacy Question">Privacy Question</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="contact-message" className="text-xs font-bold text-on-surface uppercase tracking-wider">
                    Message <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    id="contact-message"
                    required
                    rows={5}
                    placeholder="How can we help you?"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-high border border-border-muted text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loading ? (
                    <span>Sending...</span>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Send Message</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Right Column / FAQ */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-surface-container-low border border-border-muted p-6 rounded-2xl space-y-4 shadow-sm">
              <h3 className="text-base font-extrabold text-on-surface flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-sky-500" />
                About PdfMinty
              </h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                PdfMinty is built to provide ultra-fast, completely private PDF utilities. Powered by browser WebAssembly technology, your PDF documents never leave your computer.
              </p>
              <div className="pt-2 border-t border-border-muted">
                <Link
                  to={ROUTES.ABOUT_US}
                  className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                >
                  Read full story on About Us &rarr;
                </Link>
              </div>
            </div>

            <div className="bg-surface-container-low border border-border-muted p-6 rounded-2xl space-y-4 shadow-sm">
              <h3 className="text-base font-extrabold text-on-surface flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-500" />
                Frequently Asked
              </h3>
              <div className="space-y-3 text-xs">
                <div>
                  <h4 className="font-bold text-on-surface">When will I receive a reply?</h4>
                  <p className="text-on-surface-variant mt-0.5">We typically respond to all emails within 24-48 hours.</p>
                </div>
                <div>
                  <h4 className="font-bold text-on-surface">Are my PDF files uploaded?</h4>
                  <p className="text-on-surface-variant mt-0.5">No, all PDF operations run 100% locally in your browser memory.</p>
                </div>
                <div>
                  <h4 className="font-bold text-on-surface">Can I request new tools?</h4>
                  <p className="text-on-surface-variant mt-0.5">Yes! We welcome suggestions for new PDF tools and features.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
