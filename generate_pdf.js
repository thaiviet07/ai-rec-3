const PDFDocument = require('pdfkit');
const fs = require('fs');

const doc = new PDFDocument({ margin: 50, size: 'A4', bufferPages: true });
doc.pipe(fs.createWriteStream('onmi_AI_Research_Platform_Manual.pdf'));

// Primary Palette
const PRIMARY = '#0F172A'; // Dark Slate
const ACCENT_BLUE = '#2563EB'; // Blue
const ACCENT_INDIGO = '#4F46E5'; // Indigo
const ACCENT_PINK = '#EC4899'; // Pink
const TEXT_DARK = '#1E293B'; // Dark grey
const TEXT_MUTED = '#64748B'; // Muted slate grey
const BG_LIGHT = '#F8FAFC'; // Light background
const BORDER_COLOR = '#E2E8F0';

// Font Configuration
const HELVETICA = 'Helvetica';
const HELVETICA_BOLD = 'Helvetica-Bold';
const HELVETICA_OBlique = 'Helvetica-Oblique';

// Draw clean header/footer helper
function drawPageDecorations(pageNum, totalPages) {
  if (pageNum === 1) return; // Skip cover page decorations

  doc.save();
  // Header
  doc.fontSize(8).fillColor(TEXT_MUTED).font(HELVETICA_BOLD);
  doc.text('ONMI RESEARCH PLATFORM', 50, 25);
  doc.font(HELVETICA).text('OPERATIONS & INTEGRATION GUIDE', 180, 25, { align: 'right', width: 365 });
  doc.moveTo(50, 35).lineTo(545, 35).strokeColor(BORDER_COLOR).lineWidth(0.5).stroke();

  // Footer
  doc.moveTo(50, 780).lineTo(545, 780).strokeColor(BORDER_COLOR).lineWidth(0.5).stroke();
  doc.fontSize(8).fillColor(TEXT_MUTED).font(HELVETICA);
  doc.text('Confidential - Academic & Social Computing Research Only', 50, 790);
  doc.text(`Page ${pageNum} of ${totalPages}`, 400, 790, { align: 'right', width: 145 });
  doc.restore();
}

// ----------------------------------------------------
// 1. COVER PAGE
// ----------------------------------------------------
doc.rect(0, 0, 595, 842).fill(BG_LIGHT);

// Dark accent bar at top
doc.rect(0, 0, 595, 20).fill(PRIMARY);

// Large title block
doc.fillColor(PRIMARY);
doc.font(HELVETICA_BOLD).fontSize(34).text('onmi', 70, 180, { lineGap: 10 });

// Colored dot next to logo
doc.circle(162, 195, 6).fill(ACCENT_BLUE);

doc.fillColor(PRIMARY);
doc.font(HELVETICA_BOLD).fontSize(26).text('AI Shopping Research Platform', 70, 240);
doc.fontSize(16).font(HELVETICA).fillColor(ACCENT_INDIGO).text('High-Fidelity Telemetry, Counter-Balancing, & Live Analytics', 70, 275);

// Horizontal Accent Divider
doc.moveTo(70, 310).lineTo(525, 310).strokeColor(ACCENT_INDIGO).lineWidth(2.5).stroke();

// Description
doc.fontSize(11).font(HELVETICA).fillColor(TEXT_DARK).text(
  'A premium social computing research system testing AI shopping assistant autonomy, user trust, and multi-agent collaborative teaming interfaces. Featuring exact counterbalanced group assignment and real-time Knack database behavioral tracking.',
  70,
  340,
  { width: 450, lineGap: 6 }
);

// Metadata Block at Bottom
doc.rect(70, 560, 455, 120).fill('#FFFFFF');
doc.rect(70, 560, 455, 120).strokeColor(BORDER_COLOR).lineWidth(0.5).stroke();

// Metadata Title
doc.fillColor(PRIMARY).font(HELVETICA_BOLD).fontSize(10).text('SYSTEM ENVIRONMENT & TELEMETRY', 90, 580);
doc.moveTo(90, 595).lineTo(505, 595).strokeColor(BORDER_COLOR).lineWidth(0.5).stroke();

