export const getRoleColor = (role) => {
  switch (role) {
    case "employer":
      return "blue";
    case "freelancer":
      return "green";
    case "admin":
      return "red";
    default:
      return "default";
  }
};

export const getRoleText = (role) => {
  switch (role) {
    case "employer":
      return "İşveren";
    case "freelancer":
      return "Freelancer";
    case "admin":
      return "Admin";
    default:
      return role;
  }
};

export const calculateStats = (user) => {
  return {
    activeJobs: user.role === 'employer' ? 3 : 2, // Şimdilik sabit
    totalProjects: user.portfolio?.length || 0,
    averageRating: 4.8, // Şimdilik sabit
    completionRate: Math.min(100, (user.portfolio?.length || 0) * 25)
  };
};

export const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};
