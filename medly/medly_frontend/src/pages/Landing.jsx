import { Link } from 'react-router-dom'

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-brand-700 flex items-center justify-center">
              <div className="w-3.5 h-3.5 rounded-full bg-white/50" />
            </div>
            <span className="font-semibold text-gray-900 text-base">Medly</span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-gray-500 hover:text-gray-800 transition-colors">Features</a>
            <a href="#about"    className="text-sm text-gray-500 hover:text-gray-800 transition-colors">About</a>
            <a href="#contact"  className="text-sm text-gray-500 hover:text-gray-800 transition-colors">Contact</a>
          </nav>
          <Link to="/login" className="btn-primary">Sign In</Link>
        </div>
      </header>

      {/* Hero */}
      <section className="flex-1 max-w-6xl mx-auto px-6 py-16 flex flex-col md:flex-row items-center gap-12">
        <div className="flex-1">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
            Healthcare appointments,{' '}
            <span className="text-brand-700">made simple and secure.</span>
          </h1>
          <p className="mt-5 text-gray-500 text-lg leading-relaxed max-w-lg">
            Book, manage, and track your healthcare visits in one GDPR-compliant platform.
            Trusted by patients and providers.
          </p>
          <div className="mt-8 flex gap-4 flex-wrap">
            <Link to="/register" className="btn-primary text-base px-6 py-3">Get Started</Link>
            <a href="#features" className="btn-outline text-base px-6 py-3">Learn More</a>
          </div>
        </div>
        <div className="flex-1 max-w-md w-full">
          <div className="bg-gray-100 rounded-2xl aspect-video flex flex-col items-center justify-center gap-3">
            <div className="w-20 h-20 rounded-full bg-brand-700/80" />
            <span className="text-gray-400 text-sm">[ Illustration ]</span>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="bg-white py-16">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-6">
          {[
            { icon: '🗓', title: 'Easy Booking',   desc: 'Find and book appointments with doctors in minutes.' },
            { icon: '🔒', title: 'GDPR Secure',    desc: 'Your health data is encrypted and fully compliant.' },
            { icon: '👥', title: 'For Everyone',   desc: 'Patients, doctors, pharmacists, all in one platform.' },
          ].map(({ icon, title, desc }) => (
            <div key={title} className="card p-6">
              <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center mb-4 text-lg">
                {icon}
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-brand-700 py-6">
        <div className="max-w-6xl mx-auto px-6 text-center text-white/60 text-sm">
          © 2026 Medly. GDPR compliant. Data Protection Act 2018.
        </div>
      </footer>
    </div>
  )
}
