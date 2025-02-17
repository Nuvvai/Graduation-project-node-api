export const getInstallCommand = (tech: string, type: "frontend" | "backend"): string => {
    switch (tech.toLowerCase()) {
      case "react":
      case "vue":
      case "angular":
        return "npm install";
      case "node.js":
        return "npm install";
      case "django":
        return "pip install -r requirements.txt";
      case "spring boot":
        return "./mvnw clean install";
      default:
        return `echo "Unknown ${type} technology: ${tech}"`;
    }
  };
  
  export const getBuildCommand = (tech: string, type: "frontend" | "backend"): string => {
    switch (tech.toLowerCase()) {
      case "react":
      case "vue":
      case "angular":
        return "npm run build";
      case "node.js":
        return "npm run build";
      case "django":
        return "python manage.py collectstatic --noinput";
      case "spring boot":
        return "./mvnw package";
      default:
        return `echo "Unknown ${type} technology: ${tech}"`;
    }
  };
  