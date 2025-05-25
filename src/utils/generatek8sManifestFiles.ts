/**
 * @author Mennatallah Ashraf
 * @description Generates a Kubernetes deployment and service manifest YAML.
 * @param username - username of the user
 * @param projectName - The project name
 * @param containerPort - The internal container port to expose (default is 3000)
 * @returns A string containing the Kubernetes manifest YAML
 */
export const generateK8sManifest = (
    username: string,
    projectName: string,
    containerPort: number
):  string =>{
    const appLabel = `${username}-${projectName}`;
    const deploymentName = `${appLabel}-deployment`;
    const imageName = `mennahaggag/${appLabel}:latest`;
    const podName = `${appLabel}-pod`;
    const containerName = `${appLabel}-container`;
    const serviceName = `${appLabel}-service`;

    return `apiVersion: apps/v1
kind: Deployment
metadata:
  name: ${deploymentName}
  namespace: ${appLabel}
spec:
  replicas: 1
  selector:
    matchLabels:
      app: ${appLabel}
  template:
    metadata:
      name: ${podName}
      labels:
        app: ${appLabel}
    spec:
      containers:
        - name: ${containerName}
          image: ${imageName}
          ports:
            - containerPort: ${containerPort}
---
apiVersion: v1
kind: Service
metadata:
  name: ${serviceName}
  namespace: ${appLabel}
spec:
  selector:
    app: ${appLabel}
  ports:
    - protocol: TCP
      port: 80
      targetPort: ${containerPort}
  type: ClusterIP`;
}
