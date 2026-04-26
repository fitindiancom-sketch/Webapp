import { Client, Staff, Payment, Appointment, ProgressEntry, Photo, Notification, DietPlanTemplate } from "../types";

const today = new Date();
const daysFromNow = (n: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
};

export const clients: Client[] = [
  { id: "c1", clientId: "NC-10001", name: "Rahul Sharma", mobile: "+91 9876543210", email: "rahul@example.com", city: "Mumbai", dietitianId: "s1", supportStaffId: "s2", status: "Active", lifecycleStatus: "active", registrationType: "Online", planType: "Standard", progressPercent: 65, lastUpdate: daysFromNow(-2), renewalDate: daysFromNow(60), registrationDate: daysFromNow(-90), goalWeight: 75, latestPlanId: "dp-1001", latestPlanDate: daysFromNow(-7), avatar: "https://i.pravatar.cc/150?u=c1" },
  { id: "c2", clientId: "NC-10002", name: "Priya Patel", mobile: "+91 9876543211", email: "priya@example.com", city: "Pune", dietitianId: "s1", supportStaffId: "s2", status: "Renewal Due", lifecycleStatus: "renewal_due", registrationType: "Visit", planType: "Premium", progressPercent: 80, lastUpdate: daysFromNow(-5), renewalDate: daysFromNow(3), registrationDate: daysFromNow(-87), goalWeight: 60, latestPlanId: "dp-1002", latestPlanDate: daysFromNow(-30), avatar: "https://i.pravatar.cc/150?u=c2" },
  { id: "c3", clientId: "NC-10003", name: "Amit Kumar", mobile: "+91 9876543212", email: "amit@example.com", city: "Delhi", dietitianId: "s3", supportStaffId: "s4", status: "Active", lifecycleStatus: "active", registrationType: "Online", planType: "VIP", progressPercent: 30, lastUpdate: daysFromNow(0), renewalDate: daysFromNow(40), registrationDate: daysFromNow(-50), goalWeight: 80, latestPlanId: "dp-1003", latestPlanDate: daysFromNow(-3), avatar: "https://i.pravatar.cc/150?u=c3" },
  { id: "c4", clientId: "NC-10004", name: "Sneha Reddy", mobile: "+91 9876543213", email: "sneha@example.com", city: "Bangalore", dietitianId: "s1", supportStaffId: "s2", status: "Inactive", lifecycleStatus: "inactive", registrationType: "Visit", planType: "Basic", progressPercent: 10, lastUpdate: daysFromNow(-45), renewalDate: daysFromNow(-30), registrationDate: daysFromNow(-150), goalWeight: 55, avatar: "https://i.pravatar.cc/150?u=c4" },
  { id: "c5", clientId: "NC-10005", name: "Vikram Singh", mobile: "+91 9876543214", email: "vikram@example.com", city: "Hyderabad", dietitianId: "s3", supportStaffId: "s4", status: "No Response", lifecycleStatus: "not_following_no_response", registrationType: "Online", planType: "Standard", progressPercent: 5, lastUpdate: daysFromNow(-15), renewalDate: daysFromNow(35), registrationDate: daysFromNow(-25), goalWeight: 78, avatar: "https://i.pravatar.cc/150?u=c5" },
  { id: "c6", clientId: "NC-10006", name: "Kavita Desai", mobile: "+91 9876543215", email: "kavita@example.com", city: "Chennai", dietitianId: "s1", supportStaffId: "s2", status: "Active", lifecycleStatus: "completed_30_days", registrationType: "Visit", planType: "Premium", progressPercent: 90, lastUpdate: daysFromNow(-1), renewalDate: daysFromNow(50), registrationDate: daysFromNow(-32), goalWeight: 62, latestPlanId: "dp-1006", latestPlanDate: daysFromNow(-30), avatar: "https://i.pravatar.cc/150?u=c6" },
  { id: "c7", clientId: "NC-10007", name: "Rohan Das", mobile: "+91 9876543216", email: "rohan.das@example.com", city: "Kolkata", dietitianId: "s3", supportStaffId: "s4", status: "Renewal Due", lifecycleStatus: "renewal_due", registrationType: "Online", planType: "Basic", progressPercent: 95, lastUpdate: daysFromNow(-3), renewalDate: daysFromNow(5), registrationDate: daysFromNow(-85), goalWeight: 70, latestPlanId: "dp-1007", latestPlanDate: daysFromNow(-15), avatar: "https://i.pravatar.cc/150?u=c7" },
  { id: "c8", clientId: "NC-10008", name: "Neha Gupta", mobile: "+91 9876543217", email: "neha@example.com", city: "Ahmedabad", dietitianId: "s1", supportStaffId: "s2", status: "Active", lifecycleStatus: "plan_not_started", registrationType: "Visit", planType: "Standard", progressPercent: 0, lastUpdate: daysFromNow(-1), renewalDate: daysFromNow(80), registrationDate: daysFromNow(-2), goalWeight: 65, avatar: "https://i.pravatar.cc/150?u=c8" },
  { id: "c9", clientId: "NC-10009", name: "Arjun Nair", mobile: "+91 9876543218", email: "arjun@example.com", city: "Mumbai", dietitianId: "s3", supportStaffId: "s4", status: "Inactive", lifecycleStatus: "inactive", registrationType: "Online", planType: "Basic", progressPercent: 0, lastUpdate: daysFromNow(-90), renewalDate: daysFromNow(-60), registrationDate: daysFromNow(-180), goalWeight: 72, avatar: "https://i.pravatar.cc/150?u=c9" },
  { id: "c10", clientId: "NC-10010", name: "Anjali Verma", mobile: "+91 9876543219", email: "anjali@example.com", city: "Pune", dietitianId: "s1", supportStaffId: "s2", status: "No Response", lifecycleStatus: "few_days_then_stopped", registrationType: "Visit", planType: "Premium", progressPercent: 25, lastUpdate: daysFromNow(-20), renewalDate: daysFromNow(40), registrationDate: daysFromNow(-50), goalWeight: 58, latestPlanId: "dp-1010", latestPlanDate: daysFromNow(-25), avatar: "https://i.pravatar.cc/150?u=c10" },
  { id: "c11", clientId: "NC-10011", name: "Karan Mehta", mobile: "+91 9876543220", email: "karan@example.com", city: "Delhi", dietitianId: "s1", supportStaffId: "s6", status: "Active", lifecycleStatus: "active", registrationType: "Online", planType: "VIP", progressPercent: 70, lastUpdate: daysFromNow(0), renewalDate: daysFromNow(45), registrationDate: daysFromNow(-60), goalWeight: 78, latestPlanId: "dp-1011", latestPlanDate: daysFromNow(-5), avatar: "https://i.pravatar.cc/150?u=c11" },
  { id: "c12", clientId: "NC-10012", name: "Divya Iyer", mobile: "+91 9876543221", email: "divya@example.com", city: "Bangalore", dietitianId: "s3", supportStaffId: "s7", status: "Active", lifecycleStatus: "completed_30_days", registrationType: "Visit", planType: "Standard", progressPercent: 88, lastUpdate: daysFromNow(-2), renewalDate: daysFromNow(70), registrationDate: daysFromNow(-35), goalWeight: 60, latestPlanId: "dp-1012", latestPlanDate: daysFromNow(-32), avatar: "https://i.pravatar.cc/150?u=c12" },
  { id: "c13", clientId: "NC-10013", name: "Sanjay Joshi", mobile: "+91 9876543222", email: "sanjay@example.com", city: "Hyderabad", dietitianId: "s1", supportStaffId: "s6", status: "Active", lifecycleStatus: "plan_not_started", registrationType: "Online", planType: "Basic", progressPercent: 0, lastUpdate: daysFromNow(0), renewalDate: daysFromNow(85), registrationDate: daysFromNow(-1), goalWeight: 75, avatar: "https://i.pravatar.cc/150?u=c13" },
  { id: "c14", clientId: "NC-10014", name: "Meera Pillai", mobile: "+91 9876543223", email: "meera@example.com", city: "Chennai", dietitianId: "s3", supportStaffId: "s7", status: "Renewal Due", lifecycleStatus: "renewal_due", registrationType: "Visit", planType: "Premium", progressPercent: 75, lastUpdate: daysFromNow(-4), renewalDate: daysFromNow(7), registrationDate: daysFromNow(-83), goalWeight: 55, latestPlanId: "dp-1014", latestPlanDate: daysFromNow(-20), avatar: "https://i.pravatar.cc/150?u=c14" },
  { id: "c15", clientId: "NC-10015", name: "Tarun Bhatt", mobile: "+91 9876543224", email: "tarun@example.com", city: "Kolkata", dietitianId: "s1", supportStaffId: "s2", status: "No Response", lifecycleStatus: "few_days_then_stopped", registrationType: "Online", planType: "Standard", progressPercent: 18, lastUpdate: daysFromNow(-25), renewalDate: daysFromNow(50), registrationDate: daysFromNow(-40), goalWeight: 80, avatar: "https://i.pravatar.cc/150?u=c15" },
  { id: "c16", clientId: "NC-10016", name: "Ishita Roy", mobile: "+91 9876543225", email: "ishita@example.com", city: "Ahmedabad", dietitianId: "s3", supportStaffId: "s4", status: "Active", lifecycleStatus: "active", registrationType: "Visit", planType: "Premium", progressPercent: 55, lastUpdate: daysFromNow(-1), renewalDate: daysFromNow(55), registrationDate: daysFromNow(-45), goalWeight: 58, latestPlanId: "dp-1016", latestPlanDate: daysFromNow(-10), avatar: "https://i.pravatar.cc/150?u=c16" },
  { id: "c17", clientId: "NC-10017", name: "Aditya Rao", mobile: "+91 9876543226", email: "aditya@example.com", city: "Mumbai", dietitianId: "s1", supportStaffId: "s6", status: "Active", lifecycleStatus: "completed_30_days", registrationType: "Online", planType: "VIP", progressPercent: 92, lastUpdate: daysFromNow(0), renewalDate: daysFromNow(60), registrationDate: daysFromNow(-33), goalWeight: 76, latestPlanId: "dp-1017", latestPlanDate: daysFromNow(-30), avatar: "https://i.pravatar.cc/150?u=c17" },
  { id: "c18", clientId: "NC-10018", name: "Pooja Shah", mobile: "+91 9876543227", email: "pooja@example.com", city: "Pune", dietitianId: "s3", supportStaffId: "s7", status: "Inactive", lifecycleStatus: "not_following_no_response", registrationType: "Visit", planType: "Basic", progressPercent: 12, lastUpdate: daysFromNow(-30), renewalDate: daysFromNow(20), registrationDate: daysFromNow(-70), goalWeight: 60, avatar: "https://i.pravatar.cc/150?u=c18" },
  { id: "c19", clientId: "NC-10019", name: "Nikhil Saxena", mobile: "+91 9876543228", email: "nikhil@example.com", city: "Delhi", dietitianId: "s1", supportStaffId: "s2", status: "Active", lifecycleStatus: "plan_not_started", registrationType: "Online", planType: "Standard", progressPercent: 0, lastUpdate: daysFromNow(0), renewalDate: daysFromNow(89), registrationDate: daysFromNow(0), goalWeight: 82, avatar: "https://i.pravatar.cc/150?u=c19" },
  { id: "c20", clientId: "NC-10020", name: "Riya Kapoor", mobile: "+91 9876543229", email: "riya@example.com", city: "Bangalore", dietitianId: "s3", supportStaffId: "s4", status: "Active", lifecycleStatus: "active", registrationType: "Visit", planType: "Premium", progressPercent: 60, lastUpdate: daysFromNow(-2), renewalDate: daysFromNow(45), registrationDate: daysFromNow(-55), goalWeight: 56, latestPlanId: "dp-1020", latestPlanDate: daysFromNow(-8), avatar: "https://i.pravatar.cc/150?u=c20" }
];

