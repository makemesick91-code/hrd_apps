import Link from "next/link";
import { Briefcase, MapPin, Clock, DollarSign, ChevronRight, Search } from "lucide-react";

const jobs = [
  {
    id: "1",
    title: "Senior Frontend Developer",
    department: "Technology",
    location: "Jakarta (Hybrid)",
    type: "Full Time",
    level: "Senior",
    salary: "Rp 15-25 Juta/bulan",
    tags: ["React", "TypeScript", "Next.js"],
    postedAt: "2 hari lalu",
    deadline: "30 Juni 2026",
  },
  {
    id: "2",
    title: "HR Business Partner",
    department: "Human Resources",
    location: "Jakarta (On-site)",
    type: "Full Time",
    level: "Mid",
    salary: "Rp 10-15 Juta/bulan",
    tags: ["Rekrutmen", "Employee Relations", "HRIS"],
    postedAt: "5 hari lalu",
    deadline: "15 Juni 2026",
  },
  {
    id: "3",
    title: "Financial Analyst",
    department: "Finance",
    location: "Jakarta (Remote)",
    type: "Full Time",
    level: "Mid",
    salary: "Rp 12-18 Juta/bulan",
    tags: ["Excel", "SAP", "Financial Modeling"],
    postedAt: "1 minggu lalu",
    deadline: "20 Juni 2026",
  },
  {
    id: "4",
    title: "UI/UX Designer",
    department: "Technology",
    location: "Jakarta (Hybrid)",
    type: "Full Time",
    level: "Junior",
    salary: "Rp 8-12 Juta/bulan",
    tags: ["Figma", "Prototyping", "Design System"],
    postedAt: "3 hari lalu",
    deadline: "25 Juni 2026",
  },
  {
    id: "5",
    title: "Digital Marketing Specialist",
    department: "Marketing",
    location: "Jakarta (Hybrid)",
    type: "Full Time",
    level: "Mid",
    salary: "Rp 9-14 Juta/bulan",
    tags: ["SEO", "Google Ads", "Meta Ads", "Analytics"],
    postedAt: "1 hari lalu",
    deadline: "5 Juli 2026",
  },
  {
    id: "6",
    title: "Backend Developer (Node.js)",
    department: "Technology",
    location: "Remote",
    type: "Contract",
    level: "Senior",
    salary: "Rp 18-28 Juta/bulan",
    tags: ["Node.js", "PostgreSQL", "Docker", "AWS"],
    postedAt: "Hari ini",
    deadline: "10 Juli 2026",
  },
];

const levelColors: Record<string, string> = {
  Junior: "bg-emerald-100 text-emerald-700",
  Mid: "bg-blue-100 text-blue-700",
  Senior: "bg-purple-100 text-purple-700",
};

const typeColors: Record<string, string> = {
  "Full Time": "bg-gray-100 text-gray-600",
  Contract: "bg-amber-100 text-amber-700",
  Internship: "bg-pink-100 text-pink-700",
};

export default function CareersPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-br from-[#1E3A8A] to-[#2563EB] rounded-lg flex items-center justify-center">
              <span className="text-[#F4B400] font-bold text-sm">D</span>
            </div>
            <span className="font-bold text-gray-900 font-display">Daengtisia</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-sm text-gray-600 hover:text-gray-900 font-medium">Beranda</Link>
            <Link href="/login" className="text-sm bg-[#1E3A8A] text-white px-4 py-2 rounded-xl font-medium hover:bg-[#1D4ED8] transition-colors">
              Login HR
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-gradient-to-br from-[#0F172A] via-[#1E3A8A] to-[#1D4ED8] text-white py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm font-medium mb-6">
            <Briefcase size={14} className="text-[#F4B400]" />
            {jobs.length} Posisi Tersedia
          </div>
          <h1 className="text-4xl md:text-5xl font-bold font-display mb-4">
            Bergabunglah dengan<br />Tim Kami
          </h1>
          <p className="text-white/70 text-lg mb-8">
            Kami mencari talenta terbaik untuk bersama membangun masa depan yang lebih baik.
          </p>
          <div className="relative max-w-md mx-auto">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Cari posisi atau keahlian..."
              className="w-full pl-11 pr-4 py-3.5 rounded-2xl text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#F4B400]"
            />
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-12 px-4 bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { emoji: "🏥", title: "BPJS Kesehatan", desc: "Ditanggung perusahaan 100%" },
              { emoji: "🏖", title: "Cuti Fleksibel", desc: "12 hari cuti tahunan + cuti khusus" },
              { emoji: "📚", title: "Learning & Dev", desc: "Budget pelatihan Rp 5jt/tahun" },
              { emoji: "💻", title: "WFH Friendly", desc: "Kebijakan hybrid yang fleksibel" },
            ].map((b) => (
              <div key={b.title} className="text-center p-4">
                <div className="text-3xl mb-2">{b.emoji}</div>
                <div className="font-semibold text-gray-900 text-sm">{b.title}</div>
                <div className="text-xs text-gray-500 mt-1">{b.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Jobs list */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Posisi Terbuka</h2>
            <div className="flex gap-2">
              <select className="text-sm border border-gray-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>Semua Departemen</option>
                <option>Technology</option>
                <option>Human Resources</option>
                <option>Finance</option>
                <option>Marketing</option>
              </select>
              <select className="text-sm border border-gray-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>Semua Tipe</option>
                <option>Full Time</option>
                <option>Contract</option>
                <option>Internship</option>
              </select>
            </div>
          </div>

          <div className="grid gap-4">
            {jobs.map((job) => (
              <div key={job.id} className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-lg hover:border-blue-100 transition-all group">
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1E3A8A] to-[#2563EB] flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                    {job.department.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <h3 className="font-semibold text-gray-900 text-lg group-hover:text-[#1E3A8A] transition-colors">
                        {job.title}
                      </h3>
                      <div className="flex gap-2 flex-wrap">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${levelColors[job.level]}`}>
                          {job.level}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${typeColors[job.type]}`}>
                          {job.type}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-500">
                      <span className="flex items-center gap-1"><Briefcase size={13} /> {job.department}</span>
                      <span className="flex items-center gap-1"><MapPin size={13} /> {job.location}</span>
                      <span className="flex items-center gap-1"><DollarSign size={13} /> {job.salary}</span>
                      <span className="flex items-center gap-1"><Clock size={13} /> Diposting {job.postedAt}</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {job.tags.map((tag) => (
                        <span key={tag} className="text-[11px] bg-gray-100 text-gray-600 px-2.5 py-0.5 rounded-full font-medium">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <div className="text-xs text-gray-400">Deadline: {job.deadline}</div>
                    <button className="flex items-center gap-1.5 bg-[#1E3A8A] text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-[#1D4ED8] transition-colors">
                      Lamar <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-8 px-4 mt-8">
        <div className="max-w-6xl mx-auto text-center text-sm text-gray-400">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-6 h-6 bg-gradient-to-br from-[#1E3A8A] to-[#2563EB] rounded-lg flex items-center justify-center">
              <span className="text-[#F4B400] font-bold text-xs">D</span>
            </div>
            <span className="font-semibold text-gray-700">Daengtisia HR Suite</span>
          </div>
          <p>© 2026 Daengtisia. Semua hak dilindungi.</p>
        </div>
      </footer>
    </div>
  );
}
