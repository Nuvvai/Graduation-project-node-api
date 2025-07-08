import { Request, Response } from "express";

/**
 * Interface representing PersistentVolume configuration.
 * @interface IPersistentVolumeConfig
 * @property {string} name - The name of the PersistentVolume.
 * @property {string} size - The size of the volume (e.g., "10Gi").
 * @property {string} storageClass - The storage class name.
 * @property {string} mountPath - The path where the volume should be mounted in the container.
 */
interface IPersistentVolumeConfig {
    name: string;
    size: string;
    // storageClass: string;
    mountPath: string;
}

/**
 * Interface representing HorizontalPodAutoscaler configuration.
 * @interface IHPAConfig
 * @property {number} minReplicas - Minimum number of replicas.
 * @property {number} maxReplicas - Maximum number of replicas.
 * @property {number} targetCPUUtilization - Target CPU utilization percentage.
 * @property {number} [targetMemoryUtilization] - Target memory utilization percentage (optional).
 */
interface IHPAConfig {
    minReplicas: number;
    maxReplicas: number;
    targetCPUUtilization: number;
    targetMemoryUtilization?: number;
}


/**
 * Interface representing the request body for generating Kubernetes manifests.
 * @interface Ik8sManifestRequestBody
 * @property {string} projectName - The name of the project for which the manifest is generated.
 * @property {number} [containerPort] - The internal container port to expose (default is 3000).
 */
interface Ik8sManifestRequestBody extends Request {
    projectName: string;
    containerPort?: number;
    persistentVolume?: IPersistentVolumeConfig;
    horizontalScaling?: IHPAConfig;
}

/**
 * Interface for generating Kubernetes manifest files.
 * @interface IGeneratek8sManifestFiles
 * @property {function} generateK8sManifest - Generates the complete Kubernetes manifest as a string.
 * @property {function} generatePersistentVolumeClaim - Generates a PersistentVolumeClaim manifest.
 * @property {function} generateHorizontalPodAutoscaler - Generates a HorizontalPodAutoscaler manifest.
 * @property {function} generateConfigMap - Generates a ConfigMap manifest.
 * @property {function} generateSecret - Generates a Secret manifest.
 */
interface IGeneratek8sManifestFiles {
    generateK8sManifest(): Promise<string|void>;
    generatePersistentVolumeClaim(config: IPersistentVolumeConfig, appLabel: string): string;
    generateHorizontalPodAutoscaler(config: IHPAConfig, deploymentName: string, appLabel: string): string;

}


/**
 * @author Mennatallah Ashraf, Nada Abdelghany
 * @description The k8sManifestGenerator class provides methods to dynamically generate 
 * Kubernetes manifest files based on user input. It supports features like PersistentVolumeClaims,
 * HorizontalPodAutoscalers, ConfigMaps, and Secrets. The generated manifest can be used to deploy applications
 * on Kubernetes clusters.
 * 
 * @implements {IGenerateK8sManifestFiles}
 * 
 */

class k8sManifestGenerator implements IGeneratek8sManifestFiles {
    private req: Request;
    private res: Response;
    private username: string;

    constructor(req: Request, res: Response, username: string) {
        this.req = req;
        this.res = res;
        this.username = username;
    }

    public async generateK8sManifest(): Promise<string|void> {
        const {projectName, containerPort, persistentVolume, horizontalScaling}: Ik8sManifestRequestBody = this.req.body;
        const appLabel = `${this.username}-${projectName}`;
        const deploymentName = `${appLabel}-deployment`;
        const imageName = `nuvvai/${appLabel}:latest`;
        const podName = `${appLabel}-pod`;
        const containerName = `${appLabel}-container`;
        const serviceName = `${appLabel}-service`;
        let k8sManifestContent = '';


        if (persistentVolume) {
            k8sManifestContent += this.generatePersistentVolumeClaim(persistentVolume, appLabel);
            k8sManifestContent += '\n---\n';
        }
        k8sManifestContent += `apiVersion: apps/v1
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
          imagePullPolicy: Always
          ports:
            - containerPort: ${containerPort}`;

        if (persistentVolume) {
            k8sManifestContent += `
          volumeMounts:
            - name: ${persistentVolume.name}
              mountPath: ${persistentVolume.mountPath}
      volumes:
        - name: ${persistentVolume.name}
          persistentVolumeClaim:
            claimName: ${appLabel}-pvc`;
        }

        //service
        k8sManifestContent += `
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
  type: LoadBalancer`;

        if (horizontalScaling) {
            k8sManifestContent += '\n---\n';
            k8sManifestContent += this.generateHorizontalPodAutoscaler(horizontalScaling, deploymentName, appLabel);
        }

        return k8sManifestContent;
}

    public generatePersistentVolumeClaim(config: IPersistentVolumeConfig, appLabel: string): string {
        return `apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: ${appLabel}-pvc
  namespace: ${appLabel}
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: ${config.size}`;
    }

    public generateHorizontalPodAutoscaler(config: IHPAConfig, deploymentName: string, appLabel: string): string {
        let hpaContent =  `apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: ${appLabel}-hpa
  namespace: ${appLabel}
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: ${deploymentName}
  minReplicas: ${config.minReplicas}
  maxReplicas: ${config.maxReplicas}
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: ${config.targetCPUUtilization}`;

    if (config.targetMemoryUtilization) {
        hpaContent += `
    - type: Resource
      resource:
        name: memory
        target:
          type: Utilization
          averageUtilization: ${config.targetMemoryUtilization}`;
        }

        return hpaContent;
    }

}

export default k8sManifestGenerator;