export const staff: Staff[] = [
  { id: "s1", name: "Dr. Aditi Sharma", role: "Dietitian", email: "aditi@nutricare.com", mobile: "+91 9988776655", status: "Active", department: "Clinical", joinDate: "2021-05-10", avatar: "https://i.pravatar.cc/150?u=s1" },
  { id: "s2", name: "Rohan Singh", role: "Online Support", email: "rohan@nutricare.com", mobile: "+91 9988776656", status: "Active", department: "Support", joinDate: "2022-01-15", avatar: "https://i.pravatar.cc/150?u=s2" },
  { id: "s3", name: "Dr. Kavita Desai", role: "Dietitian", email: "kavita@nutricare.com", mobile: "+91 9988776657", status: "Active", department: "Clinical", joinDate: "2020-11-20", avatar: "https://i.pravatar.cc/150?u=s3" },
  { id: "s4", name: "Sneha Reddy", role: "Visit Support", email: "sneha@nutricare.com", mobile: "+91 9988776658", status: "Active", department: "Support", joinDate: "2022-03-10", avatar: "https://i.pravatar.cc/150?u=s4" },
  { id: "s5", name: "Dr. Anil Kumar", role: "Dietitian", email: "anil@nutricare.com", mobile: "+91 9988776659", status: "Inactive", department: "Clinical", joinDate: "2021-08-05", avatar: "https://i.pravatar.cc/150?u=s5" },
  { id: "s6", name: "Pooja Mehta", role: "Online Support", email: "pooja@nutricare.com", mobile: "+91 9988776660", status: "Active", department: "Support", joinDate: "2023-02-01", avatar: "https://i.pravatar.cc/150?u=s6" },
  { id: "s7", name: "Vivek Joshi", role: "Visit Support", email: "vivek@nutricare.com", mobile: "+91 9988776661", status: "Active", department: "Support", joinDate: "2022-07-22", avatar: "https://i.pravatar.cc/150?u=s7" },
  { id: "s8", name: "Karan Johar", role: "Admin", email: "karan@nutricare.com", mobile: "+91 9988776662", status: "Active", department: "Management", joinDate: "2019-12-01", avatar: "https://i.pravatar.cc/150?u=s8" }
];

