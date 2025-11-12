const User = require("../models/User");

async function seedUsers() {
  try {
    const count = await User.countDocuments();
    if (count === 0) {
      console.log("No users found — creating default users...");
      const users = [
        {
          name: "admin",
          email: "admin@admin.com",
          tel: "0000000000",
          role: "admin",
          password: "Secured1",
        },
        {
          name: "peace",
          email: "peace@gmail.com",
          tel: "0000000000",
          role: "member",
          password: "Secured1",
        },
      ];
      for (const u of users) {
        // Use create which triggers pre-save hash
        try {
          const exists = await User.findOne({ email: u.email });
          if (!exists) await User.create(u);
        } catch (err) {
          console.error("Error creating user", u.email, err.message);
        }
      }
      console.log("Default users created (admin, peace)");
    } else {
      console.log(`Users present (${count}) — skipping default seed`);
    }
  } catch (err) {
    console.error("Seed users error:", err.message);
  }
}

module.exports = seedUsers;
