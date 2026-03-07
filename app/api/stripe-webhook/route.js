import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";

const resend = new Resend(process.env.RESEND_API_KEY);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Use service role for webhook (bypasses RLS)
);

// Domain labels for the email
const DOMAIN_LABELS = {
  es: { logic: "Razonamiento Lógico", numerical: "Razonamiento Numérico", spatial: "Razonamiento Espacial", verbal: "Razonamiento Verbal", memory: "Memoria de Trabajo", abstract: "Inteligencia Fluida" },
  en: { logic: "Logical Reasoning", numerical: "Numerical Reasoning", spatial: "Spatial Reasoning", verbal: "Verbal Reasoning", memory: "Working Memory", abstract: "Fluid Intelligence" },
};

const DOMAIN_COLORS = { logic: "#D4A843", numerical: "#45B7AA", spatial: "#D45D5D", verbal: "#8B72CF", memory: "#2EBD7F", abstract: "#CF5E99" };

function buildEmailHTML(assessment) {
  const lang = assessment.lang || "es";
  const labels = DOMAIN_LABELS[lang] || DOMAIN_LABELS.es;
  const isES = lang === "es";

  const domainScores = assessment.domain_scores || {};
  const strengths = assessment.strengths || [];
  const weaknesses = assessment.weaknesses || [];

  // Build domain bars HTML
  const domainBars = Object.entries(domainScores)
    .map(([key, score]) => `
      <tr>
        <td style="padding:8px 12px 8px 0;font-size:13px;color:#7A786F;width:160px;">${labels[key] || key}</td>
        <td style="padding:8px 0;">
          <div style="background:#1A1A1F;border-radius:4px;height:8px;width:100%;">
            <div style="background:${DOMAIN_COLORS[key] || "#888"};border-radius:4px;height:8px;width:${score}%;"></div>
          </div>
        </td>
        <td style="padding:8px 0 8px 12px;font-size:13px;color:#E2E0DB;font-family:'Courier New',monospace;width:40px;text-align:right;">${score}%</td>
      </tr>
    `)
    .join("");

  const strengthsList = strengths.map((s) => `<span style="display:inline-block;padding:4px 12px;margin:3px;border-radius:4px;background:rgba(46,189,127,0.12);color:#2EBD7F;font-size:12px;">${labels[s] || s}</span>`).join("");
  const weaknessesList = weaknesses.map((w) => `<span style="display:inline-block;padding:4px 12px;margin:3px;border-radius:4px;background:rgba(212,93,93,0.12);color:#D45D5D;font-size:12px;">${labels[w] || w}</span>`).join("");

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#08080C;font-family:'Helvetica Neue',Arial,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:40px 24px;">

    <!-- Header -->
    <div style="text-align:center;margin-bottom:40px;">
      <div style="font-size:14px;font-weight:600;letter-spacing:4px;color:#D4A843;">NEXUS<span style="color:#45B7AA;">IQ</span></div>
      <div style="font-size:11px;letter-spacing:3px;color:#4A4840;margin-top:8px;">${isES ? "INFORME COMPLETO DE RESULTADOS" : "COMPLETE RESULTS REPORT"}</div>
    </div>

    <!-- Main Score -->
    <div style="text-align:center;padding:32px;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.06);border-radius:12px;margin-bottom:24px;">
      <div style="font-size:64px;font-weight:300;color:#D4A843;line-height:1;letter-spacing:-3px;">${assessment.iq_score}</div>
      <div style="font-size:13px;color:#7A786F;margin-top:8px;">${isES ? "Coeficiente Intelectual Estimado" : "Estimated Intelligence Quotient"}</div>

      <div style="margin-top:20px;padding:12px 24px;background:rgba(255,255,255,0.03);border-radius:8px;display:inline-block;">
        <span style="font-size:18px;font-family:'Courier New',monospace;color:#E2E0DB;letter-spacing:2px;">${assessment.iq_lower} — ${assessment.iq_upper}</span>
        <div style="font-size:10px;color:#4A4840;margin-top:4px;letter-spacing:2px;">${isES ? "INTERVALO DE CONFIANZA 80%" : "80% CONFIDENCE INTERVAL"}</div>
      </div>
    </div>

    <!-- Quick Stats -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <tr>
        <td style="width:33%;text-align:center;padding:16px;background:rgba(255,255,255,0.02);border-radius:8px;">
          <div style="font-size:16px;font-weight:500;color:#E2E0DB;">${isES ? (assessment.iq_score >= 130 ? "Superior" : assessment.iq_score >= 115 ? "Por encima" : assessment.iq_score >= 85 ? "Media" : "Por debajo") : (assessment.iq_score >= 130 ? "Superior" : assessment.iq_score >= 115 ? "Above avg" : assessment.iq_score >= 85 ? "Average" : "Below avg")}</div>
          <div style="font-size:10px;color:#4A4840;letter-spacing:1px;margin-top:2px;">${isES ? "CLASIFICACIÓN" : "CLASSIFICATION"}</div>
        </td>
        <td style="width:6px;"></td>
        <td style="width:33%;text-align:center;padding:16px;background:rgba(255,255,255,0.02);border-radius:8px;">
          <div style="font-size:16px;font-weight:500;color:#E2E0DB;font-family:'Courier New',monospace;">${assessment.percentile}%</div>
          <div style="font-size:10px;color:#4A4840;letter-spacing:1px;margin-top:2px;">${isES ? "PERCENTIL" : "PERCENTILE"}</div>
        </td>
        <td style="width:6px;"></td>
        <td style="width:33%;text-align:center;padding:16px;background:rgba(255,255,255,0.02);border-radius:8px;">
          <div style="font-size:16px;font-weight:500;color:#E2E0DB;font-family:'Courier New',monospace;">${assessment.total_correct}/${assessment.total_questions}</div>
          <div style="font-size:10px;color:#4A4840;letter-spacing:1px;margin-top:2px;">${isES ? "ACIERTOS" : "CORRECT"}</div>
        </td>
      </tr>
    </table>

    <!-- Domain Performance -->
    <div style="padding:24px;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.04);border-radius:12px;margin-bottom:24px;">
      <div style="font-size:11px;letter-spacing:3px;color:#4A4840;margin-bottom:16px;">${isES ? "RENDIMIENTO POR DOMINIO" : "PERFORMANCE BY DOMAIN"}</div>
      <table width="100%" cellpadding="0" cellspacing="0">
        ${domainBars}
      </table>
    </div>

    <!-- Strengths & Weaknesses -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <tr>
        <td style="width:49%;vertical-align:top;padding:18px;background:rgba(46,189,127,0.04);border:1px solid rgba(46,189,127,0.1);border-radius:10px;">
          <div style="font-size:10px;color:#2EBD7F;letter-spacing:2px;margin-bottom:10px;">${isES ? "FORTALEZAS" : "STRENGTHS"}</div>
          ${strengthsList}
        </td>
        <td style="width:2%;"></td>
        <td style="width:49%;vertical-align:top;padding:18px;background:rgba(212,93,93,0.04);border:1px solid rgba(212,93,93,0.1);border-radius:10px;">
          <div style="font-size:10px;color:#D45D5D;letter-spacing:2px;margin-bottom:10px;">${isES ? "ÁREAS DE MEJORA" : "AREAS FOR IMPROVEMENT"}</div>
          ${weaknessesList}
        </td>
      </tr>
    </table>

    <!-- Extra Stats -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
      <tr>
        <td style="width:49%;text-align:center;padding:14px;background:rgba(255,255,255,0.02);border-radius:8px;">
          <div style="font-size:18px;font-family:'Courier New',monospace;color:#E2E0DB;">${assessment.avg_time}s</div>
          <div style="font-size:10px;color:#4A4840;letter-spacing:1px;margin-top:2px;">${isES ? "TIEMPO MEDIO" : "AVG. TIME"}</div>
        </td>
        <td style="width:2%;"></td>
        <td style="width:49%;text-align:center;padding:14px;background:rgba(255,255,255,0.02);border-radius:8px;">
          <div style="font-size:18px;font-family:'Courier New',monospace;color:#E2E0DB;">${assessment.raw_score}%</div>
          <div style="font-size:10px;color:#4A4840;letter-spacing:1px;margin-top:2px;">${isES ? "PUNTUACIÓN BRUTA" : "RAW SCORE"}</div>
        </td>
      </tr>
    </table>

    <!-- Footer -->
    <div style="text-align:center;padding-top:24px;border-top:1px solid rgba(255,255,255,0.04);">
      <div style="font-size:12px;color:#D4A843;font-weight:600;letter-spacing:3px;">NEXUS<span style="color:#45B7AA;">IQ</span></div>
      <p style="font-size:11px;color:#3A3A40;margin-top:8px;line-height:1.6;">
        ${isES
          ? "Este informe es una estimación orientativa. Para una evaluación formal, consulta un profesional certificado."
          : "This report is an indicative estimate. For a formal assessment, consult a certified professional."}
      </p>
    </div>

  </div>
</body>
</html>`;
}

// ═══════════════════════════════════════════════════════════════
// STRIPE WEBHOOK HANDLER
// ═══════════════════════════════════════════════════════════════

export async function POST(request) {
  const body = await request.text();

  // Optional: verify Stripe signature (recommended for production)
  // For now, we parse the event directly
  let event;
  try {
    event = JSON.parse(body);
  } catch (err) {
    console.error("[Webhook] Invalid JSON:", err);
    return new Response("Invalid payload", { status: 400 });
  }

  // Only process completed checkout sessions
  if (event.type !== "checkout.session.completed") {
    return new Response("OK", { status: 200 });
  }

  const session = event.data.object;
  const customerEmail = session.customer_details?.email || session.customer_email;
  const stripeSessionId = session.id;

  console.log("[Webhook] Payment received:", { customerEmail, stripeSessionId });

  if (!customerEmail) {
    console.error("[Webhook] No customer email found in session");
    return new Response("No email", { status: 200 });
  }

  try {
    // Find the most recent assessment for this email
    // (or you can match by share_token passed as metadata)
    let query = supabase
      .from("assessments")
      .select("*")
      .eq("email", customerEmail)
      .order("created_at", { ascending: false })
      .limit(1);

    const { data: assessments, error: fetchError } = await query;

    if (fetchError || !assessments?.length) {
      // Fallback: find most recent unpaid assessment (in case email wasn't saved yet)
      const { data: recentAssessments } = await supabase
        .from("assessments")
        .select("*")
        .eq("paid", false)
        .order("created_at", { ascending: false })
        .limit(1);

      if (!recentAssessments?.length) {
        console.error("[Webhook] No assessment found for:", customerEmail);
        return new Response("No assessment found", { status: 200 });
      }

      // Update this assessment with the email and payment info
      const assessment = recentAssessments[0];
      await supabase
        .from("assessments")
        .update({
          email: customerEmail,
          paid: true,
          paid_at: new Date().toISOString(),
          stripe_session_id: stripeSessionId,
        })
        .eq("id", assessment.id);

      // Send email
      await sendReportEmail(customerEmail, { ...assessment, email: customerEmail });
      return new Response("OK", { status: 200 });
    }

    const assessment = assessments[0];

    // Mark as paid in Supabase
    const { error: updateError } = await supabase
      .from("assessments")
      .update({
        paid: true,
        paid_at: new Date().toISOString(),
        stripe_session_id: stripeSessionId,
      })
      .eq("id", assessment.id);

    if (updateError) {
      console.error("[Webhook] Update error:", updateError);
    }

    // Send the report email
    await sendReportEmail(customerEmail, assessment);

    console.log("[Webhook] Report sent to:", customerEmail);
    return new Response("OK", { status: 200 });
  } catch (err) {
    console.error("[Webhook] Error:", err);
    return new Response("Server error", { status: 500 });
  }
}

async function sendReportEmail(email, assessment) {
  const isES = (assessment.lang || "es") === "es";

  const { data, error } = await resend.emails.send({
    from: "NexusIQ <onboarding@resend.dev>",  // Change to your domain later: reports@nexusiq.com
    to: email,
    subject: isES
      ? `Tu informe NexusIQ — CI estimado: ${assessment.iq_score}`
      : `Your NexusIQ Report — Estimated IQ: ${assessment.iq_score}`,
    html: buildEmailHTML(assessment),
  });

  if (error) {
    console.error("[Email] Send error:", error);
    throw error;
  }

  console.log("[Email] Sent successfully:", data?.id);
  return data;
}