export const payments: Payment[] = [
  { id: "p1", clientId: "c1", amount: 5000, planType: "Standard", paidDate: "2023-09-24", renewalDate: "2024-01-24", status: "Paid" },
  { id: "p2", clientId: "c2", amount: 10000, planType: "Premium", paidDate: "2023-07-25", renewalDate: "2023-10-25", status: "Renewal Due" },
  { id: "p3", clientId: "c3", amount: 15000, planType: "VIP", paidDate: "2023-10-01", renewalDate: "2024-04-01", status: "Paid" },
  { id: "p4", clientId: "c4", amount: 3000, planType: "Basic", paidDate: "2023-06-20", renewalDate: "2023-09-20", status: "Expired" },
  { id: "p5", clientId: "c5", amount: 5000, planType: "Standard", paidDate: "2023-08-10", renewalDate: "2023-11-10", status: "Pending" },
  { id: "p6", clientId: "c6", amount: 10000, planType: "Premium", paidDate: "2023-09-15", renewalDate: "2023-12-15", status: "Partial" },
  { id: "p7", clientId: "c7", amount: 3000, planType: "Basic", paidDate: "2023-07-30", renewalDate: "2023-10-30", status: "Renewal Due" },
  { id: "p8", clientId: "c8", amount: 15000, planType: "VIP", paidDate: "2023-10-10", renewalDate: "2024-04-10", status: "Paid" }
];

