import Link from "next/link";
import {
  Users, Clock, DollarSign, TrendingUp, Shield, Star, ArrowRight,
  CheckCircle2, Briefcase, Zap, Globe,
} from "lucide-react";

const features = [
  { icon: <Users size={24} />, title: "Manajemen Karyawan", description: "Kelola data karyawan secara lengkap dengan fitur CRUD, upload dokumen, dan riwayat kerja.", color: "from-[#1E3A8A] to-[#2563EB]" },
  { icon: <Clock size={24} />, title: "Absensi Digital", description: "Check-in/out dengan GPS, QR Code, atau wajah. Rekap otomatis dan laporan harian.", color: "from-[#F4B400] to-[#FBBF24]" },
  { icon: <DollarSign size={24} />, title: "Payroll Otomatis", description: "Hitung gaji, BPJS, PPh21 secara otomatis. Generate slip gaji PDF dalam sekali klik.", color: "from-emerald-500 to-green-400" },
  { icon: <Briefcase size={24} />, title: "Rekrutmen ATS", description: "Kelola lowongan, tracking pelamar, jadwalkan interview, dan evaluasi kandidat.", color: "from-purple-500 to-violet-400" },
  { icon: <TrendingUp size={24} />, title: "Performance KPI", description: "Pantau KPI karyawan, buat review performa, dan analisis produktivitas tim.", color: "from-orange-500 to-amber-400" },
  { icon: <Shield size={24} />, title: "RBAC & Keamanan", description: "Kontrol akses berbasis peran, audit log lengkap, dan keamanan data enterprise.", color: "from-red-500 to-rose-400" },
];

const stats = [
  { value: "10,000+", label: "Karyawan Terkelola" },
  { value: "500+", label: "Perusahaan Klien" },
  { value: "99.9%", label: "Uptime Sistem" },
  { value: "4.9/5", label: "Rating Kepuasan" },
];

const testimonials = [
  { name: "Budi Santoso", role: "HRD Manager, PT Maju Bersama", text: "Daengtisia HR Suite mengubah cara kami mengelola 500+ karyawan. Proses payroll yang dulu 3 hari kini selesai 2 jam!", rating: 5 },
  { name: "Dewi Lestari", role: "CEO, Startup Teknologi", text: "Platform paling komprehensif yang pernah kami gunakan. UI modern, fitur lengkap, dan support tim yang responsif.", rating: 5 },
  { name: "Ahmad Fauzi", role: "CHRO, Perusahaan Manufaktur", text: "Absensi GPS dan rekrutmen ATS sangat membantu efisiensi tim HR kami. Highly recommended!", rating: 5 },
];

