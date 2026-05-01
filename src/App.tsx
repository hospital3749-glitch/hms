import React, { useState, useEffect, FormEvent } from 'react';
import { 
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Link,
  useLocation,
} from 'react-router-dom';
import { 
  Phone, 
  Mail,
  MapPin, 
  Calendar, 
  Clock, 
  Stethoscope, 
  Heart, 
  Activity, 
  Menu, 
  X, 
  ChevronRight, 
  MessageSquare,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  ShieldCheck,
  Star,
  Zap,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { storage } from './lib/storage';
import { Doctor } from './types';

// Admin Components
import AdminLogin from './components/Admin/Login';
import AdminDashboard from './components/Admin/Dashboard';
import AdminDoctors from './components/Admin/Doctors';
import AdminAppointments from './components/Admin/Appointments';
import AdminWards from './components/Admin/Wards';
import AdminRevenue from './components/Admin/Revenue';
import AdminSidebar from './components/Admin/Sidebar';

// --- Doctor Panel Components ---
import DoctorLogin from './components/Doctor/Login';
import DoctorDashboard from './components/Doctor/Dashboard';
import DoctorAppointments from './components/Doctor/Appointments';
import DoctorPatients from './components/Doctor/Patients';
import DoctorSidebar from './components/Doctor/Sidebar';

// --- Public Website Components ---

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'About', href: '#about' },
    { name: 'Services', href: '#services' },
    { name: 'Book Appointment', href: '#book-appointment' },
    { name: 'Contact', href: '#contact' },
  ];

  if (location.pathname.startsWith('/admin')) return null;

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled || isMobileMenuOpen ? 'bg-white shadow-md py-3' : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="bg-teal-600 p-2 rounded-lg">
            <Heart className="text-white w-6 h-6" />
          </div>
          <span className={`text-xl font-bold ${isScrolled || isMobileMenuOpen ? 'text-gray-900' : 'text-white md:text-gray-900 lg:text-white'}`}>
            Mauli <span className="text-orange-500">Hospital</span>
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            link.href.startsWith('#') ? (
              <a 
                key={link.name} 
                href={link.href}
                className={`font-medium transition-colors hover:text-teal-600 ${
                  isScrolled ? 'text-gray-600' : 'text-white'
                }`}
              >
                {link.name}
              </a>
            ) : (
              <Link
                key={link.name}
                to={link.href}
                className={`font-medium transition-colors hover:text-teal-600 ${
                  isScrolled ? 'text-gray-600' : 'text-white'
                }`}
              >
                {link.name}
              </Link>
            )
          ))}
          <button className="bg-teal-600 text-white px-5 py-2 rounded-full font-medium hover:bg-teal-700 transition-colors">
            Emergency Call
          </button>
        </nav>

        <button 
          className="md:hidden p-2 text-gray-900"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className={`w-6 h-6 ${isScrolled ? 'text-gray-900' : 'text-white'}`} />}
        </button>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-gray-100 overflow-hidden"
          >
            <div className="px-4 py-6 flex flex-col gap-4">
              {navLinks.map((link) => (
                link.href.startsWith('#') ? (
                  <a 
                    key={link.name} 
                    href={link.href}
                    className="text-lg font-medium text-gray-800 hover:text-teal-600 px-2 py-1"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.name}
                  </a>
                ) : (
                  <Link
                    key={link.name}
                    to={link.href}
                    className="text-lg font-medium text-gray-800 hover:text-teal-600 px-2 py-1"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.name}
                  </Link>
                )
              ))}
              <Link
                to="/admin/login"
                className="text-lg font-medium text-gray-400 hover:text-teal-600 px-2 py-1"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Admin Login
              </Link>
              <button className="bg-teal-600 text-white w-full py-3 rounded-xl font-bold mt-2">
                Emergency Call
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

