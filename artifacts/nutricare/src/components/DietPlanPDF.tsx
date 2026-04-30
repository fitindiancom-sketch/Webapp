import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import { templates as masterTemplates } from "../mock/data";

// Try to register a clean sans-serif (falls back to Helvetica gracefully)
try {
  Font.register({
    family: "Inter",
    fonts: [
      {
        src: "https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7.woff",
        fontWeight: 400,
      },
      {
        src: "https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMa2JL7SUc.woff",
        fontWeight: 700,
      },
    ],
  });
} catch {
  /* font registration failure → fall back to Helvetica */
}

const FONT_FAMILY = "Helvetica";

const COLORS = {
  primary: "#059669", // emerald-600
  primaryDark: "#047857",
  primaryLight: "#d1fae5",
  text: "#111827",
  muted: "#6b7280",
  border: "#e5e7eb",
  card: "#f9fafb",
  white: "#ffffff",
};

const styles = StyleSheet.create({
  page: {
    paddingTop: 36,
    paddingBottom: 36,
    paddingHorizontal: 32,
    fontSize: 10,
    fontFamily: FONT_FAMILY,
    color: COLORS.text,
    lineHeight: 1.4,
  },
  // ===== Cover Page =====
  coverWrap: {
    flex: 1,
    justifyContent: "space-between",
  },
  coverTopBar: {
    height: 6,
    backgroundColor: COLORS.primary,
    marginBottom: 40,
  },
  coverHero: {
    alignItems: "center",
    paddingHorizontal: 40,
  },
  brandBox: {
    backgroundColor: COLORS.primary,
    color: COLORS.white,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 6,
    marginBottom: 28,
  },
  brandText: {
    color: COLORS.white,
    fontSize: 28,
    fontWeight: 700,
    letterSpacing: 1,
    fontFamily: FONT_FAMILY,
  },
  brandTagline: {
    color: COLORS.white,
    fontSize: 9,
    textAlign: "center",
    marginTop: 4,
    opacity: 0.9,
  },
  coverTitle: {
    fontSize: 22,
    fontWeight: 700,
    color: COLORS.text,
    marginBottom: 6,
    textAlign: "center",
  },
  coverSubtitle: {
    fontSize: 11,
    color: COLORS.muted,
    marginBottom: 36,
    textAlign: "center",
  },
  coverDivider: {
    width: 60,
    height: 2,
    backgroundColor: COLORS.primary,
    marginVertical: 20,
  },
  coverNamePlate: {
    backgroundColor: COLORS.primaryLight,
    paddingVertical: 22,
    paddingHorizontal: 30,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
    marginVertical: 24,
  },
  coverClientName: {
    fontSize: 28,
    fontWeight: 700,
    color: COLORS.primaryDark,
    marginBottom: 6,
  },
  coverClientCode: {
    fontSize: 11,
    color: COLORS.primaryDark,
    letterSpacing: 1,
  },
  coverGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    width: "100%",
    marginTop: 16,
  },
  coverGridItem: {
    width: "50%",
    paddingVertical: 10,
    paddingHorizontal: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  coverGridLabel: {
    fontSize: 9,
    color: COLORS.muted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  coverGridValue: {
    fontSize: 11,
    fontWeight: 700,
    color: COLORS.text,
  },
  coverFooter: {
    textAlign: "center",
    fontSize: 9,
    color: COLORS.muted,
    marginTop: 30,
  },

  // ===== Page Header (pages 2 & 3) =====
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
    marginBottom: 14,
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: COLORS.primaryDark,
  },
  headerSubtitle: {
    fontSize: 8,
    color: COLORS.muted,
    marginTop: 2,
  },
  headerRight: {
    alignItems: "flex-end",
  },
  headerDate: {
    fontSize: 9,
    color: COLORS.text,
    fontWeight: 700,
  },
  headerCode: {
    fontSize: 8,
    color: COLORS.muted,
    marginTop: 2,
  },

  // ===== Two Column Layout =====
  body: {
    flexDirection: "row",
    gap: 12,
    flex: 1,
  },
  leftCol: {
    width: "32%",
  },
  rightCol: {
    width: "68%",
  },

  // ===== Section Box =====
  sectionBox: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 4,
    marginBottom: 10,
    overflow: "hidden",
  },
  sectionHeader: {
    backgroundColor: COLORS.primary,
    color: COLORS.white,
    paddingVertical: 5,
    paddingHorizontal: 8,
  },
  sectionHeaderText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  sectionBody: {
    padding: 8,
    backgroundColor: COLORS.white,
  },

  // ===== Left col items =====
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 3,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.border,
  },
  detailLabel: {
    fontSize: 8.5,
    color: COLORS.muted,
  },
  detailValue: {
    fontSize: 9,
    fontWeight: 700,
    color: COLORS.text,
  },
  bulletList: {
    paddingLeft: 2,
  },
  bulletRow: {
    flexDirection: "row",
    marginBottom: 2.5,
  },
  bulletDot: {
    width: 8,
    fontSize: 9,
    color: COLORS.primary,
  },
  bulletText: {
    flex: 1,
    fontSize: 9,
    color: COLORS.text,
    lineHeight: 1.35,
  },
  vegPill: {
    fontSize: 8.5,
    color: COLORS.text,
    backgroundColor: COLORS.card,
    paddingVertical: 2,
    paddingHorizontal: 5,
    marginRight: 3,
    marginBottom: 3,
    borderRadius: 3,
    borderWidth: 0.5,
    borderColor: COLORS.border,
  },
  pillRow: {
    flexDirection: "row",
    flexWrap: "wrap",
  },

  // ===== Right col meal =====
  mealBlock: {
    marginBottom: 10,
  },
  mealHeader: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primaryLight,
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
    marginBottom: 5,
  },
  mealName: {
    fontSize: 10.5,
    fontWeight: 700,
    color: COLORS.primaryDark,
  },
  mealTime: {
    fontSize: 9,
    color: COLORS.primaryDark,
    marginLeft: "auto",
  },
  mealItem: {
    flexDirection: "row",
    paddingVertical: 1.5,
    paddingHorizontal: 4,
  },
  mealItemDot: {
    width: 8,
    fontSize: 9,
    color: COLORS.primary,
    marginTop: 1,
  },
  mealItemText: {
    flex: 1,
    fontSize: 9.5,
    lineHeight: 1.4,
    color: COLORS.text,
  },
  emptyMeal: {
    fontSize: 9,
    color: COLORS.muted,
    fontStyle: "italic",
    paddingVertical: 2,
    paddingHorizontal: 4,
  },

  tipBox: {
    marginTop: 12,
    padding: 8,
    backgroundColor: COLORS.card,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
    borderRadius: 2,
  },
  tipTitle: {
    fontSize: 9,
    fontWeight: 700,
    color: COLORS.primaryDark,
    marginBottom: 3,
  },
  tipText: {
    fontSize: 8.5,
    color: COLORS.text,
    lineHeight: 1.4,
  },

  // ===== Page 2 — App credentials box =====
  credentialsBox: {
    marginTop: 12,
    padding: 10,
    backgroundColor: "#ecfdf5",
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 4,
  },
  credentialsTitle: {
    fontSize: 10,
    fontWeight: 700,
    color: COLORS.primaryDark,
    marginBottom: 6,
  },
  credentialsRow: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 6,
  },
  credentialsCol: {
    flex: 1,
  },
  credentialsLabel: {
    fontSize: 8,
    color: COLORS.muted,
    textTransform: "uppercase",
    letterSpacing: 0.4,
    marginBottom: 2,
  },
  credentialsValue: {
    fontSize: 11,
    fontWeight: 700,
    color: COLORS.text,
  },
  credentialsNote: {
    fontSize: 8,
    color: COLORS.muted,
    marginTop: 2,
  },

  // ===== Instructions page =====
  instructionsTitle: {
    fontSize: 16,
    fontWeight: 700,
    color: COLORS.primaryDark,
    marginBottom: 4,
  },
  instructionsSubtitle: {
    fontSize: 9,
    color: COLORS.muted,
    marginBottom: 16,
  },
  instructionRow: {
    flexDirection: "row",
    paddingVertical: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.border,
  },
  instructionNum: {
    width: 22,
    fontSize: 9.5,
    fontWeight: 700,
    color: COLORS.primary,
  },
  instructionText: {
    flex: 1,
    fontSize: 9.5,
    lineHeight: 1.5,
    color: COLORS.text,
  },

  // ===== Page footer =====
  pageFooter: {
    position: "absolute",
    bottom: 16,
    left: 32,
    right: 32,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 8,
    color: COLORS.muted,
    borderTopWidth: 0.5,
    borderTopColor: COLORS.border,
    paddingTop: 6,
  },
  pageFooterText: {
    fontSize: 8,
    color: COLORS.muted,
  },
});