// Metadata Content
doc.fontSize(9).font(HELVETICA).fillColor(TEXT_MUTED);
doc.text('Primary Database:', 90, 610);
doc.text('Integration Protocol:', 90, 625);
doc.text('Client Architecture:', 90, 640);

doc.fillColor(TEXT_DARK).font(HELVETICA_BOLD);
doc.text('Knack Cloud DB (Table 1 / object_3)', 210, 610);
doc.text('JSON Telemetry Serialization via REST API', 210, 625);
doc.text('Expo React Native + Web Optimizations', 210, 640);

// Cover Footer
doc.fontSize(8).font(HELVETICA).fillColor(TEXT_MUTED).text('Version 1.2.0 • May 2026', 70, 760);
doc.text('Antigravity Deepmind & partners', 70, 775);

// ----------------------------------------------------
// 2. PAGE 2: ARCHITECTURE & PORTAL SELECTION
// ----------------------------------------------------
doc.addPage();

doc.fillColor(PRIMARY).font(HELVETICA_BOLD).fontSize(18).text('1. Dual-Study Architecture & Landing Portal', 50, 60);
doc.fontSize(10).font(HELVETICA).fillColor(TEXT_DARK).text(
  'The platform is designed to run two separate behavioral research studies concurrently. Rather than using fragile URL parameters, the entrance point is centralized in a sleek Apple-esque study selector page.',
  50,
  90,
  { width: 495, lineGap: 4 }
);

// Vector drawing of the dual-study structure
doc.save();
doc.translate(50, 150);

// Background card box
doc.rect(0, 0, 495, 120).fill('#FFFFFF');
doc.rect(0, 0, 495, 120).strokeColor(BORDER_COLOR).lineWidth(0.5).stroke();

// S1 Box
doc.rect(20, 20, 210, 80).fill('#EFF6FF');
doc.rect(20, 20, 210, 80).strokeColor('#BFDBFE').lineWidth(1).stroke();
doc.fillColor('#2563EB').font(HELVETICA_BOLD).fontSize(11).text('STUDY 1: AUTONOMY', 35, 35);
doc.fillColor(TEXT_DARK).font(HELVETICA).fontSize(8).text('- 2 Counterbalanced Scenarios\n- Low Autonomy (Recommend)\n- High Autonomy (Auto-Purchase)', 35, 55, { lineGap: 3 });

// S2 Box
doc.rect(265, 20, 210, 80).fill('#FDF2F8');
doc.rect(265, 20, 210, 80).strokeColor('#FBCFE8').lineWidth(1).stroke();
doc.fillColor('#DB2777').font(HELVETICA_BOLD).fontSize(11).text('STUDY 2: COLLABORATION', 280, 35);
doc.fillColor(TEXT_DARK).font(HELVETICA).fontSize(8).text('- 4 Counterbalanced Scenarios\n- Autonomy (Low/High)\n- Collaborative Teaming (Yes/No)', 280, 55, { lineGap: 3 });

doc.restore();

doc.fillColor(PRIMARY).font(HELVETICA_BOLD).fontSize(13).text('Portal Features', 50, 295);
doc.fontSize(9.5).font(HELVETICA).fillColor(TEXT_DARK).text(
  '• Real-time Counterbalance Meter: A dynamic colored progress segment that shows researchers the distribution of respondents across all available scenarios.\n' +
  '• Auto-Resuming Flow: If a user temporarily closes the page, local storage memory locks their initial assignment. Clicking "Continue Study" brings them instantly back to their active chat session without altering counterbalance counts.\n' +
  '• Wallet Reset Telemetry: When starting a new session, the user\'s wallet balance automatically resets to $1,000.00, and previous local chat histories are wiped clean to prevent carry-over effects.',
  50,
  315,
  { width: 495, lineGap: 6 }
);

