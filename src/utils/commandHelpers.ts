/**
* @author Mennatallah Ashraf
* @description Get the install command for a given technology and type.
* @param tech The technology to get the install command for.
* @param type The type of the technology (frontend or backend).
* @returns The install command for the given technology and type.
*/
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

/**
 * @author Mennatallah Ashraf
 * @description Get the build command for a given technology and type.
 * @param tech The technology to get the build command for.
 * @param type The type of the technology (frontend or backend).
 * @returns The build command for the given technology and type.
 */
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
  