// Mapping our internal meal section names to the time bands shown in the
// reference layout (the user can still edit raw content per section).
const MEAL_TIME_MAP: Record<string, string> = {
  Morning: "6 AM – 8 AM",
  Breakfast: "8 AM – 11 AM",
  "Mid Meal": "11 AM – 1 PM",
  Lunch: "1 PM – 3 PM",
  Evening: "4 PM – 6 PM",
  "Tea Time": "5 PM – 6 PM",
  Dinner: "7 PM – 9 PM",
};

const DEFAULT_INSTRUCTIONS = [
  "Drink 3–4 litres of water per day, evenly spread across the day.",
  "Always take a glass of warm water first thing in the morning.",
  "Have your last meal at least 2 hours before sleeping.",
  "Walk 6,000–8,000 steps daily — track using Google Fit or a step tracker.",
  "Avoid sugar, jaggery, maida and processed snacks.",
  "Use fresh ingredients and home-cooked meals as much as possible.",
  "Stick to the time slots given in the plan; you may shift by ±30 minutes.",
  "Always weigh ingredients before cooking using a kitchen scale.",
  "Eat a salad before lunch and dinner to improve satiety.",
  "Use minimal oil — ghee, olive oil or rice bran oil (one teaspoon per meal).",
  "Avoid fried food, packaged snacks, sugary drinks and bakery items.",
  "Have green tea or black coffee (no sugar/milk) as a mid-meal pick-me-up.",
  "Take a 10-minute walk after lunch and dinner.",
  "Sleep at least 7–8 hours every night.",
  "Do not skip meals — under-eating slows down metabolism.",
  "Share daily food photos with your dietitian for honest feedback.",
  "If eating out: pick grilled, tandoori, soups, salads or steamed dishes.",
  "Avoid mayo, ketchup, peanut chutney, pickles and coconut chutney.",
  "Buttermilk after lunch helps with digestion.",
  "Weigh yourself only once a week, same day, same time, after waking.",
  "Stop the diet only after consulting your dietitian.",
  "Use spices freely — they help with metabolism and flavour.",
  "Do not skip salad before main meals; it controls portion size naturally.",
  "Avoid calling food cravings as hunger — drink water first.",
  "If constipated, try warm water with triphala powder before sleep.",
  "Replace white rice with brown rice, quinoa, millets where possible.",
  "Renew motivation weekly: review your goal, celebrate small wins.",
];