// Balanced Randomization Section
doc.fillColor(PRIMARY).font(HELVETICA_BOLD).fontSize(14).text('2. Round-Robin Randomization Algorithm', 50, 420);
doc.fontSize(10).font(HELVETICA).fillColor(TEXT_DARK).text(
  'To guarantee exact statistical cell parity (e.g., 50/50 for Study 1, and 25/25/25/25 for Study 2), the application implements a round-robin counterbalance algorithm in src/services/randomizationService.ts. Instead of simple math-random (which leads to highly unequal groups at small sample sizes), the system follows a deterministic assignment queue:',
  50,
  445,
  { width: 495, lineGap: 4 }
);

// Algorithm Box
doc.rect(50, 520, 495, 140).fill('#F8FAFC');
doc.rect(50, 520, 495, 140).strokeColor(BORDER_COLOR).lineWidth(0.5).stroke();

doc.fillColor(ACCENT_BLUE).font(HELVETICA_BOLD).fontSize(9).text('ALGORITHM FLOW SPECIFICATION (TypeScript)', 65, 535);

const codeSample = 
`// 1. Fetch historical counts from persistent memory
const counts = JSON.parse(localStorage.getItem('study_counts') || '{"S1_LOW":0,"S1_HIGH":0}');

// 2. Identify the scenario with the lowest respondent count
const scenario = counts.S1_LOW <= counts.S1_HIGH ? 'S1_LOW' : 'S1_HIGH';

// 3. Assign user, increment cell, and lock assignment in persistent session
counts[scenario]++;
localStorage.setItem('study_counts', JSON.stringify(counts));`;

doc.fillColor('#0F172A').font('Courier').fontSize(8.5).text(codeSample, 65, 555, { lineGap: 3 });

// ----------------------------------------------------
// 3. PAGE 3: TELEMETRY & BEHAVIORAL LOGGING
// ----------------------------------------------------
doc.addPage();

doc.fillColor(PRIMARY).font(HELVETICA_BOLD).fontSize(18).text('3. Structured Telemetry & Logging Protocol', 50, 60);
doc.fontSize(10).font(HELVETICA).fillColor(TEXT_DARK).text(
  'To maintain compatibility with standard Knack fields, all tracking data is compiled into a high-fidelity JSON payload and stored in Table 1 (object_3), field_23 (Name). This enables complete behavioral tracking of clicks, timing, and purchasing decisions.',
  50,
  90,
  { width: 495, lineGap: 4 }
);

doc.fillColor(PRIMARY).font(HELVETICA_BOLD).fontSize(12).text('Event Classification & Payloads', 50, 145);

// Draw table
doc.save();
doc.translate(50, 165);

// Header row
doc.rect(0, 0, 495, 20).fill(PRIMARY);
doc.fillColor('#FFFFFF').font(HELVETICA_BOLD).fontSize(8.5);
doc.text('Event Type', 10, 6);
doc.text('Description', 120, 6);
doc.text('Key Telemetry Fields Tracked', 270, 6);

// Row 1
doc.fillColor('#FFFFFF').rect(0, 20, 495, 30).fill();
doc.rect(0, 20, 495, 30).strokeColor(BORDER_COLOR).lineWidth(0.5).stroke();
doc.fillColor(TEXT_DARK).font(HELVETICA_BOLD).fontSize(8).text('ASSIGNED', 10, 30);
doc.font(HELVETICA).fontSize(8).text('Fires on study enter.', 120, 30);
doc.text('study, scenario, autonomyLevel, teaming, description', 270, 30, { width: 215 });

// Row 2
doc.fillColor('#FFFFFF').rect(0, 50, 495, 30).fill();
doc.rect(0, 50, 495, 30).strokeColor(BORDER_COLOR).lineWidth(0.5).stroke();
doc.fillColor(TEXT_DARK).font(HELVETICA_BOLD).fontSize(8).text('MESSAGE_SENT', 10, 60);
doc.font(HELVETICA).fontSize(8).text('Fires on user text chat.', 120, 60);
doc.text('text, charCount, wordCount, timestamp', 270, 60, { width: 215 });

