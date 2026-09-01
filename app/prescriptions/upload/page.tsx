import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { PrescriptionUploader } from "@/components/prescriptions/prescription-uploader";
import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";

export const metadata = { title: "Upload Prescription — AD CARE Pharmacy" };

export default async function PrescriptionUploadPage() {
  const session = await getSession();
  let user = null;
  if (session?.userId) {
    user = await prisma.user.findUnique({ where: { id: session.userId } });
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Header user={user} />
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-12 w-full">
        <div className="mb-8 text-center">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Upload Your Prescription</h1>
          <p className="text-sm text-slate-500 mt-2 max-w-lg mx-auto">
            Submit a valid doctor&apos;s prescription for pharmacist review. Once approved, prescription medicines will be dispensed and shipped.
          </p>
        </div>
        <PrescriptionUploader />
      </main>
      <Footer />
    </div>
  );
}
