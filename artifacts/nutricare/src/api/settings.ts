// TODO: replace with real REST/PostgreSQL calls — this signature is the contract
const mockSettings = {
  branding: { name: "NutriCare Clinic", tagline: "Healthy Living", primaryColor: "160 84% 39%" },
  logoUrl: "https://via.placeholder.com/150",
  roles: ["Super Admin", "Admin", "Dietitian", "Online Support", "Visit Support"],
  templates: {
    notification: "Hello {{client_name}}, your renewal is due on {{renewal_date}}.",
    whatsapp: "Hi {{client_name}}, reminder for your appointment at {{appointment_time}}.",
    pdf: "<h2>NutriCare Diet Plan for {{client_name}}</h2>"
  }
};

let currentSettings = { ...mockSettings };

export const settingsApi = {
  get: async () => new Promise<typeof currentSettings>(resolve => setTimeout(() => resolve(currentSettings), 200)),
  update: async (data: Partial<typeof currentSettings>) => new Promise<typeof currentSettings>(resolve => {
    currentSettings = { ...currentSettings, ...data };
    setTimeout(() => resolve(currentSettings), 200);
  })
};
