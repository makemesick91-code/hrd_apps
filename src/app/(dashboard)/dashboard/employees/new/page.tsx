"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User, Briefcase, DollarSign, ChevronLeft, Save, Loader2 } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import Button from "@/components/shared/Button";
import toast from "react-hot-toast";

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  gender: string;
  phone: string;
  birthDate: string;
  address: string;
  departmentId: string;
  positionId: string;
  contractType: string;
  joinDate: string;
  basicSalary: string;
  role: string;
  nik: string;
  npwp: string;
  bankName: string;
  bankAccount: string;
}

const contractTypes = [
  { value: "PERMANENT", label: "Tetap (Permanent)" },
  { value: "CONTRACT", label: "Kontrak" },
  { value: "INTERNSHIP", label: "Magang (Internship)" },
  { value: "FREELANCE", label: "Freelance" },
  { value: "PART_TIME", label: "Paruh Waktu (Part Time)" },
];

const roles = [
  { value: "EMPLOYEE", label: "Karyawan" },
  { value: "MANAGER", label: "Manager" },
  { value: "HRD", label: "HRD" },
  { value: "SUPER_ADMIN", label: "Super Admin" },
];

const steps = ["Informasi Pribadi", "Informasi Pekerjaan", "Informasi Keuangan"];

export default function NewEmployeePage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [departments, setDepartments] = useState<{ id: string; name: string }[]>([]);
  const [positions, setPositions] = useState<{ id: string; name: string }[]>([]);
  const [form, setForm] = useState<FormData>({
    firstName: "", lastName: "", email: "", password: "", gender: "",
    phone: "", birthDate: "", address: "", departmentId: "", positionId: "",
    contractType: "PERMANENT", joinDate: "", basicSalary: "", role: "EMPLOYEE",
    nik: "", npwp: "", bankName: "", bankAccount: "",
  });

  const update = (field: keyof FormData, value: string) =>
    setForm(prev => ({ ...prev, [field]: value }));

  useEffect(() => {
    Promise.all([fetch("/api/departments"), fetch("/api/positions")])
      .then(([dr, pr]) => Promise.all([dr.json(), pr.json()]))
      .then(([dd, pd]) => {
        if (dd.success) setDepartments(dd.data ?? []);
        if (pd.success) setPositions(pd.data ?? []);
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async () => {
    if (!form.firstName || !form.email || !form.password || !form.gender || !form.joinDate) {
      toast.error("Harap lengkapi field wajib: nama depan, email, password, jenis kelamin, dan tanggal bergabung");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          password: form.password,
          gender: form.gender,
          phone: form.phone || undefined,
          birthDate: form.birthDate || undefined,
          address: form.address || undefined,
          departmentId: form.departmentId || undefined,
          positionId: form.positionId || undefined,
          contractType: form.contractType || undefined,
          joinDate: form.joinDate,
          basicSalary: form.basicSalary ? Number(form.basicSalary) : undefined,
          role: form.role,
          nik: form.nik || undefined,
          npwp: form.npwp || undefined,
          bankName: form.bankName || undefined,
          bankAccount: form.bankAccount || undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Karyawan berhasil ditambahkan!");
        router.push("/dashboard/employees");
      } else {
        toast.error(data.message || "Gagal menambahkan karyawan");
      }
    } catch {
      toast.error("Terjadi kesalahan, coba lagi");
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = "w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white placeholder-gray-400";
  const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5";

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Tambah Karyawan"
        subtitle="Daftarkan karyawan baru ke dalam sistem"
        breadcrumb={[{ label: "Dashboard" }, { label: "Karyawan" }, { label: "Tambah Karyawan" }]}
        actions={
          <Button variant="ghost" size="sm" leftIcon={<ChevronLeft size={14} />} onClick={() => router.back()}>
            Kembali
          </Button>
        }
      />

      {/* Stepper */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4">
        <div className="flex items-center gap-0">
          {steps.map((step, idx) => (
            <div key={step} className="flex items-center flex-1 last:flex-none">
              <button onClick={() => setCurrentStep(idx)} className="flex items-center gap-2.5 group">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  idx === currentStep ? "bg-[#1E3A8A] text-white"
                  : idx < currentStep ? "bg-emerald-500 text-white"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-400"
                }`}>
                  {idx < currentStep ? "✓" : idx + 1}
                </div>
                <span className={`text-sm font-medium hidden sm:block ${idx === currentStep ? "text-[#1E3A8A] dark:text-blue-400" : "text-gray-400"}`}>
                  {step}
                </span>
              </button>
              {idx < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-3 ${idx < currentStep ? "bg-emerald-500" : "bg-gray-100 dark:bg-gray-800"}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
        {/* Step 1: Personal Info */}
        {currentStep === 0 && (
          <div className="space-y-5">
            <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <User size={18} className="text-blue-600" /> Informasi Pribadi
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Nama Depan *</label>
                <input value={form.firstName} onChange={e => update("firstName", e.target.value)} type="text" placeholder="cth: Ahmad" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Nama Belakang</label>
                <input value={form.lastName} onChange={e => update("lastName", e.target.value)} type="text" placeholder="cth: Fauzi" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Email *</label>
                <input value={form.email} onChange={e => update("email", e.target.value)} type="email" placeholder="email@perusahaan.com" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Password *</label>
                <input value={form.password} onChange={e => update("password", e.target.value)} type="password" placeholder="Min. 8 karakter" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Jenis Kelamin *</label>
                <select value={form.gender} onChange={e => update("gender", e.target.value)} className={inputClass}>
                  <option value="">Pilih...</option>
                  <option value="MALE">Laki-laki</option>
                  <option value="FEMALE">Perempuan</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>No. Telepon</label>
                <input value={form.phone} onChange={e => update("phone", e.target.value)} type="tel" placeholder="08xxxxxxxxxx" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Tanggal Lahir</label>
                <input value={form.birthDate} onChange={e => update("birthDate", e.target.value)} type="date" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>NIK</label>
                <input value={form.nik} onChange={e => update("nik", e.target.value)} type="text" placeholder="16 digit NIK" className={inputClass} maxLength={16} />
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>Alamat</label>
                <textarea value={form.address} onChange={e => update("address", e.target.value)} placeholder="Alamat lengkap..." rows={2} className={`${inputClass} resize-none`} />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Job Info */}
        {currentStep === 1 && (
          <div className="space-y-5">
            <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Briefcase size={18} className="text-blue-600" /> Informasi Pekerjaan
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Departemen</label>
                <select value={form.departmentId} onChange={e => update("departmentId", e.target.value)} className={inputClass}>
                  <option value="">— Pilih Departemen —</option>
                  {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Jabatan / Posisi</label>
                <select value={form.positionId} onChange={e => update("positionId", e.target.value)} className={inputClass}>
                  <option value="">— Pilih Jabatan —</option>
                  {positions.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Tipe Kontrak</label>
                <select value={form.contractType} onChange={e => update("contractType", e.target.value)} className={inputClass}>
                  {contractTypes.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Tanggal Bergabung *</label>
                <input value={form.joinDate} onChange={e => update("joinDate", e.target.value)} type="date" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Role Sistem</label>
                <select value={form.role} onChange={e => update("role", e.target.value)} className={inputClass}>
                  {roles.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Financial Info */}
        {currentStep === 2 && (
          <div className="space-y-5">
            <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <DollarSign size={18} className="text-blue-600" /> Informasi Keuangan
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Gaji Pokok (Rp)</label>
                <input value={form.basicSalary} onChange={e => update("basicSalary", e.target.value)} type="number" placeholder="cth: 8000000" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>NPWP</label>
                <input value={form.npwp} onChange={e => update("npwp", e.target.value)} type="text" placeholder="XX.XXX.XXX.X-XXX.XXX" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Nama Bank</label>
                <select value={form.bankName} onChange={e => update("bankName", e.target.value)} className={inputClass}>
                  <option value="">Pilih Bank</option>
                  {["BCA","BRI","BNI","Mandiri","CIMB Niaga","BSI","Danamon"].map(b => <option key={b}>{b}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Nomor Rekening</label>
                <input value={form.bankAccount} onChange={e => update("bankAccount", e.target.value)} type="text" placeholder="Nomor rekening" className={inputClass} />
              </div>
            </div>
            <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-xl p-4 text-sm text-amber-700 dark:text-amber-400">
              Data keuangan bersifat rahasia dan hanya dapat diakses oleh HRD dan Super Admin.
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => currentStep > 0 ? setCurrentStep(s => s - 1) : router.back()}>
          {currentStep === 0 ? "Batal" : "Kembali"}
        </Button>
        <div className="flex gap-3">
          {currentStep < steps.length - 1 ? (
            <Button onClick={() => setCurrentStep(s => s + 1)}>Lanjut</Button>
          ) : (
            <Button
              leftIcon={isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Menyimpan..." : "Simpan Karyawan"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