export const appointments: Appointment[] = [
  { id: "a1", date: "2023-10-27", time: "10:00 AM", clientId: "c1", dietitianId: "s1", type: "Online", status: "Scheduled", notes: "First consultation" },
  { id: "a2", date: "2023-10-27", time: "11:30 AM", clientId: "c2", dietitianId: "s1", type: "Visit", status: "Completed", notes: "Follow-up on diet plan" },
  { id: "a3", date: "2023-10-28", time: "02:00 PM", clientId: "c3", dietitianId: "s3", type: "Online", status: "Scheduled", notes: "Monthly review" },
  { id: "a4", date: "2023-10-28", time: "04:00 PM", clientId: "c5", dietitianId: "s3", type: "Visit", status: "Cancelled", notes: "Client requested reschedule" },
  { id: "a5", date: "2023-10-29", time: "10:30 AM", clientId: "c6", dietitianId: "s1", type: "Online", status: "Scheduled", notes: "Diet adjustment" },
  { id: "a6", date: "2023-10-29", time: "01:00 PM", clientId: "c8", dietitianId: "s1", type: "Visit", status: "Scheduled", notes: "Initial assessment" },
  { id: "a7", date: "2023-10-30", time: "03:30 PM", clientId: "c10", dietitianId: "s1", type: "Online", status: "Scheduled", notes: "Check-in" },
  { id: "a8", date: "2023-10-31", time: "11:00 AM", clientId: "c7", dietitianId: "s3", type: "Visit", status: "Scheduled", notes: "Renewal discussion" }
];