// Row 3
doc.fillColor('#FFFFFF').rect(0, 80, 495, 30).fill();
doc.rect(0, 80, 495, 30).strokeColor(BORDER_COLOR).lineWidth(0.5).stroke();
doc.fillColor(TEXT_DARK).font(HELVETICA_BOLD).fontSize(8).text('MESSAGE_RECEIVED', 10, 90);
doc.font(HELVETICA).fontSize(8).text('AI response delivery.', 120, 90);
doc.text('aiMessage, actionType, matchedProductId, matchedPrice', 270, 90, { width: 215 });

// Row 4
doc.fillColor('#FFFFFF').rect(0, 110, 495, 35).fill();
doc.rect(0, 110, 495, 35).strokeColor(BORDER_COLOR).lineWidth(0.5).stroke();
doc.fillColor(TEXT_DARK).font(HELVETICA_BOLD).fontSize(8).text('DECISION_ACTION', 10, 120);
doc.font(HELVETICA).fontSize(8).text('Final transaction state.', 120, 120);
doc.text('action (CONFIRMED | DECLINED | AUTO_PURCHASED | GUARD_BLOCKED), price, walletAfter', 270, 120, { width: 215 });

doc.restore();

// Analysis Section
doc.fillColor(PRIMARY).font(HELVETICA_BOLD).fontSize(14).text('4. Analytical Advantages', 50, 375);
doc.fontSize(10).font(HELVETICA).fillColor(TEXT_DARK).text(
  'By standardizing all actions around a persistent Session ID (e.g. sess_1703112000_a1b2c3d4), researchers gain tremendous advantages during analysis:',
  50,
  400,
  { width: 495, lineGap: 4 }
);

doc.fontSize(9.5).font(HELVETICA).fillColor(TEXT_DARK).text(
  '• Timeline Reconstruction: Easily order actions chronologically to trace the exact dialog history and decision milestones for each respondent.\n' +
  '• Conversion Funnel Modeling: Measure drop-offs, refusal counts (Alternative Request), and purchase rates based on varying autonomy levels.\n' +
  '• Safety Intercept Analysis: Track how safety budget guard limits prevent High Autonomy agent checkout, showing the limits of agency.',
  50,
  425,
  { width: 495, lineGap: 6 }
);

// ----------------------------------------------------
// 4. PAGE 4: LIVE RESEARCH ANALYTICS DASHBOARD
// ----------------------------------------------------
doc.addPage();

doc.fillColor(PRIMARY).font(HELVETICA_BOLD).fontSize(18).text('5. Live Analytics & Research Dashboard Guide', 50, 60);
doc.fontSize(10).font(HELVETICA).fillColor(TEXT_DARK).text(
  'A full-featured analytics suite is built directly into the client at /dashboard. It fetches live, raw telemetry from the Knack database and aggregates them instantly into visual indicators and inspectable tables.',
  50,
  90,
  { width: 495, lineGap: 4 }
);

// Graphic representation of dashboard layout
doc.save();
doc.translate(50, 140);

// Dashboard Window Container
doc.rect(0, 0, 495, 230).fill('#F8FAFC');
doc.rect(0, 0, 495, 230).strokeColor(BORDER_COLOR).lineWidth(0.5).stroke();

// Header bar
doc.rect(0, 0, 495, 25).fill(PRIMARY);
doc.fillColor('#FFFFFF').font(HELVETICA_BOLD).fontSize(8).text('ONMI RESEARCH DASHBOARD - REALTIME STATS', 10, 8);

// Stats boxes
doc.rect(15, 35, 100, 40).fill('#FFFFFF');
doc.rect(15, 35, 100, 40).strokeColor(BORDER_COLOR).lineWidth(0.5).stroke();
doc.fillColor(TEXT_MUTED).font(HELVETICA_BOLD).fontSize(6).text('TOTAL SESSIONS', 20, 43);
doc.fillColor(ACCENT_BLUE).font(HELVETICA_BOLD).fontSize(14).text('84', 20, 52);

doc.rect(130, 35, 100, 40).fill('#FFFFFF');
doc.rect(130, 35, 100, 40).strokeColor(BORDER_COLOR).lineWidth(0.5).stroke();
doc.fillColor(TEXT_MUTED).font(HELVETICA_BOLD).fontSize(6).text('TOTAL PURCHASES', 135, 43);
doc.fillColor('#10B981').font(HELVETICA_BOLD).fontSize(14).text('58', 135, 52);

