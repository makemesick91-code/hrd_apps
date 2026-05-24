"use client";

import { useState, useEffect, use, lazy, Suspense } from "react";
import { useRouter } from "next/navigation";
import { User, Briefcase, DollarSign, ChevronLeft, Save, Loader2, ScanFace, CheckCircle2, Trash2 } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import Button from "@/components/shared/Button";
import toast from "react-hot-toast";

const FaceEnrollment = lazy(() => import("@/components/attendance/FaceEnrollment"));

interface FormData {
  firstName: string;
  lastName: string;
  phone: string;
  gender: string;
  birthDate: string;
  address: string;
  nik: string;
  npwp: string;
  departmentId: string;
  positionId: string;
  contractType: string;
  joinDate: string;
  employmentStatus: string;
  basicSalary: string;
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

const statusOptions = [
  { value: "ACTIVE", label: "Aktif" },
  { value: "PROBATION", label: "Probasi" },
  { value: "INACTIVE", label: "Tidak Aktif" },
  { value: "TERMINATED", label: "Diberhentikan" },
  { value: "RESIGNED", label: "Resign" },
];

const steps = ["Informasi Pribadi", "Informasi Pekerjaan", "Informasi Keuangan"];

export default function EditEmployeePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [employeeName, setEmployeeName] = useState("");
  const [departments, setDepartments] = useState<{ id: string; name: string }[]>([]);
  const [positions, setPositions] = useState<{ id: string; name: string }[]>([]);
  const [faceEnrolled, setFaceEnrolled] = useState<boolean | null>(null);
  const [showFaceEnrollment, setShowFaceEnrollment] = useState(false);
  const [deletingFace, setDeletingFace] = useState(false);
  const [form, setForm] = useState<FormData>({
    firstName: "", lastName: "", phone: "", gender: "",
    birthDate: "", address: "", nik: "", npwp: "",
    departmentId: "", positionId: "",
    contractType: "PERMANENT", joinDate: "",
    employmentStatus: "ACTIVE",
    basicSalary: "", bankName: "", bankAccount: "",
  });

  const update = (field: keyof FormData, value: string) =>
    setForm(prev => ({ ...prev, [field]: value }));

