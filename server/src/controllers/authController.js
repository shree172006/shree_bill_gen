// Pre-configured Teacher & Admin Credentials for Shree Sai Classes
export const USERS = [
  {
    id: 'usr-001',
    email: 'shrikant@shreesaiclasses.edu.in',
    username: 'shrikant',
    password: 'Shrikant@SSC2024',
    name: 'Shrikant Chavan',
    role: 'teacher_school',
    section: 'school', // 6th to 10th School Section
    title: 'School Section In-Charge (Classes 6th - 10th)',
    allowedStandards: ['Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', '6th', '7th', '8th', '9th', '10th'],
  },
  {
    id: 'usr-002',
    email: 'sangita@shreesaiclasses.edu.in',
    username: 'sangita',
    password: 'Sangita@SSC2024',
    name: 'Sangita Chavan',
    role: 'teacher_college',
    section: 'college', // 11th & 12th Commerce Section
    title: 'Commerce Section In-Charge (FYJC & SYJC)',
    allowedStandards: ['FYJC (11th Commerce)', 'SYJC (12th Commerce)', 'FYJC', 'SYJC', '11th Commerce', '12th Commerce', '11th', '12th'],
  },
  {
    id: 'usr-003',
    email: 'admin@shreesaiclasses.edu.in',
    username: 'admin',
    password: 'Admin@SSC2024',
    name: 'Admin / Director',
    role: 'admin',
    section: 'all', // Full Access to All Sections
    title: 'Principal / Management',
    allowedStandards: ['all'],
  },
];

export const login = (req, res) => {
  const { identifier, password } = req.body;

  if (!identifier || !password) {
    return res.status(400).json({
      success: false,
      message: 'Please enter both email/username and password.',
    });
  }

  const cleanIdentifier = identifier.trim().toLowerCase();

  const user = USERS.find(
    (u) =>
      (u.email.toLowerCase() === cleanIdentifier || u.username.toLowerCase() === cleanIdentifier) &&
      u.password === password
  );

  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email/username or password. Please check your credentials.',
    });
  }

  // Return clean user session object (excluding password)
  const { password: _, ...userSession } = user;

  res.json({
    success: true,
    message: `Welcome back, ${user.name}!`,
    user: userSession,
    token: `token-${user.id}-${Date.now()}`,
  });
};

export const getSession = (req, res) => {
  res.json({
    success: true,
    users: USERS.map(({ password, ...u }) => u),
  });
};
