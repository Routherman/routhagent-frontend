import React, { Suspense } from "react";
import WebinarBookingClient from "./WebinarBookingClient";

export const metadata = {
  title: "Inscripción a Webinar | Colaboratium",
  description: "Elegí fecha y horario para participar del Webinar informativo oficial de Colaboratium.",
};

export default function WebinarPublicPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#070b14] text-slate-300 flex items-center justify-center text-sm">
          Cargando formulario de inscripción...
        </div>
      }
    >
      <WebinarBookingClient />
    </Suspense>
  );
}