const plans = [
  { name: "Starter", price: "Rp 299.000", period: "/bulan", desc: "Untuk usaha kecil", features: ["Hingga 50 karyawan", "Absensi Digital", "Payroll Dasar", "Cuti & Izin", "Support Email"], cta: "Mulai Gratis", popular: false },
  { name: "Business", price: "Rp 799.000", period: "/bulan", desc: "Untuk bisnis berkembang", features: ["Hingga 500 karyawan", "Semua Fitur Starter", "Rekrutmen ATS", "Performance KPI", "Laporan Lengkap", "Support Prioritas"], cta: "Coba 14 Hari", popular: true },
  { name: "Enterprise", price: "Custom", period: "", desc: "Untuk korporasi besar", features: ["Karyawan Tidak Terbatas", "Multi Cabang", "AI Assistant HR", "Integrasi Custom", "Dedicated Support", "SLA Garansi"], cta: "Hubungi Sales", popular: false },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 dark:bg-gray-950/90 backdrop-blur-md border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-[#1E3A8A] to-[#2563EB] rounded-xl flex items-center justify-center shadow-md">
              <span className="text-[#F4B400] font-black text-base">D</span>
            </div>
            <div>
              <div className="font-bold text-gray-900 dark:text-white text-sm font-display">Daengtisia HR Suite</div>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-8">
            {["Fitur", "Harga", "Karir"].map((item) => (
              <a key={item} href="#" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium transition-colors">{item}</a>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 transition-colors">Masuk</Link>
            <Link href="/dashboard" className="px-4 py-2 text-sm font-semibold bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] text-white rounded-xl hover:opacity-95 transition-all shadow-sm">
              Demo Gratis
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 bg-gradient-to-br from-[#0F172A] via-[#1E3A8A] to-[#1D4ED8] relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-[#F4B400]/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl"></div>
        </div>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(rgba(255,255,255,0.3) 1px, transparent 1px)", backgroundSize: "40px 40px" }}></div>

        <div className="relative max-w-7xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-[#F4B400]/10 border border-[#F4B400]/30 text-[#F4B400] px-4 py-1.5 rounded-full text-sm font-semibold mb-6">
            <Zap size={14} />Platform HR Enterprise Terbaik 2026
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white font-display leading-tight mb-6">
            Kelola SDM Lebih<br />
            <span className="text-[#F4B400]">Cerdas & Efisien</span>
          </h1>
          <p className="text-xl text-blue-200 max-w-2xl mx-auto mb-10">
            Platform HR enterprise all-in-one untuk mengelola karyawan, absensi, payroll, rekrutmen, dan performa dalam satu sistem terintegrasi.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/dashboard" className="px-8 py-4 bg-[#F4B400] text-[#1E3A8A] font-bold rounded-2xl hover:shadow-gold-lg hover:scale-105 transition-all flex items-center gap-2 justify-center">
              Mulai Demo Gratis <ArrowRight size={18} />
            </Link>
            <Link href="/login" className="px-8 py-4 bg-white/10 text-white font-semibold rounded-2xl hover:bg-white/20 transition-all border border-white/20 flex items-center gap-2 justify-center backdrop-blur-sm">
              Masuk ke Akun
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-16 max-w-3xl mx-auto">
            {stats.map((stat) => (
              <div key={stat.label} className="glass rounded-2xl p-4 text-center">
                <div className="text-3xl font-black text-[#F4B400] font-display">{stat.value}</div>
                <div className="text-sm text-blue-200 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-gray-900 dark:text-white font-display mb-4">Semua yang Anda Butuhkan</h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto">Dari rekrutmen hingga pensiun, kelola seluruh siklus karyawan dalam satu platform yang powerful.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.title} className="bg-white dark:bg-gray-950 rounded-3xl p-6 border border-gray-100 dark:border-gray-800 hover:shadow-premium hover:-translate-y-1 transition-all duration-300">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${f.color} flex items-center justify-center text-white mb-5 shadow-md`}>{f.icon}</div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 font-display">{f.title}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-gray-900 dark:text-white font-display mb-4">Dipercaya Ribuan Perusahaan</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="bg-gray-50 dark:bg-gray-900 rounded-3xl p-6 border border-gray-100 dark:border-gray-800">
                <div className="flex mb-4">
                  {Array.from({ length: t.rating }).map((_, i) => <Star key={i} size={16} className="text-[#F4B400] fill-[#F4B400]" />)}
                </div>
                <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed mb-6 italic">"{t.text}"</p>
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white text-sm">{t.name}</div>
                  <div className="text-xs text-gray-400">{t.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-24 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-gray-900 dark:text-white font-display mb-4">Harga Transparan</h2>
            <p className="text-gray-500 dark:text-gray-400">Pilih paket yang sesuai dengan kebutuhan bisnis Anda</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {plans.map((plan) => (
              <div key={plan.name} className={`rounded-3xl p-8 border transition-all ${plan.popular ? "bg-gradient-to-br from-[#1E3A8A] to-[#2563EB] border-transparent text-white shadow-premium scale-105" : "bg-white dark:bg-gray-950 border-gray-100 dark:border-gray-800"}`}>
                {plan.popular && <div className="bg-[#F4B400] text-[#1E3A8A] text-xs font-bold px-3 py-1 rounded-full w-fit mb-4">PALING POPULER</div>}
                <div className="font-bold text-lg mb-1">{plan.name}</div>
                <div className={`text-xs mb-4 ${plan.popular ? "text-blue-200" : "text-gray-400"}`}>{plan.desc}</div>
                <div className="mb-6">
                  <span className="text-4xl font-black font-display">{plan.price}</span>
                  <span className={`text-sm ${plan.popular ? "text-blue-200" : "text-gray-400"}`}>{plan.period}</span>
                </div>
                <div className="space-y-3 mb-8">
                  {plan.features.map((f) => (
                    <div key={f} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 size={16} className={plan.popular ? "text-[#F4B400]" : "text-emerald-500"} />
                      <span className={plan.popular ? "text-blue-100" : "text-gray-600 dark:text-gray-400"}>{f}</span>
                    </div>
                  ))}
                </div>
                <Link href="/dashboard" className={`block text-center py-3 rounded-xl font-semibold text-sm transition-all ${plan.popular ? "bg-[#F4B400] text-[#1E3A8A] hover:shadow-gold" : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-200"}`}>
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-br from-[#0F172A] via-[#1E3A8A] to-[#1D4ED8]">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-5xl font-black text-white font-display mb-6">Siap Transformasi HR<br /><span className="text-[#F4B400]">Perusahaan Anda?</span></h2>
          <p className="text-blue-200 text-lg mb-10">Bergabung dengan 500+ perusahaan yang sudah mempercayakan manajemen HR mereka kepada Daengtisia HR Suite.</p>
          <Link href="/dashboard" className="px-8 py-4 bg-[#F4B400] text-[#1E3A8A] font-bold rounded-2xl hover:shadow-gold-lg transition-all inline-flex items-center gap-2 text-base">
            Mulai Demo Gratis <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-950 py-12 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-[#1E3A8A] to-[#2563EB] rounded-lg flex items-center justify-center">
              <span className="text-[#F4B400] font-black text-sm">D</span>
            </div>
            <span className="text-gray-400 text-sm">© 2026 Daengtisia Corporation. Semua hak dilindungi.</span>
          </div>
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <Globe size={14} />Indonesia 🇮🇩
          </div>
        </div>
      </footer>
    </div>
  );
}