export interface DietPlanPDFProps {
  clientName: string;
  clientCode: string;
  dietitianName: string;
  goalWeight?: string;
  currentWeight?: string;
  category?: string;
  waterGoal?: number;
  mustDo?: string;
  instructions?: string;
  meals: { type: string; content: string }[];
  clientCity?: string;
  clientMobile?: string;
  clientGender?: string;
  createdAt?: string;
  /** App login (email or mobile-derived) shown at the bottom of page 2. */
  clientLogin?: string;
  /** App password shown at the bottom of page 2. Defaults to "Diet123". */
  clientPassword?: string;
}

const splitLines = (text: string): string[] =>
  text
    .split(/\r?\n+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

export function DietPlanPDF({
  clientName,
  clientCode,
  dietitianName,
  goalWeight,
  currentWeight,
  category = "Standard",
  waterGoal = 3,
  mustDo,
  instructions,
  meals,
  clientCity,
  clientMobile,
  clientGender,
  createdAt,
  clientLogin,
  clientPassword,
}: DietPlanPDFProps) {
  const created = createdAt ? new Date(createdAt) : new Date();
  const dateStr = created.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const timeStr = created.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const mustDoLines = mustDo ? splitLines(mustDo) : [];
  const customInstructions = instructions ? splitLines(instructions) : [];
  const allInstructions =
    customInstructions.length >= 5 ? customInstructions : DEFAULT_INSTRUCTIONS;

  const filledMeals = meals.filter((m) => m.content.trim().length > 0);

  return (
    <Document
      title={`Diet Plan — ${clientName}`}
      author={dietitianName}
      subject="NutriCare Diet Plan"
    >
      {/* ============== PAGE 1 — COVER ============== */}
      <Page size="A4" style={styles.page}>
        <View style={styles.coverTopBar} />
        <View style={styles.coverWrap}>
          <View style={styles.coverHero}>
            <View style={styles.brandBox}>
              <Text style={styles.brandText}>NutriCare</Text>
              <Text style={styles.brandTagline}>
                Personalised Nutrition · Real Results
              </Text>
            </View>

            <Text style={styles.coverTitle}>Personalised Diet Plan</Text>
            <Text style={styles.coverSubtitle}>
              {category} Plan · Customised for your goals
            </Text>

            <View style={styles.coverNamePlate}>
              <Text style={styles.coverClientName}>{clientName || "—"}</Text>
              <Text style={styles.coverClientCode}>
                Client ID: {clientCode || "—"}
              </Text>
            </View>

            <View style={styles.coverGrid}>
              <View style={styles.coverGridItem}>
                <Text style={styles.coverGridLabel}>Dietitian</Text>
                <Text style={styles.coverGridValue}>
                  {dietitianName || "—"}
                </Text>
              </View>
              <View style={styles.coverGridItem}>
                <Text style={styles.coverGridLabel}>Plan Type</Text>
                <Text style={styles.coverGridValue}>{category}</Text>
              </View>
              <View style={styles.coverGridItem}>
                <Text style={styles.coverGridLabel}>Goal Weight</Text>
                <Text style={styles.coverGridValue}>
                  {goalWeight ? `${goalWeight} kg` : "—"}
                </Text>
              </View>
              <View style={styles.coverGridItem}>
                <Text style={styles.coverGridLabel}>Water Goal</Text>
                <Text style={styles.coverGridValue}>{waterGoal} L / day</Text>
              </View>
              <View style={styles.coverGridItem}>
                <Text style={styles.coverGridLabel}>Plan Date</Text>
                <Text style={styles.coverGridValue}>{dateStr}</Text>
              </View>
              <View style={styles.coverGridItem}>
                <Text style={styles.coverGridLabel}>Issued At</Text>
                <Text style={styles.coverGridValue}>{timeStr}</Text>
              </View>
              {clientGender && (
                <View style={styles.coverGridItem}>
                  <Text style={styles.coverGridLabel}>Gender</Text>
                  <Text style={styles.coverGridValue}>{clientGender}</Text>
                </View>
              )}
              {clientCity && (
                <View style={styles.coverGridItem}>
                  <Text style={styles.coverGridLabel}>City</Text>
                  <Text style={styles.coverGridValue}>{clientCity}</Text>
                </View>
              )}
            </View>
          </View>

          <Text style={styles.coverFooter}>
            Generated by NutriCare · This plan is confidential and prepared
            specifically for {clientName || "the client"}.
          </Text>
        </View>
      </Page>

      {/* ============== PAGE 2 — DIET PLAN LAYOUT ============== */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>
              NutriCare Diet Plan — {category}
            </Text>
            <Text style={styles.headerSubtitle}>
              Customised for {clientName || "—"}
            </Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.headerDate}>
              {dateStr} · {timeStr}
            </Text>
            <Text style={styles.headerCode}>Client ID: {clientCode || "—"}</Text>
          </View>
        </View>

        <View style={styles.body}>
          {/* LEFT COLUMN */}
          <View style={styles.leftCol}>
            {/* Client details */}
            <View style={styles.sectionBox}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionHeaderText}>Client Details</Text>
              </View>
              <View style={styles.sectionBody}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Name</Text>
                  <Text style={styles.detailValue}>{clientName || "—"}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Client ID</Text>
                  <Text style={styles.detailValue}>{clientCode || "—"}</Text>
                </View>
                {currentWeight && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Current Wt.</Text>
                    <Text style={styles.detailValue}>{currentWeight} kg</Text>
                  </View>
                )}
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Goal Wt.</Text>
                  <Text style={styles.detailValue}>
                    {goalWeight ? `${goalWeight} kg` : "—"}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Water</Text>
                  <Text style={styles.detailValue}>{waterGoal} L / day</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Dietitian</Text>
                  <Text style={styles.detailValue}>{dietitianName || "—"}</Text>
                </View>
                {clientMobile && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Mobile</Text>
                    <Text style={styles.detailValue}>{clientMobile}</Text>
                  </View>
                )}
              </View>
            </View>

            {/* Must Do */}
            <View style={styles.sectionBox}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionHeaderText}>Must Do Daily</Text>
              </View>
              <View style={styles.sectionBody}>
                <View style={styles.bulletList}>
                  {(mustDoLines.length > 0
                    ? mustDoLines
                    : masterTemplates.mustDo
                  ).map((item, i) => (
                    <View key={i} style={styles.bulletRow}>
                      <Text style={styles.bulletDot}>•</Text>
                      <Text style={styles.bulletText}>{item}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>

            {/* Allowed Vegetables */}
            <View style={styles.sectionBox}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionHeaderText}>Allowed Vegetables</Text>
              </View>
              <View style={styles.sectionBody}>
                <View style={styles.pillRow}>
                  {masterTemplates.vegetables.map((v, i) => (
                    <Text key={i} style={styles.vegPill}>
                      {v}
                    </Text>
                  ))}
                </View>
              </View>
            </View>

            {/* Allowed Fruits */}
            <View style={styles.sectionBox}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionHeaderText}>Allowed Fruits</Text>
              </View>
              <View style={styles.sectionBody}>
                <View style={styles.pillRow}>
                  {masterTemplates.fruits.map((v, i) => (
                    <Text key={i} style={styles.vegPill}>
                      {v}
                    </Text>
                  ))}
                </View>
              </View>
            </View>
          </View>

          {/* RIGHT COLUMN — meal sections */}
          <View style={styles.rightCol}>
            {filledMeals.length === 0 ? (
              <Text style={styles.emptyMeal}>
                No meal sections have been filled yet.
              </Text>
            ) : (
              filledMeals.map((meal) => {
                const items = splitLines(meal.content);
                return (
                  <View key={meal.type} style={styles.mealBlock} wrap={false}>
                    <View style={styles.mealHeader}>
                      <Text style={styles.mealName}>{meal.type}</Text>
                      <Text style={styles.mealTime}>
                        {MEAL_TIME_MAP[meal.type] || ""}
                      </Text>
                    </View>
                    {items.map((item, i) => (
                      <View key={i} style={styles.mealItem}>
                        <Text style={styles.mealItemDot}>•</Text>
                        <Text style={styles.mealItemText}>{item}</Text>
                      </View>
                    ))}
                  </View>
                );
              })
            )}

            <View style={styles.tipBox}>
              <Text style={styles.tipTitle}>Tip</Text>
              <Text style={styles.tipText}>
                Eating out? Vegetarian options: paneer tikka, palak paneer,
                jowar/bajra bhakri, upma, idli, dosa, salad, buttermilk.
                Non-vegetarian options: chicken tikka, chicken tandoori, boiled
                egg whites. Share a daily Google Fit step screenshot on
                WhatsApp.
              </Text>
            </View>
          </View>
        </View>

        {/* App login credentials — pinned at the bottom of page 2 */}
        <View style={styles.credentialsBox} wrap={false}>
          <Text style={styles.credentialsTitle}>NutriCare App — Login Credentials</Text>
          <View style={styles.credentialsRow}>
            <View style={styles.credentialsCol}>
              <Text style={styles.credentialsLabel}>Login</Text>
              <Text style={styles.credentialsValue}>
                {clientLogin || "—"}
              </Text>
            </View>
            <View style={styles.credentialsCol}>
              <Text style={styles.credentialsLabel}>Password</Text>
              <Text style={styles.credentialsValue}>
                {clientPassword || "Diet123"}
              </Text>
            </View>
          </View>
          <Text style={styles.credentialsNote}>
            Use these to sign in to the NutriCare app. Please change your
            password after the first login.
          </Text>
        </View>

        <View style={styles.pageFooter} fixed>
          <Text style={styles.pageFooterText}>
            NutriCare · Confidential plan for {clientName || "—"}
          </Text>
          <Text
            style={styles.pageFooterText}
            render={({ pageNumber, totalPages }) =>
              `Page ${pageNumber} of ${totalPages}`
            }
          />
        </View>
      </Page>

      {/* ============== PAGE 3 — INSTRUCTIONS ============== */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Diet Instructions</Text>
            <Text style={styles.headerSubtitle}>
              Please read carefully and follow daily — {clientName || "—"}
            </Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.headerDate}>
              {dateStr} · {timeStr}
            </Text>
            <Text style={styles.headerCode}>Client ID: {clientCode || "—"}</Text>
          </View>
        </View>

        <Text style={styles.instructionsTitle}>General Guidelines</Text>
        <Text style={styles.instructionsSubtitle}>
          These rules apply throughout your plan. Reach out to your dietitian
          for any questions.
        </Text>

        <View>
          {allInstructions.map((line, i) => (
            <View key={i} style={styles.instructionRow} wrap={false}>
              <Text style={styles.instructionNum}>{i + 1}.</Text>
              <Text style={styles.instructionText}>{line}</Text>
            </View>
          ))}
        </View>

        <View style={styles.pageFooter} fixed>
          <Text style={styles.pageFooterText}>
            NutriCare · Confidential plan for {clientName || "—"}
          </Text>
          <Text
            style={styles.pageFooterText}
            render={({ pageNumber, totalPages }) =>
              `Page ${pageNumber} of ${totalPages}`
            }
          />
        </View>
      </Page>
    </Document>
  );
}