export const progressEntries: ProgressEntry[] = [
  { id: "pr1", clientId: "c1", date: "2023-10-01", weight: 85, waist: 36, hip: 40, chest: 42, arm: 14, notes: "Starting plan", mealCompliance: 0 },
  { id: "pr2", clientId: "c1", date: "2023-10-10", weight: 84, waist: 35.5, hip: 39.5, chest: 41.5, arm: 13.8, notes: "Good progress", mealCompliance: 80 },
  { id: "pr3", clientId: "c1", date: "2023-10-24", weight: 82.5, waist: 34.5, hip: 39, chest: 41, arm: 13.5, notes: "Feeling energetic", mealCompliance: 90 },
  { id: "pr4", clientId: "c2", date: "2023-09-15", weight: 70, waist: 32, hip: 38, chest: 38, arm: 12, notes: "Initial measurement", mealCompliance: 0 },
  { id: "pr5", clientId: "c2", date: "2023-10-20", weight: 67, waist: 30, hip: 36, chest: 36, arm: 11.5, notes: "Great results, renewal due soon", mealCompliance: 95 }
];

export const photos: Photo[] = [
  { id: "ph1", clientId: "c1", date: "2023-10-24", mealType: "Breakfast", photoUrl: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400", uploadedBy: "c1", remarks: "Oats with fruits" },
  { id: "ph2", clientId: "c1", date: "2023-10-24", mealType: "Lunch", photoUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400", uploadedBy: "c1", remarks: "Salad bowl" },
  { id: "ph3", clientId: "c1", date: "2023-10-24", mealType: "Dinner", photoUrl: "https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=400", uploadedBy: "c1", remarks: "Grilled chicken and veggies" },
  { id: "ph4", clientId: "c2", date: "2023-10-20", mealType: "Breakfast", photoUrl: "https://images.unsplash.com/photo-1493770348161-369560ae357d?w=400", uploadedBy: "c2", remarks: "Smoothie bowl" },
  { id: "ph5", clientId: "c2", date: "2023-10-20", mealType: "Lunch", photoUrl: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400", uploadedBy: "c2", remarks: "Quinoa salad" }
];

export const notifications: Notification[] = [
  { id: "n1", type: "renewal_reminder", title: "Renewal Due", body: "Priya Patel's plan is due for renewal in 3 days.", timestamp: "2026-04-25T10:00:00Z", read: false },
  { id: "n2", type: "appointment_reminder", title: "Upcoming Appointment", body: "Consultation with Rahul Sharma at 10:00 AM.", timestamp: "2026-04-26T09:00:00Z", read: true },
  { id: "n3", type: "progress_milestone", title: "Goal Achieved", body: "Kavita Desai reached her 5kg weight loss milestone.", timestamp: "2026-04-25T15:30:00Z", read: false },
  { id: "n4", type: "new_registration", title: "New Client", body: "Nikhil Saxena registered for online consultation.", timestamp: "2026-04-26T11:20:00Z", read: true },
  { id: "n5", type: "no_response", title: "No Response", body: "Vikram Singh has not uploaded meals for 15 days.", timestamp: "2026-04-22T14:15:00Z", read: false }
];

export const templates = {
  mustDo: ["Drink 3L water", "Walk 10k steps", "Sleep 8 hours", "No sugar after 6 PM", "Meditate for 10 mins", "Stretch before bed"],
  vegetables: ["Spinach", "Broccoli", "Cauliflower", "Carrots", "Bell Peppers", "Zucchini", "Cabbage", "Green Beans"],
  fruits: ["Apple", "Banana", "Orange", "Papaya", "Watermelon", "Guava", "Grapes", "Pomegranate"],
  meals: {
    Breakfast: ["Oats Poha", "Moong Dal Chilla", "Besan Chilla", "Vegetable Upma", "Boiled Eggs with Toast"],
    Lunch: ["Quinoa Pulao", "Brown Rice with Dal", "Roti with Sabzi", "Grilled Chicken Salad", "Paneer Tikka with Roti"],
    Snack: ["Roasted Makhana", "Fruits with Nuts", "Green Tea with Almonds", "Yogurt", "Sprout Salad"],
    Dinner: ["Soups and Salads", "Grilled Fish/Chicken", "Sautéed Vegetables", "Dal Soup", "Khichdi"]
  }
};

export const seedDietPlanTemplates: DietPlanTemplate[] = [
  { id: "tpl-1", category: "Morning", name: "Detox Water", content: "1 glass warm water + lemon + 1 tsp honey", createdAt: daysFromNow(-30) },
  { id: "tpl-2", category: "Morning", name: "Methi Water", content: "1 glass overnight soaked methi water on empty stomach", createdAt: daysFromNow(-29) },
  { id: "tpl-3", category: "Breakfast", name: "Oats Bowl", content: "1 bowl oats + 1 fruit (apple/banana) + handful seeds (chia/flax) + 1 tsp peanut butter", createdAt: daysFromNow(-28) },
  { id: "tpl-4", category: "Breakfast", name: "Veg Poha", content: "1 plate vegetable poha + 1 boiled egg + 1 cup green tea", createdAt: daysFromNow(-27) },
  { id: "tpl-5", category: "Breakfast", name: "Moong Chilla", content: "2 moong dal chilla + mint chutney + 1 cup masala chai (no sugar)", createdAt: daysFromNow(-26) },
  { id: "tpl-6", category: "Mid Meal", name: "Fruit Plate", content: "1 bowl seasonal fruits + 5 almonds + 2 walnuts", createdAt: daysFromNow(-25) },
  { id: "tpl-7", category: "Mid Meal", name: "Buttermilk", content: "1 glass buttermilk with roasted jeera + black salt", createdAt: daysFromNow(-24) },
  { id: "tpl-8", category: "Lunch", name: "Roti Sabzi Combo", content: "2 roti + 1 katori sabzi + 1 katori dal + 1 bowl salad + 1 cup curd", createdAt: daysFromNow(-23) },
  { id: "tpl-9", category: "Lunch", name: "Brown Rice Bowl", content: "1 cup brown rice + 1 katori rajma/chole + 1 bowl salad + 1 cup curd", createdAt: daysFromNow(-22) },
  { id: "tpl-10", category: "Lunch", name: "Quinoa Khichdi", content: "1 bowl quinoa khichdi with veggies + 1 cup raita + 1 papad (roasted)", createdAt: daysFromNow(-21) },
  { id: "tpl-11", category: "Evening", name: "Green Tea Snack", content: "1 cup green tea + 1 fistful roasted makhana", createdAt: daysFromNow(-20) },
  { id: "tpl-12", category: "Evening", name: "Sprouts Chaat", content: "1 bowl sprouts chaat + 1 cup masala chai (no sugar)", createdAt: daysFromNow(-19) },
  { id: "tpl-13", category: "Dinner", name: "Light Soup Combo", content: "1 bowl mixed veg soup + 2 multigrain rotis + 1 katori paneer bhurji", createdAt: daysFromNow(-18) },
  { id: "tpl-14", category: "Dinner", name: "Grilled Protein", content: "100g grilled chicken/fish/paneer + sautéed vegetables + 1 small bowl dal", createdAt: daysFromNow(-17) },
  { id: "tpl-15", category: "Dinner", name: "Khichdi Bowl", content: "1 bowl moong dal khichdi + 1 katori curd + ghee 1 tsp", createdAt: daysFromNow(-16) },
  { id: "tpl-16", category: "Tea Time", name: "Herbal Tea", content: "1 cup tulsi-ginger tea + 2 marie biscuits", createdAt: daysFromNow(-15) },
  { id: "tpl-17", category: "Instructions", name: "Daily Must Do", content: "Drink 3L water | 10k steps | Sleep 8 hrs | No sugar after 6 PM | Eat dinner before 8 PM", createdAt: daysFromNow(-14) },
  { id: "tpl-18", category: "Instructions", name: "Weight Loss Rules", content: "No fried food | No sugary drinks | 30 min walk after lunch and dinner | Weekly weighing only", createdAt: daysFromNow(-13) },
];