doc.rect(245, 35, 100, 40).fill('#FFFFFF');
doc.rect(245, 35, 100, 40).strokeColor(BORDER_COLOR).lineWidth(0.5).stroke();
doc.fillColor(TEXT_MUTED).font(HELVETICA_BOLD).fontSize(6).text('CONVERSION RATE', 250, 43);
doc.fillColor(ACCENT_INDIGO).font(HELVETICA_BOLD).fontSize(14).text('69.0%', 250, 52);

doc.rect(360, 35, 120, 40).fill('#FFFFFF');
doc.rect(360, 35, 120, 40).strokeColor(BORDER_COLOR).lineWidth(0.5).stroke();
doc.fillColor(TEXT_MUTED).font(HELVETICA_BOLD).fontSize(6).text('SAFETY BLOCKS', 365, 43);
doc.fillColor('#EF4444').font(HELVETICA_BOLD).fontSize(14).text('12', 365, 52);

// Two small chart representations
doc.rect(15, 90, 220, 125).fill('#FFFFFF');
doc.rect(15, 90, 220, 125).strokeColor(BORDER_COLOR).lineWidth(0.5).stroke();
doc.fillColor(TEXT_DARK).font(HELVETICA_BOLD).fontSize(7).text('AUTONOMY IMPACT (CONVERSION RATIO)', 25, 100);
// Low auto bar
doc.rect(25, 120, 130, 10).fill('#3B82F6');
doc.fillColor(TEXT_DARK).font(HELVETICA_BOLD).fontSize(6).text('Low (42.5%)', 165, 123);
// High auto bar
doc.rect(25, 140, 180, 10).fill('#10B981');
doc.fillColor(TEXT_DARK).font(HELVETICA_BOLD).fontSize(6).text('High (78.3%)', 210, 143);

doc.rect(250, 90, 230, 125).fill('#FFFFFF');
doc.rect(250, 90, 230, 125).strokeColor(BORDER_COLOR).lineWidth(0.5).stroke();
doc.fillColor(TEXT_DARK).font(HELVETICA_BOLD).fontSize(7).text('COLLABORATIVE TEAMING BENEFIT', 260, 100);
// Solo AI bar
doc.rect(260, 120, 110, 10).fill('#6366F1');
doc.fillColor(TEXT_DARK).font(HELVETICA_BOLD).fontSize(6).text('Solo (36.1%)', 380, 123);
// Teaming bar
doc.rect(260, 140, 190, 10).fill('#EC4899');
doc.fillColor(TEXT_DARK).font(HELVETICA_BOLD).fontSize(6).text('Ngoc Linh (84.2%)', 455, 143);

doc.restore();

doc.fillColor(PRIMARY).font(HELVETICA_BOLD).fontSize(12).text('Operations & Exporting Instructions', 50, 395);
doc.fontSize(9.5).font(HELVETICA).fillColor(TEXT_DARK).text(
  '1. Live Refresh: Click the indigo "Refresh" button at the top-right to pull current logs from the Knack REST API instantly. The loading spinner will indicate network progress.\n' +
  '2. Respondent Analysis Grid: The bottom half of the dashboard shows all active sessions. Clicking a row dynamically populates the step-by-step chat history panel on the right.\n' +
  '3. CSV Exporting: Click "Export CSV" to immediately trigger a browser file download of the full, flattened data structure. The system parses the JSON column and compiles it into a clean, comma-delimited Excel-compatible format.',
  50,
  415,
  { width: 495, lineGap: 6 }
);

// ----------------------------------------------------
// PAGE NUMBERS CALCULATION & DECORATION WRITING
// ----------------------------------------------------
const totalPages = doc.bufferedPageRange().count;
for (let i = 0; i < totalPages; i++) {
  doc.switchToPage(i);
  drawPageDecorations(i + 1, totalPages);
}

doc.end();
console.log('PDF successfully generated!');
