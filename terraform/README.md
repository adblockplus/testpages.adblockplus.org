## Gitlab-Runner

Files in this folder provision a gitlab-runner based on GitLabs docker-machine, most of the configuration is done in variables.tf and main.tf.
We (PET) use a centrally managed terraform module to provision all (most) resources used in your project. We have a work in progress documentation [here](https://confluence.eyeo.com/display/DEVOPS/GCP+self-service+Gitlab+runner+machine+creation).

To use this you must first ensure that you have access to your GCP project and configure your environment to have access to Gitlab following [this guide](https://confluence.eyeo.com/display/DEVOPS/Terraform+Provider+Authentication#TerraformProviderAuthentication-GitLab).

If you want to change the current configuration such as disk size or instance type you change this in main.tf and run the following commands:

```
terraform init
terraform apply
```

Note that instance type and disk size are subject to cost that will be billed to your GCP project.

To make Android emulators work we created a special worker-image with nested virtualization enabled. To update this image (needed if we want to keep us up-to-date with current releases) issue the following command:

```
gcloud compute images export --image-family=cos-stable --image-project=cos-cloud --destination-uri=gs://nasapp-worker-image/cos.tar.gz
```

and run terraform init / apply again.
