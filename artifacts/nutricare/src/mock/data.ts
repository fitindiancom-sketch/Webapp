import { Client, Staff, Payment, Appointment, ProgressEntry, Photo, Notification, DietPlan } from "../types";

export const clients: Client[] = [
  { id: "c1", clientId: "NC-10001", name: "Rahul Sharma", mobile: "+91 9876543210", city: "Mumbai", dietitianId: "s1", supportStaffId: "s2", status: "Active", registrationType: "Online", progressPercent: 65, lastUpdate: "2023-10-24", renewalDate: "2024-01-24", avatar: "https://i.pravatar.cc/150?u=c1" },
  { id: "c2", clientId: "NC-10002", name: "Priya Patel", mobile: "+91 9876543211", city: "Pune", dietitianId: "s1", supportStaffId: "s2", status: "Renewal Due", registrationType: "Visit", progressPercent: 80, lastUpdate: "2023-10-20", renewalDate: "2023-10-25", avatar: "https://i.pravatar.cc/150?u=c2" },
  { id: "c3", clientId: "NC-10003", name: "Amit Kumar", mobile: "+91 9876543212", city: "Delhi", dietitianId: "s3", supportStaffId: "s4", status: "Active", registrationType: "Online", progressPercent: 30, lastUpdate: "2023-10-25", renewalDate: "2023-12-01", avatar: "https://i.pravatar.cc/150?u=c3" },
  { id: "c4", clientId: "NC-10004", name: "Sneha Reddy", mobile: "+91 9876543213", city: "Bangalore", dietitianId: "s1", supportStaffId: "s2", status: "Inactive", registrationType: "Visit", progressPercent: 10, lastUpdate: "2023-09-15", renewalDate: "2023-09-20", avatar: "https://i.pravatar.cc/150?u=c4" },
  { id: "c5", clientId: "NC-10005", name: "Vikram Singh", mobile: "+91 9876543214", city: "Hyderabad", dietitianId: "s3", supportStaffId: "s4", status: "No Response", registrationType: "Online", progressPercent: 45, lastUpdate: "2023-10-10", renewalDate: "2023-11-10", avatar: "https://i.pravatar.cc/150?u=c5" },
  { id: "c6", clientId: "NC-10006", name: "Kavita Desai", mobile: "+91 9876543215", city: "Chennai", dietitianId: "s1", supportStaffId: "s2", status: "Active", registrationType: "Visit", progressPercent: 90, lastUpdate: "2023-10-26", renewalDate: "2023-12-15", avatar: "https://i.pravatar.cc/150?u=c6" },
  { id: "c7", clientId: "NC-10007", name: "Rohan Das", mobile: "+91 9876543216", city: "Kolkata", dietitianId: "s3", supportStaffId: "s4", status: "Renewal Due", registrationType: "Online", progressPercent: 95, lastUpdate: "2023-10-22", renewalDate: "2023-10-30", avatar: "https://i.pravatar.cc/150?u=c7" },
  { id: "c8", clientId: "NC-10008", name: "Neha Gupta", mobile: "+91 9876543217", city: "Ahmedabad", dietitianId: "s1", supportStaffId: "s2", status: "Active", registrationType: "Visit", progressPercent: 20, lastUpdate: "2023-10-25", renewalDate: "2024-02-10", avatar: "https://i.pravatar.cc/150?u=c8" },
  { id: "c9", clientId: "NC-10009", name: "Arjun Nair", mobile: "+91 9876543218", city: "Mumbai", dietitianId: "s3", supportStaffId: "s4", status: "Inactive", registrationType: "Online", progressPercent: 0, lastUpdate: "2023-08-01", renewalDate: "2023-08-15", avatar: "https://i.pravatar.cc/150?u=c9" },
  { id: "c10", clientId: "NC-10010", name: "Anjali Verma", mobile: "+91 9876543219", city: "Pune", dietitianId: "s1", supportStaffId: "s2", status: "No Response", registrationType: "Visit", progressPercent: 50, lastUpdate: "2023-10-05", renewalDate: "2023-11-05", avatar: "https://i.pravatar.cc/150?u=c10" }
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
  { id: "n1", type: "renewal_reminder", title: "Renewal Due", body: "Priya Patel's plan is due for renewal on Oct 25.", timestamp: "2023-10-26T10:00:00Z", read: false },
  { id: "n2", type: "appointment_reminder", title: "Upcoming Appointment", body: "Consultation with Rahul Sharma at 10:00 AM.", timestamp: "2023-10-27T09:00:00Z", read: true },
  { id: "n3", type: "progress_milestone", title: "Goal Achieved", body: "Kavita Desai reached her 5kg weight loss milestone!", timestamp: "2023-10-26T15:30:00Z", read: false },
  { id: "n4", type: "new_registration", title: "New Client", body: "Anjali Verma registered for a visit consultation.", timestamp: "2023-10-25T11:20:00Z", read: true },
  { id: "n5", type: "no_response", title: "No Response", body: "Vikram Singh hasn't uploaded meals for 3 days.", timestamp: "2023-10-24T14:15:00Z", read: false }
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
