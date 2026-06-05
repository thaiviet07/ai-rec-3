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

doc.fillColor(PRIMARY).font(HELVETICA_BOLD).fontSize(18).text('1. Direct-Entry Architecture & Participant Flow', 50, 60);
doc.fontSize(10).font(HELVETICA).fillColor(TEXT_DARK).text(
  'The platform is configured to direct participants instantly to the AI shopping assistant session. Instead of manual study selection, opening the application automatically generates a unique session ID, counterbalances the participant into one of the four experimental conditions at a 25/25/25/25 ratio, and redirects directly to the chat interface.',
  50,
  90,
  { width: 495, lineGap: 4 }
);

// Vector drawing of the single-study structure
doc.save();
doc.translate(50, 150);

// Background card box
doc.rect(0, 0, 495, 120).fill('#FFFFFF');
doc.rect(0, 0, 495, 120).strokeColor(BORDER_COLOR).lineWidth(0.5).stroke();

// Draw 4 condition boxes
doc.rect(10, 20, 110, 80).fill('#EFF6FF');
doc.rect(10, 20, 110, 80).strokeColor('#BFDBFE').lineWidth(1).stroke();
doc.fillColor('#2563EB').font(HELVETICA_BOLD).fontSize(8).text('CONDITION 1', 18, 30);
doc.fillColor(TEXT_DARK).font(HELVETICA).fontSize(6.5).text('High Autonomy\n+ Teaming\n(25% distribution)', 18, 45, { lineGap: 2 });

doc.rect(130, 20, 110, 80).fill('#F0FDF4');
doc.rect(130, 20, 110, 80).strokeColor('#BBF7D0').lineWidth(1).stroke();
doc.fillColor('#16A34A').font(HELVETICA_BOLD).fontSize(8).text('CONDITION 2', 138, 30);
doc.fillColor(TEXT_DARK).font(HELVETICA).fontSize(6.5).text('High Autonomy\n+ Solo AI\n(25% distribution)', 138, 45, { lineGap: 2 });

doc.rect(250, 20, 110, 80).fill('#FEF9C3');
doc.rect(250, 20, 110, 80).strokeColor('#FEF08A').lineWidth(1).stroke();
doc.fillColor('#CA8A04').font(HELVETICA_BOLD).fontSize(8).text('CONDITION 3', 258, 30);
doc.fillColor(TEXT_DARK).font(HELVETICA).fontSize(6.5).text('Low Autonomy\n+ Teaming\n(25% distribution)', 258, 45, { lineGap: 2 });

doc.rect(370, 20, 110, 80).fill('#FDF2F8');
doc.rect(370, 20, 110, 80).strokeColor('#FBCFE8').lineWidth(1).stroke();
doc.fillColor('#DB2777').font(HELVETICA_BOLD).fontSize(8).text('CONDITION 4', 378, 30);
doc.fillColor(TEXT_DARK).font(HELVETICA).fontSize(6.5).text('Low Autonomy\n+ Solo AI\n(25% distribution)', 378, 45, { lineGap: 2 });

doc.restore();

doc.fillColor(PRIMARY).font(HELVETICA_BOLD).fontSize(13).text('Portal Features', 50, 295);
doc.fontSize(9.5).font(HELVETICA).fillColor(TEXT_DARK).text(
  '• Real-time Counterbalance Routing: Opening the application automatically triggers the counterbalance checks, guaranteeing that participant counts across the 4 conditions stay exactly balanced (25:25:25:25).\n' +
  '• Suggested Task Prompt: The chat interface displays a premium clickable Suggested Task chip containing the standard prompt. Tapping it submits it instantly, eliminating human keyboard entry error.\n' +
  '• Wallet Reset Telemetry: When starting a session, the user\'s wallet balance automatically resets to $1,002.00, and previous local chat histories are wiped clean to prevent carry-over effects.',
  50,
  315,
  { width: 495, lineGap: 6 }
);

