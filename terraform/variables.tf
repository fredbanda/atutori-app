variable "app_name" { type = string }
variable "environment" { type = string, default = "production" }
variable "gcp_project" { type = string }
variable "gcp_region" { type = string, default = "us-central1" }
variable "container_image" { type = string }
variable "app_port" { type = number, default = 8000 }