  useEffect(() => {
    const load = async () => {
      try {
        const [empRes, deptRes, posRes] = await Promise.all([
          fetch(`/api/employees/${id}`),
          fetch("/api/departments"),
          fetch("/api/positions"),
        ]);
        const [empData, deptData, posData] = await Promise.all([
          empRes.json(), deptRes.json(), posRes.json(),
        ]);

        if (!empData.success) { toast.error("Karyawan tidak ditemukan"); router.back(); return; }

        const emp = empData.data;
        const nameParts = (emp.fullName ?? "").split(" ");
        const firstName = nameParts[0] ?? "";
        const lastName = nameParts.slice(1).join(" ");
        setEmployeeName(emp.fullName ?? "");

        if (deptData.success) setDepartments(deptData.data ?? []);
        if (posData.success) setPositions(posData.data ?? []);

        // Check if face is enrolled
        try {
          const faceRes = await fetch(`/api/employees/${id}/face`);
          const faceData = await faceRes.json();
          if (faceData.success) setFaceEnrolled(faceData.data.enrolled);
        } catch { setFaceEnrolled(false); }

        setForm({
          firstName,
          lastName,
          phone: emp.phone ?? "",
          gender: emp.gender ?? "",
          birthDate: emp.birthDate ? emp.birthDate.split("T")[0] : "",
          address: emp.address ?? "",
          nik: emp.nik ?? "",
          npwp: emp.npwp ?? "",
          departmentId: emp.departmentId ?? emp.department?.id ?? "",
          positionId: emp.positionId ?? emp.position?.id ?? "",
          contractType: emp.contractType ?? "PERMANENT",
          joinDate: emp.joinDate ? emp.joinDate.split("T")[0] : "",
          employmentStatus: emp.employmentStatus ?? "ACTIVE",
          basicSalary: emp.basicSalary != null ? String(emp.basicSalary) : "",
          bankName: emp.bankName ?? "",
          bankAccount: emp.bankAccount ?? "",
        });
      } catch {
        toast.error("Gagal memuat data karyawan");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDeleteFace = async () => {
    setDeletingFace(true);
    try {
      const res = await fetch(`/api/employees/${id}/face`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setFaceEnrolled(false);
        toast.success("Data wajah berhasil dihapus");
      } else {
        toast.error(data.message || "Gagal menghapus data wajah");
      }
    } catch {
      toast.error("Terjadi kesalahan");
    } finally {
      setDeletingFace(false);
    }
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/employees/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: `${form.firstName} ${form.lastName}`.trim(),
          phone: form.phone || null,
          gender: form.gender || null,
          birthDate: form.birthDate || null,
          address: form.address || null,
          nik: form.nik || null,
          npwp: form.npwp || null,
          departmentId: form.departmentId || null,
          positionId: form.positionId || null,
          contractType: form.contractType || null,
          joinDate: form.joinDate || null,
          employmentStatus: form.employmentStatus,
          basicSalary: form.basicSalary ? Number(form.basicSalary) : null,
          bankName: form.bankName || null,
          bankAccount: form.bankAccount || null,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message || "Data karyawan berhasil diperbarui");
        router.push("/dashboard/employees");
      } else {
        toast.error(data.message || "Gagal memperbarui data karyawan");
      }
    } catch {
      toast.error("Terjadi kesalahan, coba lagi");
    } finally {
      setSaving(false);
    }
  };

  const inputClass = "w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white placeholder-gray-400";
  const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5";

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 size={28} className="animate-spin text-[#1E3A8A]" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Edit Karyawan"
        subtitle={`Perbarui data ${employeeName}`}
        breadcrumb={[{ label: "Dashboard" }, { label: "Karyawan" }, { label: employeeName }, { label: "Edit" }]}
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
              <button onClick={() => setCurrentStep(idx)} className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  idx === currentStep
                    ? "bg-[#1E3A8A] text-white"
                    : idx < currentStep
                    ? "bg-emerald-500 text-white"
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
        {/* Step 1: Personal */}
        {currentStep === 0 && (
          <div className="space-y-5">
            <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <User size={18} className="text-blue-600" /> Informasi Pribadi
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Nama Depan *</label>
                <input value={form.firstName} onChange={e => update("firstName", e.target.value)} type="text" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Nama Belakang</label>
                <input value={form.lastName} onChange={e => update("lastName", e.target.value)} type="text" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Jenis Kelamin</label>
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
                <input value={form.nik} onChange={e => update("nik", e.target.value)} type="text" placeholder="16 digit NIK" maxLength={16} className={inputClass} />
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>Alamat</label>
                <textarea value={form.address} onChange={e => update("address", e.target.value)} rows={2} className={`${inputClass} resize-none`} />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Job */}
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
                <label className={labelClass}>Jabatan</label>
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
                <label className={labelClass}>Tanggal Bergabung</label>
                <input value={form.joinDate} onChange={e => update("joinDate", e.target.value)} type="date" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Status Kepegawaian</label>
                <select value={form.employmentStatus} onChange={e => update("employmentStatus", e.target.value)} className={inputClass}>
                  {statusOptions.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Financial */}
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

      {/* Face Registration */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
        <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
          <ScanFace size={18} className="text-blue-600" /> Registrasi Wajah
        </h3>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {faceEnrolled === null ? (
              <div className="w-5 h-5 rounded-full border-2 border-gray-200 animate-pulse" />
            ) : faceEnrolled ? (
              <CheckCircle2 size={20} className="text-emerald-500 shrink-0" />
            ) : (
              <div className="w-5 h-5 rounded-full border-2 border-gray-300 dark:border-gray-600" />
            )}
            <div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                {faceEnrolled ? "Wajah sudah terdaftar" : "Wajah belum didaftarkan"}
              </div>
              <div className="text-xs text-gray-400 mt-0.5">
                {faceEnrolled
                  ? "Karyawan dapat absen menggunakan verifikasi wajah"
                  : "Daftarkan wajah karyawan untuk verifikasi absensi"}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {faceEnrolled && (
              <button
                onClick={handleDeleteFace}
                disabled={deletingFace}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-red-600 border border-red-200 dark:border-red-800 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
              >
                {deletingFace ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                Hapus
              </button>
            )}
            <button
              onClick={() => setShowFaceEnrollment(true)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-[#1E3A8A] text-white rounded-xl hover:bg-blue-800 transition-colors"
            >
              <ScanFace size={13} />
              {faceEnrolled ? "Perbarui Wajah" : "Daftarkan Wajah"}
            </button>
          </div>
        </div>
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
              leftIcon={saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              onClick={handleSubmit}
              disabled={saving}
            >
              {saving ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          )}
        </div>
      </div>
      {showFaceEnrollment && (
        <Suspense fallback={null}>
          <FaceEnrollment
            targetEmployeeId={id}
            onClose={() => setShowFaceEnrollment(false)}
            onSuccess={() => { setFaceEnrolled(true); setShowFaceEnrollment(false); }}
          />
        </Suspense>
      )}
    </div>
  );
}