const Hero = () => {
  return (
    <section className="relative h-[90vh] min-h-[600px] flex items-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=2000" 
          alt="Hospital Interior" 
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-teal-900/80 to-transparent"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 w-full">
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-2xl text-white"
        >
          <div className="inline-flex items-center gap-2 bg-teal-500/30 backdrop-blur-md px-4 py-2 rounded-full text-sm font-semibold mb-6 border border-white/20">
            <ShieldCheck className="w-4 h-4" /> Trusted Healthcare Services
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-[1.1]">
            Advanced Healthcare for a <span className="text-teal-400">Better Tomorrow</span>
          </h1>
          <p className="text-lg md:text-xl text-white/90 mb-10 leading-relaxed max-w-lg">
            Providing world-class treatment with care and safety. Our dedicated team of specialists is here for you 24/7.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <a href="#book-appointment" className="bg-white text-teal-900 px-8 py-4 rounded-xl font-bold text-lg hover:bg-teal-50 transition-all transform hover:scale-105 shadow-xl text-center">
              Book Appointment
            </a>
            <button className="border-2 border-white/50 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/10 transition-all backdrop-blur-sm flex items-center justify-center gap-2">
              <Phone className="w-5 h-5" /> Emergency Call
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

const AboutSection = () => {
  return (
    <section id="about" className="py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="relative">
            <div className="grid grid-cols-2 gap-4">
              <img 
                src="https://images.unsplash.com/photo-1581056771107-24ca5f033842?auto=format&fit=crop&q=80&w=800" 
                alt="Doctors meeting" 
                className="w-full aspect-[4/5] object-cover rounded-3xl shadow-lg mt-8"
                referrerPolicy="no-referrer"
              />
              <img 
                src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=800" 
                alt="Medical equipment" 
                className="w-full aspect-[4/5] object-cover rounded-3xl shadow-lg"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="absolute -bottom-6 -right-6 bg-white p-6 rounded-3xl shadow-2xl border border-gray-100 hidden sm:block">
              <p className="text-4xl font-bold text-teal-600">25+</p>
              <p className="text-gray-600 font-semibold">Years of Experience</p>
            </div>
          </div>
          
          <div>
            <span className="text-orange-500 font-bold tracking-widest uppercase text-sm mb-4 block">About Our Hospital</span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8 leading-tight">
              A Legacy of Care, <br /> Compassion and Cure
            </h2>
            <p className="text-gray-600 text-lg mb-6 leading-relaxed">
              Mauli Hospital is a leading multi-speciality healthcare institution dedicated to providing comprehensive medical services with a divine touch. Our facility combines state-of-the-art technology with compassionate clinical excellence.
            </p>
            <p className="text-gray-600 text-lg mb-10 leading-relaxed">
              We specialize in advanced treatments across Cardiology, Neurology, and more, ensuring every patient receives personalized attention and world-class care from our renowned team of specialists.
            </p>
            
            <button className="bg-teal-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-teal-700 transition-all flex items-center gap-2 group">
              Read More <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

const FullAppointmentForm = () => {
  const [formData, setFormData] = useState({
    patientName: '',
    mobileNumber: '',
    email: '',
    doctor: '',
    department: '',
    date: '',
    time: '',
    description: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [availableDoctors, setAvailableDoctors] = useState<string[]>([]);

  useEffect(() => {
    const doctors = storage.getDoctors();
    setAvailableDoctors(doctors.map(d => d.name));
  }, []);

  const departments = ['Cardiology', 'Neurology', 'Dental', 'Radiology', 'General'];

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    storage.addAppointment(formData);
    setIsSubmitted(true);
    setTimeout(() => setIsSubmitted(false), 5000);
    handleReset();
  };

  const handleReset = () => {
    setFormData({
      patientName: '',
      mobileNumber: '',
      email: '',
      doctor: '',
      department: '',
      date: '',
      time: '',
      description: ''
    });
  };

  return (
    <section id="book-appointment" className="py-24 bg-sky-50/50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <span className="text-teal-600 font-bold tracking-widest uppercase text-sm mb-4 block">Schedule a Visit</span>
          <h2 className="text-4xl font-bold text-gray-900">Book Doctor Appointment</h2>
          <p className="text-gray-500 mt-4">Fill out the form below and we'll confirm your appointment shortly.</p>
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-teal-900/5 p-8 md:p-12 border border-white">
          <AnimatePresence mode="wait">
            {isSubmitted ? (
              <motion.div 
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="text-center py-12"
              >
                <div className="w-20 h-20 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <ShieldCheck size={40} />
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-2">Appointment Booked Successfully!</h3>
                <p className="text-gray-600 mb-8 max-w-sm mx-auto">
                  We have received your request. A member of our clinical team will contact you shortly to confirm the time.
                </p>
              </motion.div>
            ) : (
              <motion.form 
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onSubmit={handleSubmit}
                className="grid md:grid-cols-2 gap-6"
              >
                {/* Patient Name */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1">Patient Name</label>
                  <input 
                    required
                    type="text" 
                    value={formData.patientName}
                    onChange={(e) => setFormData({...formData, patientName: e.target.value})}
                    placeholder="Enter your full name"
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                  />
                </div>

                {/* Mobile Number */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1">Mobile Number</label>
                  <input 
                    required
                    type="tel" 
                    value={formData.mobileNumber}
                    onChange={(e) => setFormData({...formData, mobileNumber: e.target.value})}
                    placeholder="+1 (555) 000-0000"
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                  />
                </div>

                {/* Email (Optional) */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1">Email Address (Optional)</label>
                  <input 
                    type="email" 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="email@example.com"
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                  />
                </div>

                {/* Department Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1">Select Department</label>
                  <select 
                    required
                    value={formData.department}
                    onChange={(e) => setFormData({...formData, department: e.target.value})}
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-teal-500 outline-none transition-all appearance-none"
                  >
                    <option value="">Choose Department</option>
                    {departments.map(dept => <option key={dept} value={dept}>{dept}</option>)}
                  </select>
                </div>

                {/* Doctor Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1">Select Doctor</label>
                  <select 
                    required
                    value={formData.doctor}
                    onChange={(e) => setFormData({...formData, doctor: e.target.value})}
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-teal-500 outline-none transition-all appearance-none"
                  >
                    <option value="">Choose Doctor</option>
                    {availableDoctors.map(doc => <option key={doc} value={doc}>{doc}</option>)}
                  </select>
                </div>

                {/* Appointment Date */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1">Select Date</label>
                  <input 
                    required
                    type="date" 
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                  />
                </div>

                {/* Appointment Time */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1">Select Time</label>
                  <input 
                    required
                    type="time" 
                    value={formData.time}
                    onChange={(e) => setFormData({...formData, time: e.target.value})}
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                  />
                </div>

                {/* Description */}
                <div className="md:col-span-2 space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1">Problem Description</label>
                  <textarea 
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Tell us about your symptoms or medical concerns..."
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-teal-500 outline-none transition-all resize-none"
                  ></textarea>
                </div>

                {/* Buttons */}
                <div className="md:col-span-2 flex flex-col sm:flex-row gap-4 pt-4">
                  <button 
                    type="submit"
                    className="flex-1 bg-teal-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-teal-700 transition-all shadow-lg shadow-teal-600/20 active:scale-[0.98]"
                  >
                    Submit Appointment
                  </button>
                  <button 
                    type="button"
                    onClick={handleReset}
                    className="bg-gray-100 text-gray-600 px-8 py-4 rounded-2xl font-bold hover:bg-gray-200 transition-all"
                  >
                    Reset Form
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

const ServicesSection = () => {
  const services = [
    { title: 'Cardiology', desc: 'Expert care for your heart with advanced diagnostics.', icon: <Heart size={32} />, color: 'bg-red-50 text-red-600' },
    { title: 'Neurology', desc: 'Specialized care for disorders of the brain and spine.', icon: <Activity size={32} />, color: 'bg-purple-50 text-purple-600' },
    { title: 'Dental', desc: 'Comprehensive oral health services for all ages.', icon: <Stethoscope size={32} />, color: 'bg-sky-50 text-sky-600' },
    { title: 'Radiology', desc: 'Modern imaging technology for precise diagnosis.', icon: <Zap size={32} />, color: 'bg-teal-50 text-teal-600' },
  ];

  return (
    <section id="services" className="py-24 bg-sky-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-teal-600 font-bold tracking-widest uppercase text-sm mb-4 block">Our Services</span>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Comprehensive Medical Care</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((item, idx) => (
            <div key={idx} className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl transition-all group">
              <div className={`${item.color} w-16 h-16 rounded-2xl flex items-center justify-center mb-6`}>{item.icon}</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
              <p className="text-gray-500 mb-6">{item.desc}</p>
              <button className="text-teal-600 font-bold flex items-center gap-2 hover:gap-3 transition-all">Learn More <ChevronRight size={16} /></button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const DoctorsSection = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);

  useEffect(() => {
    setDoctors(storage.getDoctors());
  }, []);

  return (
    <section id="doctors" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="max-w-2xl">
            <span className="text-teal-600 font-bold tracking-widest uppercase text-sm mb-4 block">Expert Team</span>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Meet Our Top Specialists</h2>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {doctors.map((doc, idx) => (
            <div key={idx} className="group">
              <div className="relative overflow-hidden rounded-3xl mb-6 aspect-square bg-gray-100">
                <img src={doc.image || 'https://images.unsplash.com/photo-1559839734-2b71ef159963'} alt={doc.name} className="w-full h-full object-cover group-hover:scale-110 transition-all duration-500" />
              </div>
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-2xl font-bold text-gray-900">{doc.name}</h3>
                <div className={`w-3 h-3 rounded-full ${doc.isAvailable ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-gray-300'}`} title={doc.isAvailable ? 'Active' : 'Offline'}></div>
              </div>
              <p className="text-teal-600 font-semibold">{doc.specialization}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const FacilitiesSection = () => {
  const facilities = [
    { title: 'ICU Unit', img: 'https://images.unsplash.com/photo-1516549655169-df83a0774514' },
    { title: 'CT Scan', img: 'https://images.unsplash.com/photo-1519494140681-8917d260021b' },
    { title: 'Emergency', img: 'https://images.unsplash.com/photo-1517120444427-3185ef30e154' },
  ];
  return (
    <section className="py-24 bg-teal-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-4xl font-bold mb-4">Modern Medical Technology</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {facilities.map((f, idx) => (
            <div key={idx} className="relative group overflow-hidden rounded-3xl h-64 bg-teal-800">
              <img src={f.img} alt={f.title} className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700" />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all">
                <h3 className="text-2xl font-bold">{f.title}</h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const TestimonialsSection = () => {
  const reviews = [
    { name: 'Michael Robinson', msg: 'Exceptional care at Mauli Hospital. Staff was attentive and doctors top-notch.', role: 'Heart Patient' },
    { name: 'Linda Johnson', msg: 'Quick, professional, and very friendly. My whole family trusts them.', role: 'General Checkup' },
    { name: 'Robert Davis', msg: 'Clean facilities and empathetic staff. Smooth recovery process.', role: 'Orthopedic' },
  ];
  return (
    <section className="py-24 bg-sky-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
        <h2 className="text-4xl font-bold text-gray-900 mb-16">What Our Patients Say</h2>
        <div className="grid md:grid-cols-3 gap-8 text-left">
          {reviews.map((t, idx) => (
            <div key={idx} className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
              <div className="flex gap-1 mb-4 text-yellow-400">{[...Array(5)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}</div>
              <p className="text-gray-600 mb-8 italic">"{t.msg}"</p>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-sky-50 rounded-full flex items-center justify-center font-bold text-teal-600">{t.name[0]}</div>
                <div><h4 className="font-bold text-gray-900">{t.name}</h4><p className="text-gray-500 text-sm">{t.role}</p></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const ContactSection = () => {
  return (
    <section id="contact" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-16">
          <div>
            <h2 className="text-4xl font-bold text-gray-900 mb-8">Contact Us</h2>
            <div className="space-y-6">
              <div className="flex gap-4"><MapPin className="text-teal-600" /><p>123 Medical Way, Cityville, ST 56789</p></div>
              <div className="flex gap-4"><Phone className="text-teal-600" /><p>+1 (800) MED-CARE</p></div>
              <div className="flex gap-4"><Mail className="text-teal-600" /><p>contact@maulihospital.com</p></div>
            </div>
          </div>
          <div className="h-[300px] bg-gray-100 rounded-3xl overflow-hidden border border-gray-200">
            <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14002.83!2d-0.12!3d51.5!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0!2zMTPCsDIwJzI2LjAiTiAwwrAwNyc0MC4wIlc!5e0!3m2!1sen!2sus!4v1650000000000" width="100%" height="100%" style={{ border: 0 }} loading="lazy"></iframe>
          </div>
        </div>
      </div>
    </section>
  );
};

const PromotionalBanner = () => {
  const [isVisible, setIsVisible] = useState(true);
  const location = useLocation();
  if (!isVisible || location.pathname.startsWith('/admin')) return null;
  return (
    <div className="bg-teal-900 text-white py-2 px-4 relative z-[60] text-center">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-4">
        <span className="text-sm font-bold"><Zap size={14} className="inline mr-2 text-teal-400" /> Get Quick Appointment with Top Doctors | 24/7 Support</span>
        <a href="#book-appointment" className="bg-teal-500 text-xs font-bold px-4 py-1 rounded-full">Book Now</a>
      </div>
      <button onClick={() => setIsVisible(false)} className="absolute right-4 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100"><X size={16} /></button>
    </div>
  );
};

const Footer = () => {
  const location = useLocation();
  if (location.pathname.startsWith('/admin')) return null;
  return (
    <footer className="bg-gray-900 text-white/50 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-2">
            <div className="flex items-center gap-2 text-white mb-6"><Heart className="text-orange-500" /> <span className="font-bold text-xl">Mauli Hospital</span></div>
            <p className="max-w-sm mb-6">care . compassion . cure. World-class healthcare services for a better tomorrow.</p>
            <div className="flex gap-4"><Facebook size={20} /><Twitter size={20} /><Instagram size={20} /><Linkedin size={20} /></div>
          </div>
          <div>
            <h4 className="text-white font-bold mb-6">Quick Links</h4>
            <ul className="space-y-3">
              <li><a href="/" className="hover:text-teal-400 transition-all">Home</a></li>
              <li><a href="#about" className="hover:text-teal-400 transition-all">About Us</a></li>
              <li><a href="#book-appointment" className="hover:text-teal-400 transition-all">Book Online</a></li>
              <li><Link to="/admin/login" className="text-gray-500 hover:text-teal-400 transition-all">Admin Panel</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-6">Working Hours</h4>
            <p>Mon - Fri: 9am - 8pm</p>
            <p>Sat: 10am - 6pm</p>
            <p className="text-teal-400 font-bold mt-4">Emergency: 24/7</p>
          </div>
        </div>
        <div className="border-t border-white/5 pt-8 flex justify-between text-xs">
          <p>© 2026 Mauli Hospital. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

// --- Route Components ---

const PublicHome = () => (
  <>
    <Hero />
    <AboutSection />
    <FullAppointmentForm />
    <ServicesSection />
    <DoctorsSection />
    <FacilitiesSection />
    <TestimonialsSection />
    <ContactSection />
  </>
);

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const isLoggedIn = localStorage.getItem('mauli_admin_logged_in') === 'true';
  
  if (!isLoggedIn) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar />
      <div className="flex-1 ml-64 min-h-screen overflow-y-auto">
        <main>{children}</main>
      </div>
    </div>
  );
};

const DoctorLayout = ({ children }: { children: React.ReactNode }) => {
  const isLoggedIn = localStorage.getItem('mauli_doctor_logged_in') === 'true';
  
  if (!isLoggedIn) {
    return <Navigate to="/doctor/login" replace />;
  }

  return (
    <div className="min-h-screen bg-sky-50 flex">
      <DoctorSidebar />
      <div className="flex-1 ml-80 min-h-screen overflow-y-auto">
        <main>{children}</main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-white font-sans text-gray-900 scroll-smooth">
        <PromotionalBanner />
        <Header />
        
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<PublicHome />} />
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Admin Protected Routes */}
          <Route path="/admin/dashboard" element={<AdminLayout><AdminDashboard /></AdminLayout>} />
          <Route path="/admin/doctors" element={<AdminLayout><AdminDoctors /></AdminLayout>} />
          <Route path="/admin/appointments" element={<AdminLayout><AdminAppointments /></AdminLayout>} />
          <Route path="/admin/wards" element={<AdminLayout><AdminWards /></AdminLayout>} />
          <Route path="/admin/revenue" element={<AdminLayout><AdminRevenue /></AdminLayout>} />

          {/* Doctor Portal */}
          <Route path="/doctor/login" element={<DoctorLogin />} />
          <Route path="/doctor" element={<Navigate to="/doctor/dashboard" replace />} />
          <Route path="/doctor/dashboard" element={<DoctorLayout><DoctorDashboard /></DoctorLayout>} />
          <Route path="/doctor/appointments" element={<DoctorLayout><DoctorAppointments /></DoctorLayout>} />
          <Route path="/doctor/patients" element={<DoctorLayout><DoctorPatients /></DoctorLayout>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        <Footer />

        {/* WhatsApp Floating Button */}
        <a 
          href="https://wa.me/1234567890" 
          target="_blank" 
          rel="noopener noreferrer"
          className="fixed bottom-8 right-8 z-[60] bg-green-500 text-white p-4 rounded-full shadow-2xl hover:bg-green-600 transition-all hover:scale-110 active:scale-95 group flex items-center gap-2"
          aria-label="Contact on WhatsApp"
        >
          <MessageSquare className="w-6 h-6" />
          <span className="hidden group-hover:block font-bold pr-2">Chat with us</span>
        </a>
      </div>
    </BrowserRouter>
  );
}