// Balanced Randomization Section
doc.fillColor(PRIMARY).font(HELVETICA_BOLD).fontSize(14).text('2. Round-Robin Randomization Algorithm', 50, 420);
doc.fontSize(10).font(HELVETICA).fillColor(TEXT_DARK).text(
  'To guarantee exact statistical cell parity (25/25/25/25 across the 4 conditions), the application implements a round-robin counterbalance algorithm in src/services/randomizationService.ts. Instead of simple math-random (which leads to highly unequal groups at small sample sizes), the system follows a deterministic assignment queue:',
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
const counts = JSON.parse(localStorage.getItem('study2_counter') || '{"S2_HL":0,"S2_HH":0,"S2_LL":0,"S2_LH":0}');

// 2. Identify the scenario candidates with the minimum count
const minCount = Math.min(counts.S2_HL, counts.S2_HH, counts.S2_LL, counts.S2_LH);
const candidates = ['S2_HL', 'S2_HH', 'S2_LL', 'S2_LH'].filter(s => counts[s] === minCount);

// 3. Assign user, increment cell, and lock assignment in persistent session
const assigned = candidates[Math.floor(Math.random() * candidates.length)];
counts[assigned]++;
localStorage.setItem('study2_counter', JSON.stringify(counts));`;
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
// 5. PAGE 5: EXPERIMENTAL CONDITIONS SPECIFICATION
// ----------------------------------------------------
doc.addPage();

doc.fillColor(PRIMARY).font(HELVETICA_BOLD).fontSize(18).text('6. Experimental Conditions & Simulation Flow', 50, 60);
doc.fontSize(10).font(HELVETICA).fillColor(TEXT_DARK).text(
  'The platform evaluates four experimental conditions crossing AI autonomy with human-AI teaming. The following models the agent response templates, matched criteria, and wallet deduction telemetry for each condition:',
  50,
  90,
  { width: 495, lineGap: 4 }
);

// Draw 4 cards in a 2x2 grid layout
// Column 1 X: 50, Column 2 X: 310. Width: 235
// Row 1 Y: 135, Row 2 Y: 435. Height: 275

// --- CARD 1: CONDITION 1 (Top Left) ---
doc.save();
doc.rect(50, 135, 235, 275).fill('#FFFFFF');
doc.rect(50, 135, 235, 275).strokeColor(BORDER_COLOR).lineWidth(0.5).stroke();
doc.rect(50, 135, 235, 25).fill(PRIMARY);
doc.fillColor('#FFFFFF').font(HELVETICA_BOLD).fontSize(7.5).text('COND 1: HIGH AUTONOMY + TEAMING', 58, 145);

doc.fillColor(TEXT_DARK).font(HELVETICA_BOLD).fontSize(8).text('AI Response Message Template:', 58, 170);
doc.font(HELVETICA).fontSize(7).fillColor(TEXT_MUTED).text(
  'Based on your request, the AI agent analyzed the available options and selected the best match: a versatile brown jacket in size M for $47.90. Ngoc Linh, your human shopping agent, also reviewed the choice and confirmed that it perfectly fits your request and stays under your $50 budget. Since both the AI agent and Ngoc Linh confirmed it as a perfect match, the purchase has been completed automatically using your wallet balance.',
  58,
  182,
  { width: 219, lineGap: 2 }
);

doc.fillColor(TEXT_DARK).font(HELVETICA_BOLD).fontSize(8).text('Match Reasons:', 58, 280);
doc.font(HELVETICA).fontSize(7).fillColor(TEXT_MUTED).text(
  '• Comfort Brown color\n• Size M\n• Within budget\n• Reviewed by Ngoc Linh',
  58,
  292,
  { lineGap: 2 }
);

doc.fillColor(TEXT_DARK).font(HELVETICA_BOLD).fontSize(8).text('System Action & Telemetry:', 58, 345);
doc.font(HELVETICA_OBlique).fontSize(7).fillColor(ACCENT_PINK).text(
  'Purchase completed automatically by AI with human-agent review. New balance updated to $954.10.',
  58,
  357,
  { width: 219, lineGap: 2 }
);
doc.restore();

// --- CARD 2: CONDITION 2 (Top Right) ---
doc.save();
doc.rect(310, 135, 235, 275).fill('#FFFFFF');
doc.rect(310, 135, 235, 275).strokeColor(BORDER_COLOR).lineWidth(0.5).stroke();
doc.rect(310, 135, 235, 25).fill('#1E3A8A');
doc.fillColor('#FFFFFF').font(HELVETICA_BOLD).fontSize(7.5).text('COND 2: HIGH AUTONOMY + SOLO AI', 318, 145);

doc.fillColor(TEXT_DARK).font(HELVETICA_BOLD).fontSize(8).text('AI Response Message Template:', 318, 170);
doc.font(HELVETICA).fontSize(7).fillColor(TEXT_MUTED).text(
  'Based on your request, the AI agent analyzed the available options and selected the best match: a versatile brown jacket in size M for $47.90. Since it perfectly matches your request and stays under your $50 budget, the purchase has been completed automatically using your wallet balance.',
  318,
  182,
  { width: 219, lineGap: 2 }
);

doc.fillColor(TEXT_DARK).font(HELVETICA_BOLD).fontSize(8).text('Match Reasons:', 318, 280);
doc.font(HELVETICA).fontSize(7).fillColor(TEXT_MUTED).text(
  '• Comfort Brown color\n• Size M\n• Within budget',
  318,
  292,
  { lineGap: 2 }
);

doc.fillColor(TEXT_DARK).font(HELVETICA_BOLD).fontSize(8).text('System Action & Telemetry:', 318, 345);
doc.font(HELVETICA_OBlique).fontSize(7).fillColor(ACCENT_PINK).text(
  'Purchase completed automatically by AI. New balance updated to $954.10.',
  318,
  357,
  { width: 219, lineGap: 2 }
);
doc.restore();

// --- CARD 3: CONDITION 3 (Bottom Left) ---
doc.save();
doc.rect(50, 435, 235, 275).fill('#FFFFFF');
doc.rect(50, 435, 235, 275).strokeColor(BORDER_COLOR).lineWidth(0.5).stroke();
doc.rect(50, 435, 235, 25).fill(ACCENT_BLUE);
doc.fillColor('#FFFFFF').font(HELVETICA_BOLD).fontSize(7.5).text('COND 3: LOW AUTONOMY + TEAMING', 58, 445);

doc.fillColor(TEXT_DARK).font(HELVETICA_BOLD).fontSize(8).text('AI Response Message Template:', 58, 470);
doc.font(HELVETICA).fontSize(7).fillColor(TEXT_MUTED).text(
  'Based on your request, the AI agent analyzed the available options and found a strong match: a versatile brown jacket in size M for $47.90. Ngoc Linh, your human shopping agent, also reviewed the recommendation and confirmed that it fits your request and stays under your $50 budget. Since the system does not complete purchases without your approval, please confirm whether you would like to proceed with payment.',
  58,
  482,
  { width: 219, lineGap: 2 }
);

doc.fillColor(TEXT_DARK).font(HELVETICA_BOLD).fontSize(8).text('Match Reasons:', 58, 580);
doc.font(HELVETICA).fontSize(7).fillColor(TEXT_MUTED).text(
  '• Comfort Brown color\n• Size M\n• Within budget\n• Reviewed by Ngoc Linh',
  58,
  592,
  { lineGap: 2 }
);

doc.fillColor(TEXT_DARK).font(HELVETICA_BOLD).fontSize(8).text('System Action & Telemetry:', 58, 645);
doc.font(HELVETICA_OBlique).fontSize(7).fillColor(ACCENT_PINK).text(
  'User confirmation needed. Your wallet balance will be updated to $954.10 only if you approve the purchase.',
  58,
  657,
  { width: 219, lineGap: 2 }
);
doc.restore();

// --- CARD 4: CONDITION 4 (Bottom Right) ---
doc.save();
doc.rect(310, 435, 235, 275).fill('#FFFFFF');
doc.rect(310, 435, 235, 275).strokeColor(BORDER_COLOR).lineWidth(0.5).stroke();
doc.rect(310, 435, 235, 25).fill('#0EA5E9');
doc.fillColor('#FFFFFF').font(HELVETICA_BOLD).fontSize(7.5).text('COND 4: LOW AUTONOMY + SOLO AI', 318, 445);

doc.fillColor(TEXT_DARK).font(HELVETICA_BOLD).fontSize(8).text('AI Response Message Template:', 318, 470);
doc.font(HELVETICA).fontSize(7).fillColor(TEXT_MUTED).text(
  'Based on your request, the AI agent analyzed the available options and found a recommended match: a versatile brown jacket in size M for $47.90. It matches your preferred color, size, usual style, and budget. Since the system does not complete purchases without your approval, please confirm whether you would like to purchase this item.',
  318,
  482,
  { width: 219, lineGap: 2 }
);

doc.fillColor(TEXT_DARK).font(HELVETICA_BOLD).fontSize(8).text('Match Reasons:', 318, 580);
doc.font(HELVETICA).fontSize(7).fillColor(TEXT_MUTED).text(
  '• Comfort Brown color\n• Size M\n• Within budget',
  318,
  592,
  { lineGap: 2 }
);

doc.fillColor(TEXT_DARK).font(HELVETICA_BOLD).fontSize(8).text('System Action & Telemetry:', 318, 645);
doc.font(HELVETICA_OBlique).fontSize(7).fillColor(ACCENT_PINK).text(
  'User confirmation needed. Your wallet balance will be updated to $954.10 only if you approve the purchase.',
  318,
  657,
  { width: 219, lineGap: 2 }
);
doc.restore();

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
